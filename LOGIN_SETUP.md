# Sistema de Login con JWT

He creado un sistema completo de autenticación con JWT que incluye:

## Backend (Node.js + TypeScript + JWT)

### Funcionalidades implementadas:
- **Modelo de Usuario** (`/backend/src/models/user.ts`): Modelo con Sequelize que incluye hash automático de contraseñas con bcryptjs
- **Controlador de Autenticación** (`/backend/src/controllers/auth.ts`): Maneja login, registro y verificación de tokens
- **Middleware de Autenticación** (`/backend/src/middleware/auth.ts`): Protege rutas que requieren autenticación
- **Rutas de Autenticación** (`/backend/src/routes/auth.ts`): Endpoints para `/api/auth/login`, `/api/auth/register`, `/api/auth/verify`

### Endpoints disponibles:
- `POST /api/auth/register`: Registrar nuevo usuario
- `POST /api/auth/login`: Iniciar sesión
- `GET /api/auth/verify`: Verificar token JWT

### Estructura de datos de usuario:
```json
{
  "id": 1,
  "nombre": "Jordi",
  "ruta": "archivos/jordi", 
  "contraseña": "123",
  "apellidos": "Fernandez Uralde"
}
```

## Frontend (Angular)

### Componente de Login
- **Ubicación**: `/frontend/src/app/componentes/login/`
- **Estilo**: Similar al componente inicio con gradientes y animaciones
- **Funcionalidades**:
  - Formulario reactivo con validación
  - Mostrar/ocultar contraseña
  - Mensajes de error y éxito
  - Loading spinner durante autenticación
  - Redirección automática después del login

### Servicio de Autenticación
- **Ubicación**: `/frontend/src/app/servicios/auth.service.ts`
- **Funcionalidades**:
  - Gestión de tokens JWT en localStorage
  - Estado de autenticación observable
  - Métodos para login, logout, verificación
  - Headers automáticos para requests autenticados

### Guard de Autenticación
- **Ubicación**: `/frontend/src/app/servicios/auth.guard.ts`
- **Función**: Protege rutas que requieren autenticación

## Cómo usar

### 1. Configurar la base de datos
Tu tabla `users` existente debe tener la siguiente estructura mínima:

```sql
-- Tu tabla 'users' debe tener estos campos:
-- id (PRIMARY KEY, AUTO_INCREMENT)
-- nombre (VARCHAR)
-- ruta (VARCHAR)
-- contraseña (VARCHAR) - para contraseñas hasheadas
-- apellidos (VARCHAR)
```

### 2. Crear un usuario de prueba
Usar el endpoint de registro o insertar manualmente en la base de datos.

### 3. Acceder al login
- Ir a `http://localhost:4200/login`
- El link "Login" se añadió al navbar del componente inicio

### 4. Datos de prueba
- **Usuario**: Jordi
- **Contraseña**: 123
- **Apellidos**: Fernandez Uralde
- **Ruta**: archivos/jordi

## Características del diseño

### Estilo similar al componente inicio:
- ✅ Gradiente de fondo
- ✅ Card con sombras y bordes redondeados
- ✅ Animaciones de entrada
- ✅ Responsive design
- ✅ Estados de hover y focus
- ✅ Colores consistentes con la paleta existente

### Funcionalidades de UX:
- ✅ Validación en tiempo real
- ✅ Mensajes de error claros
- ✅ Loading states
- ✅ Confirmación visual de éxito
- ✅ Botón para mostrar/ocultar contraseña

## Seguridad implementada

- ✅ **Hash de contraseñas** con bcryptjs (salt rounds: 10)
- ✅ **JWT tokens** con expiración de 24 horas
- ✅ **Validación server-side** de credenciales
- ✅ **Middleware de autenticación** para rutas protegidas
- ✅ **Headers Authorization** automáticos
- ✅ **Gestión segura de tokens** en localStorage

## Estado actual
- ✅ Backend configurado y funcionando
- ✅ Frontend compilando correctamente
- ✅ Componente de login creado con estilos
- ✅ Servicio de autenticación implementado
- ✅ Rutas y guards configurados
- ✅ Link agregado al navbar

¡El sistema está listo para usar! Solo necesitas crear un usuario en la base de datos y podrás probar el login completo.
