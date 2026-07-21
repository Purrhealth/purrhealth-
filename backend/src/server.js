import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Import routes
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import catRoutes from './routes/cats.js';
import appointmentRoutes from './routes/appointments.js';
import vaccineRoutes from './routes/vaccines.js';
import weightRoutes from './routes/weight.js';
import documentRoutes from './routes/documents.js';

// Import middleware
import errorHandler from './middleware/errorHandler.js';
import requestLogger from './middleware/requestLogger.js';
import { notFoundHandler } from './middleware/notFound.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ═══════════════════════════════════════════════════════════
// SECURITY MIDDLEWARE
// ═══════════════════════════════════════════════════════════
app.use(helmet()); // Set security HTTP headers

// ═══════════════════════════════════════════════════════════
// CORS CONFIGURATION
// ═══════════════════════════════════════════════════════════
const corsOptions = {
  origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// ═══════════════════════════════════════════════════════════
// BODY PARSERS
// ═══════════════════════════════════════════════════════════
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ═══════════════════════════════════════════════════════════
// LOGGING MIDDLEWARE
// ═══════════════════════════════════════════════════════════
if (NODE_ENV !== 'test') {
  const morganFormat = NODE_ENV === 'production' ? 'combined' : 'dev';
  app.use(morgan(morganFormat));
}

app.use(requestLogger);

// ═══════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════

// Health check endpoint
app.use('/api/health', healthRoutes);

// Authentication routes
app.use('/api/auth', authRoutes);

// Cat management routes
app.use('/api/cats', catRoutes);

// Appointment routes
app.use('/api/appointments', appointmentRoutes);

// Vaccine routes
app.use('/api/vaccines', vaccineRoutes);

// Weight tracking routes
app.use('/api/weight', weightRoutes);

// Document management routes
app.use('/api/documents', documentRoutes);

// ═══════════════════════════════════════════════════════════
// ROOT ENDPOINT
// ═══════════════════════════════════════════════════════════
app.get('/', (req, res) => {
  res.json({
    message: '🐾 PurrHealth API Server',
    version: '1.0.0',
    status: 'running',
    environment: NODE_ENV,
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      cats: '/api/cats',
      appointments: '/api/appointments',
      vaccines: '/api/vaccines',
      weight: '/api/weight',
      documents: '/api/documents',
    },
  });
});

// ═══════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════

// 404 Not Found Handler
app.use(notFoundHandler);

// Global Error Handler (must be last)
app.use(errorHandler);

// ═══════════════════════════════════════════════════════════
// SERVER STARTUP
// ═══════════════════════════════════════════════════════════

const server = app.listen(PORT, () => {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🐾 PurrHealth API Server Started`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`API Status: http://localhost:${PORT}/api/health`);
  console.log(`\n📝 Available Endpoints:`);
  console.log(`   ├── Authentication: /api/auth`);
  console.log(`   ├── Cat Management: /api/cats`);
  console.log(`   ├── Appointments: /api/appointments`);
  console.log(`   ├── Vaccines: /api/vaccines`);
  console.log(`   ├── Weight Tracking: /api/weight`);
  console.log(`   └── Documents: /api/documents`);
  console.log(`${'═'.repeat(60)}\n`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n\n🛑 SIGTERM received: shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 SIGINT received: shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
