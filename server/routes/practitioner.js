import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateCommonParams, validateAppointment, validateTherapyPlan, validateMedicalRecord } from '../middleware/validation.js';
import Practitioner from '../models/Practitioner.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import TherapyPlan from '../models/TherapyPlan.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Invoice from '../models/Invoice.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

const router = express.Router();

// Apply authentication and practitioner authorization to all routes
router.use(authenticate);
router.use(authorize('practitioner'));

// Get practitioner profile
router.get('/profile', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id })
      .populate('userId', 'firstName lastName email phone');

    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner profile not found' });
    }

    res.json(practitioner);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update practitioner profile
router.put('/profile', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });

    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner profile not found' });
    }

    const updateFields = [
      'licenseNumber', 'specializations', 'experience', 'education', 
      'certificates', 'clinicAddress', 'bio', 'availability', 'consultationFee'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        practitioner[field] = req.body[field];
      }
    });

    await practitioner.save();

    res.json({ message: 'Profile updated successfully', practitioner });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    
    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner profile not found' });
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalPatients, todayAppointments, upcomingAppointments, activeTherapyPlans, totalReviews, pendingInvoices, monthlyRevenue, unreadMessages] = await Promise.all([
      Patient.countDocuments({ preferredPractitioner: practitioner._id }),
      Appointment.countDocuments({
        practitionerId: practitioner._id,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay }
      }),
      Appointment.countDocuments({
        practitionerId: practitioner._id,
        appointmentDate: { $gt: endOfDay },
        status: { $in: ['scheduled', 'confirmed'] }
      }),
      TherapyPlan.countDocuments({
        practitionerId: practitioner._id,
        status: 'active'
      }),
      Review.countDocuments({ practitionerId: practitioner._id }),
      Invoice.countDocuments({
        practitionerId: practitioner._id,
        paymentStatus: 'pending'
      }),
      Invoice.aggregate([
        {
          $match: {
            practitionerId: practitioner._id,
            paymentStatus: 'paid',
            createdAt: { $gte: startOfMonth }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Message.countDocuments({
        receiverId: req.user._id,
        isRead: false
      })
    ]);

    // Get today's appointments with patient details
    const todaysAppointmentsList = await Appointment.find({
      practitionerId: practitioner._id,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay }
    })
    .populate({
      path: 'patientId',
      populate: { path: 'userId', select: 'firstName lastName' }
    })
    .sort({ startTime: 1 })
    .limit(5);

    // Get recent notifications
    const recentNotifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      overview: {
        verificationStatus: practitioner.verificationStatus,
        totalPatients,
        todayAppointments,
        upcomingAppointments,
        activeTherapyPlans,
        totalReviews,
        pendingInvoices,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        unreadMessages,
        rating: practitioner.rating
      },
      todaysSchedule: todaysAppointmentsList,
      recentNotifications
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get appointments
router.get('/appointments', async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    const practitioner = await Practitioner.findOne({ userId: req.user._id });

    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner profile not found' });
    }

    let query = { practitionerId: practitioner._id };
    
    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: startDate, $lte: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phone'
        }
      })
      .populate('therapyPlanId')
      .sort({ appointmentDate: 1, startTime: 1 })
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

