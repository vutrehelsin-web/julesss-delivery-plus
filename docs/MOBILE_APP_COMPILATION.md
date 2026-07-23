# MANUAL DE COMPILACIÓN NATIVA – APK (ANDROID) & IPA (IPHONE)

Este documento constituye la guía oficial de arquitectura y DevOps para compilar, firmar y empaquetar el código fuente de Flutter de la aplicación móvil de repartidores (**`app_repartidor`** definido en `src/code_repository.ts`) para dispositivos reales Android y iPhone.

---

## 🤖 1. COMPILACIÓN NATIVA PARA ANDROID (Generación de APK / AAB)

La compilación de la APK de producción se realiza utilizando el SDK de Flutter. Sigue estos pasos para empaquetar el instalador:

### Paso A: Preparar el Entorno de Desarrollo
Asegúrate de tener instalado:
- **Flutter SDK** (versión `>=3.0.0`)
- **Java Development Kit (JDK 17)**
- **Android Studio** con Android SDK y Build Tools.

### Paso B: Clonar y Preparar el Proyecto
1. Extrae los archivos de la app móvil del editor de Delivery Plus a una carpeta local (por ejemplo, `app_repartidor/`).
2. Entra al directorio y descarga las dependencias declaradas en `pubspec.yaml`:
   ```bash
   cd app_repartidor
   flutter pub get
   ```

### Paso C: Generar la APK de Depuración (Para Pruebas)
Si deseas generar un archivo de instalación rápido para enviar a tus teléfonos de prueba:
```bash
flutter build apk --debug
```
*El resultado se alojará en:* `build/app/outputs/flutter-apk/app-debug.apk`

### Paso D: Generar la APK Firmada de Producción (Release)
1. Genera un Keystore (llave criptográfica para firmar la app) utilizando el terminal:
   ```bash
   keytool -genkey -v -keystore android/app/key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias key
   ```
2. Crea un archivo `android/key.properties` con los accesos al Keystore:
   ```properties
   storePassword=tu-password-keystore
   keyPassword=tu-password-key
   keyAlias=key
   storeFile=key.jks
   ```
3. Compila el binario optimizado final:
   ```bash
   flutter build apk --release
   ```
   - Si vas a subir la aplicación a Google Play Store, genera el paquete de distribución `AAB` en su lugar:
     ```bash
     flutter build appbundle --release
     ```
*El resultado final optimizado se aloja en:* `build/app/outputs/flutter-apk/app-release.apk`

---

## 🍏 2. COMPILACIÓN NATIVA PARA IPHONE (Generación de IPA / TestFlight)

Para empaquetar para iOS, se requiere obligatoriamente una computadora **macOS** y una cuenta en el programa de desarrolladores de Apple (**Apple Developer Program**).

### Paso A: Configuración en macOS
Instala las herramientas oficiales en tu Mac:
- **Xcode** (desde el Mac App Store).
- **Cocoapods** para gestionar dependencias de Cocoa:
  ```bash
  sudo gem install cocoapods
  ```

### Paso B: Descargar dependencias e iniciar Xcode
1. Corre la descarga de paquetes e instala los pods nativos de iOS:
   ```bash
   flutter pub get
   cd ios
   pod install
   cd ..
   ```
2. Abre el proyecto en Xcode:
   ```bash
   open ios/Runner.xcworkspace
   ```

### Paso C: Configurar Firma y Certificados (Provisioning Profiles)
1. En Xcode, selecciona el target principal **Runner**.
2. Dirígete a la pestaña **Signing & Capabilities**.
3. Selecciona tu **Team** de desarrollador de Apple. Xcode generará los perfiles de aprovisionamiento de manera automática.

### Paso D: Compilar la Aplicación (Generación de IPA)
Para generar el archivo `.ipa` de instalación e iniciar pruebas cerradas en dispositivos mediante **TestFlight**:
1. Ejecuta la compilación de iOS en tu terminal:
   ```bash
   flutter build ipa --release
   ```
2. El comando creará un archivo Xcode Archive (`Runner.xcarchive`).
3. Xcode abrirá el organizador de archivos de forma automática. Haz clic en **Distribute App**, selecciona **TestFlight** o **Ad-Hoc (para exportar .ipa local)**, y sigue los pasos para subir el binario a App Store Connect.

---

## ⚡ 3. CONFIGURACIÓN SATELLITAL DIRECTA CON RENDER / SUPABASE
La aplicación de Flutter está diseñada para apuntar dinámicamente a tu servidor desplegado en Render. Edita el archivo de configuración base de la app móvil (`lib/services/api_service.dart`) para enlazar las peticiones HTTP y eventos en tiempo real:

```dart
// Enlace satelital de app móvil:
const String BASE_URL = 'https://tu-servicio-delivery-plus.onrender.com';
const String SUPABASE_WS = 'wss://tu-proyecto.supabase.co/realtime/v1/websocket';
```
