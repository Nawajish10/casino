import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter | null = null;

    constructor(private readonly configService: ConfigService) {
        const host = this.configService.get<string>('SMTP_HOST');
        const port = this.configService.get<number>('SMTP_PORT') || 587;
        const user = this.configService.get<string>('SMTP_USER');
        const pass = this.configService.get<string>('SMTP_PASSWORD');

        if (host && user && pass) {
            try {
                this.transporter = nodemailer.createTransport({
                    host,
                    port,
                    secure: Number(port) === 465,
                    auth: { user, pass }
                });
            } catch (err) {
                this.logger.error('Failed to initialize Nodemailer SMTP transporter:', err);
            }
        } else {
            this.logger.warn('SMTP credentials missing. Email service will run in simulator fallback mode.');
        }
    }

    async sendVerificationEmail(email: string, token: string): Promise<boolean> {
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
        const verifyLink = `${frontendUrl}/auth/verify-email?token=${token}`;

        this.logger.log(`[EMAIL SIMULATOR] Verification link for ${email}: ${verifyLink}`);

        if (this.transporter) {
            const sender = this.configService.get<string>('SMTP_USER');
            try {
                await this.transporter.sendMail({
                    from: `"Casino Support" <${sender}>`,
                    to: email,
                    subject: 'Verify your email address',
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #070F1E; color: #ffffff; border-radius: 8px; max-width: 600px;">
                            <h2 style="color: #00BAE6;">Email Verification</h2>
                            <p>Thank you for registering. Please click the button below to verify your email address:</p>
                            <a href="${verifyLink}" style="display: inline-block; padding: 10px 20px; margin: 15px 0; background-color: #00BAE6; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
                            <p>Or copy and paste this link into your browser:</p>
                            <p style="word-break: break-all; color: #58D6FF;">${verifyLink}</p>
                            <hr style="border-color: #222D44; margin: 20px 0;" />
                            <p style="font-size: 12px; color: #919EAB;">If you did not request this email, please ignore it.</p>
                        </div>
                    `
                });
                this.logger.log(`Verification email sent to ${email}`);
            } catch (error) {
                this.logger.error(`Failed to send verification email to ${email}: ${error.message}`);
            }
        }

        return true;
    }
}
