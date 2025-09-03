import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PasswordResetService } from '../../../../infrastructure/services/PasswordResetService';
import { EmailService } from '../../../../infrastructure/services/EmailService';

interface GlobalWithPrisma {
  prisma?: PrismaClient;
}
const globalForPrisma = global as unknown as GlobalWithPrisma;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

const passwordResetService = new PasswordResetService();

// Configuration email
const emailConfig = {
  host: process.env.EMAIL_HOST || 'localhost',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
  from: process.env.EMAIL_FROM || 'noreply@jeb-incubator.com',
};

const emailService = new EmailService(emailConfig);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body || {};

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    // Cherche l'utilisateur par email
    const user = await prisma.s_USER.findFirst({ 
      where: { email: email.toLowerCase().trim() } 
    });

    if (!user) {
      // Pour des raisons de sécurité, on ne révèle pas que l'email n'existe pas
      return NextResponse.json({ 
        message: 'Si cet email existe dans notre système, un lien de réinitialisation a été envoyé.' 
      });
    }

    // Génère un token de réinitialisation
    const resetToken = await passwordResetService.createResetToken(user.id);

    // Envoie l'email
    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken, user.name);
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      return NextResponse.json({ 
        error: 'Erreur lors de l\'envoi de l\'email' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Si cet email existe dans notre système, un lien de réinitialisation a été envoyé.' 
    });

  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}
