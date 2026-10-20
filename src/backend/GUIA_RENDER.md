# Guia para desplegar la base de datos y la API en Render

Esta guia esta pensada para esta API AdonisJS con PostgreSQL y Cloudinary.

## 1. Preparar el repositorio

1. Sube el proyecto a GitHub, GitLab o Bitbucket.
2. Si subes la carpeta completa del workspace, en Render usa como `Root Directory`:

```txt
travelDLS/travelDLS/travelDLS
```

3. Verifica que existan estos archivos en esa carpeta:

```txt
package.json
pnpm-lock.yaml
adonisrc.ts
start/env.ts
config/database.ts
```

## 2. Crear la base de datos PostgreSQL

1. Entra a Render.
2. Ve a `New` -> `Postgres`.
3. Configura:

```txt
Name: travel-dls-db
Region: la misma region que usaras para la API
PostgreSQL Version: la version por defecto esta bien
Plan: Free para pruebas, pago para produccion real
```

4. Cuando la base de datos este creada, entra a su pagina `Info`.
5. Copia los datos de conexion interna, no la externa, porque la API tambien estara en Render.

Necesitaras estos valores:

```txt
DB_HOST=hostname interno de Render
DB_PORT=5432
DB_USER=usuario de la base de datos
DB_PASSWORD=password de la base de datos
DB_DATABASE=nombre de la base de datos
```

Render recomienda usar la conexion interna cuando la app y la base de datos estan en la misma region, porque usa la red privada y reduce latencia.

## 3. Crear el Web Service de la API

1. En Render ve a `New` -> `Web Service`.
2. Conecta el repositorio.
3. Configura:

```txt
Name: travel-dls-api
Runtime/Language: Node
Branch: main, master o la rama que uses
Root Directory: travelDLS/travelDLS/travelDLS
Build Command: corepack enable && pnpm install --frozen-lockfile && pnpm run build && cd build && pnpm install --prod --frozen-lockfile
Start Command: cd build && node bin/server.js
```

Render necesita que el servidor escuche en `0.0.0.0` y en el puerto que Render asigna mediante `PORT`. Para esta app, configura estas variables:

```txt
NODE_ENV=production
HOST=0.0.0.0
PORT=10000
LOG_LEVEL=info
```

## 4. Variables de entorno completas

En el Web Service, entra a `Environment` y agrega:

```txt
NODE_ENV=production
HOST=0.0.0.0
PORT=10000
LOG_LEVEL=info
TZ=UTC

APP_KEY=pega_aqui_tu_app_key

DB_HOST=host_interno_de_postgres
DB_PORT=5432
DB_USER=usuario_de_postgres
DB_PASSWORD=password_de_postgres
DB_DATABASE=nombre_de_la_db


ENCRYPTION_KEYS={"v1":"clave_hexadecimal_de_64_caracteres"}
ENCRYPTION_CURRENT_KEY_VERSION=v1

CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

Para generar `APP_KEY` localmente:

```bash
node ace generate:key
```

Para generar la clave de `ENCRYPTION_KEYS`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

El resultado va dentro del JSON:

```txt
ENCRYPTION_KEYS={"v1":"RESULTADO_AQUI"}
ENCRYPTION_CURRENT_KEY_VERSION=v1
```

No cambies estas claves despues de desplegar si ya tienes datos cifrados o sesiones activas.

## 5. Ejecutar migraciones y seeders

Despues del primer deploy exitoso:

1. Entra al Web Service de la API.
2. Abre `Shell`.
3. Ejecuta:

```bash
cd build
node ace migration:run --force
```

Si quieres cargar datos iniciales:

```bash
node ace db:seed
```

Si tienes seeders especificos y no quieres correr todos, ejecutalos de forma individual segun convenga.

## 6. Ajustar CORS

Ahora `config/cors.ts` solo permite frontends locales:

```txt
http://localhost:5173
http://localhost:4200
http://127.0.0.1:4200
```

Cuando tengas el frontend desplegado, agrega su dominio, por ejemplo:

```txt
https://travel-dls-frontend.onrender.com
```

Si no haces esto, el navegador bloqueara llamadas desde el frontend en produccion.

## 7. Probar el despliegue

Cuando termine el deploy, Render te dara una URL parecida a:

```txt
https://travel-dls-api.onrender.com
```

Prueba:

```txt
https://travel-dls-api.onrender.com/docs
https://travel-dls-api.onrender.com/swagger
```

La ruta `/` redirige a `/docs`, asi que tambien puedes abrir directamente:

```txt
https://travel-dls-api.onrender.com/
```

## 8. Errores comunes

### Render no detecta el puerto

Revisa que tengas:

```txt
HOST=0.0.0.0
PORT=10000
```

### Falla por variables faltantes

El archivo `start/env.ts` exige estas variables:

```txt
NODE_ENV
PORT
APP_KEY
HOST
LOG_LEVEL
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_DATABASE
ENCRYPTION_KEYS
ENCRYPTION_CURRENT_KEY_VERSION
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

### La API corre, pero el frontend no puede llamar endpoints

Revisa `config/cors.ts` y agrega el dominio real del frontend.

### La conexion a Postgres falla

Usa los datos internos de Render y confirma que la API y la base de datos esten en la misma region.

### Las migraciones no corren

Ejecuta desde el Shell del Web Service:

```bash
cd build
node ace migration:run --force
```

## 9. Checklist final

```txt
[ ] Postgres creado en Render
[ ] Web Service creado con Root Directory correcto
[ ] Build Command configurado
[ ] Start Command configurado
[ ] Variables de entorno agregadas
[ ] Deploy exitoso
[ ] Migraciones ejecutadas
[ ] Seeders ejecutados si aplican
[ ] CORS actualizado con dominio del frontend
[ ] /docs abre correctamente
```

## Referencias

- Render Web Services: https://render.com/docs/web-services
- Render Postgres: https://render.com/docs/postgresql-creating-connecting
- AdonisJS Deployment: https://docs.adonisjs.com/deployment
