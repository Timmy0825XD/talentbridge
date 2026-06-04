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
import candidateRoutes from './routes/candidate.routes';
import dashboardRoutes from './routes/dashboard.routes';
import taxRoutes from './routes/tax.routes';
import adminRoutes from './routes/admin.routes';
import universityRoutes from './routes/university.routes';
import careerRoutes from './routes/career.routes';
import institutionRoutes from './routes/institution.routes';
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
app.use('/api/candidates', candidateRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/institution', institutionRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
