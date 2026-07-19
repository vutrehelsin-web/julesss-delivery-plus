# DELIVERY PLUS MASTER AGENT v2.0
## ESPECIFICACIÓN OFICIAL DE DESARROLLO Y ARQUITECTURA IA

Este documento constituye la máxima autoridad y regla de oro para cualquier desarrollador humano o agente de Inteligencia Artificial que participe en el diseño, desarrollo, mantenimiento y despliegue del ecosistema **Delivery Plus**. Toda decisión técnica debe subordinarse estrictamente a los principios establecidos en este archivo.

---

## 🎯 1. VISIÓN Y PROPÓSITO
Delivery Plus **NO** es una aplicación de delivery tradicional ("Cliente-Comercio-Repartidor"). 

Es una **plataforma inteligente de logística, comercio B2B y movilidad impulsada por Inteligencia Artificial**. Su propósito es conectar personas, comercios, emprendedores, repartidores y operadores mediante tecnología modular, automatización, seguimiento cartográfico de alta precisión y asistencia interactiva de voz.

---

## 💎 2. PRINCIPIOS FUNDAMENTALES DE DESARROLLO

### A. Producción Primero (Cero Mock Data)
Todo desarrollo debe estar listo para operar en entornos reales de producción.
- **Prohibido el uso de:** datos simulados en duro, repositorios en memoria volátiles, billeteras ficticias, tracking de fantasía o APIs falsas.
- **En ausencia de datos reales:** la interfaz debe mostrar estados vacíos o explicativos de manera limpia. Jamás se debe inventar información.

### B. Fuente Única de Verdad (Supabase)
Toda la información y persistencia del sistema se aloja exclusivamente en:
- **Supabase PostgreSQL** (Base de datos transaccional relacional).
- **Supabase Auth** (Autenticación y tokens JWT seguros).
- **Supabase Storage** (Archivos físicos y multimedia).
- **Supabase Realtime** (Eventos de geolocalización y notificaciones instantáneas).
*No se permite almacenar información crítica o sensible en localStorage, cookies desprotegidas o memoria volátil.*

### C. Arquitectura Limpia y Modular (Clean Architecture)
El proyecto se estructura con una separación estricta de capas para garantizar la escalabilidad y mantenibilidad futura:
1. **Presentation Layer:** Componentes visuales y pantallas (React/TypeScript). Sin lógica de negocio.
2. **Application Layer:** Casos de uso de la aplicación, flujos de trabajo e interfaces de servicios.
3. **Domain Layer:** Entidades puras de negocio y reglas de dominio (independientes de frameworks).
4. **Infrastructure Layer:** Adaptadores de bases de datos, APIs de terceros, drivers e integraciones físicas.
5. **Data Layer:** Modelos de datos, persistencia y mapeo relacional.

Cada módulo oficial (Identity, Commerce, Entrepreneurs, Products, Orders, Drivers, Wallet, Payments, Maps, Notifications, Chat, Voice AI, Artificial Intelligence, Marketing, Analytics, Administration, Academy, Monitoring, Security, Configuration) es independiente. **No se debe comenzar un nuevo módulo hasta que el anterior esté 100% finalizado (con código, documentación, pruebas, APIs, migraciones, changelog y verificación de despliegue en Render).**

---

## 👥 3. MODELO DE NEGOCIO Y ROLES OFICIALES
Los actores autorizados en el ecosistema son:
- **Administrador:** Supervisa la plataforma de extremo a extremo, comisiones, zonas de demanda y KPIs.
- **Supervisor:** Gestiona incidentes, alertas del sistema, SOS y auditorías operativas rápidas.
- **Operador:** Asignación y monitoreo de despachos manuales y asistencia a la red logística.
- **Comercio:** Compra bloques fijos de turnos de 4 horas para contratar fleteros B2B exclusivos.
- **Emprendedor:** Contrata entregas individuales (paquetes B2C), publica su catálogo familiar y gestiona su billetera.
- **Repartidor:** Socio de reparto B2B que navega rutas, realiza entregas, acumula ganancias netas (80% repartidor / 20% plataforma) y reporta alertas SOS.

*El comprador no constituye un rol independiente. Cualquier usuario autenticado puede realizar compras o contratar servicios.*

---

## 🤖 4. MARCO DE INTELIGENCIA ARTIFICIAL (AI & VOICE ORCHESTRATOR)

Para evitar la dependencia exclusiva de proveedores y garantizar la viabilidad económica y técnica de la plataforma, toda la Inteligencia Artificial y Síntesis de Voz se diseña en base a **Interfaces Desacopladas**:

### A. AIProvider (Orquestador de LLM)
Interfaz común de Inteligencia Artificial que soporta las siguientes implementaciones intercambiables:
- **Gemini 2.5 Flash / 3.5 Flash** (Proveedor por defecto de alto rendimiento y bajo costo).
- **Gemini 2.5 Pro** (Para razonamiento avanzado y reportes analíticos masivos).
- **OpenAI GPT-4o/o1** (Implementación secundaria lista para producción).
- **Anthropic Claude 3.5 Sonnet** (Lista para integración).
- **Local LLM** (Para arquitecturas autónomas u offline).

### B. VoiceProvider (Ecosistema de Voz)
Marco de audio desacoplado con latencia objetivo **menor a 2 segundos**:
- **Text-To-Speech (TTS):** Kokoro TTS (principal por defecto), Piper TTS (fallback open source), Google TTS, OpenAI TTS y ElevenLabs (opcional).
- **Speech-To-Text (STT):** Whisper, Faster Whisper y Google Speech.

### C. Identidades de IA Oficiales con Tono Argentino
- **VALENTINA IA (Asesora Comercial Inteligente):** Tono femenino argentino, empática, empoderada y profesional. Ayuda a Comercios y Emprendedores en optimización comercial.
- **MATEO IA (Asesor Operativo Inteligente):** Tono masculino argentino, conciso, preciso, técnico y operativo. Asiste a los Repartidores en ruta y alertas SOS.

---

## 🛡️ 5. SEGURIDAD Y GOBIERNO DEL CÓDIGO
- **Row Level Security (RLS):** Activada obligatoriamente en todas las tablas de Supabase. Cada rol accede estrictamente a lo que le corresponde según el principio de mínimo privilegio.
- **Estrategia de Ramas en Git:**
  - `main`: Producción estable (desplegado directamente en vivo por Render).
  - `develop`: Integración continua de nuevas características.
  - `feature/*`: Desarrollo específico de funcionalidades. No se escribe código directo sobre `main` o `develop`.
