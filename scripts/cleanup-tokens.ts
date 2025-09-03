import { PasswordResetService } from '../src/infrastructure/services/PasswordResetService';

/**
 * Utility script to clean up expired password reset tokens
 * Usage: npm run cleanup-tokens
 */
async function cleanupExpiredTokens() {
  const passwordResetService = new PasswordResetService();
  
  try {
    console.log('🧹 Cleaning up expired tokens...');
    const deletedCount = await passwordResetService.cleanupExpiredTokens();
    console.log(`✅ ${deletedCount} expired token(s) deleted`);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  cleanupExpiredTokens();
}

export { cleanupExpiredTokens };
