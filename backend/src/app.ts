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
import messageRoutes from './routes/Message.routes';
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
app.use('/api/messages', messageRoutes);
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
const ALLOWED_EMOJIS = ['❤️', '😂', '🎉', '🔥', '👏', '😍', '🥳', '👍'];
const lastEmojiAt = new Map<string, number>();
const EMOJI_COOLDOWN_MS = 250;
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);
  socket.on('join-event', (eventId: string) => {
    socket.join(`event_${eventId}`);
    console.log(`Cliente ${socket.id} unido a sala event_${eventId}`);
  });
  socket.on('send-emoji', (payload: { eventId?: string; emoji?: string }) => {
    const eventId = payload?.eventId;
    const emoji = payload?.emoji;
    if (!eventId || typeof eventId !== 'string') return;
    if (!emoji || !ALLOWED_EMOJIS.includes(emoji)) return;
    const now = Date.now();
    const last = lastEmojiAt.get(socket.id) || 0;
    if (now - last < EMOJI_COOLDOWN_MS) return;
    lastEmojiAt.set(socket.id, now);
    io.to(`event_${eventId}`).emit('emoji-float', {
      emoji,
      id: `${socket.id}-${now}`
    });
  });
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
  
});
export { server };
export default app;