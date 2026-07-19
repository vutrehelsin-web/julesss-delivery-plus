# DOCUMENTACIÓN TÉCNICA Y API: MÓDULO DE REPARTIDORES (DRIVER MODULE)

Ecosistema de Repartidores B2B - Delivery Plus.

---

## 📋 OBJETIVO DE NEGOCIO
El **Módulo de Repartidores** tiene como objetivo orquestar el flujo de trabajo de los socios logísticos (fleteros B2B) encargados del transporte y entrega de mercancías dentro del ecosistema. Esto incluye la gestión de perfiles, control en tiempo real de disponibilidad, reclamación de bloques fijos de turnos de 4 horas (comercios), entregas individuales de paquetes (emprendedores), y emisión de alertas de emergencia críticas (SOS).

---

## 🛠️ DISEÑO DE BASE DE DATOS (POSTGRESQL)

El módulo se apoya directamente sobre las siguientes tablas relacionales definidas en `deliveryplus.sql`:

1. **`usuarios`**: Cuenta base de inicio de sesión y credenciales del repartidor (`rol_id = 4`).
2. **`repartidores`**: Perfil operativo con tipo de vehículo, patente, coordenadas en tiempo real (`latitud_actual`, `longitud_actual`), estado de disponibilidad (`disponible`) y verificación de cuenta (`verificado`).
3. **`perfil_repartidor`**: Registro analítico que acumula la calificación promedio, total de entregas completadas, entregas a tiempo y su zona geográfica principal (ej: Palermo).
4. **`turnos`**: Gestión de franjas horarias de 4 horas compradas por Comercios. Cuando un repartidor toma un turno, se vincula mediante `repartidor_id` y el estado pasa a `confirmado`.

---

## 📡 ESPECIFICACIÓN DE LA API (REST ENDPOINTS)

El servidor backend Express expone los siguientes endpoints para el Módulo de Repartidores en `server.ts`:

### 1. Obtener lista de repartidores
- **Endpoint:** `GET /api/repartidores`
- **Respuesta Exitosa (200 OK):**
  ```json
  [
    {
      "id": 1,
      "nombre": "Carlos",
      "apellido": "Gómez",
      "tipo_vehiculo": "moto",
      "patente": "99A-XYZ8",
      "disponible": true,
      "verificado": true,
      "perfil_repartidor": {
        "calificacion_promedio": 4.92,
        "total_entregas": 420
      }
    }
  ]
  ```

### 2. Actualizar Disponibilidad
- **Endpoint:** `PATCH /api/repartidores/:id/disponibilidad`
- **Cuerpo (JSON):**
  ```json
  { "disponible": true }
  ```
- **Respuesta (200 OK):** `{ "success": true, "data": { "id": 1, "disponible": true } }`

### 3. Tomar Turno (Reserva B2B)
- **Endpoint:** `POST /api/repartidores/:id/turnos/:turnoId/tomar`
- **Respuesta (200 OK):** `{ "success": true, "data": { "id": 3, "repartidor_id": 1, "estado": "confirmado" } }`

### 4. Señal de Alerta SOS (Emergencias)
- **Endpoint:** `POST /api/repartidores/:id/sos`
- **Cuerpo (JSON):**
  ```json
  {
    "latitud": -34.5982,
    "longitud": -58.4211,
    "tipo_emergencia": "Accidente / Asistencia Médica"
  }
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "success": true,
    "sosId": "sos_xyz123",
    "message": "Señal de emergencia SOS recibida por el Centro de Monitoreo General. Soporte médico o policial despachado de inmediato."
  }
  ```

---

## 🧪 REPORTE DE PRUEBAS DE CALIDAD

Se realizaron pruebas exhaustivas de integración entre el frontend de React 19 y el backend Node.js:
1. **Prueba de Disponibilidad:** El repartidor Carlos Gómez alterna su estado en el panel móvil, lo que dispara una petición `PATCH` al servidor y persiste de inmediato en Supabase.
2. **Prueba de Reserva de Turnos:** Carlos Gómez hace clic en "Tomar Bloque de Turno", gatillando una petición `POST` que vincula su ID con el turno en PostgreSQL y actualiza el estado a `confirmado`.
3. **Prueba de Alertas SOS:** Al presionar el botón SOS, el sistema loguea la alerta de emergencia en tiempo real con las coordenadas precisas de geolocalización.
4. **Prueba de Compilación:** Compilación del proyecto libre de errores con `npm run build` y TypeScript check `npm run lint` completados con éxito absoluto.

---

## 📖 INSTRUCCIONES DE DEMO

1. Inicia sesión en la aplicación utilizando las credenciales reales:
   - **Email:** `repartidor@test.com`
   - **Password:** `123456`
2. Serás direccionado automáticamente a la **Consola del Repartidor Carlos Gómez**.
3. Alterna el switch **"Disponible / Desconectado"** y verifica en la terminal del backend que la disponibilidad se sincroniza en vivo en PostgreSQL.
4. Ve a la sección de **Turnos Disponibles** de Palermo, presiona el botón para **"Tomar Turno"** y observa cómo el estado cambia de disponible a asignado y se refleja de manera persistente en la base de datos de Supabase.
5. Presiona el botón de pánico **SOS** para verificar la emisión de la señal de alerta.
