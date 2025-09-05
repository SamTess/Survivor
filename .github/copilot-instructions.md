# Copilot Instructions for Survivor Project

## Project Overview
This is a **Next.js 15.5.2** startup incubator platform using **React 19.1.0**, **TypeScript**, and **Onion Architecture**. The application manages startup listings, user authentication, news, events, and analytics with **PostgreSQL** database via **Prisma ORM**.

## Architecture Pattern: Onion Architecture

### Core Principles
- **Domain** layer: Pure business logic, no external dependencies
- **Application** layer: Use cases and services orchestration
- **Infrastructure** layer: External concerns (database, APIs, email)
- **Presentation** layer: Next.js app router and components

### Layer Structure
```
src/
├── domain/           # Business entities and interfaces
│   ├── entities/     # Core business models (User, Startup, News, Event)
│   ├── enums/        # Business enums and constants
│   ├── interfaces/   # Domain interfaces and contracts
│   └── repositories/ # Repository interfaces (no implementation)
├── application/      # Use cases and application services
│   └── services/     # Business logic orchestration
├── infrastructure/   # External concerns implementation
│   ├── persistence/  # Database models and mappers
│   ├── repositories/ # Prisma repository implementations
│   ├── services/     # External API services
│   ├── security/     # Authentication and authorization
│   └── logging/      # Logging and monitoring
└── app/             # Next.js presentation layer
    ├── api/         # API routes
    ├── [pages]/     # Application pages
    └── components/  # React components
```

## Database Schema

### Table Naming Convention
All tables use `S_` prefix (e.g., `S_User`, `S_Startup`, `S_News`, `S_Event`).

### Key Entities
- **S_User**: User accounts with authentication
- **S_Startup**: Startup companies with full details
- **S_News**: News articles with content and metadata
- **S_Event**: Events with dates and descriptions
- **S_UserInteraction**: User engagement tracking (likes, bookmarks, follows)

### Connection String
```env
DATABASE_URL="postgresql://survivor_user:survivor_password@db:5432/survivor_db"
```

## Development Environment

### Docker Setup
- **Development**: `docker-compose up -d` (port 3000)
- **Production**: `docker-compose -f docker-compose.prod.yml up -d` (port 8080)
- **Database**: PostgreSQL on port 5432

### Essential Commands
```bash
# Start development
docker-compose up -d

# Database operations
docker-compose exec db psql -U survivor_user -d survivor_db
npx prisma migrate dev
npx prisma generate

# Development server
npm run dev  # Uses Turbopack for faster builds
```

## Code Patterns

### Repository Pattern
All database access goes through repository interfaces:

```typescript
// Domain interface
export interface UserRepository {
  findById(id: number): Promise<User | null>
  create(userData: CreateUserData): Promise<User>
  // ...
}

// Infrastructure implementation
export class UserRepositoryPrisma implements UserRepository {
  constructor(private prisma: PrismaClient) {}
  
  async findById(id: number): Promise<User | null> {
    const prismaUser = await this.prisma.s_User.findUnique({
      where: { id }
    })
    return prismaUser ? UserMapper.toDomain(prismaUser) : null
  }
}
```

### Service Layer Pattern
Application services orchestrate business logic:

```typescript
export class UserService {
  constructor(private userRepository: UserRepository) {}
  
  async getUserById(id: number): Promise<User | null> {
    return await this.userRepository.findById(id)
  }
}
```

### Mapper Pattern
Convert between domain entities and Prisma models:

```typescript
export class UserMapper {
  static toDomain(prismaUser: S_User): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      // ... map all fields
    }
  }
  
  static toPrisma(user: User): S_User {
    return {
      id: user.id,
      email: user.email,
      // ... map all fields
    }
  }
}
```

### Dependency Injection
Use container pattern for service composition:

```typescript
// composition/container.ts
export const container = {
  userRepository: new UserRepositoryPrisma(prisma),
  userService: new UserService(container.userRepository),
  // ...
}
```

## API Route Patterns

### Standard Structure
```typescript
// app/api/[resource]/route.ts
import { container } from '@/composition/container'

export async function GET() {
  try {
    const data = await container.resourceService.getAll()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
```

