# Architecture & Module Guide

## Architecture Overview

This is a modular NestJS backend following clean architecture principles with:
- **Modular Design**: Each feature is an independent module
- **Separation of Concerns**: Controllers, Services, and DTOs clearly separated
- **Security**: Guards, Decorators, and Filters for request validation
- **Error Handling**: Global exception filters with consistent error responses
- **Type Safety**: Full TypeScript with Zod validation

## Module Structure

Each module follows this pattern:
```
module-name/
├── module-name.controller.ts   # API endpoints
├── module-name.service.ts      # Business logic
├── module-name.module.ts       # Module definition
└── dto/                        # Data Transfer Objects
    └── create-*.dto.ts
    └── update-*.dto.ts
```

## Core Modules

### Authentication (auth)
Handles user registration, login, and session management.
- Uses JWT for stateless authentication
- Integrates with Supabase authentication
- Provides AuthGuard for protected routes

### Products (products)
Manages product catalog with filtering and search capabilities.
- CRUD operations
- Category association
- Rating and review integration

### Cart (cart)
Shopping cart management for users.
- Add/remove items
- Quantity updates
- Session persistence via Zustand (frontend)

### Orders (orders)
Order processing and tracking.
- Order creation from cart
- Order history
- Status tracking

### Additional Modules
- **Categories**: Product categorization
- **Reviews**: Product ratings and comments
- **Wishlist**: User favorite products

## Common Utilities

### Decorators
- `@CurrentUser()`: Injects current authenticated user
- `@Roles()`: Role-based access control

### Guards
- `AuthGuard`: JWT validation
- `RolesGuard`: Permission checking

### Filters
- `HttpExceptionFilter`: Standardized error responses

### Pipes
- `ZodValidationPipe`: Request body validation

### Interceptors
- `TransformInterceptor`: Response transformation

## Data Flow

```
HTTP Request
    ↓
Controller (validates, calls service)
    ↓
Service (business logic, database operations)
    ↓
Supabase (PostgreSQL)
    ↓
Service (formats response)
    ↓
Interceptor (transforms response)
    ↓
HTTP Response
```

## Best Practices

1. **DTOs**: Use Data Transfer Objects for all request/response bodies
2. **Validation**: Validate all inputs using ZodValidationPipe
3. **Error Handling**: Throw HttpException with appropriate status codes
4. **Database**: Use Supabase client for all database operations
5. **Security**: Always check authentication and authorization
6. **Logging**: Use logger for debugging (to be implemented)
7. **Testing**: Write unit tests for services and E2E tests for APIs

## Environment Variables

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_KEY`: Supabase service role key
- `JWT_SECRET`: Secret for JWT signing
- `JWT_EXPIRES_IN`: JWT expiration time
- `PORT`: Server port (default: 3000)

## Adding a New Module

1. Generate module structure: `nest generate resource modules/new-feature`
2. Implement controller methods
3. Implement service logic
4. Create DTOs in dto/ folder
5. Add module to app.module.ts imports
6. Write tests
7. Document endpoints in API.md

## Running in Different Environments

- **Development**: `npm run start:dev` (with hot reload)
- **Testing**: `npm run test:e2e` (E2E test suite)
- **Production**: `npm run build && npm start`
