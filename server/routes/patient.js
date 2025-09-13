import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validatePatientProfile, validateMongoId, validatePagination } from '../middleware/validation.js';
import Patient from '../models/Patient.js';
import Practitioner from '../models/Practitioner.js';
import Appointment from '../models/Appointment.js';
import TherapyPlan from '../models/TherapyPlan.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Invoice from '../models/Invoice.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

const router = express.Router();

// Apply authentication and patient authorization to all routes
router.use(authenticate);
router.use(authorize('patient'));

// Get patient profile
router.get('/profile', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id })
      .populate('userId', 'firstName lastName email phone avatar');

    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: 'Patient profile not found' 
      });
    }

    res.json({
      success: true,
      patient
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get patient profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update patient profile
router.put('/profile', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });

    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: 'Patient profile not found' 
      });
    }

    const updateFields = [
      'dateOfBirth', 'gender', 'bloodGroup', 'height', 'weight', 'address', 
      'emergencyContact', 'medicalHistory', 'allergies', 'currentMedications', 
      'healthGoals', 'preferences', 'insurance', 'profileImage'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        patient[field] = req.body[field];
      }
    });

    await patient.save();

    res.json({ 
      success: true,
      message: 'Profile updated successfully', 
      patient 
    });
  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update patient profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const totalAppointments = await Appointment.countDocuments({ patientId: patient._id });
    const completedSessions = await Appointment.countDocuments({ 
      patientId: patient._id, 
      status: 'completed' 
    });
    const upcomingAppointments = await Appointment.countDocuments({
      patientId: patient._id,
      status: { $in: ['scheduled', 'confirmed'] },
      appointmentDate: { $gte: new Date() }
    });
    const activeTherapyPlans = await TherapyPlan.countDocuments({
      patientId: patient._id,
      status: 'active'
    });

    // Get next appointment
    const nextAppointment = await Appointment.findOne({
      patientId: patient._id,
      status: { $in: ['scheduled', 'confirmed'] },
      appointmentDate: { $gte: new Date() }
    })
    .populate({
      path: 'practitionerId',
      populate: {
        path: 'userId',
        select: 'firstName lastName'
      }
    })
    .sort({ appointmentDate: 1, startTime: 1 });

    res.json({
      totalAppointments,
      completedSessions,
      upcomingAppointments,
      activeTherapyPlans,
      nextAppointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get appointments
router.get('/appointments', async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const patient = await Patient.findOne({ userId: req.user._id });

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    let query = { patientId: patient._id };
    
    if (status) query.status = status;
    if (type === 'upcoming') {
      query.appointmentDate = { $gte: new Date() };
      query.status = { $in: ['scheduled', 'confirmed'] };
    } else if (type === 'past') {
      query.appointmentDate = { $lt: new Date() };
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: 'practitionerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phone'
        }
      })
      .populate('therapyPlanId')
      .sort({ appointmentDate: -1, startTime: -1 })
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

// Get therapy plans
router.get('/therapy-plans', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    const { status, page = 1, limit = 10 } = req.query;

    let query = { patientId: patient._id };
    if (status) query.status = status;

    const therapyPlans = await TherapyPlan.find(query)
      .populate({
        path: 'practitionerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
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

// Get specific therapy plan details
router.get('/therapy-plans/:id', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    
    const therapyPlan = await TherapyPlan.findOne({
      _id: req.params.id,
      patientId: patient._id
    })
    .populate({
      path: 'practitionerId',
      populate: {
        path: 'userId',
        select: 'firstName lastName email phone'
      }
    });

    if (!therapyPlan) {
      return res.status(404).json({ message: 'Therapy plan not found' });
    }

    res.json(therapyPlan);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get available practitioners
router.get('/practitioners', async (req, res) => {
  try {
    const { specialization, page = 1, limit = 10 } = req.query;
    
    let query = { verificationStatus: 'approved' };
    if (specialization) {
      query.specializations = { $in: [specialization] };
    }

    const practitioners = await Practitioner.find(query)
      .populate('userId', 'firstName lastName email phone')
      .sort({ rating: -1, totalReviews: -1 })
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

// Book appointment
router.post('/appointments', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const appointment = new Appointment({
      ...req.body,
      patientId: patient._id,
      status: 'scheduled'
    });

    await appointment.save();

    // Create notification for practitioner
    const notification = new Notification({
      userId: req.body.practitionerId,
      title: 'New Appointment Request',
      message: `You have a new appointment request for ${new Date(req.body.appointmentDate).toLocaleDateString()}`,
      type: 'appointment',
      priority: 'high',
      relatedId: appointment._id,
      relatedModel: 'Appointment'
    });

    await notification.save();
    req.io.to(req.body.practitionerId).emit('notification', notification);

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel appointment
router.put('/appointments/:id/cancel', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: patient._id
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    // Create notification for practitioner
    const notification = new Notification({
      userId: appointment.practitionerId,
      title: 'Appointment Cancelled',
      message: `An appointment scheduled for ${new Date(appointment.appointmentDate).toLocaleDateString()} has been cancelled`,
      type: 'appointment',
      priority: 'medium',
      relatedId: appointment._id,
      relatedModel: 'Appointment'
    });

    await notification.save();
    req.io.to(appointment.practitionerId.toString()).emit('notification', notification);

    res.json({ message: 'Appointment cancelled successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit review
router.post('/reviews', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    const { appointmentId, practitionerId, rating, comment, aspects, wouldRecommend, isAnonymous } = req.body;

    // Check if appointment exists and belongs to patient
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: patient._id,
      status: 'completed'
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Completed appointment not found' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ appointmentId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already submitted for this appointment' });
    }

    const review = new Review({
      patientId: patient._id,
      practitionerId,
      appointmentId,
      rating,
      comment,
      aspects,
      wouldRecommend,
      isAnonymous
    });

    await review.save();

    // Update practitioner rating
    const practitioner = await Practitioner.findById(practitionerId);
    const reviews = await Review.find({ practitionerId });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    practitioner.rating = totalRating / reviews.length;
    practitioner.totalReviews = reviews.length;
    await practitioner.save();

    // Create notification for practitioner
    const notification = new Notification({
      userId: practitionerId,
      title: 'New Review Received',
      message: `You received a ${rating}-star review`,
      type: 'feedback',
      priority: 'low',
      relatedId: review._id,
      relatedModel: 'Review'
    });

    await notification.save();
    req.io.to(practitionerId).emit('notification', notification);

    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get patient's reviews
router.get('/reviews', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    
    const reviews = await Review.find({ patientId: patient._id })
      .populate({
        path: 'practitionerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get medical records
router.get('/medical-records', validatePagination, async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    const { page = 1, limit = 10, type, search } = req.query;

    let query = { patientId: patient._id };
    if (type) query.recordType = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const records = await MedicalRecord.find(query)
      .populate('practitionerId', 'userId specializations')
      .populate('practitionerId.userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MedicalRecord.countDocuments(query);

    res.json({
      success: true,
      records,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get medical records',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get specific medical record
router.get('/medical-records/:id', validateMongoId('id'), async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    
    const record = await MedicalRecord.findOne({
      _id: req.params.id,
      patientId: patient._id
    })
    .populate('practitionerId', 'userId specializations')
    .populate('practitionerId.userId', 'firstName lastName');

    if (!record) {
      return res.status(404).json({ 
        success: false,
        message: 'Medical record not found' 
      });
    }

    res.json({
      success: true,
      record
    });
  } catch (error) {
    console.error('Get medical record error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get medical record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add vital signs
router.post('/vital-signs', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    
    const vitalSigns = {
      ...req.body,
      date: new Date(),
      recordedBy: req.user._id
    };

    patient.vitalSigns.push(vitalSigns);
    await patient.save();

    res.status(201).json({
      success: true,
      message: 'Vital signs recorded successfully',
      vitalSigns: patient.vitalSigns[patient.vitalSigns.length - 1]
    });
  } catch (error) {
    console.error('Add vital signs error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to record vital signs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get invoices
router.get('/invoices', validatePagination, async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    const { page = 1, limit = 10, status, paymentStatus } = req.query;

    let query = { patientId: patient._id };
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const invoices = await Invoice.find(query)
      .populate('practitionerId', 'userId consultationFee')
      .populate('practitionerId.userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Invoice.countDocuments(query);

    res.json({
      success: true,
      invoices,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get invoices',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Pay invoice
router.post('/invoices/:id/pay', validateMongoId('id'), async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    const { paymentMethod, amount } = req.body;
    
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      patientId: patient._id
    });

    if (!invoice) {
      return res.status(404).json({ 
        success: false,
        message: 'Invoice not found' 
      });
    }

    if (invoice.paymentStatus === 'paid') {
      return res.status(400).json({ 
        success: false,
        message: 'Invoice is already paid' 
      });
    }

    // Process payment (integrate with payment gateway)
    invoice.paidAmount += amount;
    invoice.paymentMethod = paymentMethod;
    invoice.paymentDate = new Date();
    
    if (invoice.paidAmount >= invoice.totalAmount) {
      invoice.paymentStatus = 'paid';
      invoice.status = 'paid';
    } else {
      invoice.paymentStatus = 'partial';
    }

    await invoice.save();

    res.json({
      success: true,
      message: 'Payment processed successfully',
      invoice
    });
  } catch (error) {
    console.error('Pay invoice error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Payment processing failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get conversations
router.get('/conversations', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = {
      'participants.userId': req.user._id,
      'participants.role': 'patient'
    };
    if (status) query.status = status;

    const conversations = await Conversation.find(query)
      .populate({
        path: 'participants.userId',
        select: 'firstName lastName avatar role'
      })
      .populate('lastMessage.senderId', 'firstName lastName')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Conversation.countDocuments(query);

    res.json({
      success: true,
      conversations,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get messages in a conversation
router.get('/conversations/:id/messages', validateMongoId('id'), validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      'participants.userId': req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ 
        success: false,
        message: 'Conversation not found' 
      });
    }

    const messages = await Message.find({ conversationId: req.params.id })
      .populate('senderId', 'firstName lastName avatar')
      .populate('receiverId', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments({ conversationId: req.params.id });

    res.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get messages',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Send message
router.post('/conversations/:id/messages', validateMongoId('id'), async (req, res) => {
  try {
    const { content, messageType = 'text', attachments } = req.body;
    
    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      'participants.userId': req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ 
        success: false,
        message: 'Conversation not found' 
      });
    }

    // Find receiver (the other participant)
    const receiver = conversation.participants.find(
      p => p.userId.toString() !== req.user._id.toString()
    );

    const message = new Message({
      conversationId: req.params.id,
      senderId: req.user._id,
      receiverId: receiver.userId,
      content,
      messageType,
      attachments
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

    // Emit real-time message
    req.io.to(receiver.userId.toString()).emit('new-message', {
      conversationId: req.params.id,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Health goals management
router.get('/health-goals', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    
    res.json({
      success: true,
      healthGoals: patient.healthGoals || []
    });
  } catch (error) {
    console.error('Get health goals error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get health goals',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.post('/health-goals', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    
    const healthGoal = {
      ...req.body,
      createdAt: new Date()
    };

    patient.healthGoals.push(healthGoal);
    await patient.save();

    res.status(201).json({
      success: true,
      message: 'Health goal added successfully',
      healthGoal: patient.healthGoals[patient.healthGoals.length - 1]
    });
  } catch (error) {
    console.error('Add health goal error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add health goal',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.put('/health-goals/:goalId', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    const goal = patient.healthGoals.id(req.params.goalId);
    
    if (!goal) {
      return res.status(404).json({ 
        success: false,
        message: 'Health goal not found' 
      });
    }

    Object.assign(goal, req.body);
    await patient.save();

    res.json({
      success: true,
      message: 'Health goal updated successfully',
      healthGoal: goal
    });
  } catch (error) {
    console.error('Update health goal error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update health goal',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.delete('/health-goals/:goalId', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    patient.healthGoals.id(req.params.goalId).remove();
    await patient.save();

    res.json({
      success: true,
      message: 'Health goal deleted successfully'
    });
  } catch (error) {
    console.error('Delete health goal error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete health goal',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
