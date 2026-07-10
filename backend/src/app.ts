import express from 'express';
import cors from 'cors';
import http from 'http';
import multer from 'multer';
import eventRoutes from './routes/event.routes';
import userRoutes from './routes/User.routes';
import guestRoutes from './routes/Guest.routes';
import photoRoutes from './routes/Photo.routes';
import adminRoutes from './routes/Admin.routes';
import authRoutes from './routes/Auth.routes';
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/api/health', (_, res) => {
  res.json({ status: 'OK', message: 'PhotoWall API running' });
});
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'La imagen supera el tamaño máximo permitido (15MB)'
      });
    }
    return res.status(400).json({
      message: `Error subiendo archivo: ${err.message}`
    });
  }
  console.error('🔴 ERROR NO MANEJADO:', err);
  res.status(500).json({ message: 'Error interno del servidor' });
});
const server = http.createServer(app);
import { Server } from 'socket.io';
export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);
  socket.on('join-event', (eventId: string) => {
    socket.join(`event_${eventId}`);
    console.log(`Cliente ${socket.id} unido a sala event_${eventId}`);
  });
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});
export default app;