# DOCUMENTACIÓN DE INTEGRACIÓN DE PRODUCCIÓN (PHASE 9)

Integración Completa del Flujo de Negocio Persistente - Delivery Plus.

---

## 🔄 1. ARQUITECTURA DEL FLUJO UNIFICADO DE PRODUCCIÓN

La arquitectura del ecosistema ha sido integrada de forma completa y desacoplada, enlazando la base de datos PostgreSQL de Supabase, las APIs del Servidor Express, el cliente React y las orquestaciones de voz e IA:

```
Pedido creado (Turnos / Entregas) ➔ Sincronizado en Postgres
                   ↓
      Gatilla Notificación Express
                   ↓
      FCM Push Dispatcher (Android/iOS)
                   ↓
      Voz Mateo/Valentina (Kokoro/ElevenLabs) ➔ Genera Audio MP3
```

---

## 📡 2. ENDPOINTS DE PRODUCCIÓN INTEGRADOS (API.md)

Los siguientes servicios transaccionales en vivo se han desarrollado en `server.ts` con persistencia real sobre la base de datos de producción:

### **A. Servicio de Pedidos y Turnos (Orders Service)**
1. **Listado General de Turnos B2B:**
   - **Endpoint:** `GET /api/turnos`
   - **Propósito:** Lista los bloques de turnos disponibles de 4 horas comprados por Comercios, uniendo la información de la ubicación del Comercio.
2. **Crear Bloque de Turno B2B:**
   - **Endpoint:** `POST /api/turnos`
   - **Cuerpo (JSON):**
     ```json
     {
       "comercio_id": 1,
       "fecha": "2026-07-17",
       "hora_inicio": "20:00:00",
       "hora_fin": "23:59:59",
       "monto_total": 15000.00
     }
     ```
3. **Listado de Entregas Individuales B2C:**
   - **Endpoint:** `GET /api/entregas`
4. **Crear Entrega de Paquete B2C:**
   - **Endpoint:** `POST /api/entregas`

### **B. Servicio Financiero (Wallet & Ledger)**
1. **Consultar Saldo:**
   - **Endpoint:** `GET /api/billeteras/:userId`
2. **Procesar Transacciones (Carga/Retiro con libro mayor):**
   - **Endpoint:** `POST /api/billeteras/:userId/transacciones`
   - **Cuerpo (JSON):** `{ "tipo": "deposito" | "retiro", "monto": 5000.00 }`
   - **Acción:** Obtiene el saldo actual, calcula el nuevo saldo, actualiza la billetera, e inyecta la fila de la transacción de forma idempotente en `transacciones`.

### **C. Servicio de Notificaciones y Voz (AI Notification Dispatcher)**
1. **Despachador Push y Eventos de Voz:**
   - **Endpoint:** `POST /api/notifications/notify`
   - **Cuerpo (JSON):** `{ "event": "ORDER_CREATED" | "DRIVER_ASSIGNED" | "WALLET_UPDATED", "details": {} }`
   - **Acción:** Dispara de forma síncrona la notificación Web Push, Android, y iPhone a través de Firebase Cloud Messaging, y gatilla la síntesis de voz en MP3 (Mateo IA) para alertar al repartidor: *"Tienes un nuevo pedido disponible en tu zona operativa."*

---

## 🧪 3. REPORTE DE CALIDAD Y PRUEBAS DE PRODUCCIÓN

- **Cero dependencias simuladas:** Los flujos de depósitos y retiros de billetera se sincronizan en vivo en la base de datos.
- **Soporte de Docker y VPS Azure:** El contenedor de producción unificado en el `Dockerfile` empaqueta de forma liviana todo este flujo y compila exitosamente.
- **Aprobación de Integración Continua:** Todas las pruebas de lint (`tsc --noEmit`) y empaquetamiento de Vite y esbuild se ejecutan al 100% de éxito de manera automatizada.
