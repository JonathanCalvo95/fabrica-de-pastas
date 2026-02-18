# Fábrica de Pastas - AI Agent Instructions

## Project Overview
Full-stack pasta factory management system with:
- **Backend**: ASP.NET Core 8.0 + MongoDB (no ORM queries, native driver)
- **Frontend**: React 19 + TypeScript + Vite + Material-UI + React Router v7
- **Auth**: JWT-based with role-based access control (RBAC)

## Architecture Patterns

### Backend (C# - `/back`)
- **Layered architecture**: Controllers → Services → Repositories → MongoDB
- **DI registration** in [Program.cs](../back/Program.cs): All repositories/services registered as scoped
- **No DTOs in domain layer**: Entity models are in `/Entities`, DTOs in `/Dtos` (never mix)
- **AutoMapper**: Used for entity-to-DTO mapping (see [ProductoProfile.cs](../back/Mapping/ProductoProfile.cs))
- **Migration system**: Custom MongoDB migrations run on startup via `MigrationRunner` - see [MigrationRunner.cs](../back/Migrations/MigrationRunner.cs)
  - Migrations tracked in `_migrations` collection
  - Implement `IMigration` interface with unique `Id` property
  - Executed in alphabetical order by Id on app startup

### Frontend (TypeScript - `/front`)
- **Routing**: Nested routes with role-based protection via `<ProtectedRoute>` HOC
- **API layer**: Centralized axios instance in [api.ts](../front/src/api/api.ts) with interceptors for auth & error handling
- **State management**: No global state library - uses React Query (@tanstack/react-query) for server state
- **Role mapping**: JWT role claims mapped to Spanish labels via `getUserRole()` in [auth.ts](../front/src/utils/auth.ts)
  - Handles numeric enum values (1=Administrador, 2=Productor, 3=Vendedor)
  - Uses `tipoRolLabel()` from [enums.ts](../front/src/utils/enums.ts) for display

## Critical Conventions

### Role-Based Access
**Three roles** defined in [TipoRol.cs](../back/Enums/TipoRol.cs):
1. **Administrador** (1): Full access - Dashboard, Usuarios, Productos, Ventas, Pedidos, Caja
2. **Productor** (2): Stock & Productos only
3. **Vendedor** (3): Ventas, Pedidos, Caja

**Frontend route protection**:
- Wrap routes with `<ProtectedRoute allowedRoles={["Administrador", "Vendedor"]} />`
- Initial redirect logic in [RoleRedirect.tsx](../front/src/components/RoleRedirect.tsx)
- Check [App.tsx](../front/src/App.tsx) for current route structure

**Backend controller authorization**:
```csharp
[Authorize(Roles = "Administrador")]
[HttpGet]
public async Task<IActionResult> GetAll() { }
```

### MongoDB Patterns
- **Entity IDs**: Always `string` with `[BsonId]` and `BsonRepresentation(BsonType.ObjectId)`
- **Soft deletes**: Use `Activo` boolean flag, never hard delete
- **Date handling**: All dates stored as UTC (`DateTime.UtcNow`, `[BsonDateTimeOptions(Kind = DateTimeKind.Utc)]`)
- **Repository pattern**: Use `IMongoCollection<T>` from [MongoDbContext.cs](../back/Configuration/MongoDbContext.cs)
- **Atomic operations**: Use `FindOneAndUpdateAsync` for transactional stock updates (see [ProductoRepository.cs](../back/Repositories/ProductoRepository.cs) `DecrementStockIfEnoughAsync`)

### Frontend Conventions
- **Enum labels**: All enums have `*_OPTIONS` arrays and `*Label()` helpers in [enums.ts](../front/src/utils/enums.ts)
- **API error handling**: Automatic redirects to `/error/{401|403|500}` via axios interceptors
- **Forms**: Use `react-hook-form` + MUI integration (`react-hook-form-mui`)
- **Navigation**: Sidebar items defined in [navigation.ts](../front/src/config/navigation.ts) with `allowedRoles` filtering

## Development Workflow

### Backend
```powershell
cd back
dotnet build                    # Build project
dotnet run                      # Run with hot reload (port 5000/5001)
```
- **appsettings**: JWT key must be ≥16 chars in `appsettings.Development.json`
- **MongoDB**: Connection string in `MongoDbConfiguration` section
- **Migrations**: Auto-run on startup - add new ones to DI in [Program.cs](../back/Program.cs)

### Frontend
```powershell
cd front
npm install
npm run dev                     # Vite dev server (default port 5173)
npm run build                   # TypeScript check + production build
```
- **Environment**: `VITE_API_URL` in `.env` for backend URL
- **Linting**: ESLint configured with TypeScript rules

## Key Integration Points

### Authentication Flow
1. Frontend: POST to `/api/Auth/login` with `{ usuario, clave }` → receives JWT token
2. Token stored in `localStorage.getItem("authToken")`
3. Axios interceptor adds `Authorization: Bearer {token}` to all requests
4. Backend validates via `JwtBearerDefaults` authentication scheme

### Stock Management
- Decrement: `ProductoRepository.DecrementStockIfEnoughAsync()` - atomic check & update
- Increment: `IncrementStockAsync()` for order cancellations/returns
- Always done within service layer, never in controllers

### Error Boundaries
- Frontend has [AppErrorBoundary](../front/src/components/AppErrorBoundary.tsx) at root level
- Custom error pages in `/errors` directory for 401/403/404/500

## Component Structure
- **AppLayout**: Navbar + Sidebar + Footer wrapper (see [AppLayout.tsx](../front/src/AppLayout.tsx))
- **Sidebar context**: `useSidebar()` hook from [SidebarContext.tsx](../front/src/context/SidebarContext.tsx)
- **Theme**: Centralized MUI theme in [Theme.ts](../front/src/theme/Theme.ts)

## Common Pitfalls
- Don't use entity models in DTOs - always create separate DTO classes
- Frontend role checks must use Spanish labels ("Administrador"), not enum numbers
- MongoDB updates require `Set(p => p.FechaActualizacion, DateTime.UtcNow)` for audit trail
- Protected routes need nested `<ProtectedRoute>` structure (see [App.tsx](../front/src/App.tsx) examples)
