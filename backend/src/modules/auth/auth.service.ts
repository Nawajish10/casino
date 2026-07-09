import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { OtpService } from './otp.service';
import { EmailService } from './email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly otpService: OtpService,
        private readonly emailService: EmailService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    async sendOtp(mobile: string): Promise<boolean> {
        return this.otpService.sendOtp(mobile);
    }

    async verifyOtp(mobile: string, otp: string) {
        // Verify OTP code first
        await this.otpService.verifyOtp(mobile, otp);

        // Find or create user (automatic signup/login flow)
        let user = await this.prisma.user.findUnique({
            where: { mobile }
        });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    mobile,
                    mobileVerified: true
                }
            });
        } else if (!user.mobileVerified) {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: { mobileVerified: true }
            });
        }

        // Generate tokens
        const tokens = await this.generateTokens(user.id);

        // Store refresh token
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: tokens.refreshToken,
                expiresAt
            }
        });

        return {
            success: true,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                ...user,
                _id: user.id,
                username: user.name || `User_${user.mobile.slice(-4)}`,
                name: user.name || 'Player',
                email: user.email || '',
                accountType: 'player',
                currency: 'USD'
            }
        };
    }

    async sendEmailVerification(userId: string, email: string): Promise<boolean> {
        // Find user
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException('User not found.');
        }

        // Save email on the user record (pending verification)
        await this.prisma.user.update({
            where: { id: userId },
            data: { email }
        });

        // Generate email verification token (expires in 24 hours)
        const payload = { sub: userId, email, type: 'email-verify' };
        const secret = this.configService.get<string>('JWT_SECRET');
        const token = this.jwtService.sign(payload, { secret, expiresIn: '24h' });

        return this.emailService.sendVerificationEmail(email, token);
    }

    async verifyEmail(token: string) {
        try {
            const secret = this.configService.get<string>('JWT_SECRET');
            const payload = this.jwtService.verify(token, { secret });
            if (payload.type !== 'email-verify') {
                throw new BadRequestException('Invalid token type.');
            }

            const userId = payload.sub;
            const email = payload.email;

            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    email,
                    emailVerified: true
                }
            });

            return { success: true, message: 'Email verified successfully.' };
        } catch (error) {
            throw new BadRequestException('Invalid or expired email verification token.');
        }
    }

    async refreshSession(refreshTokenStr: string) {
        // Find refresh token in DB
        const tokenRecord = await this.prisma.refreshToken.findFirst({
            where: { token: refreshTokenStr }
        });

        if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
            if (tokenRecord) {
                await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
            }
            throw new UnauthorizedException('Refresh token invalid or expired.');
        }

        // Verify JWT refresh token signature
        try {
            const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
            this.jwtService.verify(refreshTokenStr, { secret: refreshSecret });

            // Generate new tokens
            const tokens = await this.generateTokens(tokenRecord.userId);

            // Delete old refresh token & insert new one (rotation)
            await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });

            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
            await this.prisma.refreshToken.create({
                data: {
                    userId: tokenRecord.userId,
                    token: tokens.refreshToken,
                    expiresAt
                }
            });

            return {
                success: true,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            };
        } catch (err) {
            await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
            throw new UnauthorizedException('Refresh token signature invalid.');
        }
    }

    async logout(refreshTokenStr: string) {
        const tokenRecord = await this.prisma.refreshToken.findFirst({
            where: { token: refreshTokenStr }
        });

        if (tokenRecord) {
            await this.prisma.refreshToken.delete({
                where: { id: tokenRecord.id }
            });
        }

        return { success: true };
    }

    private async generateTokens(userId: string) {
        const payload = { sub: userId };
        const secret = this.configService.get<string>('JWT_SECRET');
        const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

        const accessToken = this.jwtService.sign(payload, { secret, expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { secret: refreshSecret, expiresIn: '30d' });

        return { accessToken, refreshToken };
    }
}
