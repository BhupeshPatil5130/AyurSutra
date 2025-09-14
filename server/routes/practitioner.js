import express from 'express';
import Practitioner from '../models/Practitioner.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import Invoice from '../models/Invoice.js';
import User from '../models/User.js';
import MedicalRecord from '../models/MedicalRecord.js';
import TherapyPlan from '../models/TherapyPlan.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Report from '../models/Report.js';
import { validateCommonParams, validateMedicalRecord } from '../middleware/validation.js';

import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Test endpoint without authentication for debugging
router.get('/test-no-auth', (req, res) => {
  res.json({
    success: true,
    message: 'No auth test',
    useMockDb: req.useMockDb,
    mockDb: req.mockDb ? 'available' : 'not available'
  });
});

// Test notifications endpoint without authentication
router.get('/test-notifications', (req, res) => {
  const mockNotifications = [
    {
      _id: 'notif1',
      title: 'New Appointment',
      message: 'You have a new appointment scheduled',
      type: 'appointment',
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'notif2',
      title: 'Payment Received',
      message: 'Payment of ₹1500 received from John Doe',
      type: 'payment',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];
  
  res.json({
    success: true,
    notifications: mockNotifications,
    total: mockNotifications.length,
    unreadCount: mockNotifications.filter(n => !n.isRead).length
  });
});

// Apply authentication middleware to all routes
router.use(authenticate);

// Test endpoint to verify authentication
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication working',
    user: req.user,
    useMockDb: req.useMockDb
  });
});

