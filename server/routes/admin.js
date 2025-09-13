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
    let totalPractitioners, pendingVerifications, approvedPractitioners, totalPatients, totalAppointments, completedAppointments, totalTherapyPlans, activeTherapyPlans, totalInvoices, paidInvoices, pendingInvoices, totalRevenue;
    
    if (req.useMockDb) {
      // Use mock database
      const practitioners = await req.mockDb.findAll('practitioners');
      const patients = await req.mockDb.findAll('patients');
      const appointments = await req.mockDb.findAll('appointments');
      const therapyPlans = await req.mockDb.findAll('therapyPlans');
      const invoices = await req.mockDb.findAll('invoices');
      
      totalPractitioners = practitioners.length;
      pendingVerifications = practitioners.filter(p => p.verificationStatus === 'pending').length;
      approvedPractitioners = practitioners.filter(p => p.verificationStatus === 'approved').length;
      totalPatients = patients.length;
      totalAppointments = appointments.length;
      completedAppointments = appointments.filter(a => a.status === 'completed').length;
      totalTherapyPlans = therapyPlans.length;
      activeTherapyPlans = therapyPlans.filter(tp => tp.status === 'active').length;
      totalInvoices = invoices.length;
      paidInvoices = invoices.filter(i => i.paymentStatus === 'paid').length;
      pendingInvoices = invoices.filter(i => i.paymentStatus === 'pending').length;
      totalRevenue = invoices.filter(i => i.paymentStatus === 'paid').reduce((sum, i) => sum + (i.totalAmount || 0), 0);
    } else {
      // Use MongoDB
      [totalPractitioners, pendingVerifications, approvedPractitioners, totalPatients, totalAppointments, completedAppointments, totalTherapyPlans, activeTherapyPlans, totalInvoices, paidInvoices, pendingInvoices, totalRevenue] = await Promise.all([
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
      totalRevenue = totalRevenue[0]?.total || 0;
    }

    // Get recent activity
    let recentAppointments, recentRegistrations, monthlyStats;
    
    if (req.useMockDb) {
      const appointments = await req.mockDb.findAll('appointments');
      const users = await req.mockDb.findAll('users');
      const patients = await req.mockDb.findAll('patients');
      const practitioners = await req.mockDb.findAll('practitioners');
      
      recentAppointments = appointments.slice(0, 5).map(apt => ({
        ...apt,
        patientId: { userId: { firstName: 'Mock', lastName: 'Patient' } },
        practitionerId: { userId: { firstName: 'Mock', lastName: 'Practitioner' } }
      }));
      
      recentRegistrations = users.slice(0, 5).map(user => ({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt || new Date()
      }));
      
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      
      monthlyStats = [
        appointments.filter(a => new Date(a.createdAt || Date.now()) >= currentMonth).length,
        patients.filter(p => new Date(p.createdAt || Date.now()) >= currentMonth).length,
        practitioners.filter(p => new Date(p.createdAt || Date.now()) >= currentMonth).length
      ];
    } else {
      recentAppointments = await Appointment.find()
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

      recentRegistrations = await User.find()
        .select('firstName lastName email role createdAt')
        .sort({ createdAt: -1 })
        .limit(5);

      // Monthly statistics
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      monthlyStats = await Promise.all([
        Appointment.countDocuments({ createdAt: { $gte: currentMonth } }),
        Patient.countDocuments({ createdAt: { $gte: currentMonth } }),
        Practitioner.countDocuments({ createdAt: { $gte: currentMonth } })
      ]);
    }

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
        totalRevenue: totalRevenue
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

// Get all notifications
router.get('/notifications', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, priority } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const notifications = await Notification.find(query)
      .populate('userId', 'firstName lastName email role')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete notification
router.delete('/notifications/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update practitioner profile
router.put('/practitioners/:id', async (req, res) => {
  try {
    const { 
      specializations, 
      consultationFee, 
      experience, 
      bio, 
      education, 
      certifications,
      availability 
    } = req.body;

    const practitioner = await Practitioner.findById(req.params.id);
    
    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner not found' });
    }

    // Update fields if provided
    if (specializations) practitioner.specializations = specializations;
    if (consultationFee) practitioner.consultationFee = consultationFee;
    if (experience !== undefined) practitioner.experience = experience;
    if (bio) practitioner.bio = bio;
    if (education) practitioner.education = education;
    if (certifications) practitioner.certifications = certifications;
    if (availability) practitioner.availability = availability;

    await practitioner.save();

    const updatedPractitioner = await Practitioner.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone');

    res.json({
      message: 'Practitioner updated successfully',
      practitioner: updatedPractitioner
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete practitioner
router.delete('/practitioners/:id', async (req, res) => {
  try {
    const practitioner = await Practitioner.findById(req.params.id);
    
    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner not found' });
    }

    // Check for active appointments
    const activeAppointments = await Appointment.countDocuments({
      practitionerId: req.params.id,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (activeAppointments > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete practitioner with active appointments' 
      });
    }

    // Delete practitioner and associated user
    await User.findByIdAndDelete(practitioner.userId);
    await Practitioner.findByIdAndDelete(req.params.id);

    res.json({ message: 'Practitioner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update patient profile
router.put('/patients/:id', async (req, res) => {
  try {
    const { 
      dateOfBirth, 
      gender, 
      emergencyContact, 
      medicalHistory, 
      allergies, 
      currentMedications,
      lifestyle 
    } = req.body;

    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update fields if provided
    if (dateOfBirth) patient.dateOfBirth = dateOfBirth;
    if (gender) patient.gender = gender;
    if (emergencyContact) patient.emergencyContact = emergencyContact;
    if (medicalHistory) patient.medicalHistory = medicalHistory;
    if (allergies) patient.allergies = allergies;
    if (currentMedications) patient.currentMedications = currentMedications;
    if (lifestyle) patient.lifestyle = lifestyle;

    await patient.save();

    const updatedPatient = await Patient.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone');

    res.json({
      message: 'Patient updated successfully',
      patient: updatedPatient
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete patient
router.delete('/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check for active appointments
    const activeAppointments = await Appointment.countDocuments({
      patientId: req.params.id,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (activeAppointments > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete patient with active appointments' 
      });
    }

    // Delete patient and associated user
    await User.findByIdAndDelete(patient.userId);
    await Patient.findByIdAndDelete(req.params.id);

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get appointment details
router.get('/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'userId')
      .populate('practitionerId', 'userId')
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phone'
        }
      })
      .populate({
        path: 'practitionerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phone'
        }
      });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update appointment status
router.put('/appointments/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    if (!['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'userId')
      .populate('practitionerId', 'userId');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = status;
    if (notes) appointment.adminNotes = notes;
    appointment.updatedBy = req.user._id;
    appointment.updatedAt = new Date();

    await appointment.save();

    // Send notifications to patient and practitioner
    const notifications = [
      {
        userId: appointment.patientId.userId,
        title: 'Appointment Status Updated',
        message: `Your appointment status has been updated to: ${status}`,
        type: 'appointment',
        priority: 'medium'
      },
      {
        userId: appointment.practitionerId.userId,
        title: 'Appointment Status Updated',
        message: `Appointment status has been updated to: ${status}`,
        type: 'appointment',
        priority: 'medium'
      }
    ];

    await Notification.insertMany(notifications);

    // Send real-time notifications
    req.io.to(appointment.patientId.userId.toString()).emit('notification', notifications[0]);
    req.io.to(appointment.practitionerId.userId.toString()).emit('notification', notifications[1]);

    res.json({
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get system settings
router.get('/settings', async (req, res) => {
  try {
    // Mock system settings - in production, these would be stored in database
    const settings = {
      general: {
        siteName: 'AyurSutra - Panchakarma Care',
        siteDescription: 'Comprehensive Ayurvedic wellness platform',
        contactEmail: 'admin@ayursutra.com',
        supportPhone: '+1-800-AYURVEDA',
        timezone: 'Asia/Kolkata',
        language: 'en',
        maintenanceMode: false
      },
      appointments: {
        maxAdvanceBookingDays: 90,
        minAdvanceBookingHours: 24,
        defaultSessionDuration: 60,
        allowCancellationHours: 24,
        autoConfirmAppointments: false
      },
      payments: {
        currency: 'INR',
        taxRate: 18,
        paymentMethods: ['card', 'upi', 'netbanking'],
        refundPolicy: '24 hours before appointment',
        processingFee: 2.5
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        reminderHours: [24, 2],
        marketingEmails: false
      },
      security: {
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        requireTwoFactor: false,
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf'],
        maxFileSize: 5
      }
    };

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update system settings
router.put('/settings', async (req, res) => {
  try {
    const { category, settings } = req.body;
    
    if (!category || !settings) {
      return res.status(400).json({ message: 'Category and settings are required' });
    }

    // In production, save to database
    // For now, just return success
    res.json({
      message: `${category} settings updated successfully`,
      settings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const { page = 1, limit = 20, action, userId, startDate, endDate } = req.query;
    
    // Mock audit logs - in production, these would be stored in database
    const mockLogs = [
      {
        id: '1',
        timestamp: new Date(),
        userId: req.user._id,
        userEmail: req.user.email,
        action: 'USER_LOGIN',
        resource: 'auth',
        details: 'Admin user logged in',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000),
        userId: req.user._id,
        userEmail: req.user.email,
        action: 'PRACTITIONER_VERIFIED',
        resource: 'practitioners',
        details: 'Practitioner verification approved',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    ];

    res.json({
      logs: mockLogs,
      totalPages: 1,
      currentPage: 1,
      total: mockLogs.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Export data
router.get('/export/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { format = 'json', startDate, endDate } = req.query;
    
    let data = [];
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    switch (type) {
      case 'users':
        data = await User.find(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {})
          .select('-password -refreshTokens')
          .sort({ createdAt: -1 });
        break;
      case 'practitioners':
        data = await Practitioner.find(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {})
          .populate('userId', 'firstName lastName email phone')
          .sort({ createdAt: -1 });
        break;
      case 'patients':
        data = await Patient.find(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {})
          .populate('userId', 'firstName lastName email phone')
          .sort({ createdAt: -1 });
        break;
      case 'appointments':
        data = await Appointment.find(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {})
          .populate('patientId', 'userId')
          .populate('practitionerId', 'userId')
          .populate({
            path: 'patientId',
            populate: { path: 'userId', select: 'firstName lastName email' }
          })
          .populate({
            path: 'practitionerId',
            populate: { path: 'userId', select: 'firstName lastName email' }
          })
          .sort({ createdAt: -1 });
        break;
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    if (format === 'csv') {
      // Convert to CSV format
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-export.csv`);
      // Simple CSV conversion - in production, use proper CSV library
      const csv = data.map(item => Object.values(item).join(',')).join('\n');
      res.send(csv);
    } else {
      res.json({
        type,
        exportDate: new Date(),
        count: data.length,
        data
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get stats with time range
router.get('/stats', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Calculate date filter based on time range
    let dateFilter = new Date();
    switch (timeRange) {
      case '1d':
        dateFilter.setDate(dateFilter.getDate() - 1);
        break;
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      case '90d':
        dateFilter.setDate(dateFilter.getDate() - 90);
        break;
      default:
        dateFilter.setDate(dateFilter.getDate() - 7);
    }

    if (req.useMockDb) {
      // Mock database stats
      const users = await req.mockDb.findAll('users');
      const practitioners = await req.mockDb.findAll('practitioners');
      const patients = await req.mockDb.findAll('patients');
      const appointments = await req.mockDb.findAll('appointments');
      
      const filteredUsers = users.filter(u => new Date(u.createdAt || Date.now()) >= dateFilter);
      const filteredAppointments = appointments.filter(a => new Date(a.createdAt || Date.now()) >= dateFilter);
      
      res.json({
        totalUsers: users.length,
        newUsers: filteredUsers.length,
        totalPractitioners: practitioners.length,
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        newAppointments: filteredAppointments.length,
        completedAppointments: appointments.filter(a => a.status === 'completed').length,
        pendingAppointments: appointments.filter(a => a.status === 'pending').length,
        timeRange
      });
    } else {
      // MongoDB stats
      const [totalUsers, newUsers, totalPractitioners, totalPatients, totalAppointments, newAppointments, completedAppointments, pendingAppointments] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: dateFilter } }),
        Practitioner.countDocuments(),
        Patient.countDocuments(),
        Appointment.countDocuments(),
        Appointment.countDocuments({ createdAt: { $gte: dateFilter } }),
        Appointment.countDocuments({ status: 'completed' }),
        Appointment.countDocuments({ status: 'pending' })
      ]);

      res.json({
        totalUsers,
        newUsers,
        totalPractitioners,
        totalPatients,
        totalAppointments,
        newAppointments,
        completedAppointments,
        pendingAppointments,
        timeRange
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get activities
router.get('/activities', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    if (req.useMockDb) {
      // Mock activities
      const activities = [
        {
          id: '1',
          type: 'user_registration',
          description: 'New patient registered',
          user: 'John Doe',
          timestamp: new Date(),
          icon: 'user-plus',
          color: 'green'
        },
        {
          id: '2',
          type: 'appointment_booked',
          description: 'New appointment scheduled',
          user: 'Jane Smith',
          timestamp: new Date(Date.now() - 3600000),
          icon: 'calendar',
          color: 'blue'
        },
        {
          id: '3',
          type: 'practitioner_verified',
          description: 'Practitioner verification approved',
          user: 'Dr. Kumar',
          timestamp: new Date(Date.now() - 7200000),
          icon: 'check-circle',
          color: 'green'
        },
        {
          id: '4',
          type: 'payment_received',
          description: 'Payment received for consultation',
          user: 'Alice Johnson',
          timestamp: new Date(Date.now() - 10800000),
          icon: 'credit-card',
          color: 'purple'
        },
        {
          id: '5',
          type: 'appointment_completed',
          description: 'Consultation completed',
          user: 'Bob Wilson',
          timestamp: new Date(Date.now() - 14400000),
          icon: 'check',
          color: 'green'
        }
      ];
      
      res.json(activities.slice(0, limit));
    } else {
      // MongoDB activities - combine recent registrations and appointments
      const [recentUsers, recentAppointments] = await Promise.all([
        User.find()
          .select('firstName lastName createdAt role')
          .sort({ createdAt: -1 })
          .limit(10),
        Appointment.find()
          .populate('patientId', 'userId')
          .populate('practitionerId', 'userId')
          .populate({
            path: 'patientId',
            populate: { path: 'userId', select: 'firstName lastName' }
          })
          .sort({ createdAt: -1 })
          .limit(10)
      ]);
      
      const activities = [];
      
      // Add user registrations
      recentUsers.forEach(user => {
        activities.push({
          id: user._id,
          type: 'user_registration',
          description: `New ${user.role} registered`,
          user: `${user.firstName} ${user.lastName}`,
          timestamp: user.createdAt,
          icon: 'user-plus',
          color: 'green'
        });
      });
      
      // Add appointments
      recentAppointments.forEach(apt => {
        activities.push({
          id: apt._id,
          type: 'appointment_booked',
          description: 'New appointment scheduled',
          user: apt.patientId?.userId ? `${apt.patientId.userId.firstName} ${apt.patientId.userId.lastName}` : 'Unknown',
          timestamp: apt.createdAt,
          icon: 'calendar',
          color: 'blue'
        });
      });
      
      // Sort by timestamp and limit
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      res.json(activities.slice(0, limit));
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get system health
router.get('/system-health', async (req, res) => {
  try {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    // Check database connection
    let dbStatus = 'connected';
    let dbType = 'mock';
    
    if (req.useMockDb) {
      dbStatus = 'connected';
      dbType = 'mock';
    } else {
      dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      dbType = 'mongodb';
    }
    
    // Mock system metrics
    const systemHealth = {
      status: 'healthy',
      uptime: Math.floor(uptime),
      database: {
        status: dbStatus,
        type: dbType,
        responseTime: Math.floor(Math.random() * 10) + 1 // Mock response time
      },
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
      },
      cpu: {
        usage: Math.floor(Math.random() * 30) + 10 // Mock CPU usage 10-40%
      },
      services: {
        api: 'healthy',
        database: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
        email: 'healthy',
        storage: 'healthy',
        notifications: 'healthy'
      },
      metrics: {
        requestsPerMinute: Math.floor(Math.random() * 100) + 50,
        averageResponseTime: Math.floor(Math.random() * 200) + 100,
        errorRate: (Math.random() * 2).toFixed(2) + '%'
      }
    };
    
    res.json(systemHealth);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get revenue with time range
router.get('/revenue', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Calculate date filter based on time range
    let dateFilter = new Date();
    switch (timeRange) {
      case '1d':
        dateFilter.setDate(dateFilter.getDate() - 1);
        break;
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      case '90d':
        dateFilter.setDate(dateFilter.getDate() - 90);
        break;
      default:
        dateFilter.setDate(dateFilter.getDate() - 7);
    }

    if (req.useMockDb) {
      // Mock revenue data
      const mockRevenue = {
        totalRevenue: 125000,
        periodRevenue: 15000,
        growth: 12.5,
        transactions: 45,
        averageTransaction: 333.33,
        dailyRevenue: [
          { date: '2024-01-01', amount: 2500 },
          { date: '2024-01-02', amount: 3200 },
          { date: '2024-01-03', amount: 2800 },
          { date: '2024-01-04', amount: 3500 },
          { date: '2024-01-05', amount: 2100 },
          { date: '2024-01-06', amount: 1800 },
          { date: '2024-01-07', amount: 2900 }
        ],
        revenueByService: [
          { service: 'Panchakarma', amount: 8500, percentage: 56.7 },
          { service: 'Consultation', amount: 4200, percentage: 28.0 },
          { service: 'Herbal Medicine', amount: 1800, percentage: 12.0 },
          { service: 'Yoga Therapy', amount: 500, percentage: 3.3 }
        ],
        timeRange
      };
      
      res.json(mockRevenue);
    } else {
      // MongoDB revenue calculation
      const [totalRevenue, periodInvoices] = await Promise.all([
        Invoice.aggregate([
          { $match: { paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Invoice.find({
          paymentStatus: 'paid',
          createdAt: { $gte: dateFilter }
        })
      ]);
      
      const periodRevenue = periodInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
      const transactions = periodInvoices.length;
      const averageTransaction = transactions > 0 ? periodRevenue / transactions : 0;
      
      // Daily revenue breakdown
      const dailyRevenue = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const dayInvoices = periodInvoices.filter(inv => 
          new Date(inv.createdAt) >= dayStart && new Date(inv.createdAt) <= dayEnd
        );
        
        dailyRevenue.push({
          date: dayStart.toISOString().split('T')[0],
          amount: dayInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
        });
      }
      
      res.json({
        totalRevenue: totalRevenue[0]?.total || 0,
        periodRevenue,
        growth: 12.5, // Mock growth percentage
        transactions,
        averageTransaction,
        dailyRevenue,
        revenueByService: [
          { service: 'Panchakarma', amount: periodRevenue * 0.567, percentage: 56.7 },
          { service: 'Consultation', amount: periodRevenue * 0.280, percentage: 28.0 },
          { service: 'Herbal Medicine', amount: periodRevenue * 0.120, percentage: 12.0 },
          { service: 'Yoga Therapy', amount: periodRevenue * 0.033, percentage: 3.3 }
        ],
        timeRange
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get notification settings
router.get('/notification-settings', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notificationPreferences');
    
    res.json({
      success: true,
      preferences: user.notificationPreferences || {
        email: true,
        push: true,
        sms: false,
        types: {
          appointment: true,
          reminder: true,
          billing: true,
          system: true,
          marketing: false
        }
      }
    });
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get notification settings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update notification settings
router.put('/notification-settings', async (req, res) => {
  try {
    const { email, push, sms, types } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    user.notificationPreferences = {
      email: email !== undefined ? email : user.notificationPreferences?.email || true,
      push: push !== undefined ? push : user.notificationPreferences?.push || true,
      sms: sms !== undefined ? sms : user.notificationPreferences?.sms || false,
      types: {
        ...user.notificationPreferences?.types,
        ...types
      }
    };

    await user.save();

    res.json({ 
      success: true,
      message: 'Notification preferences updated successfully',
      preferences: user.notificationPreferences
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update notification settings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get notifications
router.get('/notifications', async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead, type, priority } = req.query;
    
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
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found' 
      });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ 
      success: true,
      message: 'Notification marked as read' 
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to mark notification as read',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
