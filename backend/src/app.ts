import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globales
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check — sirve para verificar que el servidor está vivo
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'TalentBridge API',
    timestamp: new Date().toISOString(),
  });
});

// Rutas (se agregan en fases siguientes)
// app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 TalentBridge API corriendo en http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});

export default app;