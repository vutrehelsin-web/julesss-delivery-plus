# TECHNICAL DEBT - DELIVERY PLUS

Lista priorizada de deuda técnica detectada en el ecosistema Delivery Plus.

---

## 🚨 Prioridad 1: Alta (Bloqueantes de Producción)
1. **Compilación en el Start Phase de Render (Resuelto):**
   - *Impacto:* El script `prestart` ejecutaba `npm run build` en el arranque, causando time-out de puertos y caídas de servicio.
   - *Remediación:* Se eliminó `prestart` de `package.json` para separar completamente la etapa de compilación (Build Command) de la de ejecución (Start Command).
2. **Incompatibilidad del SQL original (Resuelto):**
   - *Impacto:* `deliveryplus.sql` original estaba en MySQL, incompatible con Supabase (Postgres).
   - *Remediación:* Se tradujo 100% a formato PostgreSQL nativo e idempotente.
3. **Ausencia de Capa de Datos Persistente en Supabase:**
   - *Impacto:* Todos los cambios del frontend (productos, billetera, pedidos) viven en la memoria local de React y se pierden al recargar.
   - *Remediación:* Migrar secuencialmente las consultas del frontend para escribir/leer directamente en Supabase PostgreSQL.

---

## ⚠️ Prioridad 2: Media (Optimizaciones y Arquitectura)
1. **Gobierno de Roles de Supabase Auth:**
   - *Detalle:* Sincronizar dinámicamente el login de Supabase Auth para verificar el rol del usuario en la tabla `usuarios` y direccionar a la consola correcta de forma persistente.
2. **Desacoplamiento Completo del Voice Orchestrator:**
   - *Detalle:* Asegurar que la implementación de TTS/STT sea totalmente abstracta mediante `VoiceProvider` para permitir intercambiar ElevenLabs, Kokoro o Piper de forma fluida.

---

## ℹ️ Prioridad 3: Baja (Mantenibilidad)
1. **Pruebas Unitarias automatizadas en CI/CD:**
   - *Detalle:* Añadir un workflow de GitHub Actions para correr tests automatizados antes de fusionar `develop` a `main`.
