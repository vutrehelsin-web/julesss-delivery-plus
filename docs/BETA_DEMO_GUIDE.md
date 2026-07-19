# GUÍA OFICIAL DE DEMO: FLUJO LOGÍSTICO COMPLETO END-TO-END (CLOSED BETA)

Esta guía te permite simular y validar el flujo operativo completo en **dos teléfonos reales (o dispositivos en simultáneo)** conectándose de forma real a tu servidor Express + Vite desplegado en Render y a tu base de datos Supabase PostgreSQL.

---

## 📱 PREPARACIÓN DE LOS DISPOSITIVOS

Para realizar esta demo con dos teléfonos reales, ambos deben acceder a la URL pública de tu Web Service desplegado en Render (por ejemplo: `https://vide-pijg.onrender.com` o la de tu servicio Delivery Plus):

- **Teléfono A:** Iniciará sesión como **Comercio** (para crear y publicar turnos B2B) o **Emprendedor** (para crear y publicar paquetes individuales).
- **Teléfono B:** Iniciará sesión como **Repartidor (Carlos Gómez)** (para simular el GPS, tomar la orden y finalizar la entrega).

---

## 🔄 PASO A PASO DEL FLUJO COMPLETO DE NEGOCIO

### 1. Publicación del Pedido (Teléfono A - Comercio o Emprendedor)
1. Abre la aplicación en el **Teléfono A** e ingresa con la cuenta de Comercio:
   - **Email:** `trattoria@comercio.com`
   - **Password:** `123456`
2. En la barra superior, haz clic en **Consola**.
3. Selecciona la opción **Crear Bloque de Turno de 4 Horas** (B2B) o sube un paquete de envío.
4. Escribe el monto en pesos (por ejemplo, `$15000`) y presiona **Publicar Oferta**.
5. *Impacto en Producción:* La aplicación realiza una llamada `POST /api/turnos` al servidor Express, inyectando la fila correspondiente de forma permanente en la tabla `turnos` de tu base de datos Supabase PostgreSQL.

---

### 2. Alerta por Voz de Mateo IA y Asignación (Teléfono B - Repartidor Carlos)
1. Abre la aplicación en el **Teléfono B** e ingresa con la cuenta del repartidor Carlos Gómez:
   - **Email:** `repartidor@test.com`
   - **Password:** `123456`
2. En la esquina superior derecha, activa el switch **"Disponible"**.
   - *Impacto en Producción:* Dispara un `PATCH /api/repartidores/1/disponibilidad` en la base de datos Supabase.
3. Al estar disponible y registrarse un nuevo pedido o turno en la zona, **el altavoz del teléfono reproducirá automáticamente el audio de Mateo IA** (generado de manera interactiva por Kokoro/ElevenLabs) anunciando:
   👉 *"Atención Carlos: Tienes un nuevo pedido disponible en tu zona operativa. Revisa tu pool de despachos."*
4. En el listado de turnos, Carlos hace clic en **"Tomar Turno"** o **"Aceptar Orden"**.
   - *Impacto en Producción:* Se envía un `POST /api/repartidores/1/turnos/{id}/tomar`, vinculando el turno con el `repartidor_id = 1` y actualizando el estado de la tabla `turnos` a `confirmado`.

---

### 3. Seguimiento en Tiempo Real en el Mapa (En ambos Teléfonos)
1. En las pantallas de ambos dispositivos, podrás visualizar el mapa interactivo nocturno de Leaflet (**ArgentinaMap**).
2. Verás el marcador de Carlos (🛵) moviéndose suavemente en tiempo real a lo largo de las calles de la Ciudad Autónoma de Buenos Aires, avanzando paso a paso hacia el Comercio para recolectar el pedido y luego hacia el destino final de entrega.
3. El estado del pedido se actualiza automáticamente en las pantallas de ambos teléfonos, mostrando el avance logístico.

---

### 4. Finalización de Entrega y Actualización de la Billetera (Teléfono B ➔ Teléfono A)
1. Una vez que el marcador de Carlos llega a destino, Carlos presiona el botón **"Finalizar Entrega"** en su teléfono.
2. *Impacto en Producción:* 
   - El estado de la orden en la tabla de Supabase cambia a `completado`.
   - Se realiza la llamada `POST /api/billeteras/2/transacciones` en el backend para sumar de forma transaccional el **80% de ganancias netas** (ej: `$12000`) directamente al saldo del repartidor.
   - El saldo de la billetera virtual de Carlos se actualiza en vivo de manera instantánea y se inyecta la transacción en el libro contable de la tabla `transacciones`.
3. El Comercio (Teléfono A) recibe una notificación push de alta fidelidad confirmando que el cliente ha recibido su pedido y que la transacción comercial fue cerrada exitosamente.
