# DELIVERY PLUS B2B - PLATAFORMA LOGÍSTICA INTELIGENTE CON IA MULTIMODAL

Bienvenido a **Delivery Plus**, un ecosistema logístico de última generación diseñado específicamente para el mercado corporativo y de emprendedores (B2B) en Argentina. Impulsado por Inteligencia Artificial Multimodal (Gemini 2.5 Flash / 3.5 Flash), síntesis de voz interactiva (ElevenLabs / Kokoro TTS) y cartografía en tiempo real (Leaflet).

Esta plataforma rompe con el esquema tradicional de delivery ("Cliente-Comercio-Repartidor") estructurándose bajo roles específicos de negocio y una sólida arquitectura de datos persistente sobre **Supabase (PostgreSQL)** y **Render**.

---

## 🌟 Características Destacadas

1. **Inteligencia Artificial Multimodal Activa (Gemini & ElevenLabs TTS):**
   - **Valentina IA:** Asesora comercial empática y cercana de tono femenino argentino, orientada a la toma de decisiones, optimización de márgenes para Comercios y reportes para Emprendedores.
   - **Mateo IA:** Asesor operativo y técnico de tono masculino argentino, diseñado para guiar a los Repartidores en ruta, reportar alertas de clima o tráfico y activar asistencia SOS.
   - **Análisis de Clima Logístico en Vivo:** Integración dinámica con Gemini que calcula tarifas por congestión (multiplicador de tarifa) y ofrece sugerencias operativas según el clima y comportamiento de los usuarios en tiempo real.
2. **Ecosistema Multi-Rol Unificado:**
   - **Administrador:** Panel de KPIs de rendimiento global de la flota, comisiones consolidadas, auditorías y monitoreo en vivo.
   - **Comercio:** Compra de turnos por bloques de 4 horas para contratar fleteros B2B exclusivos.
   - **Emprendedor:** Publicación de envíos de paquetes individuales, pasarela de carga de productos familiares con historia de origen, y billetera de recarga.
   - **Repartidor:** Consola móvil de reparto B2B, billetera con reparto de ganancias (80% repartidor / 20% plataforma), reportes de SOS, y reputación operativa.
3. **Monitoreo Cartográfico de Alta Precisión (ArgentinaMap):**
   - Mapa nocturno interactivo con Leaflet que dibuja rutas activas, posicionamiento GPS dinámico y zonas calientes de demanda operativa en la Ciudad Autónoma de Buenos Aires.

---

## 🛠️ Arquitectura Tecnológica

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Framer Motion.
- **Backend:** Node.js Express empaquetado en CommonJS para producción.
- **Base de Datos:** Supabase PostgreSQL (esquema oficial en `deliveryplus.sql`).
- **Autenticación:** Supabase Auth (OAuth y Email persistente).
- **Despliegue Principal:** Render (Web Service).

---

## 💾 Configuración de la Base de Datos (Supabase / Postgres)

El proyecto incluye el esquema de base de datos listo para producción en el archivo **`deliveryplus.sql`**. Al usar Supabase, la base de datos es **PostgreSQL**.

### Cómo configurar e importar el esquema:
1. Dirígete a tu panel de control de [Supabase](https://supabase.com).
2. Selecciona tu proyecto.
3. Ve a la sección **SQL Editor** en el menú de la izquierda.
4. Haz clic en **New Query**.
5. Abre el archivo `deliveryplus.sql` de este repositorio, copia todo su contenido y pégalo en el editor de Supabase.
6. Haz clic en **Run**. 

*Esto creará instantáneamente las 13 tablas relacionales (roles, usuarios, repartidores, comercios, emprendedores, turnos, entregas unicas, billeteras, transacciones, etc.) con sus debidos tipos, restricciones `CHECK`, llaves foráneas e inyectará los datos semilla de prueba (usuarios de prueba, repartidores y zonas calientes).*

---

## 🔑 Variables de Entorno (.env)

Crea un archivo `.env` en la raíz del proyecto para conectar los servicios reales:

```env
# Servidor Backend
PORT=3000
NODE_ENV=production

# Supabase Auth e Integraciones
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase

# Google Gemini AI Studio
GEMINI_API_KEY=tu-gemini-api-key

# ElevenLabs Speech Synthesis (Opcional, tiene fallback)
ELEVENLABS_API_KEY=tu-elevenlabs-key
ELEVENLABS_VOICE_ID=4wDRKlxcHNOFO5kBvE81
```

---

## 🚀 Ejecución y Despliegue

### Ejecución Local
1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Inicia el servidor de desarrollo (con Express + Vite HMR):
   ```bash
   npm run dev
   ```
3. Abre http://localhost:3000.

### Compilación para Producción (Vite + Esbuild)
Para empaquetar el frontend y el backend de forma optimizada para producción:
```bash
npm run build
```
Esto generará los activos estáticos en la carpeta `dist/` y el bundle del servidor Node Express compilado en `dist/server.cjs`.

### Inicio del Servidor de Producción (Render)
Para ejecutar la aplicación en producción (comando que utiliza Render por defecto):
```bash
npm run start
```

---

## 📈 Forma de Trabajo y Calidad
1. **Sin errores de tipado:** El comando de lint de TypeScript `npm run lint` (`tsc --noEmit`) se ejecuta de manera exitosa antes de cada compilación.
2. **Cero dependencias simuladas:** Todo el backend está configurado para operar con datos e infraestructura en vivo mediante endpoints proxy optimizados.

*DeliveryPlus es una marca registrada y una solución logística inteligente avanzada.*
