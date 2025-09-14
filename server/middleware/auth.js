import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    console.log('Token received:', token);
    console.log('JWT Secret:', process.env.JWT_SECRET || 'fallback_secret');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    console.log('Token decoded:', decoded);
    let user;
    
    // Use mock database or MongoDB based on availability
    if (req.useMockDb) {
      user = await req.mockDb.findUser({ _id: decoded.userId });
    } else {
      user = await User.findById(decoded.userId).select('-password');
    }
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token. User not found.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated.' 
      });
    }

    if (user.isLocked) {
      return res.status(423).json({ 
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts.' 
      });
    }

    // Update last login (only if not using mock DB)
    if (!req.useMockDb) {
      user.lastLogin = new Date();
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token has expired.' 
      });
    }
    res.status(401).json({ 
      success: false,
      message: 'Authentication failed.' 
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. Please authenticate first.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}` 
      });
    }

    next();
  };
};

// Middleware to check if user owns the resource
export const checkOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required.' 
      });
    }

    const resourceUserId = req.params[resourceField] || req.body[resourceField];
    
    if (req.user.role === 'admin') {
      return next(); // Admins can access all resources
    }

    if (req.user._id.toString() !== resourceUserId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. You can only access your own resources.' 
      });
    }

    next();
  };
};

// Rate limiting middleware
export const rateLimitByUser = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    if (!req.user) return next();
    
    const userId = req.user._id.toString();
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(userId)) {
      requests.set(userId, []);
    }
    
    const userRequests = requests.get(userId);
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    validRequests.push(now);
    requests.set(userId, validRequests);
    
    next();
  };
};
