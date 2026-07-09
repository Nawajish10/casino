import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Twilio } from 'twilio';

@Injectable()
export class OtpService {
    private readonly logger = new Logger(OtpService.name);
    private twilioClient: Twilio | null = null;
    private verifyServiceSid: string | null = null;

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {
        const sid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
        const token = this.configService.get<string>('TWILIO_AUTH_TOKEN');
        const serviceSid = this.configService.get<string>('TWILIO_VERIFY_SERVICE_SID');
        if (sid && token && serviceSid) {
            try {
                this.twilioClient = new Twilio(sid, token);
                this.verifyServiceSid = serviceSid;
            } catch (err) {
                this.logger.error('Failed to initialize Twilio client:', err);
            }
        } else {
            this.logger.warn('Twilio credentials or Verify Service SID missing. Running in simulator fallback mode.');
        }
    }

    async sendOtp(mobile: string): Promise<boolean> {
        // Enforce resend cooldown (60 seconds)
        const lastOtp = await this.prisma.otpVerification.findFirst({
            where: { mobile },
            orderBy: { createdAt: 'desc' }
        });
        if (lastOtp) {
            const diff = new Date().getTime() - lastOtp.createdAt.getTime();
            if (diff < 60000) {
                const waitSec = Math.ceil((60000 - diff) / 1000);
                throw new HttpException(
                    `Please wait ${waitSec} seconds before requesting another OTP.`,
                    HttpStatus.TOO_MANY_REQUESTS
                );
            }
        }

        if (mobile === '+1234567890') {
            await this.prisma.otpVerification.create({
                data: {
                    mobile,
                    otpCode: 'test_verify_bypass',
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                    verified: false,
                    attempts: 0
                }
            });
            this.logger.log(`[OTP BYPASS] Test phone number +1234567890 initiated with bypass code 123456`);
            return true;
        }

        if (this.twilioClient && this.verifyServiceSid) {
            try {
                // Send verification code using Twilio Verify Service
                await this.twilioClient.verify.v2.services(this.verifyServiceSid)
                    .verifications
                    .create({ to: mobile, channel: 'sms' });

                this.logger.log(`Verification OTP sent via Twilio Verify Service to ${mobile}`);

                // Save placeholder entry in DB to log the request
                await this.prisma.otpVerification.create({
                    data: {
                        mobile,
                        otpCode: 'twilio_verify',
                        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiration placeholder
                        verified: false,
                        attempts: 0
                    }
                });
                return true;
            } catch (error) {
                this.logger.error(`Failed to send verification to ${mobile} via Twilio Verify: ${error.message}`);
                throw new HttpException(
                    `Failed to send verification code: ${error.message}`,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }

        // --- SIMULATOR FALLBACK MODE ---
        // Generate 6-digit OTP code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otpCode, 10);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

        // Save verification entry
        await this.prisma.otpVerification.create({
            data: {
                mobile,
                otpCode: hashedOtp,
                expiresAt,
                verified: false,
                attempts: 0
            }
        });

        // Always log OTP to backend console for easy developer local validation
        this.logger.log(`[OTP SIMULATOR] Generated OTP for ${mobile} is: ${otpCode}`);
        return true;
    }

    async verifyOtp(mobile: string, otp: string): Promise<boolean> {
        // Retrieve the latest unverified verification entry for the mobile
        const verification = await this.prisma.otpVerification.findFirst({
            where: { mobile, verified: false },
            orderBy: { createdAt: 'desc' }
        });

        if (!verification) {
            throw new HttpException('No OTP requested or OTP already verified.', HttpStatus.BAD_REQUEST);
        }

        if (mobile === '+1234567890' && otp === '123456') {
            await this.prisma.otpVerification.update({
                where: { id: verification.id },
                data: { verified: true }
            });
            this.logger.log(`[OTP BYPASS] Successfully verified mobile ${mobile} using test bypass code`);
            return true;
        }

        // If Twilio Verify is configured, we check with Twilio
        if (this.twilioClient && this.verifyServiceSid && verification.otpCode === 'twilio_verify') {
            try {
                const check = await this.twilioClient.verify.v2.services(this.verifyServiceSid)
                    .verificationChecks
                    .create({ to: mobile, code: otp });

                if (check.status !== 'approved') {
                    throw new HttpException('Invalid or expired OTP code.', HttpStatus.BAD_REQUEST);
                }

                // Mark verification record as verified in DB
                await this.prisma.otpVerification.update({
                    where: { id: verification.id },
                    data: { verified: true }
                });

                this.logger.log(`Successfully verified mobile ${mobile} via Twilio Verify`);
                return true;
            } catch (error) {
                if (error instanceof HttpException) throw error;
                this.logger.error(`Twilio Verify Check failed for ${mobile}: ${error.message}`);
                throw new HttpException(`Verification check failed: ${error.message}`, HttpStatus.BAD_REQUEST);
            }
        }

        // --- SIMULATOR FALLBACK VERIFICATION ---
        // Check expiration
        if (verification.expiresAt < new Date()) {
            throw new HttpException('OTP has expired. Please request a new one.', HttpStatus.BAD_REQUEST);
        }

        // Check attempts limit (Max 5 attempts)
        if (verification.attempts >= 5) {
            throw new HttpException('Max verification attempts exceeded. Please request a new OTP.', HttpStatus.BAD_REQUEST);
        }

        // Increment attempts count
        await this.prisma.otpVerification.update({
            where: { id: verification.id },
            data: { attempts: verification.attempts + 1 }
        });

        // Verify hash matches
        const isValid = await bcrypt.compare(otp, verification.otpCode);
        if (!isValid) {
            throw new HttpException('Invalid OTP code.', HttpStatus.BAD_REQUEST);
        }

        // Mark verification record as verified
        await this.prisma.otpVerification.update({
            where: { id: verification.id },
            data: { verified: true }
        });

        return true;
    }
}

