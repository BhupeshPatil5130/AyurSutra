import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Practitioner from '../models/Practitioner.js';
import Patient from '../models/Patient.js';
import { validateUserRegistration, validateUserLogin } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Register
router.post('/register', async (req, res) => {
  try {
    let { email, password, name, firstName, lastName, phone, role, dateOfBirth, gender } = req.body;

    // Handle name field - split if provided as single field
    if (name && !firstName && !lastName) {
      const nameParts = name.trim().split(' ');
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ') || nameParts[0];
    }

    // Validate required fields
    if (!email || !password || !firstName || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, password, name, phone, and role are required'
      });
    }

    // Check if user already exists (use mock DB if MongoDB is not available)
    let existingUser;
    if (req.useMockDb) {
      existingUser = await req.mockDb.findUser({ email });
    } else {
      existingUser = await User.findOne({ email });
    }

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Prepare user data
    const userData = {
      email,
      password,
      firstName,
      lastName: lastName || firstName,
      phone,
      role,
      verificationToken,
      isVerified: process.env.NODE_ENV === 'development', // Auto-verify in development
      isActive: true,
      fullName: `${firstName} ${lastName || firstName}`,
      name: `${firstName} ${lastName || firstName}`
    };

    let user;
    if (req.useMockDb) {
      // Hash password for mock database
      const salt = await bcrypt.genSalt(12);
      userData.password = await bcrypt.hash(password, salt);
      user = await req.mockDb.createUser(userData);
    } else {
      // Create user with MongoDB
      user = new User(userData);
      await user.save();
    }

    // Create role-specific profile
    if (role === 'practitioner') {
      const practitionerData = {
        userId: user._id,
        licenseNumber: req.body.licenseNumber || `TEMP${Date.now()}`,
        experience: parseInt(req.body.experience) || 0,
        consultationFee: parseFloat(req.body.consultationFee) || 500,
        specializations: req.body.specialization ? [req.body.specialization] : ['General Ayurveda'],
        availability: [],
        bio: req.body.qualifications || 'Experienced Ayurvedic practitioner',
        education: req.body.qualifications ? [req.body.qualifications] : ['BAMS'],
        certifications: req.body.specialization ? [req.body.specialization] : ['Ayurvedic Medicine'],
        rating: 4.5,
        totalReviews: 0,
        isVerified: false // Practitioners need manual verification
      };

      if (req.useMockDb) {
        await req.mockDb.create('practitioners', practitionerData);
      } else {
        const practitioner = new Practitioner(practitionerData);
        await practitioner.save();
      }
    } else if (role === 'patient') {
      const patientData = {
        userId: user._id,
        dateOfBirth: dateOfBirth || new Date('1990-01-01'),
        gender: gender || 'other',
        emergencyContact: {
          name: req.body.emergencyContactName || 'Emergency Contact',
          relationship: req.body.emergencyContactRelation || 'Family',
          phone: req.body.emergencyContactPhone || phone
        },
        medicalHistory: [],
        allergies: [],
        currentMedications: [],
        lifestyle: {
          diet: 'Vegetarian',
          exercise: 'Moderate',
          smoking: false,
          alcohol: 'Never'
        }
      };

      if (req.useMockDb) {
        await req.mockDb.create('patients', patientData);
      } else {
        const patient = new Patient(patientData);
        await patient.save();
      }
    }

    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName || user.name,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user (use mock DB if MongoDB is not available)
    let user;
    if (req.useMockDb) {
      user = await req.mockDb.findUser({ email });
    } else {
      user = await User.findOne({ email }).select('+password');
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ 
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts' 
      });
    }

    // Check password
    let isMatch;
    if (req.useMockDb) {
      // For mock DB, use bcrypt directly
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = await user.comparePassword(password);
    }
    
    if (!isMatch) {
      if (!req.useMockDb) {
        await user.incLoginAttempts();
      }
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated. Please contact support.' 
      });
    }

    // Reset login attempts on successful login
    if (!req.useMockDb && user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    if (!req.useMockDb) {
      user.lastLogin = new Date();
      await user.save();
    }

    const token = generateToken(user._id);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Demo login endpoints
router.post('/demo-login/:role', async (req, res) => {
  try {
    const { role } = req.params;
    
    if (!['admin', 'practitioner', 'patient'].includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role. Must be admin, practitioner, or patient' 
      });
    }

    const email = `${role}@panchakarma.com`;
    let user;
    
    // Use mock database or MongoDB based on availability
    if (req.useMockDb) {
      user = await req.mockDb.findUser({ email });
    } else {
      user = await User.findOne({ email });
    }
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: `Demo ${role} user not found. Please run the seed script first.` 
      });
    }

    // Update last login (only if not using mock DB)
    if (!req.useMockDb) {
      user.lastLogin = new Date();
      await user.save();
    }

    const token = generateToken(user._id);
    
    res.json({
      success: true,
      message: `Demo ${role} login successful`,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName || user.name?.split(' ')[0] || 'Demo',
        lastName: user.lastName || user.name?.split(' ')[1] || 'User',
        fullName: user.fullName || user.name || `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Demo login failed', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = req.user;
    let profile = null;

    // Get role-specific profile
    if (user.role === 'practitioner') {
      profile = await Practitioner.findOne({ userId: user._id });
    } else if (user.role === 'patient') {
      profile = await Patient.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        avatar: user.avatar,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      },
      profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Logout (client-side token removal, but we can track it)
router.post('/logout', authenticate, async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just send a success response
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Logout failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Refresh token
router.post('/refresh-token', authenticate, async (req, res) => {
  try {
    const newToken = generateToken(req.user._id);
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Token refresh failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
