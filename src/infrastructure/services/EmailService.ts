import nodemailer from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  rejectUnauthorized?: boolean;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: EmailConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
      tls: {
        rejectUnauthorized: config.rejectUnauthorized !== false
      }
    });
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
              <h1>Réinitialisation de votre mot de passe</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${userName}</strong>,</p>
              
              <p>Nous avons remarqué que votre compte n'a pas encore de mot de passe défini. Pour des raisons de sécurité, nous vous invitons à créer un mot de passe pour votre compte Jeb Incubator.</p>
              
              <p>Cliquez sur le bouton ci-dessous pour créer votre mot de passe :</p>
              
              <a href="${resetUrl}" class="button">Créer mon mot de passe</a>
              
              <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
              <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px; font-family: monospace;">${resetUrl}</p>
              
              <p><strong>Important :</strong> Ce lien expirera dans 72 heures pour des raisons de sécurité.</p>
              
              <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer ce message en toute sécurité.</p>
              
              <p>Cordialement,<br>L'équipe Jeb Incubator</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Jeb Incubator. Tous droits réservés.</p>
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
      Bonjour ${userName},

      Nous avons remarqué que votre compte n'a pas encore de mot de passe défini. Pour des raisons de sécurité, nous vous invitons à créer un mot de passe pour votre compte Jeb Incubator.

      Visitez ce lien pour créer votre mot de passe : ${resetUrl}

      Important : Ce lien expirera dans 72 heures pour des raisons de sécurité.

      Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer ce message en toute sécurité.

      Cordialement,
      L'équipe Jeb Incubator
    `;

    await this.transporter.sendMail({
      from: this.config.from,
      to,
      subject: 'Créez votre mot de passe - Jeb Incubator',
      text: textContent,
      html: htmlContent,
    });
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}
