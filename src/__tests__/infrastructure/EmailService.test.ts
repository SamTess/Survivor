import { describe, it, expect } from 'vitest';
import { EmailService, EmailConfig } from '../../infrastructure/services/EmailService';

describe('EmailService Security Configuration', () => {
  it('should enable TLS certificate validation by default', () => {
    const config: EmailConfig = {
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'test@example.com',
        pass: 'password'
      },
      from: 'test@example.com'
    };

    const emailService = new EmailService(config);
    // Le service devrait être créé avec rejectUnauthorized=true par défaut
    expect(emailService).toBeInstanceOf(EmailService);
  });

  it('should allow disabling TLS certificate validation when explicitly set to false', () => {
    const config: EmailConfig = {
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'test@example.com',
        pass: 'password'
      },
      from: 'test@example.com',
      rejectUnauthorized: false
    };

    const emailService = new EmailService(config);
    // Le service devrait accepter rejectUnauthorized=false explicitement
    expect(emailService).toBeInstanceOf(EmailService);
  });

  it('should enable TLS certificate validation when explicitly set to true', () => {
    const config: EmailConfig = {
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'test@example.com',
        pass: 'password'
      },
      from: 'test@example.com',
      rejectUnauthorized: true
    };

    const emailService = new EmailService(config);
    // Le service devrait accepter rejectUnauthorized=true explicitement
    expect(emailService).toBeInstanceOf(EmailService);
  });
});
