import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PasswordResetService } from '../../../../infrastructure/services/PasswordResetService';
import { hashPassword } from '../../../../infrastructure/security/auth';

interface GlobalWithPrisma {
  prisma?: PrismaClient;
}
const globalForPrisma = global as unknown as GlobalWithPrisma;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

const passwordResetService = new PasswordResetService();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = body || {};

    if (!token || !password) {
      return NextResponse.json({ 
        error: 'Token et mot de passe requis' 
      }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ 
        error: 'Le mot de passe doit contenir au moins 8 caractères' 
      }, { status: 400 });
    }

    // Valide le token
    const { userId, valid } = await passwordResetService.validateResetToken(token);

    if (!valid) {
      return NextResponse.json({ 
        error: 'Token invalide ou expiré' 
      }, { status: 400 });
    }

    // Hash le nouveau mot de passe
    const hashedPassword = hashPassword(password);

    // Met à jour le mot de passe de l'utilisateur
    await prisma.s_USER.update({
      where: { id: userId },
      data: { password_hash: hashedPassword }
    });

    // Marque le token comme utilisé
    await passwordResetService.useResetToken(token);

    return NextResponse.json({ 
      message: 'Mot de passe mis à jour avec succès' 
    });

  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    console.log('🔍 GET /api/auth/reset-password - Validation du token:', token);

    if (!token) {
      console.log('❌ Token manquant');
      return NextResponse.json({ 
        error: 'Token requis' 
      }, { status: 400 });
    }

    // Valide le token
    const result = await passwordResetService.validateResetToken(token);
    console.log('🔍 Résultat validation:', result);

    return NextResponse.json({ valid: result.valid });

  } catch (error) {
    console.error('❌ Erreur lors de la validation du token:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}
