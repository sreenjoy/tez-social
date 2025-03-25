import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    // Create a test account if not in production
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    if (isProduction && 
        this.configService.get('SMTP_HOST') && 
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
      this.logger.log('Using production email configuration');
    } else {
      // Create test account for development
      this.logger.log('Creating test email account for development');
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        this.logger.log(`Test email account created: ${testAccount.user}`);
      } catch (error) {
        this.logger.error('Failed to create test email account', error.stack);
        // Fallback to console logging only
        this.transporter = null;
      }
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

    // Always log the verification details for development/testing
    console.log('=========================================');
    console.log('📧 VERIFICATION EMAIL');
    console.log('----------------------------------------');
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log('----------------------------------------');
    console.log(`Welcome to Tez Social!`);
    console.log(`Please verify your email address by clicking the link below:`);
    console.log(`🔗 ${verificationUrl}`);
    console.log(`This link will expire in 24 hours.`);
    console.log('=========================================');
    
    // Also log the API verification method for convenience
    const apiUrl = this.configService.get<string>('API_URL') || 'http://localhost:3001';
    const apiEndpoint = `${apiUrl}/api/auth/verify-email`;
    console.log('----------------------------------------');
    console.log('🛠️ FOR TESTING: Send this JSON to the verification endpoint:');
    console.log(`POST ${apiEndpoint}`);
    console.log(JSON.stringify({ token }));
    console.log('----------------------------------------');
    
    // If transporter is not available, return true after logging
    if (!this.transporter) {
      this.logger.log(`[DEV MODE] Email verification link would be sent to ${to}`);
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
      
      // Log Ethereal URL for test emails
      if (nodemailer.getTestMessageUrl(info)) {
        this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        console.log(`📬 Test email preview: ${nodemailer.getTestMessageUrl(info)}`);
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
      return false;
    }
  }
} 