import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mockDb from './config/mockDatabase.js';

// Import routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import practitionerRoutes from './routes/practitioner.js';
import patientRoutes from './routes/patient.js';
import notificationRoutes from './routes/notifications.js';
import uploadRoutes from './routes/upload.js';
import therapyRoutes from './routes/therapy.js';

// Import middleware
import { handleUploadError } from './middleware/upload.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5178"],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5178'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = useMockDb ? 'mock-database' : (mongoose.connection.readyState === 1 ? 'mongodb-connected' : 'mongodb-disconnected');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      connected: isDbConnected,
      type: useMockDb ? 'mock' : 'mongodb',
      readyState: useMockDb ? 1 : mongoose.connection.readyState
    },
    server: {
      port: process.env.PORT || 8003,
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    }
  });
});

// Database connection with fallback to mock database
let isDbConnected = false;
let useMockDb = false;

// Initialize mock database first
console.log('🔄 Initializing mock database for development');
useMockDb = true;
isDbConnected = true;
console.log('✅ Mock database initialized successfully');

// Try MongoDB Atlas connection (non-blocking)
if (process.env.MONGODB_URI && process.env.NODE_ENV === 'production') {
  mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
    maxPoolSize: 10
  })
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully');
    isDbConnected = true;
    useMockDb = false;
  })
  .catch(err => {
    console.log('❌ MongoDB Atlas connection failed:', err.message);
    console.log('🔄 Continuing with mock database');
  });
} else {
  console.log('📝 Using mock database in development mode');
}

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.log('MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Socket.io for real-time notifications
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', (userId) => {
    socket.join(userId);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io and database available to routes
app.use((req, res, next) => {
  req.io = io;
  req.mockDb = mockDb;
  req.useMockDb = useMockDb;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/practitioner', practitionerRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/therapies', therapyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Panchakarma API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Panchakarma Platform API',
    version: '1.0.0',
    description: 'Comprehensive Ayurvedic wellness platform backend',
    endpoints: {
      auth: '/api/auth - Authentication and user management',
      admin: '/api/admin - Admin panel functionality',
      practitioner: '/api/practitioner - Practitioner dashboard and tools',
      patient: '/api/patient - Patient portal and services',
      notifications: '/api/notifications - Notification management',
      upload: '/api/upload - File upload and storage',
      therapies: '/api/therapies - Therapy management and scheduling',
      health: '/api/health - API health check'
    },
    features: [
      'JWT Authentication',
      'Role-based Authorization',
      'Real-time Notifications',
      'File Upload with Cloudinary',
      'Email Notifications',
      'Comprehensive Validation',
      'MongoDB Integration',
      'Socket.IO Real-time Communication'
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    availableRoutes: [
      '/api/auth',
      '/api/admin', 
      '/api/practitioner',
      '/api/patient',
      '/api/notifications',
      '/api/upload',
      '/api/therapies',
      '/api/health'
    ]
  });
});

// Error handling middleware
app.use(handleUploadError);
app.use(errorHandler);

const PORT = process.env.PORT || 8001;
server.listen(PORT, () => {
  console.log(`🚀 Panchakarma API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API Documentation: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📧 Email Service: ${process.env.NODE_ENV === 'production' ? 'Production' : 'Development (Ethereal)'}`);
  console.log(`☁️  File Storage: ${process.env.CLOUDINARY_CLOUD_NAME ? 'Cloudinary' : 'Local'}`);
});
