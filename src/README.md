# Código Fuente de TravelDLS

Esta carpeta contiene el código fuente del sistema TravelDLS. Actualmente, la aplicación está organizada de la siguiente manera:

```text
src/
├── backend/                 # API y lógica del servidor
│   ├── app/
│   │   ├── controllers/     # Controladores HTTP
│   │   ├── enums/           # Enumeraciones del dominio
│   │   ├── middleware/      # Middleware de autenticación y seguridad
│   │   ├── models/          # Modelos y relaciones de base de datos
│   │   ├── services/        # Lógica de negocio
│   │   └── validators/      # Validación de datos de entrada
│   ├── config/              # Configuración de AdonisJS
│   ├── database/
│   │   ├── migrations/      # Estructura y cambios de la base de datos
│   │   └── seeders/         # Datos iniciales
│   ├── start/               # Rutas y configuración de inicio
│   ├── tests/               # Pruebas automatizadas
│   ├── package.json         # Dependencias y scripts del backend
│   ├── adonisrc.ts          # Configuración principal de AdonisJS
│   └── .env.example         # Variables de entorno de referencia
└── README.md                # Esta guía
```

## Backend

El backend está desarrollado con **AdonisJS**, **TypeScript**, **Lucid ORM** y **PostgreSQL**. La carpeta `src/backend` es la raíz de la aplicación AdonisJS.

Para instalar las dependencias y ejecutar el backend:

```bash
cd src/backend
pnpm install
pnpm dev
```

Comandos útiles:

```bash
pnpm typecheck    # Comprueba los tipos de TypeScript
pnpm test         # Ejecuta las pruebas
pnpm build        # Genera la compilación de producción
```

Las variables de entorno deben configurarse copiando `src/backend/.env.example` como `.env`. El archivo `.env` puede contener credenciales y no debe subirse al repositorio.

## Organización futura

Si se incorpora una interfaz web, puede agregarse como `src/frontend/`, manteniendo su propio `package.json` y configuración independiente del backend.

Las dependencias instaladas, archivos compilados y temporales deben mantenerse fuera del control de versiones mediante los archivos `.gitignore` correspondientes.
