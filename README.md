# 📸 PhotoWall – Plataforma SaaS para Eventos en Vivo

**PhotoWall** es una plataforma web completa tipo SaaS donde los invitados pueden subir fotos y mensajes escaneando un **QR**, viéndolos en una **galería en tiempo real** y proyectándolos durante el evento.
Ideal para **bodas, cumpleaños, aniversarios, eventos empresariales y celebraciones especiales**.

---

## 🚀 Funcionalidades Principales

### 👤 Organizadores (Usuarios Registrados)
* Creación de cuenta con **Correo/Contraseña** o **Google Auth**.
* Dashboard de gestión para crear y administrar eventos ilimitados.
* Diferentes **Planes y Precios** (Free, Esencial, Estándar, Premium) con pasarela de pago **PayPal** integrada.
* Generación automática de códigos QR y enlaces cortos (`/e/slug`).
* Gestión de moderación: eliminación de fotos inapropiadas en tiempo real.

### 🎉 Invitados (Acceso sin login)
* Acceso ultra rápido al evento escaneando el código QR.
* Identificación simple mediante nombre (creación de sesión anónima en localStorage).
* Subida de fotos instantánea almacenada en **Cloudinary**.
* Envío de mensajes y dedicatorias al organizador (filtradas automáticamente contra groserías).
* Visualización de la galería pública del evento en tiempo real.

### 👑 SuperAdmin (Administración Global)
* Panel de control central (`/superadmin`) protegido con métricas y gráficas financieras.
* Estadísticas en tiempo real (Ingresos totales, usuarios, fotos, invitados).
* Gestión global: Cambiar planes de usuarios manualmente, auditar transacciones.
* Herramientas de sistema: Poblar BD (Seeder), limpiar eventos inactivos, y *Factory Reset*.
* Script de consola de ultra-seguridad para creación en Producción.

### 🖥️ Proyección en Vivo
* Vista `/projection/:slug` optimizada para pantallas gigantes.
* Sincronización milimétrica usando **WebSockets (Socket.IO)**.
* Animaciones modernas, moderación automática y alertas en vivo.

---

## 🧠 Arquitectura Tecnológica

### Backend (API REST & WebSockets)
* **Node.js + Express** (TypeScript)
* **MongoDB + Mongoose** (Modelos relacionales: Usuarios, Eventos, Fotos, Mensajes, Pagos)
* **Socket.IO** (Comunicación bidireccional en tiempo real)
* **JWT (JSON Web Tokens)** (Autenticación y Seguridad)
* **Cloudinary** (Almacenamiento y optimización de imágenes)
* **PayPal REST API** (Procesamiento de pagos SaaS)

### Frontend (SPA)
* **Angular** (Standalone Components, Signals, Control Flow)
* Diseño moderno y responsivo con **Glassmorphism**, animaciones fluidas.
* Guardas de rutas (`authGuard`, `superAdminGuard`) e Interceptores HTTP.
* Carga de archivos y previsualización de imágenes integradas.

---

## 🔐 Seguridad y Accesos

1. **Organizadores:** Acceso vía token JWT seguro.
2. **Invitados:** Uso de *Guest Token* generado dinámicamente y validado en cada subida de foto/mensaje para evitar spam.
3. **SuperAdmin:** 
   - **En Desarrollo:** Accesible creando la cuenta vía API si coincide el `SUPER_ADMIN_SECRET`.
   - **En Producción:** Bloqueo total de API. Solo el administrador del servidor puede crear la cuenta vía CLI interactiva.

---

## 📦 Guía de Instalación Rápida

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/photowall.git
cd photowall
```

### 2️⃣ Configurar Backend
```bash
cd backend
npm install
```
Crear archivo `.env` en `backend/` basado en `.env.example` con tus credenciales de MongoDB, JWT, Cloudinary, Google Auth y PayPal.

Levantar servidor en desarrollo:
```bash
npm run dev
```

### 3️⃣ Configurar Frontend
En una nueva terminal:
```bash
cd frontend/photowall-frontend
npm install
```
Levantar aplicación Angular:
```bash
npm start
```

---

## 👑 Gestión del SuperAdmin

Para administrar la plataforma de forma global, PhotoWall cuenta con un **Panel SuperAdmin** (`/superadmin`).

### Crear el SuperAdmin (Máxima Seguridad)
Nunca debes exponer endpoints públicos para crear administradores en producción. Por ello, se ha creado un CLI interactivo:

1. Abre la terminal en el servidor (en la carpeta `backend/`).
2. Ejecuta el script de creación:
   ```bash
   # En desarrollo (local):
   npm run create:superadmin
   
   # En producción (tras compilar con npm run build):
   npm run create:superadmin:prod
   ```
3. Sigue las instrucciones en pantalla para asignar un nombre, correo y contraseña segura. 
4. Ve al frontend, inicia sesión con esas credenciales y el sistema automáticamente te redigirá al Panel de SuperAdmin.

---

## 🧪 Estado Actual del Proyecto
* [x] Backend estructurado, seguro y robusto.
* [x] Autenticación dual (Local y Google Auth).
* [x] Suscripciones y Pagos (SaaS con PayPal).
* [x] Panel Organizador (Dashboard, Creación de eventos, Moderación).
* [x] Panel SuperAdmin Global y herramientas de consola.
* [x] Experiencia de Invitado (Subida de fotos, mensajes).
* [x] Live WebSockets (Galería y Proyección).
* [x] Profanity Filter (Bloqueo de groserías multilingüe).
* [x] Despliegue en la nube listo.

---
## 📄 Licencia
MIT
