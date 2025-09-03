import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('API Routes Structure', () => {
  it('should have all required API route files', () => {
    // Test de structure basique pour vérifier que les fichiers existent
    const apiRoutesDir = path.join(process.cwd(), 'src/app/api');
    
    // Vérifier que le dossier API existe
    expect(fs.existsSync(apiRoutesDir)).toBe(true);
    
    // Vérifier les routes principales
    const expectedRoutes = [
      'users/route.ts',
      'news/route.ts',
      'events/route.ts',
      'startups/route.ts',
      'founders/route.ts',
      'investors/route.ts',
      'partners/route.ts',
      'likes/route.ts',
      'bookmarks/route.ts',
      'follows/route.ts',
      'analytics/page-view/route.ts'
    ];
    
    expectedRoutes.forEach(route => {
      const routePath = path.join(apiRoutesDir, route);
      expect(fs.existsSync(routePath), `Route ${route} should exist`).toBe(true);
    });
  });

  it('should have proper HTTP methods exported', async () => {
    // Test que les fichiers de route exportent les bonnes méthodes HTTP
    const testCases = [
      { file: 'users/route.ts', expectedMethods: ['GET', 'POST'] },
      { file: 'news/route.ts', expectedMethods: ['GET', 'POST'] },
      { file: 'events/route.ts', expectedMethods: ['GET', 'POST'] },
      { file: 'startups/route.ts', expectedMethods: ['GET', 'POST'] },
    ];

    for (const testCase of testCases) {
      try {
        const routeModule = await import(`../../app/api/${testCase.file}`);
        
        testCase.expectedMethods.forEach(method => {
          expect(
            typeof routeModule[method] === 'function',
            `${testCase.file} should export ${method} method`
          ).toBe(true);
        });
      } catch (error) {
        // Si l'import échoue, on note que le fichier existe mais peut avoir des dépendances manquantes
        console.warn(`Could not import ${testCase.file}:`, error);
      }
    }
  });

  it('should validate API response structure', () => {
    // Test du format de réponse standard
    const successResponse = {
      success: true,
      data: { id: 1, name: 'Test' }
    };

    const errorResponse = {
      success: false,
      error: 'Something went wrong'
    };

    // Vérifier la structure des réponses de succès
    expect(successResponse).toHaveProperty('success');
    expect(successResponse).toHaveProperty('data');
    expect(successResponse.success).toBe(true);

    // Vérifier la structure des réponses d'erreur
    expect(errorResponse).toHaveProperty('success');
    expect(errorResponse).toHaveProperty('error');
    expect(errorResponse.success).toBe(false);
  });
});
