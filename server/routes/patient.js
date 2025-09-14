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
import User from '../models/User.js';

const router = express.Router();

// Apply authentication and patient authorization to all routes
router.use(authenticate);
router.use(authorize('patient'));

// Get patient profile
router.get('/profile', async (req, res) => {
  try {
    let patient;
    
    if (req.useMockDb) {
      const patients = await req.mockDb.find('patients', { userId: req.user._id });
      patient = patients[0];
      
      if (patient) {
        patient.userId = {
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: req.user.email,
          phone: req.user.phone,
          avatar: req.user.avatar
        };
      }
    } else {
      patient = await Patient.findOne({ userId: req.user._id })
        .populate('userId', 'firstName lastName email phone avatar');
    }

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
    const { range = '7d' } = req.query;
    
    let patient;
    if (req.useMockDb) {
      const patients = await req.mockDb.find('patients', { userId: req.user._id });
      patient = patients[0];
    } else {
      patient = await Patient.findOne({ userId: req.user._id });
    }
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    let totalAppointments, completedSessions, upcomingAppointments, activeTherapyPlans, nextAppointment;

    if (req.useMockDb) {
      const appointments = await req.mockDb.find('appointments', { patientId: patient._id });
      const therapyPlans = await req.mockDb.find('therapyPlans', { patientId: patient._id });
      
      totalAppointments = appointments.length;
      completedSessions = appointments.filter(a => a.status === 'completed').length;
      upcomingAppointments = appointments.filter(a => 
        ['scheduled', 'confirmed'].includes(a.status) && 
        new Date(a.date) >= new Date()
      ).length;
      activeTherapyPlans = therapyPlans.filter(tp => tp.status === 'active').length;
      
      // Get next appointment
      const upcoming = appointments
        .filter(a => ['scheduled', 'confirmed'].includes(a.status) && new Date(a.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      nextAppointment = upcoming[0] || null;
    } else {
      totalAppointments = await Appointment.countDocuments({ patientId: patient._id });
      completedSessions = await Appointment.countDocuments({ 
        patientId: patient._id, 
        status: 'completed' 
      });
      upcomingAppointments = await Appointment.countDocuments({
        patientId: patient._id,
        status: { $in: ['scheduled', 'confirmed'] },
        appointmentDate: { $gte: new Date() }
      });
      activeTherapyPlans = await TherapyPlan.countDocuments({
        patientId: patient._id,
        status: 'active'
      });

      // Get next appointment
      nextAppointment = await Appointment.findOne({
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
    }

    res.json({
      totalAppointments,
      completedSessions,
      upcomingAppointments,
      activeTherapyPlans,
      nextAppointment,
      range
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get appointments
router.get('/appointments', async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    
    let patient;
    if (req.useMockDb) {
      const patients = await req.mockDb.find('patients', { userId: req.user._id });
      patient = patients[0];
    } else {
      patient = await Patient.findOne({ userId: req.user._id });
    }

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    let appointments, total;

    if (req.useMockDb) {
      let allAppointments = await req.mockDb.find('appointments', { patientId: patient._id });
      
      // Apply filters
      if (status) {
        allAppointments = allAppointments.filter(apt => apt.status === status);
      }
      if (type === 'upcoming') {
        allAppointments = allAppointments.filter(apt => 
          ['scheduled', 'confirmed'].includes(apt.status) && 
          new Date(apt.date) >= new Date()
        );
      } else if (type === 'past') {
        allAppointments = allAppointments.filter(apt => new Date(apt.date) < new Date());
      }

      total = allAppointments.length;
      
      // Sort and paginate
      appointments = allAppointments
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice((page - 1) * limit, page * limit);

      // Add practitioner details
      appointments = appointments.map(apt => {
        const practitioner = req.mockDb.practitioners.find(p => p._id === apt.practitionerId);
        return {
          ...apt,
          practitionerId: practitioner ? {
            _id: practitioner._id,
            userId: {
              firstName: practitioner.userId ? req.mockDb.users.find(u => u._id === practitioner.userId)?.firstName : 'Unknown',
              lastName: practitioner.userId ? req.mockDb.users.find(u => u._id === practitioner.userId)?.lastName : 'Practitioner',
              email: practitioner.userId ? req.mockDb.users.find(u => u._id === practitioner.userId)?.email : 'unknown@example.com',
              phone: practitioner.userId ? req.mockDb.users.find(u => u._id === practitioner.userId)?.phone : '+91-0000000000'
            },
            specializations: practitioner.specializations,
            consultationFee: practitioner.consultationFee
          } : null
        };
      });
    } else {
      let query = { patientId: patient._id };
      
      if (status) query.status = status;
      if (type === 'upcoming') {
        query.appointmentDate = { $gte: new Date() };
        query.status = { $in: ['scheduled', 'confirmed'] };
      } else if (type === 'past') {
        query.appointmentDate = { $lt: new Date() };
      }

      appointments = await Appointment.find(query)
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

      total = await Appointment.countDocuments(query);
    }

    res.json({
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
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
    
    let practitioners, total;

    if (req.useMockDb) {
      let allPractitioners = await req.mockDb.find('practitioners', { isVerified: true });
      
      // Apply specialization filter
      if (specialization) {
        allPractitioners = allPractitioners.filter(p => 
          p.specializations && p.specializations.includes(specialization)
        );
      }

      total = allPractitioners.length;
      
      // Sort and paginate
      practitioners = allPractitioners
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice((page - 1) * limit, page * limit);

      // Add user details
      practitioners = practitioners.map(practitioner => {
        const user = req.mockDb.users.find(u => u._id === practitioner.userId);
        return {
          ...practitioner,
          userId: user ? {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone
          } : null
        };
      });
    } else {
      let query = { verificationStatus: 'approved' };
      if (specialization) {
        query.specializations = { $in: [specialization] };
      }

      practitioners = await Practitioner.find(query)
        .populate('userId', 'firstName lastName email phone')
        .sort({ rating: -1, totalReviews: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      total = await Practitioner.countDocuments(query);
    }

    res.json({
      practitioners,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get practitioner details
router.get('/practitioners/:id', async (req, res) => {
  try {
    const practitionerId = req.params.id;
    
    let practitioner;
    if (req.useMockDb) {
      const practitioners = await req.mockDb.find('practitioners', { _id: practitionerId });
      practitioner = practitioners[0];
      
      if (practitioner) {
        const user = req.mockDb.users.find(u => u._id === practitioner.userId);
        practitioner.userId = user ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        } : null;
      }
    } else {
      practitioner = await Practitioner.findById(practitionerId)
        .populate('userId', 'firstName lastName email phone');
    }

    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner not found' });
    }

    res.json(practitioner);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get available time slots for a practitioner
router.get('/practitioners/:id/slots', async (req, res) => {
  try {
    const { date } = req.query;
    const practitionerId = req.params.id;
    
    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required' });
    }

    let practitioner;
    if (req.useMockDb) {
      const practitioners = await req.mockDb.find('practitioners', { _id: practitionerId });
      practitioner = practitioners[0];
    } else {
      practitioner = await Practitioner.findById(practitionerId);
    }

    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner not found' });
    }

    // Generate mock available slots
    const availableSlots = [];
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    
    // Check if practitioner is available on this day
    const dayAvailability = practitioner.availability?.find(a => a.day === dayOfWeek);
    
    if (dayAvailability && dayAvailability.slots) {
      dayAvailability.slots.forEach(slot => {
        availableSlots.push({
          time: slot,
          available: true,
          duration: 60
        });
      });
    } else {
      // Default slots if no availability set
      const defaultSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
      defaultSlots.forEach(slot => {
        availableSlots.push({
          time: slot,
          available: true,
          duration: 60
        });
      });
    }

    res.json(availableSlots);
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

// Health tracking
router.get('/health-tracking', async (req, res) => {
  try {
    const { metric, days = 30 } = req.query;
    
    let patient;
    if (req.useMockDb) {
      const patients = await req.mockDb.find('patients', { userId: req.user._id });
      patient = patients[0];
    } else {
      patient = await Patient.findOne({ userId: req.user._id });
    }
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Mock health tracking data
    const healthData = {
      metric: metric || 'weight',
      data: [],
      trends: {
        current: 70,
        previous: 72,
        change: -2,
        changePercent: -2.8
      }
    };

    // Generate mock data points
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      healthData.data.push({
        date: date.toISOString().split('T')[0],
        value: 70 + Math.random() * 4 - 2, // Random value around 70
        unit: metric === 'weight' ? 'kg' : 'units'
      });
    }

    res.json(healthData);
  } catch (error) {
    console.error('Get health tracking error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get health tracking data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Health goals management
router.get('/health-goals', async (req, res) => {
  try {
    let patient;
    if (req.useMockDb) {
      const patients = await req.mockDb.find('patients', { userId: req.user._id });
      patient = patients[0];
    } else {
      patient = await Patient.findOne({ userId: req.user._id });
    }
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    
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

// Get notification settings
router.get('/notification-settings', async (req, res) => {
  try {
    const user = req.user;
    const notificationPreferences = user.notificationPreferences || {
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
    };

    res.json(notificationPreferences);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update notification settings
router.put('/notification-settings', async (req, res) => {
  try {
    const user = req.user;
    const { email, push, sms, types } = req.body;

    const notificationPreferences = {
      email: email !== undefined ? email : user.notificationPreferences?.email || true,
      push: push !== undefined ? push : user.notificationPreferences?.push || true,
      sms: sms !== undefined ? sms : user.notificationPreferences?.sms || false,
      types: {
        ...user.notificationPreferences?.types,
        ...types
      }
    };

    if (req.useMockDb) {
      const users = await req.mockDb.find('users', { _id: user._id });
      if (users.length > 0) {
        users[0].notificationPreferences = notificationPreferences;
        await req.mockDb.saveData('users.json', await req.mockDb.find('users'));
      }
    } else {
      user.notificationPreferences = notificationPreferences;
      await user.save();
    }

    res.json({ 
      message: 'Notification settings updated successfully',
      notificationPreferences 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get notifications
router.get('/notifications', async (req, res) => {
  try {
    const { page = 1, limit = 10, unread } = req.query;
    
    let notifications;
    let total;

    if (req.useMockDb) {
      let allNotifications = await req.mockDb.find('notifications', { userId: req.user._id });
      
      if (unread === 'true') {
        allNotifications = allNotifications.filter(n => !n.read);
      }

      total = allNotifications.length;
      notifications = allNotifications
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice((page - 1) * limit, page * limit);
    } else {
      let query = { userId: req.user._id };
      if (unread === 'true') {
        query.read = false;
      }

      notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      total = await Notification.countDocuments(query);
    }

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      unreadCount: req.useMockDb 
        ? (await req.mockDb.find('notifications', { userId: req.user._id, read: false })).length
        : await Notification.countDocuments({ userId: req.user._id, read: false })
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    let notification;

    if (req.useMockDb) {
      const notifications = await req.mockDb.find('notifications', { _id: req.params.id, userId: req.user._id });
      notification = notifications[0];
      
      if (notification) {
        notification.read = true;
        await req.mockDb.saveData('notifications.json', await req.mockDb.find('notifications'));
      }
    } else {
      notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { read: true },
        { new: true }
      );
    }

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
