# CHANGELOG - DELIVERY PLUS

Historial de cambios y lanzamientos oficiales de la plataforma Delivery Plus.

---

## [2.0.0] - 2026-07-17
### Añadido
- **Especificación DELIVERY PLUS MASTER AGENT v2.0:** Definición formal en `AGENTS.md` de la visión, principios, roles y arquitectura IA del ecosistema.
- **Dockerfile Multi-Stage Optimizado:** Creación del archivo `Dockerfile` utilizando compilación en dos etapas para minimizar el peso del contenedor y maximizar el rendimiento en VPS (Azure Ubuntu 24.04) y entornos de producción.
- **Esquema compatible con PostgreSQL/Supabase:** Reescritura completa del script `deliveryplus.sql` de MySQL a PostgreSQL con restricciones `CHECK` reales, relaciones robustas y datos semilla idempotentes.
- **Estrategia Git Flow:** Estructuración de ramas de trabajo (`main`, `develop` y `feature/*`) para mantener la estabilidad del despliegue continuo de Render.

### Modificado
- **Compatibilidad del Servidor Express (Enlace de red):** Ajuste de `server.ts` para enlazarse explícitamente a `0.0.0.0` y resolver dinámicamente el puerto mediante `PORT` o fallback 3000, permitiendo la exposición externa de puertos en Render.
- **README.md reescrito en Español:** Manual de desarrollo detallado con guías textuales paso a paso para configurar la base de datos en Supabase y desplegar en Render con variables de entorno.
- **Automatización de Builds en Producción:** Adición del script `"prestart": "npm run build"` en `package.json` para garantizar la existencia de los binarios y recursos empaquetados en `dist/server.cjs` antes de iniciar la ejecución del servidor Node.

---

## [1.0.0] - 2026-07-15
### Añadido
- **Código base inicial de Delivery Plus:** Carga inicial de la interfaz interactiva de React con dashboards para Administrador, Repartidor, Comercio y Emprendedor.
- **Integración de Mapas de Argentina:** Inclusión de Leaflet para tracking geográfico simulado en vivo.
- ** proxies de IA de Gemini y ElevenLabs TTS:** Lógica para generar de voz interactiva y sugerencias dinámicas basadas en el clima.
