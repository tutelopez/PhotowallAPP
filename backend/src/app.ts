import express from 'express';
import cors from 'cors';
import eventRoutes from './routes/event.routes';
import userRoutes from './routes/User.routes';
import guestRoutes from './routes/Guest.routes'
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_, res) => {
  res.json({ status: 'OK', message: 'PhotoWall API running' });
});

app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/guests', guestRoutes)
export default app;
