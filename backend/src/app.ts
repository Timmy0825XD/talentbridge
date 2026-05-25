import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import rankingRoutes from './routes/ranking.routes';
import jobRoutes from './routes/job.routes';
import applicationRoutes from './routes/application.routes';
import keywordRoutes from './routes/keyword.routes';
import notificationRoutes from './routes/notification.routes';
import contractRoutes from './routes/contract.routes';
import { notFoundHandler } from './middlewares/not-found.middleware';
import { globalErrorHandler } from './middlewares/global-error.middleware';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'TalentBridge API',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/keywords', keywordRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contracts', contractRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