// Create appointment
router.post('/appointments', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });

    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner profile not found' });
    }

    if (practitioner.verificationStatus !== 'approved') {
      return res.status(403).json({ message: 'Profile must be verified to schedule appointments' });
    }

    const appointment = new Appointment({
      ...req.body,
      practitionerId: practitioner._id
    });

    await appointment.save();

    // Create notification for patient
    const notification = new Notification({
      userId: req.body.patientId,
      title: 'New Appointment Scheduled',
      message: `You have a new appointment scheduled for ${new Date(req.body.appointmentDate).toLocaleDateString()}`,
      type: 'appointment',
      priority: 'high',
      relatedId: appointment._id,
      relatedModel: 'Appointment'
    });

    await notification.save();

    // Send real-time notification
    req.io.to(req.body.patientId).emit('notification', notification);

    res.status(201).json({ message: 'Appointment created successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update appointment
router.put('/appointments/:id', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      practitionerId: practitioner._id
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    Object.keys(req.body).forEach(key => {
      appointment[key] = req.body[key];
    });

    await appointment.save();

    // Create notification for patient if status changed
    if (req.body.status) {
      const notification = new Notification({
        userId: appointment.patientId,
        title: 'Appointment Updated',
        message: `Your appointment status has been updated to: ${req.body.status}`,
        type: 'appointment',
        priority: 'medium',
        relatedId: appointment._id,
        relatedModel: 'Appointment'
      });

      await notification.save();
      req.io.to(appointment.patientId.toString()).emit('notification', notification);
    }

    res.json({ message: 'Appointment updated successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get therapy plans
router.get('/therapy-plans', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    const { status, page = 1, limit = 10 } = req.query;

    let query = { practitionerId: practitioner._id };
    if (status) query.status = status;

    const therapyPlans = await TherapyPlan.find(query)
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TherapyPlan.countDocuments(query);

    res.json({
      therapyPlans,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create therapy plan
router.post('/therapy-plans', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });

    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner profile not found' });
    }

    const therapyPlan = new TherapyPlan({
      ...req.body,
      practitionerId: practitioner._id
    });

    await therapyPlan.save();

    // Create notification for patient
    const notification = new Notification({
      userId: req.body.patientId,
      title: 'New Therapy Plan Created',
      message: `A new therapy plan "${req.body.title}" has been created for you`,
      type: 'general',
      priority: 'high',
      relatedId: therapyPlan._id,
      relatedModel: 'TherapyPlan'
    });

    await notification.save();
    req.io.to(req.body.patientId).emit('notification', notification);

    res.status(201).json({ message: 'Therapy plan created successfully', therapyPlan });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update therapy plan
router.put('/therapy-plans/:id', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    const therapyPlan = await TherapyPlan.findOne({
      _id: req.params.id,
      practitionerId: practitioner._id
    });

    if (!therapyPlan) {
      return res.status(404).json({ message: 'Therapy plan not found' });
    }

    Object.keys(req.body).forEach(key => {
      therapyPlan[key] = req.body[key];
    });

    await therapyPlan.save();

    res.json({ message: 'Therapy plan updated successfully', therapyPlan });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get patients
router.get('/patients', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    
    const patients = await Patient.find({ preferredPractitioner: practitioner._id })
      .populate('userId', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get reviews
router.get('/reviews', validateCommonParams, async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create medical record
router.post('/medical-records', validateMedicalRecord, async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    
    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner profile not found' });
    }

    const medicalRecord = new MedicalRecord({
      ...req.body,
      practitionerId: practitioner._id
    });

    await medicalRecord.save();

    // Create notification for patient
    const notification = new Notification({
      userId: req.body.patientId,
      title: 'New Medical Record',
      message: `A new medical record has been added to your profile`,
      type: 'medical',
      priority: 'medium',
      relatedId: medicalRecord._id,
      relatedModel: 'MedicalRecord'
    });

    await notification.save();
    req.io.to(req.body.patientId).emit('notification', notification);

    res.status(201).json({ message: 'Medical record created successfully', medicalRecord });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get medical records
router.get('/medical-records', validateCommonParams, async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    const { patientId, page = 1, limit = 10 } = req.query;

    let query = { practitionerId: practitioner._id };
    if (patientId) query.patientId = patientId;

    const medicalRecords = await MedicalRecord.find(query)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .populate('appointmentId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MedicalRecord.countDocuments(query);

    res.json({
      medicalRecords,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update medical record
router.put('/medical-records/:id', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    const medicalRecord = await MedicalRecord.findOne({
      _id: req.params.id,
      practitionerId: practitioner._id
    });

    if (!medicalRecord) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    Object.keys(req.body).forEach(key => {
      medicalRecord[key] = req.body[key];
    });

    await medicalRecord.save();

    res.json({ message: 'Medical record updated successfully', medicalRecord });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create invoice
router.post('/invoices', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    
    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner profile not found' });
    }

    // Generate invoice number
    const invoiceCount = await Invoice.countDocuments({ practitionerId: practitioner._id });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`;

    const invoice = new Invoice({
      ...req.body,
      practitionerId: practitioner._id,
      invoiceNumber
    });

    await invoice.save();

    // Create notification for patient
    const notification = new Notification({
      userId: req.body.patientId,
      title: 'New Invoice',
      message: `You have received a new invoice #${invoiceNumber}`,
      type: 'billing',
      priority: 'medium',
      relatedId: invoice._id,
      relatedModel: 'Invoice'
    });

    await notification.save();
    req.io.to(req.body.patientId).emit('notification', notification);

    res.status(201).json({ message: 'Invoice created successfully', invoice });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get invoices
router.get('/invoices', validateCommonParams, async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    const { status, page = 1, limit = 10 } = req.query;

    let query = { practitionerId: practitioner._id };
    if (status) query.paymentStatus = status;

    const invoices = await Invoice.find(query)
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
      invoices,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update invoice
router.put('/invoices/:id', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      practitionerId: practitioner._id
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    Object.keys(req.body).forEach(key => {
      invoice[key] = req.body[key];
    });

    await invoice.save();

    res.json({ message: 'Invoice updated successfully', invoice });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get conversations
router.get('/conversations', validateCommonParams, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const conversations = await Conversation.find({
      'participants.userId': req.user._id
    })
    .populate({
      path: 'participants.userId',
      select: 'firstName lastName email role'
    })
    .sort({ updatedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Conversation.countDocuments({
      'participants.userId': req.user._id
    });

    res.json({
      conversations,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get messages in conversation
router.get('/conversations/:id/messages', validateCommonParams, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    // Verify user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      'participants.userId': req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversationId: req.params.id })
      .populate('senderId', 'firstName lastName role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments({ conversationId: req.params.id });

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId: req.params.id,
        receiverId: req.user._id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      messages: messages.reverse(),
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send message
router.post('/conversations/:id/messages', async (req, res) => {
  try {
    const { content, messageType = 'text' } = req.body;

    // Verify user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      'participants.userId': req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Find receiver
    const receiver = conversation.participants.find(
      p => p.userId.toString() !== req.user._id.toString()
    );

    const message = new Message({
      conversationId: req.params.id,
      senderId: req.user._id,
      receiverId: receiver.userId,
      content,
      messageType
    });

    await message.save();

    // Update conversation last message
    conversation.lastMessage = {
      content,
      senderId: req.user._id,
      timestamp: new Date()
    };
    conversation.updatedAt = new Date();
    await conversation.save();

    // Send real-time message
    req.io.to(receiver.userId.toString()).emit('newMessage', {
      conversationId: req.params.id,
      message
    });

    res.status(201).json({ message: 'Message sent successfully', messageData: message });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get analytics
router.get('/analytics', async (req, res) => {
  try {
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
      { $match: { preferredPractitioner: practitioner._id } },
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      appointmentStats,
      revenueStats,
      patientDemographics
    });
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
