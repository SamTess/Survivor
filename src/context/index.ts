// Re-export everything from the enhanced auth context
export * from './AuthContext';
export { AuthProvider, useAuth, withAuth, useRequireAuth } from './AuthContext';

// This file serves as the main entry point for authentication
// It can be used to replace the existing AuthContext import in layout.tsx
