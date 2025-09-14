import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import existing routes
import therapyRoutes from './routes/therapyRoutes.js';
import dataRoutes from './routes/dataRoutes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/therapy', therapyRoutes);
app.use('/api/data', dataRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AyurSutra API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    endpoints: {
      'Data Management': {
        'GET /api/data/{type}': 'Get all records of a specific type',
        'GET /api/data/{type}/:id': 'Get a specific record by ID',
        'POST /api/data/{type}': 'Create a new record',
        'PUT /api/data/{type}/:id': 'Update an existing record',
        'DELETE /api/data/{type}/:id': 'Delete a record',
        'GET /api/data/{type}/search': 'Search records',
        'POST /api/data/{type}/bulk': 'Bulk operations'
      },
      'Specialized Endpoints': {
        'GET /api/data/appointments/date-range': 'Get appointments by date range',
        'GET /api/data/appointments/available-slots': 'Get available time slots',
        'GET /api/data/patients/:id/medical-history': 'Get complete patient medical history',
        'GET /api/data/analytics/dashboard': 'Get dashboard analytics'
      },
      'Utility Endpoints': {
        'POST /api/data/export': 'Export data in various formats',
        'POST /api/data/validate': 'Validate data against rules',
        'GET /api/health': 'Health check',
        'GET /api/docs': 'API documentation'
      }
    },
    dataTypes: [
      'appointments',
      'patients', 
      'practitioners',
      'medical-records',
      'therapy-plans',
      'invoices',
      'reviews',
      'notifications',
      'users'
    ]
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌿 AyurSutra Server running on port ${PORT}`);
  console.log(`📊 Data Management API available at http://localhost:${PORT}/api/data`);
  console.log(`📖 API Documentation available at http://localhost:${PORT}/api/docs`);
});

export default app;
