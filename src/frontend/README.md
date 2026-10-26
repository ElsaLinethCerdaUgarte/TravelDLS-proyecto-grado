# Frontend de TravelDLS

Frontend con Next.js, App Router, TypeScript estricto y CSS Modules. Incluye una
pantalla de bienvenida responsive con formularios visuales de inicio de sesión
y registro. No consulta la API ni necesita variables de entorno o el backend encendido.

Se puede cambiar de formulario, mostrar u ocultar la contraseña y comprobar los
campos obligatorios. El envío solo presenta un aviso de vista previa: no crea
cuentas, inicia sesiones, persiste datos ni realiza peticiones de autenticación.

## Ejecutar

Requisitos: Node.js 22.13 o superior y pnpm 10.28.2 (versión usada en el proyecto).
Desde la raíz del repositorio:

```bash
cd src/frontend
pnpm install --frozen-lockfile
pnpm dev
```

Abre http://localhost:3000. Detén el servidor con `Ctrl+C`.

```bash
pnpm lint       # ESLint: reglas de Next.js y TypeScript
pnpm typecheck  # Genera tipos de rutas y comprueba TypeScript
pnpm build     # Compilación de producción
pnpm start     # Sirve la compilación en localhost:3000, después de build
```

## Dónde encontrar el código

`src/frontend` es la raíz del proyecto Next.js; su carpeta `src` contiene el
código. El alias `@/` apunta a `src/frontend/src`.

```text
src/frontend/
├── public/images/      # Logo, camión y emblema originales de TravelDLS
├── src/
│   ├── app/
│   │   ├── layout.tsx  # Layout raíz, idioma y metadatos
│   │   ├── page.tsx    # Compone la pantalla principal
│   │   └── globals.css
│   ├── components/ui/Icon/Icon.tsx
│   └── features/auth/components/
│       ├── WelcomeScreen/ # Presentación de la marca y diseño responsive
│       └── AuthPanel/     # Formularios visuales e interacción local
├── eslint.config.mjs
├── next.config.mjs      # Raíz explícita del frontend para Turbopack
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
└── README.md
```

Guía de organización; crea las carpetas adicionales cuando sean necesarias:

| Ubicación dentro de `src/` | Contenido |
| --- | --- |
| `app/` | Rutas, layouts y archivos especiales de Next.js. |
| `components/ui/` | Elementos genéricos compartidos, por ejemplo `Button/Button.tsx`. |
| `components/layout/` | Navegación compartida, por ejemplo `Header/Header.tsx`. |
| `features/<nombre-modulo>/` | Componentes, hooks, servicios y tipos de una funcionalidad. |
| `hooks/` | Hooks compartidos entre módulos. |
| `lib/` | Configuración, utilidades y cliente HTTP compartido. |
| `types/` | Tipos utilizados por distintos módulos. |
| `constants/` | Constantes compartidas. |

Los recursos estáticos están en `public/images/`, fuera de `src/`. Los estilos
de cada componente están junto a su archivo, en CSS Modules. El logo se adapta
al fondo oscuro mediante CSS; los archivos de imagen originales se conservan.
No se mantienen carpetas vacías.

## Convenciones

- Nombres en inglés: componentes y archivos en PascalCase, hooks en camelCase
  con prefijo `use`, rutas y módulos en kebab-case.
- Mantener los nombres especiales `page.tsx` y `layout.tsx`; evitar `index.tsx`
  y reexportaciones innecesarias.
- Componentes de servidor por defecto. Agregar `"use client"` solo cuando haga
  falta interactividad o APIs del navegador. Tipar explícitamente las props.
- CSS Modules junto al componente; estilos compartidos en `globals.css`.
- Ubicar el código exclusivo de una funcionalidad en su módulo. Extraer elementos
  a carpetas compartidas cuando realmente se reutilicen.
- Al conectar datos, revisar los contratos de `../backend`, separar servicios de
  presentación y manejar carga, errores y estados vacíos.
- Mantener secretos en el servidor. Las variables `NEXT_PUBLIC_*` son públicas.

Cada aplicación tiene sus propias dependencias y lockfile. Los archivos generados
(`.next/`, `next-env.d.ts`, `*.tsbuildinfo`) se ignoran en Git.

La instalación con ESLint 10 puede mostrar avisos de peer dependencies de los
plugins incluidos en `eslint-config-next`, cuyos rangos aún declaran ESLint 9.
Next.js documenta esta situación; comprueba su funcionamiento con `pnpm lint`.

Referencia: [documentación de instalación de Next.js](https://nextjs.org/docs/app/getting-started/installation).
