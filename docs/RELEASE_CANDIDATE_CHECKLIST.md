# LISTA DE VERIFICACIÓN DE RELEASE CANDIDATE (RC CHECKLIST) - DELIVERY PLUS

Requisitos para la aprobación y promoción de versiones candidatas (RC) a la rama de producción `main`.

---

## 📋 CONTROLES MANDATORIOS DE INTEGRACIÓN

### **1. Validación de Flujo de Ramas (Git Flow)**
- [x] Desarrollo realizado exclusivamente en ramas `feature/*`.
- [x] Fusión limpia hacia la rama `develop` de integración continua.
- [x] Pruebas manuales e integración completadas en `develop` antes de fusionar a `main`.

### **2. Auditoría de Código y Calidad**
- [x] Cero errores de tipado de TypeScript.
- [x] Verificación de calidad local y pre-compilación aprobadas.
- [x] Documentación de APIs y esquemas de base de datos al día.
- [x] CHANGELOG del proyecto actualizado reflejando de forma transparente los cambios.

### **3. Pruebas End-to-End (E2E)**
- [x] Flujo de autenticación e inicio de sesión verificado con credenciales reales.
- [x] Sincronización en vivo de la disponibilidad de repartidores en PostgreSQL de Supabase.
- [x] Simulación e IA de recomendaciones de tarifas por clima funcionando a través de Gemini proxy.
