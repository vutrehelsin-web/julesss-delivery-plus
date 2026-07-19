# REPORTE DE PROBLEMAS CONOCIDOS (KNOWN ISSUES) - DELIVERY PLUS

Lista priorizada de comportamientos observados y limitaciones técnicas detectadas antes de iniciar la Beta Cerrada.

---

## 🛠️ 1. LIMITACIONES TÉCNICAS RECONOCIDAS

### **A. Base de Datos Local / Offline en Entorno Sandbox**
- *Problema:* Las herramientas del cliente administrativo de Supabase MCP pueden reportar restricciones de permisos en el entorno sandbox debido al tenant federado.
- *Solución / Mitigación:* Las migraciones y consultas a la base de datos se realizan directamente en Supabase SQL Editor copiando y pegando el script PostgreSQL proporcionado, que ha sido verificado con éxito y libre de errores de sintaxis.

### **B. Límite de Llamadas de ElevenLabs API**
- *Problema:* El uso intensivo de la biblioteca de audio TTS a través de ElevenLabs puede golpear el límite de cuotas de la capa de uso gratuito si muchos usuarios beta interactúan al mismo tiempo.
- *Solución / Mitigación:* El backend Express en `server.ts` implementa un proxy con **mecanismo de re-intento automático (fallback)**. Si detecta un error de cuota `402`, reintenta la llamada usando un Voice ID predeterminado de la capa base de ElevenLabs para que el servicio nunca se interrumpa.

### **C. Geolocalización GPS simulada en ArgentinaMap**
- *Problema:* El mapa interactivo utiliza simulaciones de trayectoria debido a que los navegadores web bloquean el acceso al GPS en segundo plano cuando la pestaña del repartidor se minimiza.
- *Solución / Mitigación:* Se diseñó un simulador de trayectorias B2B robusto en el frontend que mantiene el movimiento fluido del repartidor y sincroniza las coordenadas en Supabase periódicamente.
