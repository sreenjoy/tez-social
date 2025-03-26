import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    if (this.configService.get('SMTP_HOST') && 
        this.configService.get('SMTP_USER') && 
        this.configService.get('SMTP_PASS')) {
      // Production email configuration
      this.transporter = nodemailer.createTransport({
        host: this.configService.get('SMTP_HOST'),
        port: this.configService.get('SMTP_PORT') || 587,
        secure: this.configService.get('SMTP_SECURE') === 'true',
        auth: {
          user: this.configService.get('SMTP_USER'),
          pass: this.configService.get('SMTP_PASS'),
        },
      });
      this.logger.log('Using email configuration with SMTP server');
    } else {
      // No email configuration available
      this.logger.warn('No email configuration found. Emails will be logged but not sent.');
      this.transporter = null;
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const verificationUrl = `${frontendUrl}/auth/verify?token=${token}`;
    
    const subject = 'Verify your Tez Social account';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3f51b5;">Welcome to Tez Social!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #3f51b5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Verify Email
          </a>
        </div>
        <p>Or copy and paste this URL into your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #666; font-size: 12px;">
          If you didn't register for Tez Social, you can safely ignore this email.
        </p>
      </div>
    `;
    
    // If transporter is not available, log and return
    if (!this.transporter) {
      this.logger.log(`Email verification would be sent to ${to}`);
      this.logger.log(`Verification URL: ${verificationUrl}`);
      return true;
    }

    try {
      // Send actual email
      const info = await this.transporter.sendMail({
        from: `"Tez Social" <${this.configService.get('SMTP_FROM') || 'noreply@tezsocial.com'}>`,
        to,
        subject,
        html,
      });
      
      this.logger.log(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
      return false;
    }
  }
} 