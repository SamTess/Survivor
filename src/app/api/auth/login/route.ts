import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { PrismaClient } from '@prisma/client';
import { verifyPassword, signJwt, getAuthSecret } from '../../../../infrastructure/security/auth';
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
    const { email, password } = body || {};
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    
    // email n'est pas marqué @unique dans le schema -> utilisation de findFirst
    const user = await prisma.s_USER.findFirst({ where: { email } });
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Vérifier si le mot de passe est vide en base
    if (!user.password_hash || user.password_hash.trim() === '') {
      try {
        // Générer un token de réinitialisation
        const resetToken = await passwordResetService.createResetToken(user.id);
        
        // En mode développement, afficher le lien dans la console au lieu d'envoyer l'email
        if (process.env.NODE_ENV === 'development' && (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)) {
          const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
          console.log('🔗 LIEN DE RESET DE MOT DE PASSE (MODE DEV):');
          console.log(`📧 Pour: ${user.email} (${user.name})`);
          console.log(`🔑 Token: ${resetToken}`);
          console.log(`🌐 URL: ${resetUrl}`);
          console.log('⏰ Expire dans 72h');
          
          return NextResponse.json({ 
            error: 'Aucun mot de passe défini. Le lien de reset a été généré (voir console serveur).',
            requiresPasswordReset: true,
            devMode: true,
            resetUrl: resetUrl
          }, { status: 401 });
        }
        
        // Envoyer l'email de réinitialisation (mode production)
        await emailService.sendPasswordResetEmail(user.email, resetToken, user.name);
        
        return NextResponse.json({ 
          error: 'Aucun mot de passe défini. Un email de création de mot de passe a été envoyé.',
          requiresPasswordReset: true 
        }, { status: 401 });
      } catch (emailError) {
        console.error('Erreur envoi email reset:', emailError);
        return NextResponse.json({ 
          error: 'Aucun mot de passe défini. Veuillez contacter l\'administrateur.',
          requiresPasswordReset: true 
        }, { status: 401 });
      }
    }

    // Vérifier le mot de passe normal
    if (!verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    const token = signJwt({ userId: user.id }, 60 * 60 * 24 * 7, getAuthSecret());
    const res = NextResponse.json({ id: user.id, name: user.name, email: user.email });
    res.cookies.set('auth', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, sameSite: 'lax', path: '/' });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
