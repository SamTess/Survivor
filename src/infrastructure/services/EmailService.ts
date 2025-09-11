import nodemailer from 'nodemailer';
import axios, { AxiosError } from 'axios';

export interface EmailConfig {
  emailServerUrl?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
  from?: string;
  rejectUnauthorized?: boolean;
}

export interface EmailData {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

export class EmailService {
  private emailServerUrl: string | null;
  private fallbackTransporter: nodemailer.Transporter | null = null;

  constructor(private config: EmailConfig) {
    console.log('EmailService config:', config);
    let emailServerUrl = config.emailServerUrl || null;
    if (!emailServerUrl && process.env.EMAIL_SERVER_IP) {
      const ip = process.env.EMAIL_SERVER_IP;
      const port = process.env.EMAIL_SERVER_PORT || '4000';
      emailServerUrl = `http://${ip}:${port}/send-email`;
    }
    this.emailServerUrl = emailServerUrl;
    if (this.emailServerUrl) {
      console.log('📧 Using external email server for email sending:', this.emailServerUrl);
    } else {
      console.log('📧 Using direct SMTP for email sending');
      this.setupFallbackTransporter();
    }
  }

  private setupFallbackTransporter() {
    if (this.config.host && this.config.auth) {
      this.fallbackTransporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port || 587,
        secure: this.config.secure || false,
        auth: this.config.auth,
        tls: {
          rejectUnauthorized: this.config.rejectUnauthorized !== false
        }
      });
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string, userName: string): Promise<void> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            .logo { width: 60px; height: 60px; margin: 0 auto 20px; background: white; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #667eea; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">J</div>
              <h1>Reset your password</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${userName}</strong>,</p>

              <p>We noticed that your account doesn't have a password set yet. For security reasons, we invite you to create a password for your Jeb Incubator account.</p>

              <p>Click the button below to create your password:</p>

              <a href="${resetUrl}" class="button">Create my password</a>

              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px; font-family: monospace;">${resetUrl}</p>

              <p><strong>Important:</strong> This link will expire in 72 hours for security reasons.</p>

              <p>If you didn't request this reset, you can safely ignore this message.</p>

              <p>Best regards,<br>The Jeb Incubator Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Jeb Incubator. All rights reserved.</p>
              <p>This email was sent automatically, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
      Hello ${userName},

      We noticed that your account doesn't have a password set yet. For security reasons, we invite you to create a password for your Jeb Incubator account.

      Visit this link to create your password: ${resetUrl}

      Important: This link will expire in 72 hours for security reasons.

      If you didn't request this reset, you can safely ignore this message.

      Best regards,
      The Jeb Incubator Team
    `;

    if (this.emailServerUrl) {
        console.log("Email");
      await this.sendViaEmailServer({
        from: this.config.from || 'noreply@jeb-incubator.com',
        to,
        subject: 'Create your password - Jeb Incubator',
        text: textContent,
        html: htmlContent
      });
    } else {
        console.log("SMTP");
      await this.sendViaSMTP({
        from: this.config.from || 'noreply@jeb-incubator.com',
        to,
        subject: 'Create your password - Jeb Incubator',
        text: textContent,
        html: htmlContent
      });
    }
  }

  private async sendViaEmailServer(emailData: EmailData): Promise<void> {
    if (!this.emailServerUrl) {
      throw new Error('Email server URL not configured');
    }
    try {
      await axios.post(this.emailServerUrl, emailData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error: unknown) {
      const err = error as AxiosError;
      if (err.response) {
        throw new Error(`Email server returned ${err.response.status}: ${err.response.data}`);
      } else if (err.request) {
        throw new Error('No response from email server');
      } else {
        throw new Error(`Failed to send email via server: ${err.message}`);
      }
    }
  }

  private async sendViaSMTP(emailData: EmailData): Promise<void> {
    if (!this.fallbackTransporter) {
      throw new Error('No email configuration available');
    }

    await this.fallbackTransporter.sendMail(emailData);
  }

  async verifyConnection(): Promise<boolean> {
    if (this.emailServerUrl) {
      try {
        const healthUrl = this.emailServerUrl.replace('/send-email', '/health');
        const response = await axios.get(healthUrl, { timeout: 5000 });
        return response.status === 200;
      } catch (error: unknown) {
        console.error('Email server health check failed:', error);
        return false;
      }
    } else if (this.fallbackTransporter) {
      try {
        await this.fallbackTransporter.verify();
        return true;
      } catch (error: unknown) {
        console.error('SMTP connection failed:', error);
        return false;
      }
    }
    return false;
  }
}