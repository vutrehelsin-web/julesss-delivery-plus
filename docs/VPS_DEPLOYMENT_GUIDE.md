# GUÍA DE DESPLIEGUE EN VPS UBUNTU 24.04 – INSTALACIÓN Y CONFIGURACIÓN

Este manual detalla los pasos de ingeniería y administración de sistemas para configurar tu Servidor Virtual Privado (VPS) Ubuntu 24.04, instalar las dependencias críticas y montar un servicio de **Delivery Plus** para producción 24/7 con proxy reverso seguro.

---

## 📦 1. PREPARACIÓN E INSTALACIÓN DE DEPENDENCIAS (VPS)

Conéctate a tu VPS por SSH e instala los paquetes necesarios para compilar y ejecutar Node.js y gestionar contenedores:

```bash
# Actualizar el sistema de paquetes
sudo apt update && sudo apt upgrade -y

# Instalar Git, Curl y herramientas de compilación
sudo apt install -y curl git build-essential nginx certbot python3-certbot-nginx

# Instalar Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar versiones instaladas
node -v
npm -v
```

---

## 🚀 2. CONFIGURACIÓN DEL PROYECTO Y VARIABLES DE ENTORNO

1. Clona tu repositorio de GitHub de Delivery Plus en el VPS (por ejemplo, en el directorio `/var/www/`):
   ```bash
   sudo mkdir -p /var/www/deliveryplus
   sudo chown -R $USER:$USER /var/www/deliveryplus
   # Clonar proyecto
   git clone https://github.com/vutrehelsin-web/julesss-delivery-plus.git /var/www/deliveryplus
   cd /var/www/deliveryplus
   ```

2. Crea tu archivo .env de producción en la raíz del proyecto para conectar los servicios reales:
   ```env
   PORT=3000
   NODE_ENV=production
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-real-de-supabase
   GEMINI_API_KEY=tu-gemini-key
   HF_TOKEN=tu-hugging-face-token-para-chatterbox
   GOOGLE_APPLICATION_CREDENTIALS_JSON=...
   ```

3. Instala los paquetes de producción y compila la aplicación para empaquetar el frontend y el backend de forma optimizada:
   ```bash
   npm install
   npm run build
   ```

---

## ⚙️ 3. DAEMONIZACIÓN CON SYSTEMD (Ejecución 24/7 con Auto-Restart)

Para garantizar que el servidor Express de Delivery Plus corra en segundo plano permanentemente y se reinicie solo en caso de caídas o reinicios del VPS, crearemos un servicio de **systemd**:

1. Crea el archivo de servicio `/etc/systemd/system/deliveryplus.service` e inyecta la configuración:
   ```ini
   [Unit]
   Description=Servidor Express + Vite de Delivery Plus B2B
   After=network.target

   [Service]
   Type=simple
   User=ubuntu
   WorkingDirectory=/var/www/deliveryplus
   ExecStart=/usr/bin/npm run start
   Restart=on-failure
   Environment=NODE_ENV=production

   [Install]
   WantedBy=multi-user.target
   ```

2. Recarga los daemons de systemd, habilita el inicio automático y arranca el servicio:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable deliveryplus
   sudo systemctl start deliveryplus

   # Verificar que el servicio esté corriendo (LIVE)
   sudo systemctl status deliveryplus
   ```

---

## 🔒 4. PROXY REVERSO NGINX Y SSL SEGURO (HTTPS)

Para exponer tu aplicación de manera segura en un dominio público (ej: `https://tudominio.com`) sin mostrar el puerto `:3000`:

1. Configura el archivo de sitio de Nginx `/etc/nginx/sites-available/deliveryplus`:
   ```nginx
   server {
       listen 80;
       server_name tudominio.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

2. Enlaza el sitio en los activos de Nginx, remueve la plantilla por defecto y reinicia el servidor web:
   ```bash
   sudo ln -s /etc/nginx/sites-available/deliveryplus /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default
   sudo systemctl restart nginx
   ```

3. Genera e instala certificados SSL gratuitos de **Let's Encrypt** con Certbot:
   ```bash
   sudo certbot --nginx -d tudominio.com
   ```
   *(Certbot configurará automáticamente la redirección obligatoria de HTTP a HTTPS de manera segura).*

---

## 🛠️ 5. DESPLIEGUE DIRECTO DESDE JULES (WEBHOOKS INTEGRADOS)

Si deseas configurar mi CLI (Jules CLI) para disparar redespliegues automáticos directos en tu VPS cada vez que hagamos commits en la rama release o main:

1. En tu VPS, puedes instalar un webhook receptor ligero en Node.js o Python que escuche en el puerto 9000.
2. Al recibir un webhook de GitHub, el VPS ejecutará automáticamente la secuencia:
   ```bash
   cd /var/www/deliveryplus
   # Sincronizar cambios de rama
   git pull origin release
   npm install
   npm run build
   sudo systemctl restart deliveryplus
   ```
3. Esto enlazará mis entregas de código de forma directa con la infraestructura física de tu propio servidor.