### Authentication Routes
- JWT tokens stored in httpOnly cookies
- Password hashing with scrypt
- Session validation middleware

## Component Patterns

### Custom Hooks
Create hooks for data fetching with loading/error states:

```typescript
export function useResourceData() {
  const [data, setData] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch logic
  }, [])

  return { data, loading, error }
}
```

### Component Structure
- Use TypeScript interfaces for props
- Implement loading states with skeletons
- Handle errors gracefully
- Follow Tailwind CSS patterns

## External Integrations

### Email System
- Nodemailer for transactional emails
- Password reset functionality
- Template-based email sending

### External API Sync
- Automated data synchronization
- Configurable sync intervals
- Debug mode for development

### Analytics
- User interaction tracking
- Performance monitoring
- Custom analytics service

## Testing

### Framework
- **Vitest** for unit and integration tests
- Supertest for API testing
- Mock external dependencies

### Test Structure
```typescript
// __tests__/[feature]/[component].test.ts
describe('Component', () => {
  it('should handle expected behavior', () => {
    // Test implementation
  })
})
```

## Environment Configuration

### Required Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=development|production

# External API
EXTERNAL_API_BASE_URL=
EXTERNAL_API_KEY=

# Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=

# Sync System
SYNC_INTERVAL_MS=3600000
SYNC_AUTO=true
SYNC_DEBUG=false
```

## Deployment

### Infrastructure
- **Terraform**: DigitalOcean droplet provisioning
- **Ansible**: Application deployment automation
- **Docker**: Containerized deployment

### Environments
- **Staging**: `development` branch, port 3000
- **Production**: `main` branch, port 8080

### Deployment Commands
```bash
# Infrastructure
cd terraform && ./deploy.sh

# Application
cd ansible && ./deploy.sh
```

## Best Practices

### 1. Follow Onion Architecture
- Domain layer stays pure (no external dependencies)
- Infrastructure implements domain interfaces
- Application services orchestrate use cases
- Never import from outer layers to inner layers

### 2. Repository Pattern
- All database access through repository interfaces
- Use mappers to convert between layers
- Mock repositories for testing

### 3. Type Safety
- Use TypeScript interfaces for all data structures
- Implement proper error handling
- Validate inputs at boundaries

### 4. Performance
- Use Turbopack for development builds
- Implement proper loading states
- Cache database queries where appropriate

### 5. Security
- Validate all user inputs
- Use parameterized queries (Prisma handles this)
- Implement proper authentication checks
- Use httpOnly cookies for sensitive data

## Common Tasks

### Adding New Entity
1. Create domain entity in `domain/entities/`
2. Create repository interface in `domain/repositories/`
3. Implement Prisma repository in `infrastructure/repositories/`
4. Create mapper in `infrastructure/persistence/mappers/`
5. Add service in `application/services/`
6. Register in dependency container
7. Create API routes in `app/api/`
8. Add React components and hooks

### Database Changes
1. Update Prisma schema
2. Run `npx prisma migrate dev`
3. Update mappers and repositories
4. Update TypeScript interfaces
5. Test with Docker environment

### API Development
1. Follow existing route patterns
2. Use dependency injection container
3. Implement proper error handling
4. Add TypeScript interfaces
5. Write tests for new endpoints

## File Naming Conventions
- **PascalCase**: Components, entities, services, mappers
- **camelCase**: Functions, variables, file names (except components)
- **kebab-case**: Page routes, API endpoints
- **UPPER_CASE**: Environment variables, constants

## Dependencies to Know
- **Next.js 15.5.2**: App router, API routes, middleware
- **React 19.1.0**: Latest React features
- **Prisma 6.15.0**: Database ORM and migrations
- **TypeScript 5**: Strict type checking
- **Tailwind CSS 4**: Utility-first styling
- **Lucide React**: Icon library
- **Nodemailer**: Email sending
- **Vitest**: Testing framework

When working on this project, always respect the onion architecture principles, use the established patterns, and maintain type safety throughout the codebase.
