import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.routes';
import projectsRoutes from './routes/projects.routes';
import redactionsRoutes from './routes/redactions.routes';
import briefsRoutes from './routes/briefs.routes';
import styleRoutes from './routes/style.routes';

// Middleware
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Sécurité
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Autoriser tous les localhost (dev) + frontend URL spécifique (prod)
    const allowedOrigins = [
      'http://localhost:4321',
      'http://localhost:4322',
      'http://localhost:4323',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (!origin || allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'redaction-ia-api'
  });
});

// Routes publiques
app.use('/api/auth', authRoutes);

// Routes protégées (nécessitent JWT)
app.use(authMiddleware);
app.use('/api/projects', projectsRoutes);
app.use('/api/redactions', redactionsRoutes);
app.use('/api/briefs', briefsRoutes);
app.use('/api/style', styleRoutes);

// Gestionnaire d'erreur global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

app.listen(PORT, () => {
  console.log(`✅ Backend démarré sur http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth: POST http://localhost:${PORT}/api/auth/login`);
});

export default app;
