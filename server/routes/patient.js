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
import PaymentMethod from '../models/PaymentMethod.js';
import Payment from '../models/Payment.js';
import VitalSign from '../models/VitalSign.js';
import Document from '../models/Document.js';
import HealthTracking from '../models/HealthTracking.js';
import HealthGoal from '../models/HealthGoal.js';
import TherapySession from '../models/TherapySession.js';
import DietItem from '../models/DietItem.js';

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

// Get therapy plans with progress tracking
router.get('/therapy-plans/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const therapyPlan = req.mockDb.therapyPlans.find(plan => 
        plan._id === id && plan.patientId === patient._id
      );
      
      if (!therapyPlan) {
        return res.status(404).json({ message: 'Therapy plan not found' });
      }
      
      // Mock progress data
      const progressData = {
        planId: id,
        totalSessions: therapyPlan.sessions || 10,
        completedSessions: 6,
        progressPercentage: 60,
        currentWeek: 3,
        totalWeeks: therapyPlan.duration || 8,
        exercises: [
          { id: 'ex1', name: 'Morning Stretches', completed: true, date: new Date().toISOString() },
          { id: 'ex2', name: 'Breathing Exercises', completed: true, date: new Date().toISOString() },
          { id: 'ex3', name: 'Meditation', completed: false, date: null }
        ],
        dietCompliance: [
          { id: 'diet1', item: 'Herbal Tea', completed: true, date: new Date().toISOString() },
          { id: 'diet2', item: 'Vegetables', completed: true, date: new Date().toISOString() },
          { id: 'diet3', item: 'Avoid Spicy Food', completed: false, date: null }
        ],
        notes: 'Good progress overall. Continue with current routine.',
        nextSession: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      res.json(progressData);
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const therapyPlan = await TherapyPlan.findOne({
        _id: id,
        patientId: patient._id
      });
      
      if (!therapyPlan) {
        return res.status(404).json({ message: 'Therapy plan not found' });
      }
      
      // Calculate progress data
      const totalSessions = therapyPlan.sessions || 10;
      const completedSessions = await TherapySession.countDocuments({
        therapyPlanId: id,
        status: 'completed'
      });
      
      const progressData = {
        planId: id,
        totalSessions,
        completedSessions,
        progressPercentage: Math.round((completedSessions / totalSessions) * 100),
        currentWeek: Math.ceil(completedSessions / 2),
        totalWeeks: therapyPlan.duration || 8,
        exercises: therapyPlan.exercises || [],
        dietCompliance: therapyPlan.dietPlan || [],
        notes: therapyPlan.notes || '',
        nextSession: therapyPlan.nextSession || null
      };
      
      res.json(progressData);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Complete therapy session
router.patch('/therapy-sessions/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      // Mock session completion
      res.json({
        message: 'Session marked as completed',
        sessionId: id,
        completedAt: new Date().toISOString()
      });
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const session = await TherapySession.findOneAndUpdate(
        { _id: id, patientId: patient._id },
        { 
          status: 'completed',
          completedAt: new Date()
        },
        { new: true }
      );
      
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      
      res.json({
        message: 'Session marked as completed',
        session
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update diet compliance
router.patch('/diet-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      // Mock diet item update
      res.json({
        message: 'Diet compliance updated',
        itemId: id,
        completed,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const dietItem = await DietItem.findOneAndUpdate(
        { _id: id, patientId: patient._id },
        { 
          completed,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      if (!dietItem) {
        return res.status(404).json({ message: 'Diet item not found' });
      }
      
      res.json({
        message: 'Diet compliance updated',
        dietItem
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get practitioners for search
router.get('/practitioners/search', async (req, res) => {
  try {
    const { specialization, location, rating, availability } = req.query;
    
    if (req.useMockDb) {
      // Use mock database
      let practitioners = req.mockDb.practitioners.filter(p => p.isActive);
      
      // Apply filters
      if (specialization) {
        practitioners = practitioners.filter(p => 
          p.specializations?.some(spec => 
            spec.toLowerCase().includes(specialization.toLowerCase())
          )
        );
      }
      
      if (location) {
        practitioners = practitioners.filter(p => 
          p.location?.toLowerCase().includes(location.toLowerCase())
        );
      }
      
      if (rating) {
        practitioners = practitioners.filter(p => p.rating >= parseFloat(rating));
      }
      
      // Add user details
      const practitionersWithUsers = practitioners.map(practitioner => {
        const user = req.mockDb.users.find(u => u._id === practitioner.userId);
        return {
          ...practitioner,
          user: user ? {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone
          } : null
        };
      });
      
      res.json(practitionersWithUsers);
    } else {
      // Use MongoDB
      let query = { isActive: true };
      
      if (specialization) {
        query.specializations = { $in: [new RegExp(specialization, 'i')] };
      }
      
      if (location) {
        query.location = { $regex: location, $options: 'i' };
      }
      
      if (rating) {
        query.rating = { $gte: parseFloat(rating) };
      }
      
      const practitioners = await Practitioner.find(query)
        .populate('userId', 'firstName lastName email phone')
        .sort({ rating: -1 });
      
      res.json(practitioners);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Book appointment
router.post('/appointments/book', async (req, res) => {
  try {
    const { practitionerId, type, date, time, notes } = req.body;
    
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const practitioner = req.mockDb.practitioners.find(p => p._id === practitionerId);
      
      if (!practitioner) {
        return res.status(404).json({ message: 'Practitioner not found' });
      }
      
      const newAppointment = {
        _id: req.mockDb.generateId(),
        patientId: patient._id,
        practitionerId,
        type: type || 'consultation',
        appointmentDate: date,
        time,
        status: 'pending',
        notes: notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      req.mockDb.appointments.push(newAppointment);
      req.mockDb.saveData('appointments.json', req.mockDb.appointments);
      
      res.json({
        message: 'Appointment booked successfully',
        appointment: newAppointment
      });
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const appointment = new Appointment({
        patientId: patient._id,
        practitionerId,
        type: type || 'consultation',
        appointmentDate: date,
        time,
        status: 'pending',
        notes: notes || ''
      });
      
      await appointment.save();
      
      res.json({
        message: 'Appointment booked successfully',
        appointment
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create conversation
router.post('/conversations', async (req, res) => {
  try {
    const { practitionerId, subject, message } = req.body;
    
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const newConversation = {
        _id: req.mockDb.generateId(),
        patientId: patient._id,
        practitionerId,
        subject: subject || 'General Inquiry',
        status: 'active',
        lastMessage: message || '',
        lastMessageAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      req.mockDb.conversations.push(newConversation);
      req.mockDb.saveData('conversations.json', req.mockDb.conversations);
      
      // Add initial message
      const newMessage = {
        _id: req.mockDb.generateId(),
        conversationId: newConversation._id,
        senderId: req.user._id,
        senderType: 'patient',
        content: message || '',
        type: 'text',
        createdAt: new Date().toISOString()
      };
      
      req.mockDb.messages.push(newMessage);
      req.mockDb.saveData('messages.json', req.mockDb.messages);
      
      res.json({
        message: 'Conversation created successfully',
        conversation: newConversation
      });
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const conversation = new Conversation({
        patientId: patient._id,
        practitionerId,
        subject: subject || 'General Inquiry',
        status: 'active'
      });
      
      await conversation.save();
      
      // Add initial message
      const messageDoc = new Message({
        conversationId: conversation._id,
        senderId: req.user._id,
        senderType: 'patient',
        content: message || '',
        type: 'text'
      });
      
      await messageDoc.save();
      
      res.json({
        message: 'Conversation created successfully',
        conversation
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get payment methods
router.get('/payment-methods', async (req, res) => {
  try {
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      // Mock payment methods
      const paymentMethods = [
        {
          _id: 'pm1',
          type: 'card',
          last4: '4242',
          brand: 'visa',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: 'pm2',
          type: 'upi',
          upiId: 'patient@paytm',
          isDefault: false,
          createdAt: new Date().toISOString()
        }
      ];
      
      res.json(paymentMethods);
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const paymentMethods = await PaymentMethod.find({ patientId: patient._id })
        .sort({ isDefault: -1, createdAt: -1 });
      
      res.json(paymentMethods);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add payment method
router.post('/payment-methods', async (req, res) => {
  try {
    const { type, cardDetails, upiDetails } = req.body;
    
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const newPaymentMethod = {
        _id: req.mockDb.generateId(),
        patientId: patient._id,
        type,
        ...(type === 'card' ? cardDetails : upiDetails),
        isDefault: false,
        createdAt: new Date().toISOString()
      };
      
      res.json({
        message: 'Payment method added successfully',
        paymentMethod: newPaymentMethod
      });
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const paymentMethod = new PaymentMethod({
        patientId: patient._id,
        type,
        ...(type === 'card' ? cardDetails : upiDetails)
      });
      
      await paymentMethod.save();
      
      res.json({
        message: 'Payment method added successfully',
        paymentMethod
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get payment stats
router.get('/payment-stats', async (req, res) => {
  try {
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      // Mock payment stats
      const stats = {
        totalSpent: 45000,
        thisMonth: 15000,
        lastMonth: 12000,
        totalInvoices: 8,
        paidInvoices: 6,
        pendingInvoices: 2,
        averagePayment: 5625,
        paymentMethods: 2,
        recentTransactions: [
          {
            id: 'txn1',
            amount: 2000,
            type: 'payment',
            status: 'completed',
            date: new Date().toISOString(),
            description: 'Consultation Fee'
          },
          {
            id: 'txn2',
            amount: 1500,
            type: 'payment',
            status: 'completed',
            date: new Date(Date.now() - 86400000).toISOString(),
            description: 'Therapy Session'
          }
        ]
      };
      
      res.json(stats);
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const invoices = await Invoice.find({ patientId: patient._id });
      const payments = await Payment.find({ patientId: patient._id });
      
      const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const thisMonth = payments.filter(p => 
        new Date(p.createdAt).getMonth() === new Date().getMonth()
      ).reduce((sum, payment) => sum + payment.amount, 0);
      
      const stats = {
        totalSpent,
        thisMonth,
        totalInvoices: invoices.length,
        paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
        pendingInvoices: invoices.filter(inv => inv.status === 'pending').length,
        averagePayment: payments.length > 0 ? totalSpent / payments.length : 0,
        paymentMethods: await PaymentMethod.countDocuments({ patientId: patient._id })
      };
      
      res.json(stats);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Pay invoice
router.post('/invoices/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethodId, amount } = req.body;
    
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const invoice = req.mockDb.invoices.find(inv => inv._id === id && inv.patientId === patient._id);
      
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
      
      // Mock payment processing
      const payment = {
        _id: req.mockDb.generateId(),
        invoiceId: id,
        patientId: patient._id,
        amount: amount || invoice.totalAmount,
        paymentMethodId,
        status: 'completed',
        transactionId: 'txn_' + Date.now(),
        createdAt: new Date().toISOString()
      };
      
      // Update invoice status
      invoice.status = 'paid';
      invoice.paidAt = new Date().toISOString();
      
      res.json({
        message: 'Payment processed successfully',
        payment,
        invoice
      });
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const invoice = await Invoice.findOne({ _id: id, patientId: patient._id });
      
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
      
      const payment = new Payment({
        invoiceId: id,
        patientId: patient._id,
        amount: amount || invoice.totalAmount,
        paymentMethodId,
        status: 'completed'
      });
      
      await payment.save();
      
      // Update invoice status
      invoice.status = 'paid';
      invoice.paidAt = new Date();
      await invoice.save();
      
      res.json({
        message: 'Payment processed successfully',
        payment,
        invoice
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Download invoice
router.get('/invoices/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const invoice = req.mockDb.invoices.find(inv => inv._id === id && inv.patientId === patient._id);
      
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
      
      // Mock PDF generation
      const pdfContent = `Invoice #${invoice.invoiceNumber}
Date: ${new Date(invoice.createdAt).toLocaleDateString()}
Amount: ₹${invoice.totalAmount}
Status: ${invoice.status}`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
      res.send(pdfContent);
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const invoice = await Invoice.findOne({ _id: id, patientId: patient._id });
      
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
      
      // Generate PDF (implement PDF generation logic)
      const pdfBuffer = await generateInvoicePDF(invoice);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
      res.send(pdfBuffer);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get vitals
router.get('/vitals', async (req, res) => {
  try {
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      // Mock vitals data
      const vitals = [
        {
          _id: 'vital1',
          patientId: patient._id,
          type: 'blood_pressure',
          value: '120/80',
          unit: 'mmHg',
          recordedAt: new Date().toISOString(),
          notes: 'Normal range'
        },
        {
          _id: 'vital2',
          patientId: patient._id,
          type: 'heart_rate',
          value: '72',
          unit: 'bpm',
          recordedAt: new Date(Date.now() - 86400000).toISOString(),
          notes: 'Resting heart rate'
        },
        {
          _id: 'vital3',
          patientId: patient._id,
          type: 'weight',
          value: '70',
          unit: 'kg',
          recordedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          notes: 'Morning weight'
        }
      ];
      
      res.json(vitals);
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const vitals = await VitalSign.find({ patientId: patient._id })
        .sort({ recordedAt: -1 });
      
      res.json(vitals);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add vital
router.post('/vitals', async (req, res) => {
  try {
    const { type, value, unit, notes } = req.body;
    
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const newVital = {
        _id: req.mockDb.generateId(),
        patientId: patient._id,
        type,
        value,
        unit,
        notes: notes || '',
        recordedAt: new Date().toISOString()
      };
      
      res.json({
        message: 'Vital recorded successfully',
        vital: newVital
      });
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const vital = new VitalSign({
        patientId: patient._id,
        type,
        value,
        unit,
        notes: notes || ''
      });
      
      await vital.save();
      
      res.json({
        message: 'Vital recorded successfully',
        vital
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload medical record
router.post('/medical-records/upload', async (req, res) => {
  try {
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      // Mock file upload
      const newRecord = {
        _id: req.mockDb.generateId(),
        patientId: patient._id,
        type: 'document',
        title: 'Uploaded Document',
        fileName: 'document.pdf',
        fileUrl: '/uploads/document.pdf',
        uploadedAt: new Date().toISOString()
      };
      
      res.json({
        message: 'Document uploaded successfully',
        record: newRecord
      });
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      // Handle file upload (implement file upload logic)
      const uploadedFile = await uploadFile(req.file);
      
      const medicalRecord = new MedicalRecord({
        patientId: patient._id,
        type: 'document',
        title: req.body.title || req.file.originalname,
        fileName: req.file.originalname,
        fileUrl: uploadedFile.url
      });
      
      await medicalRecord.save();
      
      res.json({
        message: 'Document uploaded successfully',
        record: medicalRecord
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Download medical record
router.get('/medical-records/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const record = req.mockDb.medicalRecords.find(r => r._id === id && r.patientId === patient._id);
      
      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
      }
      
      // Mock file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${record.fileName}"`);
      res.send('Mock file content');
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const record = await MedicalRecord.findOne({ _id: id, patientId: patient._id });
      
      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
      }
      
      // Download file from storage
      const fileBuffer = await downloadFile(record.fileUrl);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${record.fileName}"`);
      res.send(fileBuffer);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get documents
router.get('/documents', async (req, res) => {
  try {
    const { folder, type, search } = req.query;
    
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      // Mock documents
      let documents = [
        {
          _id: 'doc1',
          patientId: patient._id,
          title: 'Blood Test Report',
          type: 'lab_report',
          fileName: 'blood_test_2024.pdf',
          fileUrl: '/uploads/blood_test_2024.pdf',
          folder: 'medical_reports',
          size: 245760,
          uploadedAt: new Date().toISOString()
        },
        {
          _id: 'doc2',
          patientId: patient._id,
          title: 'X-Ray Scan',
          type: 'scan',
          fileName: 'xray_chest_2024.pdf',
          fileUrl: '/uploads/xray_chest_2024.pdf',
          folder: 'scans',
          size: 1024000,
          uploadedAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          _id: 'doc3',
          patientId: patient._id,
          title: 'Prescription',
          type: 'prescription',
          fileName: 'prescription_jan_2024.pdf',
          fileUrl: '/uploads/prescription_jan_2024.pdf',
          folder: 'prescriptions',
          size: 128000,
          uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString()
        }
      ];
      
      // Apply filters
      if (folder) {
        documents = documents.filter(doc => doc.folder === folder);
      }
      
      if (type) {
        documents = documents.filter(doc => doc.type === type);
      }
      
      if (search) {
        documents = documents.filter(doc => 
          doc.title.toLowerCase().includes(search.toLowerCase()) ||
          doc.fileName.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      res.json(documents);
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      let query = { patientId: patient._id };
      
      if (folder) {
        query.folder = folder;
      }
      
      if (type) {
        query.type = type;
      }
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { fileName: { $regex: search, $options: 'i' } }
        ];
      }
      
      const documents = await Document.find(query)
        .sort({ uploadedAt: -1 });
      
      res.json(documents);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get document folders
router.get('/document-folders', async (req, res) => {
  try {
    if (req.useMockDb) {
      // Use mock database
      const folders = [
        {
          _id: 'folder1',
          name: 'medical_reports',
          displayName: 'Medical Reports',
          count: 5,
          color: '#3B82F6'
        },
        {
          _id: 'folder2',
          name: 'scans',
          displayName: 'Scans & Images',
          count: 3,
          color: '#10B981'
        },
        {
          _id: 'folder3',
          name: 'prescriptions',
          displayName: 'Prescriptions',
          count: 8,
          color: '#F59E0B'
        },
        {
          _id: 'folder4',
          name: 'insurance',
          displayName: 'Insurance',
          count: 2,
          color: '#EF4444'
        }
      ];
      
      res.json(folders);
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const folders = await Document.aggregate([
        { $match: { patientId: patient._id } },
        { $group: { _id: '$folder', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      const folderData = folders.map(folder => ({
        _id: folder._id,
        name: folder._id,
        displayName: folder._id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count: folder.count,
        color: getFolderColor(folder._id)
      }));
      
      res.json(folderData);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload document
router.post('/documents', async (req, res) => {
  try {
    const { title, type, folder } = req.body;
    
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const newDocument = {
        _id: req.mockDb.generateId(),
        patientId: patient._id,
        title: title || 'Uploaded Document',
        type: type || 'document',
        fileName: req.file?.originalname || 'document.pdf',
        fileUrl: '/uploads/' + (req.file?.filename || 'document.pdf'),
        folder: folder || 'general',
        size: req.file?.size || 0,
        uploadedAt: new Date().toISOString()
      };
      
      res.json({
        message: 'Document uploaded successfully',
        document: newDocument
      });
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      // Handle file upload
      const uploadedFile = await uploadFile(req.file);
      
      const document = new Document({
        patientId: patient._id,
        title: title || req.file.originalname,
        type: type || 'document',
        fileName: req.file.originalname,
        fileUrl: uploadedFile.url,
        folder: folder || 'general',
        size: req.file.size
      });
      
      await document.save();
      
      res.json({
        message: 'Document uploaded successfully',
        document
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Download document
router.get('/documents/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const document = req.mockDb.documents.find(doc => doc._id === id && doc.patientId === patient._id);
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      // Mock file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
      res.send('Mock file content');
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const document = await Document.findOne({ _id: id, patientId: patient._id });
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      // Download file from storage
      const fileBuffer = await downloadFile(document.fileUrl);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
      res.send(fileBuffer);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete document
router.delete('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const documentIndex = req.mockDb.documents.findIndex(doc => doc._id === id && doc.patientId === patient._id);
      
      if (documentIndex === -1) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      req.mockDb.documents.splice(documentIndex, 1);
      req.mockDb.saveData('documents.json', req.mockDb.documents);
      
      res.json({ message: 'Document deleted successfully' });
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const document = await Document.findOneAndDelete({ _id: id, patientId: patient._id });
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      // Delete file from storage
      await deleteFile(document.fileUrl);
      
      res.json({ message: 'Document deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Share document
router.post('/documents/:id/share', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const document = req.mockDb.documents.find(doc => doc._id === id && doc.patientId === patient._id);
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      // Mock share link generation
      const shareUrl = `${process.env.CLIENT_URL}/shared-document/${id}?token=${req.mockDb.generateId()}`;
      
      res.json({
        message: 'Share link generated successfully',
        shareUrl
      });
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const document = await Document.findOne({ _id: id, patientId: patient._id });
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      // Generate share token
      const shareToken = jwt.sign(
        { documentId: id, patientId: patient._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      const shareUrl = `${process.env.CLIENT_URL}/shared-document/${id}?token=${shareToken}`;
      
      res.json({
        message: 'Share link generated successfully',
        shareUrl
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get health tracking data
router.get('/health-tracking', async (req, res) => {
  try {
    const { metric, days } = req.query;
    const timeRange = parseInt(days) || 30;
    
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      // Mock health tracking data
      const data = {
        metric: metric || 'weight',
        timeRange,
        dataPoints: generateMockHealthData(metric || 'weight', timeRange),
        trends: {
          current: 70,
          previous: 72,
          change: -2,
          changePercent: -2.8
        },
        goals: [
          {
            id: 'goal1',
            metric: 'weight',
            target: 65,
            current: 70,
            progress: 71.4
          }
        ]
      };
      
      res.json(data);
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRange);
      
      const healthData = await HealthTracking.find({
        patientId: patient._id,
        metric: metric || 'weight',
        recordedAt: { $gte: startDate }
      }).sort({ recordedAt: 1 });
      
      const data = {
        metric: metric || 'weight',
        timeRange,
        dataPoints: healthData,
        trends: calculateTrends(healthData)
      };
      
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get review stats
router.get('/review-stats', async (req, res) => {
  try {
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      // Mock review stats
      const stats = {
        totalReviews: 5,
        averageRating: 4.2,
        ratingDistribution: {
          5: 2,
          4: 2,
          3: 1,
          2: 0,
          1: 0
        },
        recentReviews: 2,
        helpfulVotes: 8
      };
      
      res.json(stats);
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const reviews = await Review.find({ patientId: patient._id });
      
      const stats = {
        totalReviews: reviews.length,
        averageRating: reviews.length > 0 ? 
          reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0,
        ratingDistribution: calculateRatingDistribution(reviews),
        recentReviews: reviews.filter(r => 
          new Date(r.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length,
        helpfulVotes: reviews.reduce((sum, review) => sum + (review.helpfulVotes || 0), 0)
      };
      
      res.json(stats);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark all notifications as read
router.patch('/notifications/mark-all-read', async (req, res) => {
  try {
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      // Update all notifications for this patient
      req.mockDb.notifications.forEach(notification => {
        if (notification.patientId === patient._id) {
          notification.isRead = true;
        }
      });
      
      req.mockDb.saveData('notifications.json', req.mockDb.notifications);
      
      res.json({ message: 'All notifications marked as read' });
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      await Notification.updateMany(
        { patientId: patient._id, isRead: false },
        { isRead: true }
      );
      
      res.json({ message: 'All notifications marked as read' });
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
      const patient = req.mockDb.patients.find(p => p.userId === req.user._id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const notificationIndex = req.mockDb.notifications.findIndex(notif => 
        notif._id === id && notif.patientId === patient._id
      );
      
      if (notificationIndex === -1) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      req.mockDb.notifications.splice(notificationIndex, 1);
      req.mockDb.saveData('notifications.json', req.mockDb.notifications);
      
      res.json({ message: 'Notification deleted successfully' });
    } else {
      // Use MongoDB
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const notification = await Notification.findOneAndDelete({
        _id: id,
        patientId: patient._id
      });
      
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      res.json({ message: 'Notification deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper functions
function generateMockHealthData(metric, days) {
  const data = [];
  const baseValue = metric === 'weight' ? 70 : metric === 'blood_pressure' ? 120 : 72;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: baseValue + (Math.random() - 0.5) * 4,
      unit: metric === 'weight' ? 'kg' : metric === 'blood_pressure' ? 'mmHg' : 'bpm'
    });
  }
  
  return data;
}

function calculateTrends(dataPoints) {
  if (dataPoints.length < 2) {
    return { current: 0, previous: 0, change: 0, changePercent: 0 };
  }
  
  const current = dataPoints[dataPoints.length - 1].value;
  const previous = dataPoints[0].value;
  const change = current - previous;
  const changePercent = previous !== 0 ? (change / previous) * 100 : 0;
  
  return { current, previous, change, changePercent };
}

function calculateRatingDistribution(reviews) {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  reviews.forEach(review => {
    distribution[review.rating]++;
  });
  
  return distribution;
}

function getFolderColor(folderName) {
  const colors = {
    'medical_reports': '#3B82F6',
    'scans': '#10B981',
    'prescriptions': '#F59E0B',
    'insurance': '#EF4444',
    'general': '#6B7280'
  };
  
  return colors[folderName] || '#6B7280';
}

 export default router;
