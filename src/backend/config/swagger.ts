import path from 'node:path'
import url from 'node:url'

const swaggerConfig = {
  uiEnabled: true,
  uiUrl: 'docs',
  specEnabled: true,
  specUrl: '/swagger',
  middleware: [],

  title: 'Travel Hook API',
  version: '1.0.0',
  description: `
# 🌍 Bienvenido a Travel Hook API (TravelDLS)

> *El motor principal detrás de la plataforma de logística y gestión de viajes.* 🚀

**Travel Hook API** está diseñada con una arquitectura RESTful robusta y escalable, facilitando la administración integral en tiempo real de recursos, flujos de trabajo, empresas y control de accesos. 

---

### ✨ Características Principales

- 🔐 **Autenticación Segura (JWT):** Acceso protegido mediante tokens de seguridad (Bearer / Cookies Seguras) y políticas de control de acceso basado en roles (RBAC).
- 🏢 **Gestión Centralizada de Empresas:** Soporte robusto y escalable para la administración de múltiples compañías, sus empleados y configuraciones.
- 🚍 **Logística de Viajes:** Control granular de rutas, asignación de vehículos, supervisión de conductores y seguimiento del ciclo de vida del viaje.
- 📊 **Validación de Datos Rigurosa:** Control exhaustivo de *payloads* para garantizar la consistencia e integridad en cada transacción.

---

### 🛠️ Guía Rápida de Uso

1. **🔑 Obtén tu Token:** Inicia sesión con tus credenciales a través de los endpoints de autenticación correspondientes.
2. **🛡️ Autorízate:** Una vez obtenido el JWT, da clic en el botón superior derecho **\`Authorize 🔒\`** e insértalo en el formato requerido.
3. **🚀 Interactúa:** Despliega las diferentes secciones, examina los modelos en el aparatado de \`Schemas\` y usa el botón \`Try it out\` para realizar solicitudes HTTP en vivo.

---

> 💡 **Nota para Desarrolladores:**
> Familiarízate con la sección de **\`Schemas\`** al final de esta página para entender perfectamente las estructuras de datos esperadas (Input) y retornadas (Output). Los diferentes códigos de estado HTTP están documentados en cada endpoint para facilitar tu integración. 💻👨‍💻

<br/>

*Documentación estructurada y lista para consumo por aplicaciones frontend.*
`,

  // Organization and formatting
  tagIndex: 2,
  snakeCase: true,
  ignore: ['/swagger', '/docs'],
  preferredPutPatch: 'PUT',

  path: path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..') + path.sep,

  // Security and Authentication Configuration
  common: {
    parameters: {},
    headers: {},
  },
  securitySchemes: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },

  authConfigs: {
    bearer: 'BearerAuth',
  },

  persistAuthorization: true, // Persists the token even if the page is reloaded
  showFullPath: false,
}

export default swaggerConfig
