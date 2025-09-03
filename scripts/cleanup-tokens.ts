import { PasswordResetService } from '../src/infrastructure/services/PasswordResetService';

/**
 * Script utilitaire pour nettoyer les tokens de reset de mot de passe expirés
 * Usage: npm run cleanup-tokens
 */
async function cleanupExpiredTokens() {
  const passwordResetService = new PasswordResetService();
  
  try {
    console.log('🧹 Nettoyage des tokens expirés...');
    const deletedCount = await passwordResetService.cleanupExpiredTokens();
    console.log(`✅ ${deletedCount} token(s) expiré(s) supprimé(s)`);
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  cleanupExpiredTokens();
}

export { cleanupExpiredTokens };
