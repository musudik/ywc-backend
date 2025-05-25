import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '../generated/prisma';
import { authRoutes } from './auth/routes/auth-routes';
import analysisFormRoutes from './forms/master/analysis-form.routes';
import businessRoutes from './business/routes';
import formsRoutes from './forms/routes';
import adminRoutes from './admin/routes';

// Load environment variables with explicit path
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment variables from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.warn('No .env file found. Using environment variables from the system.');
  dotenv.config();
}

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Initialize Prisma client
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/forms/analysis', analysisFormRoutes);
app.use('/api/forms', formsRoutes);
app.use('/api', businessRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle shutdown gracefully
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  // Close database connections
  await prisma.$disconnect();
  process.exit(0);
});

// Export app for testing
export { app }; 