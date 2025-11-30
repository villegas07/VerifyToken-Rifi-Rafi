# TurisApp Colombia - Token Verification System

Sistema de verificación de tokens para Rifi-Rafi App que maneja tanto la verificación de usuarios como el restablecimiento de contraseñas.

## Características

- ✅ **Verificación de Email**: Activación de cuentas de usuario mediante tokens
- 🔐 **Restablecimiento de Contraseña**: Cambio de contraseña usando tokens seguros
- 🔑 **Recuperación de Cuenta**: Solicitud de recuperación usando email o ID de usuario
- 🌐 **API Integration**: Conexión completa con las APIs de TurisApp Colombia
- 📱 **Responsive Design**: Interfaz optimizada para todos los dispositivos
- 🎨 **UI/UX Moderna**: Diseño atractivo con animaciones y feedback visual

## APIs Integradas

### URL Base
```
https://app-turismo.onrender.com/api/
```

### Endpoints

#### 1. Verificación de Email
- **URL**: `POST /auth/verify-email`
- **Payload**: 
  ```json
  {
    "token": "string"
  }
  ```

#### 2. Restablecimiento de Contraseña
- **URL**: `POST /auth/reset-password`
- **Payload**: 
  ```json
  {
    "token": "string",
    "newPassword": "string (6-36 caracteres)"
  }
  ```

#### 3. Recuperación de Cuenta
- **URL**: `POST /users/{identifier}/recover-account`
- **Parámetros URL**: 
  - `identifier`: Email del usuario o ID de usuario
- **Payload**: 
  ```json
  {}
  ```
- **Ejemplo**: 
  ```
  POST /users/test@example.com/recover-account
  POST /users/user123/recover-account
  ```

## Rutas Disponibles

- `/` o `/verify-email` - Verificación de email de usuario
- `/reset-password` - Restablecimiento de contraseña
- `/recover-account` - Recuperación de cuenta de usuario
- `/demo` - Página de demostración

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200/`.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
