import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateCommonParams } from '../middleware/validation.js';
import User from '../models/User.js';
import Practitioner from '../models/Practitioner.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import TherapyPlan from '../models/TherapyPlan.js';
import Invoice from '../models/Invoice.js';
import MedicalRecord from '../models/MedicalRecord.js';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorize('admin'));

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const [totalPractitioners, pendingVerifications, approvedPractitioners, totalPatients, totalAppointments, completedAppointments, totalTherapyPlans, activeTherapyPlans, totalInvoices, paidInvoices, pendingInvoices, totalRevenue] = await Promise.all([
      Practitioner.countDocuments(),
      Practitioner.countDocuments({ verificationStatus: 'pending' }),
      Practitioner.countDocuments({ verificationStatus: 'approved' }),
      Patient.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'completed' }),
      TherapyPlan.countDocuments(),
      TherapyPlan.countDocuments({ status: 'active' }),
      Invoice.countDocuments(),
      Invoice.countDocuments({ paymentStatus: 'paid' }),
      Invoice.countDocuments({ paymentStatus: 'pending' }),
      Invoice.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    // Get recent activity
    const recentAppointments = await Appointment.find()
      .populate('patientId', 'userId')
      .populate('practitionerId', 'userId')
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .populate({
        path: 'practitionerId',
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .sort({ createdAt: -1 })
      .limit(5);

    const recentRegistrations = await User.find()
      .select('firstName lastName email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly statistics
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyStats = await Promise.all([
      Appointment.countDocuments({ createdAt: { $gte: currentMonth } }),
      Patient.countDocuments({ createdAt: { $gte: currentMonth } }),
      Practitioner.countDocuments({ createdAt: { $gte: currentMonth } })
    ]);

    res.json({
      overview: {
        totalPractitioners,
        pendingVerifications,
        approvedPractitioners,
        totalPatients,
        totalAppointments,
        completedAppointments,
        totalTherapyPlans,
        activeTherapyPlans,
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      monthlyStats: {
        newAppointments: monthlyStats[0],
        newPatients: monthlyStats[1],
        newPractitioners: monthlyStats[2]
      },
      recentActivity: {
        appointments: recentAppointments,
        registrations: recentRegistrations
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all practitioners pending verification
router.get('/practitioners/pending', async (req, res) => {
  try {
    const practitioners = await Practitioner.find({ verificationStatus: 'pending' })
      .populate('userId', 'firstName lastName email phone createdAt')
      .sort({ createdAt: -1 });

    res.json(practitioners);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get practitioner details for verification
router.get('/practitioners/:id', async (req, res) => {
  try {
    const practitioner = await Practitioner.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone createdAt');

    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner not found' });
    }

    res.json(practitioner);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify practitioner
router.post('/practitioners/:id/verify', async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const practitioner = await Practitioner.findById(req.params.id)
      .populate('userId', 'firstName lastName email');

    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner not found' });
    }

    practitioner.verificationStatus = status;
    practitioner.verificationNotes = notes;
    practitioner.verifiedBy = req.user._id;
    practitioner.verifiedAt = new Date();

    await practitioner.save();

    // Create notification for practitioner
    const notification = new Notification({
      userId: practitioner.userId._id,
      title: `Verification ${status}`,
      message: status === 'approved' 
        ? 'Congratulations! Your practitioner profile has been approved.'
        : `Your practitioner profile verification was rejected. Reason: ${notes}`,
      type: 'verification',
      priority: 'high'
    });

    await notification.save();

    // Send real-time notification
    req.io.to(practitioner.userId._id.toString()).emit('notification', notification);

    res.json({ 
      message: `Practitioner ${status} successfully`,
      practitioner 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all practitioners
router.get('/practitioners', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { verificationStatus: status } : {};
    
    const practitioners = await Practitioner.find(query)
      .populate('userId', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Practitioner.countDocuments(query);

    res.json({
      practitioners,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all patients
router.get('/patients', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const patients = await Patient.find()
      .populate('userId', 'firstName lastName email phone createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Patient.countDocuments();

    res.json({
      patients,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all appointments
router.get('/appointments', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};
    
    const appointments = await Appointment.find(query)
      .populate('patientId', 'userId')
      .populate('practitionerId', 'userId')
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .populate({
        path: 'practitionerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .sort({ appointmentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Deactivate user
router.post('/users/:id/deactivate', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Activate user
router.post('/users/:id/activate', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = true;
    await user.save();

    res.json({ message: 'User activated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users with filtering
router.get('/users', validateCommonParams, async (req, res) => {
  try {
    const { role, status, page = 1, limit = 10, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get system analytics
router.get('/analytics', async (req, res) => {
  try {
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

    // User growth analytics
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: dateFilter } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Appointment analytics
    const appointmentAnalytics = await Appointment.aggregate([
      { $match: { createdAt: { $gte: dateFilter } } },
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
    const revenueAnalytics = await Invoice.aggregate([
      { 
        $match: { 
          createdAt: { $gte: dateFilter },
          paymentStatus: 'paid'
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

    // Top performing practitioners
    const topPractitioners = await Appointment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: dateFilter } } },
      { $group: { _id: '$practitionerId', appointmentCount: { $sum: 1 } } },
      { $sort: { appointmentCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'practitioners',
          localField: '_id',
          foreignField: '_id',
          as: 'practitioner'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'practitioner.userId',
          foreignField: '_id',
          as: 'user'
        }
      }
    ]);

    res.json({
      userGrowth,
      appointmentAnalytics,
      revenueAnalytics,
      topPractitioners
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get system reports
router.get('/reports', async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    let report = {};

    switch (type) {
      case 'practitioners':
        report = await Practitioner.aggregate([
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $lookup: {
              from: 'appointments',
              localField: '_id',
              foreignField: 'practitionerId',
              as: 'appointments'
            }
          },
          {
            $project: {
              name: { $concat: [{ $arrayElemAt: ['$user.firstName', 0] }, ' ', { $arrayElemAt: ['$user.lastName', 0] }] },
              email: { $arrayElemAt: ['$user.email', 0] },
              specializations: 1,
              verificationStatus: 1,
              rating: 1,
              totalReviews: 1,
              totalAppointments: { $size: '$appointments' },
              completedAppointments: {
                $size: {
                  $filter: {
                    input: '$appointments',
                    cond: { $eq: ['$$this.status', 'completed'] }
                  }
                }
              }
            }
          }
        ]);
        break;

      case 'revenue':
        report = await Invoice.aggregate([
          { $match: { paymentStatus: 'paid', ...(Object.keys(dateFilter).length && { createdAt: dateFilter }) } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              totalRevenue: { $sum: '$totalAmount' },
              totalInvoices: { $sum: 1 },
              averageInvoice: { $avg: '$totalAmount' }
            }
          },
          { $sort: { '_id': 1 } }
        ]);
        break;

      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    res.json({ report, type, dateRange: { startDate, endDate } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send system notification to all users
router.post('/notifications/broadcast', async (req, res) => {
  try {
    const { title, message, type = 'system', priority = 'medium', targetRole } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    // Get target users
    const userQuery = targetRole ? { role: targetRole } : {};
    const users = await User.find(userQuery).select('_id');

    // Create notifications for all users
    const notifications = users.map(user => ({
      userId: user._id,
      title,
      message,
      type,
      priority,
      createdBy: req.user._id
    }));

    await Notification.insertMany(notifications);

    // Send real-time notifications
    users.forEach(user => {
      req.io.to(user._id.toString()).emit('notification', {
        title,
        message,
        type,
        priority
      });
    });

    res.json({ 
      message: 'Broadcast notification sent successfully',
      recipientCount: users.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
