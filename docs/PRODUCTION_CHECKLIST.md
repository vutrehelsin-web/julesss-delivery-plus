# LISTA DE VERIFICACIÓN DE PRODUCCIÓN (PRODUCTION CHECKLIST) - DELIVERY PLUS

Controles mandatorios previos al despliegue oficial de producción.

---

## 📦 1. INFRAESTRUCTURA Y SERVIDORES
- [x] Contenedor Docker compilando sin errores mediante multi-stage build.
- [x] Servicio web configurado en Render enlazando explícitamente a `0.0.0.0`.
- [x] Variable de entorno `PORT` declarada en `Environment` de Render (ej. 3000 o 10000).
- [x] Variable de entorno `GEMINI_API_KEY` configurada en Render.
- [x] Conexión SSL/HTTPS forzada en producción.

## 💾 2. PERSISTENCIA Y SEGURIDAD (SUPABASE)
- [x] Script `deliveryplus.sql` importado con éxito en el SQL Editor de Supabase.
- [x] Row Level Security (RLS) habilitado en todas las tablas de producción de Supabase.
- [x] Claves secretas de Supabase (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`) inyectadas de forma segura y ocultas en el código compilado.

## 📈 3. RENDIMIENTO Y CALIDAD
- [x] TypeScript compila al 100% sin advertencias ni errores mediante `npm run lint`.
- [x] El bundle de producción se empaqueta exitosamente con Vite y esbuild (`npm run build`).
- [x] El servidor de backend no realiza llamadas o simulaciones pesadas de CPU en el hilo principal de arranque (prestart removido).
