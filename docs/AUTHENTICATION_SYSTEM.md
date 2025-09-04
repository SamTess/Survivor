# Authentication System Documentation

This document describes the authentication system that includes an API service using axios, context provider, and authentication context with user permissions and login status management.

## Components Overview

### 1. ApiService (`src/infrastructure/services/ApiService.ts`)
A comprehensive HTTP client service using axios that handles:
- Request/response interceptors
- Automatic error handling
- Cookie-based authentication
- Authentication-specific methods (login, signup, logout, etc.)

### 2. AuthContext (`src/context/AuthContext.tsx`)
Enhanced authentication context that provides:
- User state management
- Authentication actions (login, signup, logout)
- Authorization helpers (role and permission checking)
- Error handling
- Loading states

### 3. Auth Guards (`src/components/auth/AuthGuards.tsx`)
React components for conditional rendering based on authentication state:
- `ProtectedRoute` - General route protection
- `RoleGuard` - Role-based content rendering
- `PermissionGuard` - Permission-based content rendering
- `AdminOnly`, `ModeratorOnly` - Convenience components

### 4. Auth Hooks (`src/hooks/useAuthGuards.ts`)
Utility hooks for navigation and access control:
- `useAuthRedirect` - Redirect unauthenticated users
- `useRoleGuard` - Check role requirements
- `usePermissionGuard` - Check permission requirements
- `useAdminGuard`, `useModeratorGuard` - Convenience hooks

### 5. Login Form (`src/components/auth/LoginForm.tsx`)
A complete login form component demonstrating the new auth system usage.

## Usage Examples

### Basic Authentication Check
```tsx
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Welcome, {user?.name}!</div>;
}
```

### Login Implementation
```tsx
import { useAuth } from '@/context/AuthContext';

function LoginPage() {
  const { login, loading, error } = useAuth();

  const handleLogin = async (credentials) => {
    const result = await login(credentials);
    
    if (result.success) {
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } else if (result.error?.requiresPasswordReset) {
      // Handle password reset case
      console.log('Password reset required:', result.error.resetUrl);
    } else {
      // Show error message
      console.error('Login failed:', result.error?.message);
    }
  };

  return (
    <LoginForm onSuccess={() => window.location.href = '/dashboard'} />
  );
}
```

### Role-Based Access Control
```tsx
import { RoleGuard, AdminOnly } from '@/components/auth/AuthGuards';

function AdminPanel() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Show for all authenticated users */}
      <RoleGuard roles={['USER', 'MODERATOR', 'ADMIN']}>
        <UserContent />
      </RoleGuard>

      {/* Show only for moderators and admins */}
      <RoleGuard roles={['MODERATOR', 'ADMIN']}>
        <ModeratorContent />
      </RoleGuard>

      {/* Show only for admins */}
      <AdminOnly>
        <AdminOnlyContent />
      </AdminOnly>
    </div>
  );
}
```

### Permission-Based Access Control
```tsx
import { PermissionGuard } from '@/components/auth/AuthGuards';
import { useAuth } from '@/context/AuthContext';

function ContentManager() {
  const { hasPermission, hasAllPermissions } = useAuth();

  return (
    <div>
      <PermissionGuard permissions="content:read">
        <div>You can read content</div>
      </PermissionGuard>

      <PermissionGuard permissions={['content:write', 'content:publish']}>
        <div>You can write and publish content</div>
      </PermissionGuard>

      {hasPermission('admin:delete') && (
        <button>Delete All Content</button>
      )}
    </div>
  );
}
```

### Route Protection with Hooks
```tsx
import { useAuthRedirect, useAdminGuard } from '@/hooks/useAuthGuards';

function AdminPage() {
  // Automatically redirect if not authenticated
  useAuthRedirect('/login');
  
  // Check admin role and redirect if not admin
  const { hasAccess, loading } = useAdminGuard('/dashboard');

  if (loading) return <div>Loading...</div>;
  if (!hasAccess) return null; // Will redirect automatically

  return <div>Admin-only content</div>;
}
```

### Using the API Service Directly
```tsx
import { apiService } from '@/infrastructure/services/ApiService';

async function fetchUserData() {
  const response = await apiService.get('/users/profile');
  
  if (response.success) {
    console.log('User data:', response.data);
  } else {
    console.error('Error:', response.error);
  }
}

async function updateProfile(data) {
  const response = await apiService.put('/users/profile', data);
  
  if (response.success) {
    console.log('Profile updated:', response.data);
  } else {
    console.error('Update failed:', response.error);
  }
}
```

## API Service Features

### Request/Response Interceptors
- Automatic logging of API calls
- Error handling for common HTTP status codes
- Custom event emission for unauthorized access (401)
- Automatic handling of server errors (5xx)

### Authentication Methods
- `login(credentials)` - User login
- `signup(userData)` - User registration
- `logout()` - User logout
- `getCurrentUser()` - Get current user info
- `requestPasswordReset(email)` - Request password reset
- `resetPassword(token, password)` - Reset password with token

### Generic HTTP Methods
- `get(url, config)`
- `post(url, data, config)`
- `put(url, data, config)`
- `patch(url, data, config)`
- `delete(url, config)`

## Error Handling

The system provides comprehensive error handling:

1. **Network Errors**: Caught and wrapped in a consistent format
2. **HTTP Errors**: Status codes are handled appropriately
3. **Authentication Errors**: Special handling for login failures and password reset requirements
4. **Unauthorized Access**: Automatic event emission and session clearing

## Integration with Existing Code

The new system is designed to be a drop-in replacement for the existing AuthContext. All existing components using `useAuth()` will continue to work, but now have access to additional features like:

- Enhanced error handling
- Login/signup methods
- Additional utility getters (`isAdmin`, `isModerator`, etc.)
- Permission checking helpers

## Configuration

The API service uses the following default configuration:
- Base URL: `/api`
- Timeout: 10 seconds
- Credentials: Included (for cookies)
- Content-Type: `application/json`

These can be customized when creating a new ApiService instance:

```tsx
const customApiService = new ApiService('/api/v2');
```

## Security Considerations

1. **HTTP-Only Cookies**: Authentication tokens are stored in HTTP-only cookies for security
2. **CSRF Protection**: The system works with the existing CSRF middleware
3. **Automatic Token Refresh**: The system handles token refresh through the `/api/auth/me` endpoint
4. **Session Expiration**: Automatic handling of expired sessions with redirect to login

## Testing

The system is designed to be easily testable. Mock the `apiService` for unit tests:

```tsx
import { apiService } from '@/infrastructure/services/ApiService';

// Mock successful login
jest.spyOn(apiService, 'login').mockResolvedValue({
  success: true,
  data: { id: 1, name: 'Test User', email: 'test@example.com', role: 'USER' }
});
```
