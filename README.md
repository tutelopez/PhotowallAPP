# 📸 PhotoWall – Eventos con Fotos en Vivo vía QR

**PhotoWall** es una plataforma web para eventos donde los invitados pueden subir fotos escaneando un **QR**, verlas en una **galería en tiempo real** y proyectarlas durante el evento.
Ideal para **bodas, cumpleaños, aniversarios, eventos empresariales y celebraciones especiales**.

---

## 🚀 Funcionalidades (en progreso)

### 👤 Organizadores

* Crear eventos (nombre, fecha, tipo)
* Generar QR público por evento
* Ver todas las fotos del evento
* Eliminar fotos inapropiadas
* Gestionar eventos propios (sin acceso cruzado)

### 🎉 Invitados (sin cuenta)

* Acceso al evento vía QR
* Ingresar su nombre (sin registro)
* Subir fotos al evento
* Ver galería pública del evento

### 🖥️ Proyección (próximamente)

* Vista especial para proyectar fotos en vivo
* Actualización en tiempo real (WebSockets)

---

## 🧠 Arquitectura del Proyecto

### Backend

* **Node.js**
* **Express**
* **TypeScript**
* **MongoDB + Mongoose**
* Arquitectura **MVC modular**
* Identificación de invitados sin login (Guest Token)

### Frontend (en desarrollo)

* **Angular**
* Consumo de API REST
* Vistas públicas y privadas

---

## 🗂️ Estructura del Backend

```
src/
 ├─ config/
 │   └─ db.ts
 ├─ middlewares/
 │   └─ guest.middleware.ts
 ├─ modules/
 │   ├─ events/
 │   ├─ guests/
 │   ├─ photos/        (pendiente)
 │   ├─ gallery/       (pendiente)
 │   └─ projection/    (pendiente)
 ├─ routes/
 ├─ types/
 │   └─ express.d.ts
 ├─ utils/
 │   ├─ slugify.ts
 │   └─ qr.ts
 ├─ app.ts
 └─ server.ts
```

---

## 🔐 Identificación de Invitados (sin login)

Los invitados **no crean cuenta**.

Flujo:

1. Escanean el QR del evento
2. Ingresan su nombre
3. El backend crea una **Guest Session**
4. Se genera un `guestToken` (UUID)
5. El frontend guarda el token en `localStorage`
6. El token se envía en cada request (`x-guest-token`)

✔️ Sin emails
✔️ Sin contraseñas
✔️ Experiencia rápida y segura

---

## 📦 Instalación (Backend)

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/photowall.git
cd photowall/backend
```

### 2️⃣ Instalar dependencias

```bash
npm install
```

### 3️⃣ Variables de entorno

Crear `.env`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/photowall
```

### 4️⃣ Ejecutar en desarrollo

```bash
npm run dev
```

---

## 🔌 Endpoints principales (actuales)

### Crear evento

```http
POST /api/events
```

### Obtener evento por slug

```http
GET /api/events/:slug
```

### Unirse a evento (invitado)

```http
POST /api/guests/join/:slug
```

Header (en requests protegidos):

```http
x-guest-token: <guest_token>
```

---

## 🧪 Estado actual del proyecto

* [x] Backend base con TypeScript
* [x] Eventos (CRUD inicial)
* [x] QR por evento
* [x] Invitados sin login
* [x] Middleware de identificación de invitado
* [ ] Subida de fotos (Cloudinary)
* [ ] Galería pública
* [ ] Proyección en vivo
* [ ] Filtro de contenido con IA

---

## 🤖 IA (idea futura)

Integración futura para:

* Detección de contenido inapropiado
* Moderación automática de fotos
* APIs posibles: Google Vision, AWS Rekognition, OpenAI Vision

---

## ✨ Visión

PhotoWall busca ofrecer una experiencia:

* 📱 **Simple para invitados**
* 🎥 **Impactante para eventos**
* 🛠️ **Robusta para organizadores**

---

## 📄 Licencia

MIT