// Get practitioner profile
router.get('/profile', async (req, res) => {
  try {
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner profile not found' });
      }
      
      const user = req.mockDb.users.find(u => u._id === practitioner.userId);
      
      res.json({
        ...practitioner,
        user: user ? {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role
        } : null
      });
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOne({ userId: req.user._id })
        .populate('userId', 'firstName lastName email phone role');
    
    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner profile not found' });
    }

    res.json(practitioner);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update practitioner profile
router.put('/profile', async (req, res) => {
  try {
    const updateData = req.body;
    
    if (req.useMockDb) {
      // Use mock database
      const practitionerIndex = req.mockDb.practitioners.findIndex(p => p.userId === req.user._id);
      
      if (practitionerIndex === -1) {
      return res.status(404).json({ message: 'Practitioner profile not found' });
    }

      req.mockDb.practitioners[practitionerIndex] = {
        ...req.mockDb.practitioners[practitionerIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      req.mockDb.saveData('practitioners.json', req.mockDb.practitioners);
      
      res.json({
        message: 'Profile updated successfully',
        practitioner: req.mockDb.practitioners[practitionerIndex]
      });
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOneAndUpdate(
        { userId: req.user._id },
        { $set: updateData },
        { new: true }
      ).populate('userId', 'firstName lastName email phone role');
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner profile not found' });
      }
      
      res.json({
        message: 'Profile updated successfully',
        practitioner
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner profile not found' });
      }
      
      // Get appointments for this practitioner
      const appointments = req.mockDb.appointments.filter(apt => apt.practitionerId === practitioner._id);
      
      // Get patients for this practitioner
      const patientIds = [...new Set(appointments.map(apt => apt.patientId))];
      const patients = req.mockDb.patients.filter(p => patientIds.includes(p._id));
      
      // Get invoices for this practitioner
      const invoices = req.mockDb.invoices.filter(inv => inv.practitionerId === practitioner._id);
      
      // Get reviews for this practitioner
      const reviews = req.mockDb.reviews.filter(r => r.practitionerId === practitioner._id);
      
      // Calculate statistics
      const totalPatients = patients.length;
      const totalAppointments = appointments.length;
      const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.total || 0), 0);
      const avgRating = reviews.length > 0 ? 
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
      
      res.json({
        totalPatients: { current: totalPatients, previous: Math.floor(totalPatients * 0.9) },
        totalAppointments: { current: totalAppointments, previous: Math.floor(totalAppointments * 0.8) },
        totalRevenue: { current: totalRevenue, previous: Math.floor(totalRevenue * 0.85) },
        avgRating: { current: Math.round(avgRating * 100) / 100 },
        totalReviews: reviews.length,
        patientSatisfaction: Math.round(avgRating * 20), // Convert to percentage
        successRate: 92,
        completionRate: appointments.length > 0 ? 
          Math.round((appointments.filter(apt => apt.status === 'completed').length / appointments.length) * 100) : 0,
        recentReviews: reviews
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(review => {
            const patient = req.mockDb.patients.find(p => p._id === review.patientId);
            const patientUser = patient ? req.mockDb.users.find(u => u._id === patient.userId) : null;
            
            return {
              ...review,
              patient: patientUser ? {
                firstName: patientUser.firstName,
                lastName: patientUser.lastName
              } : null
            };
          })
      });
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOne({ userId: req.user._id });
    
    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner profile not found' });
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    // Calculate date range for comparison
    let dateFilter;
    let previousDateFilter;
    
    switch (timeRange) {
      case '7d':
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        previousDateFilter = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        previousDateFilter = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        previousDateFilter = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        previousDateFilter = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    }

      const [currentPatients, previousPatients, currentAppointments, previousAppointments, currentRevenue, previousRevenue, avgRating, totalReviews] = await Promise.all([
        Patient.countDocuments({ preferredPractitioner: practitioner._id, createdAt: { $gte: dateFilter } }),
        Patient.countDocuments({ preferredPractitioner: practitioner._id, createdAt: { $gte: previousDateFilter, $lt: dateFilter } }),
        Appointment.countDocuments({ practitionerId: practitioner._id, createdAt: { $gte: dateFilter } }),
        Appointment.countDocuments({ practitionerId: practitioner._id, createdAt: { $gte: previousDateFilter, $lt: dateFilter } }),
        Invoice.aggregate([{ $match: { practitionerId: practitioner._id, paymentStatus: 'paid', createdAt: { $gte: dateFilter } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
        Invoice.aggregate([{ $match: { practitionerId: practitioner._id, paymentStatus: 'paid', createdAt: { $gte: previousDateFilter, $lt: dateFilter } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
        Review.aggregate([{ $match: { practitionerId: practitioner._id } }, { $group: { _id: null, avg: { $avg: '$rating' } } }]),
        Review.countDocuments({ practitionerId: practitioner._id })
      ]);

    res.json({
        totalPatients: { current: currentPatients, previous: previousPatients },
        totalAppointments: { current: currentAppointments, previous: previousAppointments },
        totalRevenue: { current: currentRevenue[0]?.total || 0, previous: previousRevenue[0]?.total || 0 },
        avgRating: { current: avgRating[0]?.avg || 0 },
      totalReviews,
        patientSatisfaction: 85,
        successRate: 92,
        completionRate: 0,
        recentReviews: []
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get appointments
router.get('/appointments', async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
    
    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner profile not found' });
    }

      let allAppointments = req.mockDb.appointments.filter(apt => apt.practitionerId === practitioner._id);
      
      // Apply filters
      if (status) {
        allAppointments = allAppointments.filter(apt => apt.status === status);
      }
      if (date) {
        const targetDate = new Date(date).toDateString();
        allAppointments = allAppointments.filter(apt => 
          new Date(apt.appointmentDate).toDateString() === targetDate
        );
      }

      const total = allAppointments.length;
      
      // Sort and paginate
      const appointments = allAppointments
        .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
        .slice((page - 1) * limit, page * limit)
        .map(apt => {
          const patient = req.mockDb.patients.find(p => p._id === apt.patientId);
          const user = patient ? req.mockDb.users.find(u => u._id === patient.userId) : null;
          
          return {
        ...apt,
        patientId: {
              _id: apt.patientId,
              userId: user ? {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone
              } : {
                _id: apt.patientId,
                firstName: 'Unknown',
                lastName: 'Patient',
                email: 'unknown@example.com',
                phone: 'N/A'
              }
            }
          };
        });

    res.json({
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
    } else {
      // Use MongoDB
    const practitioner = await Practitioner.findOne({ userId: req.user._id });

    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner profile not found' });
    }

    let query = { practitionerId: practitioner._id };
    if (status) query.status = status;
      if (date) {
        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
        query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
      }

      const appointments = await Appointment.find(query)
      .populate({
        path: 'patientId',
          populate: { path: 'userId', select: 'firstName lastName email phone' }
      })
        .sort({ appointmentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

      const total = await Appointment.countDocuments(query);

    res.json({
        appointments,
      totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
      total
    });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get patients
router.get('/patients', async (req, res) => {
  try {
    const { recent, page = 1, limit = 10 } = req.query;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);

    if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      let allPatients = req.mockDb.patients;
      
      // Filter patients who have appointments with this practitioner
      const practitionerAppointments = req.mockDb.appointments.filter(apt => apt.practitionerId === practitioner._id);
      const patientIds = [...new Set(practitionerAppointments.map(apt => apt.patientId))];
      
      allPatients = allPatients.filter(patient => patientIds.includes(patient._id));
      
      if (recent === 'true') {
        // Get recent patients (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        allPatients = allPatients.filter(patient => 
          new Date(patient.createdAt) >= thirtyDaysAgo
        ).slice(0, 5);
      } else {
        // Apply pagination
        allPatients = allPatients
          .slice((page - 1) * limit, page * limit);
      }
      
      // Add user details
      const patients = allPatients.map(patient => {
        const user = req.mockDb.users.find(u => u._id === patient.userId);
        return {
          ...patient,
          userId: user ? {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone
          } : {
            _id: patient.userId,
            firstName: 'Unknown',
            lastName: 'Patient',
            email: 'unknown@example.com',
            phone: 'N/A'
          }
        };
      });
      
      res.json(patients);
    } else {
      // Use MongoDB
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    const { recent, page = 1, limit = 10 } = req.query;
    
    let query = { preferredPractitioner: practitioner._id };
    let patients;
    
    if (recent === 'true') {
      // Get recent patients (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      patients = await Patient.find({
        ...query,
        createdAt: { $gte: thirtyDaysAgo }
      })
      .populate('userId', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(5);
    } else {
      patients = await Patient.find(query)
        .populate('userId', 'firstName lastName email phone')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
    }

    res.json(patients);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get notifications
router.get('/notifications', async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead, type, priority } = req.query;
    
    if (req.useMockDb) {
      // Use mock database
      let allNotifications = req.mockDb.notifications.filter(n => n.userId === req.user._id);
      
      // Apply filters
      if (isRead !== undefined) {
        allNotifications = allNotifications.filter(n => n.isRead === (isRead === 'true'));
      }
      if (type) {
        allNotifications = allNotifications.filter(n => n.type === type);
      }
      if (priority) {
        allNotifications = allNotifications.filter(n => n.priority === priority);
      }

      const total = allNotifications.length;
      const unreadCount = req.mockDb.notifications.filter(n => 
        n.userId === req.user._id && !n.isRead
      ).length;
      
      // Sort and paginate
      const notifications = allNotifications
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice((page - 1) * limit, page * limit)
        .map(notification => {
          const createdBy = notification.createdBy ? 
            req.mockDb.users.find(u => u._id === notification.createdBy) : null;
          
          return {
            ...notification,
            createdBy: createdBy ? {
              _id: createdBy._id,
              firstName: createdBy.firstName,
              lastName: createdBy.lastName,
              role: createdBy.role
            } : null
          };
        });

    res.json({
        success: true,
        notifications,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        unreadCount
      });
    } else {
      // Use MongoDB
      let query = { userId: req.user._id };
      if (isRead !== undefined) {
        query.isRead = isRead === 'true';
      }
      if (type) {
        query.type = type;
      }
      if (priority) {
        query.priority = priority;
      }

      const notifications = await Notification.find(query)
        .populate('relatedId')
        .populate('createdBy', 'firstName lastName role')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({ 
        userId: req.user._id, 
        isRead: false 
      });

    res.json({
        success: true,
        notifications,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        unreadCount
      });
    }
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get revenue statistics
router.get('/revenue/stats', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      let dateFilter;
      const now = new Date();
      
      switch (timeRange) {
        case '7d':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
        case '30d':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
        case '90d':
          dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      // Get invoices for this practitioner within date range
      const practitionerInvoices = req.mockDb.invoices.filter(invoice => 
        invoice.practitionerId === practitioner._id && 
        new Date(invoice.createdAt) >= dateFilter
      );
      
      const totalRevenue = practitionerInvoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.total || 0), 0);
      const paidRevenue = practitionerInvoices
        .filter(inv => inv.status === 'paid' || inv.paymentStatus === 'paid')
        .reduce((sum, inv) => sum + (inv.totalAmount || inv.total || 0), 0);
      const pendingRevenue = practitionerInvoices
        .filter(inv => inv.status === 'pending' || inv.paymentStatus === 'pending')
        .reduce((sum, inv) => sum + (inv.totalAmount || inv.total || 0), 0);
      
      const totalInvoices = practitionerInvoices.length;
      const paidInvoices = practitionerInvoices.filter(inv => 
        inv.status === 'paid' || inv.paymentStatus === 'paid'
      ).length;
      
      // Calculate monthly growth (mock data)
      const previousMonthRevenue = totalRevenue * 0.85; // 15% growth
      const growthPercentage = totalRevenue > 0 ? ((totalRevenue - previousMonthRevenue) / previousMonthRevenue * 100) : 0;
      
      // Calculate average session value
      const appointments = req.mockDb.appointments.filter(apt => 
        apt.practitionerId === practitioner._id && 
        new Date(apt.appointmentDate) >= dateFilter
      );
      const averageSessionValue = appointments.length > 0 ? totalRevenue / appointments.length : 0;

    res.json({
      success: true,
        totalRevenue,
        paidRevenue,
        pendingRevenue,
        totalInvoices,
        paidInvoices,
        growthPercentage: Math.round(growthPercentage * 100) / 100,
        averageSessionValue: Math.round(averageSessionValue * 100) / 100,
        monthlyBreakdown: [
          { month: 'Jan', revenue: totalRevenue * 0.8 },
          { month: 'Feb', revenue: totalRevenue * 0.9 },
          { month: 'Mar', revenue: totalRevenue * 1.1 },
          { month: 'Apr', revenue: totalRevenue * 0.95 },
          { month: 'May', revenue: totalRevenue * 1.05 },
          { month: 'Jun', revenue: totalRevenue }
        ],
        paymentMethods: {
          upi: Math.round(totalRevenue * 0.4),
          card: Math.round(totalRevenue * 0.35),
          cash: Math.round(totalRevenue * 0.25)
        }
      });
    } else {
      // Use MongoDB
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
      const { timeRange = '30d' } = req.query;
      
      let dateFilter;
      const now = new Date();
      
      switch (timeRange) {
        case '7d':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const [totalRevenue, paidRevenue, pendingRevenue, totalInvoices, paidInvoices] = await Promise.all([
        Invoice.aggregate([{ $match: { practitionerId: practitioner._id, createdAt: { $gte: dateFilter } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
        Invoice.aggregate([{ $match: { practitionerId: practitioner._id, paymentStatus: 'paid', createdAt: { $gte: dateFilter } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
        Invoice.aggregate([{ $match: { practitionerId: practitioner._id, paymentStatus: 'pending', createdAt: { $gte: dateFilter } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
        Invoice.countDocuments({ practitionerId: practitioner._id, createdAt: { $gte: dateFilter } }),
        Invoice.countDocuments({ practitionerId: practitioner._id, paymentStatus: 'paid', createdAt: { $gte: dateFilter } })
      ]);

    res.json({
      success: true,
        totalRevenue: totalRevenue[0]?.total || 0,
        paidRevenue: paidRevenue[0]?.total || 0,
        pendingRevenue: pendingRevenue[0]?.total || 0,
        totalInvoices,
        paidInvoices,
        growthPercentage: 15.5,
        averageSessionValue: totalInvoices > 0 ? (paidRevenue[0]?.total || 0) / totalInvoices : 0
      });
    }
  } catch (error) {
    console.error('Get revenue stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get revenue statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get reviews
router.get('/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 10, stats } = req.query;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      if (stats === 'true') {
        // Return review statistics
        const allReviews = req.mockDb.reviews.filter(r => r.practitionerId === practitioner._id);
        
        const stats = {
          totalReviews: allReviews.length,
          averageRating: allReviews.length > 0 ? 
            (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length) : 0,
          ratingDistribution: {
            5: allReviews.filter(r => r.rating === 5).length,
            4: allReviews.filter(r => r.rating === 4).length,
            3: allReviews.filter(r => r.rating === 3).length,
            2: allReviews.filter(r => r.rating === 2).length,
            1: allReviews.filter(r => r.rating === 1).length
          },
          recentReviews: allReviews
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(review => {
              const patient = req.mockDb.patients.find(p => p._id === review.patientId);
              const patientUser = patient ? req.mockDb.users.find(u => u._id === patient.userId) : null;
              
              return {
                ...review,
                patientId: patient ? {
                  _id: patient._id,
                  userId: patientUser ? {
                    _id: patientUser._id,
                    firstName: patientUser.firstName,
                    lastName: patientUser.lastName
                  } : null
                } : null
              };
            })
        };
        
        res.json(stats);
      } else {
        // Return paginated reviews
        let allReviews = req.mockDb.reviews.filter(r => r.practitionerId === practitioner._id);
        
        const total = allReviews.length;
        
        // Sort and paginate
        const reviews = allReviews
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice((page - 1) * limit, page * limit)
          .map(review => {
            const patient = req.mockDb.patients.find(p => p._id === review.patientId);
            const patientUser = patient ? req.mockDb.users.find(u => u._id === patient.userId) : null;
            const appointment = req.mockDb.appointments.find(apt => apt._id === review.appointmentId);
            
            return {
              ...review,
              patientId: patient ? {
                _id: patient._id,
                userId: patientUser ? {
                  _id: patientUser._id,
                  firstName: patientUser.firstName,
                  lastName: patientUser.lastName
                } : null
              } : null,
              appointmentId: appointment || null
            };
          });
        
        res.json({
          reviews,
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          total
        });
      }
    } else {
      // Use MongoDB
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ practitionerId: practitioner._id })
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('appointmentId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ practitionerId: practitioner._id });

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get medical records
router.get('/medical-records', async (req, res) => {
  try {
    const { page = 1, limit = 10, patientId, type } = req.query;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
    
    if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      let allRecords = req.mockDb.medicalRecords;
      
      // Filter by practitioner's patients
      const practitionerAppointments = req.mockDb.appointments.filter(apt => apt.practitionerId === practitioner._id);
      const patientIds = [...new Set(practitionerAppointments.map(apt => apt.patientId))];
      allRecords = allRecords.filter(record => patientIds.includes(record.patientId));
      
      // Apply filters
      if (patientId) {
        allRecords = allRecords.filter(record => record.patientId === patientId);
      }
      if (type) {
        allRecords = allRecords.filter(record => record.type === type);
      }
      
      const total = allRecords.length;
      
      // Sort and paginate
      const records = allRecords
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice((page - 1) * limit, page * limit)
        .map(record => {
          const patient = req.mockDb.patients.find(p => p._id === record.patientId);
          const patientUser = patient ? req.mockDb.users.find(u => u._id === patient.userId) : null;
          
          return {
            ...record,
            patient: patientUser ? {
              _id: patientUser._id,
              firstName: patientUser.firstName,
              lastName: patientUser.lastName,
              email: patientUser.email
            } : null
          };
        });
      
      res.json({
        records,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      });
    } else {
      // Use MongoDB
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      let query = {};
    if (patientId) query.patientId = patientId;
      if (type) query.type = type;

      const records = await MedicalRecord.find(query)
      .populate({
        path: 'patientId',
          populate: { path: 'userId', select: 'firstName lastName email' }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MedicalRecord.countDocuments(query);

    res.json({
        records,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create medical record
router.post('/medical-records', async (req, res) => {
  try {
    const { patientId, type, diagnosis, treatment, notes, attachments } = req.body;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const newRecord = {
        _id: req.mockDb.generateId(),
        patientId,
        practitionerId: practitioner._id,
        type,
        diagnosis,
        treatment,
        notes,
        attachments: attachments || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      req.mockDb.medicalRecords.push(newRecord);
      req.mockDb.saveData('medicalRecords.json', req.mockDb.medicalRecords);
      
      res.json({
        message: 'Medical record created successfully',
        record: newRecord
      });
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOne({ userId: req.user._id });
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const medicalRecord = new MedicalRecord({
        patientId,
        practitionerId: practitioner._id,
        type,
        diagnosis,
        treatment,
        notes,
        attachments: attachments || []
    });

    await medicalRecord.save();

      res.json({
        message: 'Medical record created successfully',
        record: medicalRecord
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get therapy plans
router.get('/therapy-plans', async (req, res) => {
  try {
    const { page = 1, limit = 10, patientId, status } = req.query;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
    
    if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      let allPlans = req.mockDb.therapyPlans.filter(plan => plan.practitionerId === practitioner._id);
      
      // Apply filters
      if (patientId) {
        allPlans = allPlans.filter(plan => plan.patientId === patientId);
      }
      if (status) {
        allPlans = allPlans.filter(plan => plan.status === status);
      }
      
      const total = allPlans.length;
      
      // Sort and paginate
      const therapyPlans = allPlans
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice((page - 1) * limit, page * limit)
        .map(plan => {
          const patient = req.mockDb.patients.find(p => p._id === plan.patientId);
          const patientUser = patient ? req.mockDb.users.find(u => u._id === patient.userId) : null;
          
          return {
            ...plan,
            patient: patientUser ? {
              _id: patientUser._id,
              firstName: patientUser.firstName,
              lastName: patientUser.lastName,
              email: patientUser.email
            } : null
          };
        });
      
      res.json({
        therapyPlans,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      });
    } else {
      // Use MongoDB
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }

    let query = { practitionerId: practitioner._id };
      if (patientId) query.patientId = patientId;
      if (status) query.status = status;

      const therapyPlans = await TherapyPlan.find(query)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'firstName lastName email' }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

      const total = await TherapyPlan.countDocuments(query);

    res.json({
        therapyPlans,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create therapy plan
router.post('/therapy-plans', async (req, res) => {
  try {
    const { patientId, title, description, duration, sessions, exercises, goals } = req.body;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const newPlan = {
        _id: req.mockDb.generateId(),
        patientId,
        practitionerId: practitioner._id,
        title,
        description,
        duration,
        sessions,
        exercises: exercises || [],
        goals: goals || [],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      req.mockDb.therapyPlans.push(newPlan);
      req.mockDb.saveData('therapyPlans.json', req.mockDb.therapyPlans);
      
      res.json({
        message: 'Therapy plan created successfully',
        plan: newPlan
      });
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOne({ userId: req.user._id });
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const therapyPlan = new TherapyPlan({
        patientId,
        practitionerId: practitioner._id,
        title,
        description,
        duration,
        sessions,
        exercises: exercises || [],
        goals: goals || []
      });
      
      await therapyPlan.save();
      
      res.json({
        message: 'Therapy plan created successfully',
        plan: therapyPlan
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update therapy plan
router.put('/therapy-plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const planIndex = req.mockDb.therapyPlans.findIndex(plan => 
        plan._id === id && plan.practitionerId === practitioner._id
      );
      
      if (planIndex === -1) {
        return res.status(404).json({ message: 'Therapy plan not found' });
      }
      
      req.mockDb.therapyPlans[planIndex] = {
        ...req.mockDb.therapyPlans[planIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      req.mockDb.saveData('therapyPlans.json', req.mockDb.therapyPlans);
      
      res.json({
        message: 'Therapy plan updated successfully',
        plan: req.mockDb.therapyPlans[planIndex]
      });
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOne({ userId: req.user._id });
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const therapyPlan = await TherapyPlan.findOneAndUpdate(
        { _id: id, practitionerId: practitioner._id },
        { $set: updateData },
        { new: true }
      );
      
      if (!therapyPlan) {
        return res.status(404).json({ message: 'Therapy plan not found' });
      }

    res.json({
        message: 'Therapy plan updated successfully',
        plan: therapyPlan
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get sessions
router.get('/sessions', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, date } = req.query;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      let allSessions = req.mockDb.appointments.filter(apt => apt.practitionerId === practitioner._id);
      
      // Apply filters
      if (status) {
        allSessions = allSessions.filter(apt => apt.status === status);
      }
      if (date) {
        const targetDate = new Date(date).toDateString();
        allSessions = allSessions.filter(apt => 
          new Date(apt.appointmentDate).toDateString() === targetDate
        );
      }
      
      const total = allSessions.length;
      
      // Sort and paginate
      const sessions = allSessions
        .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
        .slice((page - 1) * limit, page * limit)
        .map(session => {
          const patient = req.mockDb.patients.find(p => p._id === session.patientId);
          const patientUser = patient ? req.mockDb.users.find(u => u._id === patient.userId) : null;
          
          return {
            ...session,
            patient: patientUser ? {
              _id: patientUser._id,
              firstName: patientUser.firstName,
              lastName: patientUser.lastName,
              email: patientUser.email
            } : null
          };
        });
      
      res.json({
        success: true,
        sessions,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      });
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOne({ userId: req.user._id });
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      let query = { practitionerId: practitioner._id };
      if (status) query.status = status;
      if (date) {
        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
        query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
      }
      
      const sessions = await Appointment.find(query)
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'firstName lastName email' }
        })
        .sort({ appointmentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

      const total = await Appointment.countDocuments(query);

    res.json({
        success: true,
        sessions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete session
router.delete('/sessions/:id', async (req, res) => {
  try {
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const sessionIndex = req.mockDb.appointments.findIndex(apt => 
        apt._id === req.params.id && apt.practitionerId === practitioner._id
      );
      
      if (sessionIndex === -1) {
        return res.status(404).json({ message: 'Session not found' });
      }
      
      req.mockDb.appointments.splice(sessionIndex, 1);
      req.mockDb.saveData('appointments.json', req.mockDb.appointments);
      
      res.json({ message: 'Session deleted successfully' });
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOne({ userId: req.user._id });
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const session = await Appointment.findOneAndDelete({
        _id: req.params.id,
        practitionerId: practitioner._id
      });
      
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      
      res.json({ message: 'Session deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create appointment
router.post('/appointments', async (req, res) => {
  try {
    const { patientId, appointmentDate, time, duration, type, notes } = req.body;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const newAppointment = {
        _id: req.mockDb.generateId(),
        patientId,
          practitionerId: practitioner._id,
        appointmentDate,
        time,
        duration: duration || 60,
        type: type || 'consultation',
        status: 'confirmed',
        notes: notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      req.mockDb.appointments.push(newAppointment);
      req.mockDb.saveData('appointments.json', req.mockDb.appointments);
      
      res.json({
        message: 'Appointment created successfully',
        appointment: newAppointment
      });
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOne({ userId: req.user._id });
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const appointment = new Appointment({
        patientId,
          practitionerId: practitioner._id,
        appointmentDate,
        time,
        duration: duration || 60,
        type: type || 'consultation',
        status: 'confirmed',
        notes: notes || ''
      });
      
      await appointment.save();

    res.json({
        message: 'Appointment created successfully',
        appointment
    });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update appointment
router.put('/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const appointmentIndex = req.mockDb.appointments.findIndex(apt => 
        apt._id === id && apt.practitionerId === practitioner._id
      );
      
      if (appointmentIndex === -1) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      
      req.mockDb.appointments[appointmentIndex] = {
        ...req.mockDb.appointments[appointmentIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      req.mockDb.saveData('appointments.json', req.mockDb.appointments);
      
      res.json({
        message: 'Appointment updated successfully',
        appointment: req.mockDb.appointments[appointmentIndex]
      });
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOne({ userId: req.user._id });
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const appointment = await Appointment.findOneAndUpdate(
        { _id: id, practitionerId: practitioner._id },
        { $set: updateData },
        { new: true }
      );
      
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

    res.json({ 
        message: 'Appointment updated successfully',
        appointment
    });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get conversations
router.get('/conversations', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      // Mock conversations data
      const mockConversations = [
        {
          _id: 'conv1',
          patientId: 'patient1',
          practitionerId: practitioner._id,
          type: 'direct',
          status: 'active',
          lastMessage: 'Thank you for the consultation',
          lastMessageAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'conv2',
          patientId: 'patient2',
          practitionerId: practitioner._id,
          type: 'direct',
          status: 'active',
          lastMessage: 'When is my next appointment?',
          lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      let conversations = mockConversations;
      
      if (status) {
        conversations = conversations.filter(conv => conv.status === status);
      }
      
      const total = conversations.length;
      
      // Sort and paginate
      conversations = conversations
        .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
        .slice((page - 1) * limit, page * limit)
        .map(conversation => {
          const patient = req.mockDb.patients.find(p => p._id === conversation.patientId);
          const patientUser = patient ? req.mockDb.users.find(u => u._id === patient.userId) : null;
          
          return {
            ...conversation,
            patient: patientUser ? {
              _id: patientUser._id,
              firstName: patientUser.firstName,
              lastName: patientUser.lastName,
              email: patientUser.email
            } : null
          };
    });

    res.json({
      success: true,
        conversations,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
        total
      });
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOne({ userId: req.user._id });
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      let query = { practitionerId: practitioner._id };
      if (status) query.status = status;
      
      const conversations = await Conversation.find(query)
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'firstName lastName email' }
        })
        .sort({ lastMessageAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      
      const total = await Conversation.countDocuments(query);

    res.json({ 
      success: true,
        conversations,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
    });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get conversation messages
router.get('/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      // Mock messages data
      const mockMessages = [
        {
          _id: 'msg1',
          conversationId: id,
          senderId: req.user._id,
          senderType: 'practitioner',
          content: 'Hello! How are you feeling today?',
          type: 'text',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'msg2',
          conversationId: id,
          senderId: 'patient1',
          senderType: 'patient',
          content: 'I am feeling much better, thank you!',
          type: 'text',
          createdAt: new Date(Date.now() - 1800000).toISOString()
        }
      ];
      
      const messages = mockMessages
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .slice((page - 1) * limit, page * limit);

    res.json({ 
      success: true,
        messages,
        totalPages: Math.ceil(mockMessages.length / limit),
        currentPage: parseInt(page),
        total: mockMessages.length
      });
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOne({ userId: req.user._id });
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const conversation = await Conversation.findOne({
        _id: id,
        practitionerId: practitioner._id
      });
      
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      
      const messages = await Message.find({ conversationId: id })
        .sort({ createdAt: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      
      const total = await Message.countDocuments({ conversationId: id });

    res.json({ 
      success: true,
        messages,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
    });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send message
router.post('/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, type = 'text' } = req.body;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const newMessage = {
        _id: req.mockDb.generateId(),
        conversationId: id,
        senderId: req.user._id,
        senderType: 'practitioner',
        content,
        type,
        createdAt: new Date().toISOString()
      };

    res.json({ 
      success: true,
        message: newMessage
      });
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOne({ userId: req.user._id });
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const conversation = await Conversation.findOne({
        _id: id,
        practitionerId: practitioner._id
      });
      
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      
      const message = new Message({
        conversationId: id,
        senderId: req.user._id,
        senderType: 'practitioner',
        content,
        type
      });
      
      await message.save();
      
      // Update conversation last message
      conversation.lastMessage = content;
      conversation.lastMessageAt = new Date();
      await conversation.save();

    res.json({ 
      success: true,
        message
    });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create conversation
router.post('/conversations', async (req, res) => {
  try {
    const { patientId, type = 'direct' } = req.body;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const newConversation = {
        _id: req.mockDb.generateId(),
        patientId,
        practitionerId: practitioner._id,
        type,
        status: 'active',
        lastMessage: '',
        lastMessageAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      res.json({
        success: true,
        conversation: newConversation
      });
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOne({ userId: req.user._id });
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const conversation = new Conversation({
        patientId,
        practitionerId: practitioner._id,
        type,
        status: 'active'
      });
      
      await conversation.save();

    res.json({ 
      success: true,
        conversation
    });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get availability
router.get('/availability', async (req, res) => {
  try {
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const availability = {
        _id: practitioner._id,
        schedule: {
          monday: { start: '09:00', end: '17:00', available: true },
          tuesday: { start: '09:00', end: '17:00', available: true },
          wednesday: { start: '09:00', end: '17:00', available: true },
          thursday: { start: '09:00', end: '17:00', available: true },
          friday: { start: '09:00', end: '17:00', available: true },
          saturday: { start: '10:00', end: '14:00', available: true },
          sunday: { start: '00:00', end: '00:00', available: false }
        },
        timezone: 'Asia/Kolkata',
        breakTime: 30,
        sessionDuration: 60,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      res.json(availability);
    } else {
      // Use MongoDB
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    
    if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      res.json(practitioner.availability || {});
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update availability
router.put('/availability', async (req, res) => {
  try {
    const { schedule, timezone } = req.body;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
    
    if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      practitioner.availability = {
        schedule,
        timezone,
        updatedAt: new Date().toISOString()
      };
      
      req.mockDb.saveData('practitioners.json', req.mockDb.practitioners);

    res.json({
      message: 'Availability updated successfully',
        availability: practitioner.availability
      });
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOneAndUpdate(
        { userId: req.user._id },
        { $set: { availability: { schedule, timezone } } },
        { new: true }
      );
    
    if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
    }

    res.json({
        message: 'Availability updated successfully',
        availability: practitioner.availability
    });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get time slots
router.get('/time-slots', async (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
    
    if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
    }

      // Generate mock time slots
      const timeSlots = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'lowercase' });
        const availability = practitioner.availability?.schedule?.[dayOfWeek];
        
        if (availability?.available) {
          const startTime = new Date(d);
          startTime.setHours(parseInt(availability.start.split(':')[0]), parseInt(availability.start.split(':')[1]));
          
          const endTime = new Date(d);
          endTime.setHours(parseInt(availability.end.split(':')[0]), parseInt(availability.end.split(':')[1]));
          
          for (let time = new Date(startTime); time < endTime; time.setMinutes(time.getMinutes() + 60)) {
          timeSlots.push({
              _id: req.mockDb.generateId(),
              date: d.toISOString().split('T')[0],
              time: time.toTimeString().split(' ')[0].substring(0, 5),
              available: true,
              practitionerId: practitioner._id
        });
      }
    }
      }
      
      res.json(timeSlots);
    } else {
      // Use MongoDB
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    
    if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      // Generate time slots based on availability
      const timeSlots = [];
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'lowercase' });
        const availability = practitioner.availability?.schedule?.[dayOfWeek];
        
        if (availability?.available) {
          const startTime = new Date(d);
          startTime.setHours(parseInt(availability.start.split(':')[0]), parseInt(availability.start.split(':')[1]));
          
          const endTime = new Date(d);
          endTime.setHours(parseInt(availability.end.split(':')[0]), parseInt(availability.end.split(':')[1]));
          
          for (let time = new Date(startTime); time < endTime; time.setMinutes(time.getMinutes() + 60)) {
            timeSlots.push({
              date: d.toISOString().split('T')[0],
              time: time.toTimeString().split(' ')[0].substring(0, 5),
              available: true
            });
          }
        }
      }
      
      res.json(timeSlots);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get analytics
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      let dateFilter;
      const now = new Date();
      
      switch (period) {
        case '7d':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      // Get appointments for this practitioner within date range
      const appointments = req.mockDb.appointments.filter(apt => 
        apt.practitionerId === practitioner._id && 
        new Date(apt.createdAt) >= dateFilter
      );
      
      // Get invoices for this practitioner within date range
      const invoices = req.mockDb.invoices.filter(inv => 
        inv.practitionerId === practitioner._id && 
        new Date(inv.createdAt) >= dateFilter
      );
      
      // Get reviews for this practitioner
      const reviews = req.mockDb.reviews.filter(r => r.practitionerId === practitioner._id);
      
      // Calculate appointment analytics
      const appointmentStats = appointments.reduce((acc, apt) => {
        const date = new Date(apt.createdAt).toISOString().split('T')[0];
        const key = `${date}_${apt.status}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      
      // Calculate revenue analytics
      const paidInvoices = invoices.filter(inv => inv.status === 'paid' || inv.paymentStatus === 'paid');
      const revenueStats = paidInvoices.reduce((acc, inv) => {
        const date = new Date(inv.createdAt).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + (inv.totalAmount || inv.total || 0);
        return acc;
      }, {});
      
      // Calculate patient analytics
      const patientIds = [...new Set(appointments.map(apt => apt.patientId))];
      const newPatients = patientIds.filter(patientId => {
        const patient = req.mockDb.patients.find(p => p._id === patientId);
        return patient && new Date(patient.createdAt) >= dateFilter;
      }).length;
      
      // Calculate review analytics
      const avgRating = reviews.length > 0 ? 
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    res.json({
      success: true,
        period,
        appointmentStats: Object.entries(appointmentStats).map(([key, count]) => {
          const [date, status] = key.split('_');
          return { date, status, count };
        }),
        revenueStats: Object.entries(revenueStats).map(([date, revenue]) => ({
          date, revenue
        })),
        patientStats: {
          totalPatients: patientIds.length,
          newPatients,
          returningPatients: patientIds.length - newPatients
        },
        reviewStats: {
          totalReviews: reviews.length,
          averageRating: Math.round(avgRating * 100) / 100,
          ratingDistribution: {
            5: reviews.filter(r => r.rating === 5).length,
            4: reviews.filter(r => r.rating === 4).length,
            3: reviews.filter(r => r.rating === 3).length,
            2: reviews.filter(r => r.rating === 2).length,
            1: reviews.filter(r => r.rating === 1).length
          }
        },
        performanceMetrics: {
          completionRate: appointments.length > 0 ? 
            (appointments.filter(apt => apt.status === 'completed').length / appointments.length * 100) : 0,
          averageSessionDuration: 60, // Mock data
          patientSatisfaction: Math.round(avgRating * 20), // Convert to percentage
          revenueGrowth: 15.5 // Mock data
        }
      });
    } else {
      // Use MongoDB
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
      const { period = '30d' } = req.query;
    
    let dateFilter;
    const now = new Date();
    
      switch (period) {
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

      // Appointment analytics
      const appointmentStats = await Appointment.aggregate([
        {
          $match: {
            practitionerId: practitioner._id,
            createdAt: { $gte: dateFilter }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              status: '$status'
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]);

      // Revenue analytics
      const revenueStats = await Invoice.aggregate([
      {
        $match: {
          practitionerId: practitioner._id,
          paymentStatus: 'paid',
          createdAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

      // Patient demographics
      const patientDemographics = await Patient.aggregate([
        {
          $match: {
            preferredPractitioner: practitioner._id,
            createdAt: { $gte: dateFilter }
          }
        },
        {
          $group: {
            _id: '$gender',
            count: { $sum: 1 }
          }
        }
    ]);

    res.json({
      success: true,
        period,
        appointmentStats,
        revenueStats,
        patientDemographics
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get reports
router.get('/reports', async (req, res) => {
  try {
    const { type, period = '30d', page = 1, limit = 10 } = req.query;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      // Mock reports data
      const mockReports = [
        {
          _id: 'report1',
          type: 'appointments',
          title: 'Monthly Appointment Report',
          period: '30d',
          status: 'completed',
          generatedAt: new Date().toISOString(),
          data: {
            totalAppointments: 45,
            completedAppointments: 42,
            cancelledAppointments: 3,
            totalRevenue: 45000
          }
        },
        {
          _id: 'report2',
          type: 'revenue',
          title: 'Revenue Analysis Report',
          period: '30d',
          status: 'completed',
          generatedAt: new Date(Date.now() - 86400000).toISOString(),
          data: {
            totalRevenue: 45000,
            paidRevenue: 42000,
            pendingRevenue: 3000,
            averageSessionValue: 1000
          }
        }
      ];
      
      let reports = mockReports;
      
      if (type) {
        reports = reports.filter(report => report.type === type);
      }
      
      const total = reports.length;
      
      // Sort and paginate
      reports = reports
        .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt))
        .slice((page - 1) * limit, page * limit);
      
      res.json({
        success: true,
        reports,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      });
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOne({ userId: req.user._id });
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      let query = { practitionerId: practitioner._id };
      if (type) query.type = type;
      
      const reports = await Report.find(query)
        .sort({ generatedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      
      const total = await Report.countDocuments(query);
      
      res.json({
        success: true,
        reports,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate report
router.post('/reports/generate', async (req, res) => {
  try {
    const { type, period } = req.body;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const newReport = {
        _id: req.mockDb.generateId(),
        practitionerId: practitioner._id,
        type,
        period,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${period}`,
        status: 'generating',
        generatedAt: new Date().toISOString(),
        data: {}
      };
      
      // Simulate report generation
      setTimeout(() => {
        newReport.status = 'completed';
        newReport.data = {
          totalAppointments: 45,
          completedAppointments: 42,
          totalRevenue: 45000
        };
      }, 2000);
      
      res.json({
        success: true,
        message: 'Report generation started',
        report: newReport
      });
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOne({ userId: req.user._id });
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const report = new Report({
        practitionerId: practitioner._id,
        type,
        period,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${period}`,
        status: 'generating'
      });
      
      await report.save();
      
      res.json({
        success: true,
        message: 'Report generation started',
        report
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Export report
router.get('/reports/export', async (req, res) => {
  try {
    const { format, type, period } = req.query;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      // Mock export data
      const exportData = {
        type,
        period,
        generatedAt: new Date().toISOString(),
        data: {
          totalAppointments: 45,
          completedAppointments: 42,
          totalRevenue: 45000
        }
      };
      
      if (format === 'csv') {
        const csv = `Type,Period,Total Appointments,Completed Appointments,Total Revenue\n${type},${period},${exportData.data.totalAppointments},${exportData.data.completedAppointments},${exportData.data.totalRevenue}`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${type}-report-${period}.csv"`);
        res.send(csv);
      } else if (format === 'pdf') {
        // Mock PDF response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${type}-report-${period}.pdf"`);
        res.json({ message: 'PDF export not implemented in mock mode' });
      } else {
        res.json(exportData);
      }
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOne({ userId: req.user._id });
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      // Generate export based on type and period
      const exportData = await generateReportData(practitioner._id, type, period);
      
      if (format === 'csv') {
        const csv = convertToCSV(exportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${type}-report-${period}.csv"`);
        res.send(csv);
      } else if (format === 'pdf') {
        const pdf = await generatePDF(exportData);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${type}-report-${period}.pdf"`);
        res.send(pdf);
      } else {
        res.json(exportData);
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get revenue transactions
router.get('/revenue/transactions', async (req, res) => {
  try {
    const { timeRange = '30d', status, page = 1, limit = 10 } = req.query;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      let dateFilter;
      const now = new Date();
      
      switch (timeRange) {
        case '7d':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      // Get invoices for this practitioner within date range
      let transactions = req.mockDb.invoices.filter(invoice => 
        invoice.practitionerId === practitioner._id && 
        new Date(invoice.createdAt) >= dateFilter
      );
      
      // Apply status filter
      if (status && status !== 'all') {
        transactions = transactions.filter(inv => 
          inv.status === status || inv.paymentStatus === status
        );
      }
      
      const total = transactions.length;
      
      // Sort and paginate
      transactions = transactions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice((page - 1) * limit, page * limit)
        .map(transaction => {
          const patient = req.mockDb.patients.find(p => p._id === transaction.patientId);
          const patientUser = patient ? req.mockDb.users.find(u => u._id === patient.userId) : null;
          const appointment = req.mockDb.appointments.find(apt => apt._id === transaction.appointmentId);
          
          return {
            ...transaction,
            patientId: patient ? {
              _id: patient._id,
              userId: patientUser ? {
                _id: patientUser._id,
                firstName: patientUser.firstName,
                lastName: patientUser.lastName,
                email: patientUser.email
              } : null
            } : null,
            appointmentId: appointment || null
          };
        });
      
      res.json({
        success: true,
        transactions,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      });
    } else {
      // Use MongoDB
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    const { timeRange = '30d', status, page = 1, limit = 10 } = req.query;
    
    let dateFilter;
    const now = new Date();
    
    switch (timeRange) {
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    let query = {
      practitionerId: practitioner._id,
      createdAt: { $gte: dateFilter }
    };
    
    if (status && status !== 'all') {
      query.paymentStatus = status;
    }

    const transactions = await Invoice.find(query)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'firstName lastName email' }
      })
      .populate('appointmentId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Invoice.countDocuments(query);

    res.json({
      success: true,
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
    }
  } catch (error) {
    console.error('Get revenue transactions error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get revenue transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get individual patient details
router.get('/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const patient = req.mockDb.patients.find(p => p._id === id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const user = req.mockDb.users.find(u => u._id === patient.userId);
      
      // Get patient's appointments with this practitioner
      const appointments = req.mockDb.appointments.filter(apt => 
        apt.patientId === id && apt.practitionerId === practitioner._id
      );
      
      // Get patient's medical records
      const medicalRecords = req.mockDb.medicalRecords.filter(record => 
        record.patientId === id && record.practitionerId === practitioner._id
      );
      
      // Get patient's therapy plans
      const therapyPlans = req.mockDb.therapyPlans.filter(plan => 
        plan.patientId === id && plan.practitionerId === practitioner._id
      );
      
      const patientDetails = {
        ...patient,
        user: user ? {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender
        } : null,
        appointments: appointments.map(apt => ({
          ...apt,
          practitioner: {
            _id: practitioner._id,
            firstName: 'Dr. Rajesh',
            lastName: 'Sharma'
          }
        })),
        medicalRecords: medicalRecords.map(record => ({
          ...record,
          practitioner: {
            _id: practitioner._id,
            firstName: 'Dr. Rajesh',
            lastName: 'Sharma'
          }
        })),
        therapyPlans: therapyPlans.map(plan => ({
          ...plan,
          practitioner: {
            _id: practitioner._id,
            firstName: 'Dr. Rajesh',
            lastName: 'Sharma'
          }
        })),
        stats: {
          totalAppointments: appointments.length,
          completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
          totalSessions: appointments.length,
          lastVisit: appointments.length > 0 ? 
            appointments.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))[0].appointmentDate : null,
          nextAppointment: appointments.filter(apt => apt.status === 'confirmed').length > 0 ?
            appointments.filter(apt => apt.status === 'confirmed')
              .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0].appointmentDate : null
        }
      };
      
      res.json(patientDetails);
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOne({ userId: req.user._id });
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const patient = await Patient.findById(id)
        .populate('userId', 'firstName lastName email phone dateOfBirth gender');
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      // Get patient's appointments with this practitioner
      const appointments = await Appointment.find({
        patientId: id,
        practitionerId: practitioner._id
      }).populate('practitionerId', 'firstName lastName');
      
      // Get patient's medical records
      const medicalRecords = await MedicalRecord.find({
        patientId: id,
        practitionerId: practitioner._id
      }).populate('practitionerId', 'firstName lastName');
      
      // Get patient's therapy plans
      const therapyPlans = await TherapyPlan.find({
        patientId: id,
        practitionerId: practitioner._id
      }).populate('practitionerId', 'firstName lastName');
      
      const patientDetails = {
        ...patient.toObject(),
        appointments,
        medicalRecords,
        therapyPlans,
        stats: {
          totalAppointments: appointments.length,
          completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
          totalSessions: appointments.length,
          lastVisit: appointments.length > 0 ? 
            appointments.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))[0].appointmentDate : null,
          nextAppointment: appointments.filter(apt => apt.status === 'confirmed').length > 0 ?
            appointments.filter(apt => apt.status === 'confirmed')
              .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0].appointmentDate : null
        }
      };
      
      res.json(patientDetails);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get patient stats
router.get('/patients/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const appointments = req.mockDb.appointments.filter(apt => 
        apt.patientId === id && apt.practitionerId === practitioner._id
      );
      
      const medicalRecords = req.mockDb.medicalRecords.filter(record => 
        record.patientId === id && record.practitionerId === practitioner._id
      );
      
      const therapyPlans = req.mockDb.therapyPlans.filter(plan => 
        plan.patientId === id && plan.practitionerId === practitioner._id
      );
      
      const stats = {
        totalAppointments: appointments.length,
        completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
        cancelledAppointments: appointments.filter(apt => apt.status === 'cancelled').length,
        totalSessions: appointments.length,
        totalMedicalRecords: medicalRecords.length,
        activeTherapyPlans: therapyPlans.filter(plan => plan.status === 'active').length,
        completedTherapyPlans: therapyPlans.filter(plan => plan.status === 'completed').length,
        lastVisit: appointments.length > 0 ? 
          appointments.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))[0].appointmentDate : null,
        nextAppointment: appointments.filter(apt => apt.status === 'confirmed').length > 0 ?
          appointments.filter(apt => apt.status === 'confirmed')
            .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0].appointmentDate : null,
        averageSessionDuration: 60, // Mock data
        patientSatisfaction: 4.5, // Mock data
        treatmentProgress: 75 // Mock data
      };
      
      res.json(stats);
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOne({ userId: req.user._id });
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const [appointments, medicalRecords, therapyPlans] = await Promise.all([
        Appointment.find({ patientId: id, practitionerId: practitioner._id }),
        MedicalRecord.find({ patientId: id, practitionerId: practitioner._id }),
        TherapyPlan.find({ patientId: id, practitionerId: practitioner._id })
      ]);
      
      const stats = {
        totalAppointments: appointments.length,
        completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
        cancelledAppointments: appointments.filter(apt => apt.status === 'cancelled').length,
        totalSessions: appointments.length,
        totalMedicalRecords: medicalRecords.length,
        activeTherapyPlans: therapyPlans.filter(plan => plan.status === 'active').length,
        completedTherapyPlans: therapyPlans.filter(plan => plan.status === 'completed').length,
        lastVisit: appointments.length > 0 ? 
          appointments.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))[0].appointmentDate : null,
        nextAppointment: appointments.filter(apt => apt.status === 'confirmed').length > 0 ?
          appointments.filter(apt => apt.status === 'confirmed')
            .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0].appointmentDate : null,
        averageSessionDuration: 60,
        patientSatisfaction: 4.5,
        treatmentProgress: 75
      };
      
      res.json(stats);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Emergency mode
router.post('/emergency-mode', async (req, res) => {
  try {
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      // Mock emergency mode activation
    res.json({
      success: true,
        message: 'Emergency mode activated successfully',
        emergencyMode: true,
        activatedAt: new Date().toISOString()
      });
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOne({ userId: req.user._id });
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      practitioner.emergencyMode = true;
      practitioner.emergencyModeActivatedAt = new Date();
      await practitioner.save();
      
      res.json({
        success: true,
        message: 'Emergency mode activated successfully',
        emergencyMode: true,
        activatedAt: practitioner.emergencyModeActivatedAt
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reply to review
router.post('/reviews/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const reviewIndex = req.mockDb.reviews.findIndex(r => 
        r._id === id && r.practitionerId === practitioner._id
      );
      
      if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found' });
    }

      req.mockDb.reviews[reviewIndex].practitionerReply = {
        reply,
        repliedAt: new Date().toISOString(),
      repliedBy: req.user._id
    };

      req.mockDb.saveData('reviews.json', req.mockDb.reviews);
      
      res.json({
        success: true,
        message: 'Reply added successfully',
        review: req.mockDb.reviews[reviewIndex]
      });
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOne({ userId: req.user._id });
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const review = await Review.findOneAndUpdate(
        { _id: id, practitionerId: practitioner._id },
        { 
          $set: { 
            'practitionerReply.reply': reply,
            'practitionerReply.repliedAt': new Date(),
            'practitionerReply.repliedBy': req.user._id
          }
        },
        { new: true }
      );
      
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

    res.json({
      success: true,
        message: 'Reply added successfully',
      review
    });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get notification settings
router.get('/notification-settings', async (req, res) => {
  try {
    if (req.useMockDb) {
      // Use mock database
      const user = req.mockDb.users.find(u => u._id === req.user._id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const settings = {
        email: true,
        push: true,
        sms: false,
        types: {
          appointments: true,
          messages: true,
          reviews: true,
          billing: true,
          system: true,
          marketing: false
        }
      };
      
      res.json(settings);
    } else {
      // Use MongoDB
      const user = await User.findById(req.user._id).select('notificationPreferences');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user.notificationPreferences || {
        email: true,
        push: true,
        sms: false,
        types: {
          appointments: true,
          messages: true,
          reviews: true,
          billing: true,
          system: true,
          marketing: false
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update notification settings
router.put('/notification-settings', async (req, res) => {
  try {
    const { email, push, sms, types } = req.body;
    
    if (req.useMockDb) {
      // Use mock database
      const userIndex = req.mockDb.users.findIndex(u => u._id === req.user._id);
      
      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      req.mockDb.users[userIndex].notificationPreferences = {
        email,
        push,
        sms,
        types
      };
      
      req.mockDb.saveData('users.json', req.mockDb.users);
      
      res.json({
        success: true,
        message: 'Notification settings updated successfully',
        settings: req.mockDb.users[userIndex].notificationPreferences
      });
    } else {
      // Use MongoDB
      const user = await User.findById(req.user._id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      user.notificationPreferences = {
        email,
        push,
        sms,
        types
      };
      
      await user.save();

    res.json({
      success: true,
        message: 'Notification settings updated successfully',
        settings: user.notificationPreferences
    });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete notification
router.delete('/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioner = req.mockDb.practitioners.find(p => p.userId === req.user._id);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const notificationIndex = req.mockDb.notifications.findIndex(n => 
        n._id === id && n.userId === req.user._id
      );
      
      if (notificationIndex === -1) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      req.mockDb.notifications.splice(notificationIndex, 1);
      req.mockDb.saveData('notifications.json', req.mockDb.notifications);
      
      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } else {
      // Use MongoDB
      const practitioner = await Practitioner.findOne({ userId: req.user._id });
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const notification = await Notification.findOneAndDelete({
        _id: id,
        userId: req.user._id
      });
      
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({
      success: true,
        message: 'Notification deleted successfully'
    });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;