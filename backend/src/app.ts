import express from 'express';
import cors from 'cors';
import http from 'http';
import eventRoutes from './routes/event.routes';
import userRoutes from './routes/User.routes';
import guestRoutes from './routes/Guest.routes';
import photoRoutes from './routes/Photo.routes';
import adminRoutes from './routes/Admin.routes'

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_, res) => {
  res.json({ status: 'OK', message: 'PhotoWall API running' });
});

app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/admin', adminRoutes)

// 🌐 Socket.IO
const server = http.createServer(app);

import { Server } from 'socket.io';
export const io = new Server(server, {
  cors: {
    origin: '*', // Cambiar según tu frontend
    methods: ['GET', 'POST']
  }
});

// manejar conexiones
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  // unirse a sala de un evento
  socket.on('join-event', (eventId: string) => {
    socket.join(`event_${eventId}`);
    console.log(`Cliente ${socket.id} unido a sala event_${eventId}`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});


export default app;
