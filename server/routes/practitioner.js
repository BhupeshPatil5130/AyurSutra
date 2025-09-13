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
    let practitioner;
    
    if (req.useMockDb) {
      const practitioners = await req.mockDb.find('practitioners', { userId: req.user._id });
      practitioner = practitioners[0];
      
      if (practitioner) {
        // Add user details to practitioner
        practitioner.userId = {
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: req.user.email,
          phone: req.user.phone,
          avatar: req.user.avatar
        };
      }
    } else {
      practitioner = await Practitioner.findOne({ userId: req.user._id })
        .populate('userId', 'firstName lastName email phone avatar');
    }
    
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
    let practitioner;
    
    if (req.useMockDb) {
      const practitioners = await req.mockDb.find('practitioners', { userId: req.user._id });
      practitioner = practitioners[0];
    } else {
      practitioner = await Practitioner.findOne({ userId: req.user._id });
    }
    
    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner profile not found' });
    }

    const { timeRange = '30d' } = req.query;
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

    let currentPatients, previousPatients, currentAppointments, previousAppointments;
    let currentRevenue, previousRevenue, avgRating, totalReviews;
    let patientSatisfaction = 85, successRate = 92, completionRate;

    if (req.useMockDb) {
      // Use mock database for calculations
      const patients = await req.mockDb.find('patients', { preferredPractitioner: practitioner._id });
      const appointments = await req.mockDb.find('appointments', { practitionerId: practitioner._id });
      const invoices = await req.mockDb.find('invoices', { practitionerId: practitioner._id });
      const reviews = await req.mockDb.find('reviews', { practitionerId: practitioner._id });

      // Calculate patient counts
      currentPatients = patients.filter(p => new Date(p.createdAt) >= dateFilter).length;
      previousPatients = patients.filter(p => {
        const date = new Date(p.createdAt);
        return date >= previousDateFilter && date < dateFilter;
      }).length;

      // Calculate appointment counts
      currentAppointments = appointments.filter(a => new Date(a.createdAt) >= dateFilter).length;
      previousAppointments = appointments.filter(a => {
        const date = new Date(a.createdAt);
        return date >= previousDateFilter && date < dateFilter;
      }).length;

      // Calculate revenue
      const currentPaidInvoices = invoices.filter(i => 
        i.paymentStatus === 'paid' && new Date(i.createdAt) >= dateFilter
      );
      const previousPaidInvoices = invoices.filter(i => {
        const date = new Date(i.createdAt);
        return i.paymentStatus === 'paid' && date >= previousDateFilter && date < dateFilter;
      });

      currentRevenue = currentPaidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      previousRevenue = previousPaidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

      // Calculate rating
      avgRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;
      totalReviews = reviews.length;

      // Calculate completion rate
      const completedAppointments = appointments.filter(a => a.status === 'completed').length;
      completionRate = appointments.length > 0 
        ? Math.round((completedAppointments / appointments.length) * 100)
        : 0;
    } else {
      // Use MongoDB for calculations
      const [
        currentPatientsCount, previousPatientsCount,
        currentAppointmentsCount, previousAppointmentsCount,
        currentRevenueData, previousRevenueData,
        avgRatingData, totalReviewsCount,
        completionRateData
      ] = await Promise.all([
        Patient.countDocuments({ 
          preferredPractitioner: practitioner._id,
          createdAt: { $gte: dateFilter }
        }),
        Patient.countDocuments({ 
          preferredPractitioner: practitioner._id,
          createdAt: { $gte: previousDateFilter, $lt: dateFilter }
        }),
        Appointment.countDocuments({
          practitionerId: practitioner._id,
          createdAt: { $gte: dateFilter }
        }),
        Appointment.countDocuments({
          practitionerId: practitioner._id,
          createdAt: { $gte: previousDateFilter, $lt: dateFilter }
        }),
        Invoice.aggregate([
          {
            $match: {
              practitionerId: practitioner._id,
              paymentStatus: 'paid',
              createdAt: { $gte: dateFilter }
            }
          },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Invoice.aggregate([
          {
            $match: {
              practitionerId: practitioner._id,
              paymentStatus: 'paid',
              createdAt: { $gte: previousDateFilter, $lt: dateFilter }
            }
          },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Review.aggregate([
          { $match: { practitionerId: practitioner._id } },
          { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]),
        Review.countDocuments({ practitionerId: practitioner._id }),
        Appointment.aggregate([
          { $match: { practitionerId: practitioner._id } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
              }
            }
          }
        ])
      ]);

      currentPatients = currentPatientsCount;
      previousPatients = previousPatientsCount;
      currentAppointments = currentAppointmentsCount;
      previousAppointments = previousAppointmentsCount;
      currentRevenue = currentRevenueData[0]?.total || 0;
      previousRevenue = previousRevenueData[0]?.total || 0;
      avgRating = avgRatingData[0]?.avgRating || 0;
      totalReviews = totalReviewsCount;
      
      const completionStats = completionRateData[0];
      completionRate = completionStats 
        ? Math.round((completionStats.completed / completionStats.total) * 100)
        : 0;
    }

    // Get recent reviews for dashboard
    let recentReviews = [];
    if (req.useMockDb) {
      const reviews = await req.mockDb.find('reviews', { practitionerId: practitioner._id });
      recentReviews = reviews
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
    } else {
      recentReviews = await Review.find({ practitionerId: practitioner._id })
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'firstName lastName' }
        })
        .sort({ createdAt: -1 })
        .limit(3);
    }

    const formattedReviews = recentReviews.map(review => ({
      rating: review.rating,
      comment: review.comment,
      patientName: review.isAnonymous 
        ? 'Anonymous Patient' 
        : (req.useMockDb ? review.patientName : `${review.patientId?.userId?.firstName} ${review.patientId?.userId?.lastName}`)
    }));

    res.json({
      totalPatients: {
        current: currentPatients,
        previous: previousPatients
      },
      totalAppointments: {
        current: currentAppointments,
        previous: previousAppointments
      },
      totalRevenue: {
        current: currentRevenue[0]?.total || 0,
        previous: previousRevenue[0]?.total || 0
      },
      avgRating: {
        current: avgRating[0]?.avgRating || 0
      },
      totalReviews,
      patientSatisfaction,
      successRate,
      completionRate: calculatedCompletionRate,
      recentReviews: formattedReviews
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get appointments
router.get('/appointments', async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    
    let practitioner;
    if (req.useMockDb) {
      const practitioners = await req.mockDb.find('practitioners', { userId: req.user._id });
      practitioner = practitioners[0];
    } else {
      practitioner = await Practitioner.findOne({ userId: req.user._id });
    }
    
    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner profile not found' });
    }

    let appointments;
    let total;

    if (req.useMockDb) {
      let allAppointments = await req.mockDb.find('appointments', { practitionerId: practitioner._id });
      
      // Apply filters
      if (status) {
        allAppointments = allAppointments.filter(apt => apt.status === status);
      }
      if (date) {
        const targetDate = new Date(date).toDateString();
        allAppointments = allAppointments.filter(apt => 
          new Date(apt.date).toDateString() === targetDate
        );
      }

      total = allAppointments.length;
      
      // Sort and paginate
      appointments = allAppointments
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice((page - 1) * limit, page * limit);

      // Add patient details
      appointments = appointments.map(apt => ({
        ...apt,
        patientId: {
          userId: {
            firstName: apt.patientName?.split(' ')[0] || 'Unknown',
            lastName: apt.patientName?.split(' ')[1] || 'Patient',
            email: `patient${apt.patientId}@example.com`,
            phone: '+91-9876543210'
          }
        }
      }));
    } else {
      let query = { practitionerId: practitioner._id };
      
      if (status) query.status = status;
      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        query.appointmentDate = { $gte: startDate, $lt: endDate };
      }

      appointments = await Appointment.find(query)
        .populate({
          path: 'patientId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email phone'
          }
        })
        .populate('therapyPlanId')
        .sort({ appointmentDate: -1 })
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get individual patient details
router.get('/patients/:id', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    
    const patient = await Patient.findOne({
      _id: req.params.id,
      preferredPractitioner: practitioner._id
    })
    .populate('userId', 'firstName lastName email phone')
    .populate('medicalHistory');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get patient's appointments
    const appointments = await Appointment.find({ 
      patientId: patient._id,
      practitionerId: practitioner._id 
    })
    .sort({ appointmentDate: -1 })
    .limit(10);

    // Get patient's therapy plans
    const therapyPlans = await TherapyPlan.find({ 
      patientId: patient._id,
      practitionerId: practitioner._id 
    })
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      ...patient.toObject(),
      recentAppointments: appointments,
      therapyPlans
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get patient statistics
router.get('/patients/:id/stats', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    const patientId = req.params.id;
    
    const [totalAppointments, completedAppointments, activeTherapyPlans, totalInvoices, paidInvoices] = await Promise.all([
      Appointment.countDocuments({ 
        patientId, 
        practitionerId: practitioner._id 
      }),
      Appointment.countDocuments({ 
        patientId, 
        practitionerId: practitioner._id,
        status: 'completed' 
      }),
      TherapyPlan.countDocuments({ 
        patientId, 
        practitionerId: practitioner._id,
        status: 'active' 
      }),
      Invoice.countDocuments({ 
        patientId, 
        practitionerId: practitioner._id 
      }),
      Invoice.countDocuments({ 
        patientId, 
        practitionerId: practitioner._id,
        paymentStatus: 'paid' 
      })
    ]);

    res.json({
      totalAppointments,
      completedAppointments,
      activeTherapyPlans,
      totalInvoices,
      paidInvoices,
      completionRate: totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(1) : 0,
      paymentRate: totalInvoices > 0 ? ((paidInvoices / totalInvoices) * 100).toFixed(1) : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Bulk patient actions
router.post('/patients/bulk-action', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    const { patientIds, action } = req.body;
    
    if (!patientIds || !Array.isArray(patientIds) || !action) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    let result;
    switch (action) {
      case 'archive':
        result = await Patient.updateMany(
          { 
            _id: { $in: patientIds },
            preferredPractitioner: practitioner._id 
          },
          { isArchived: true }
        );
        break;
      case 'unarchive':
        result = await Patient.updateMany(
          { 
            _id: { $in: patientIds },
            preferredPractitioner: practitioner._id 
          },
          { isArchived: false }
        );
        break;
      case 'delete':
        result = await Patient.deleteMany({
          _id: { $in: patientIds },
          preferredPractitioner: practitioner._id
        });
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    res.json({
      success: true,
      message: `${action} completed successfully`,
      modifiedCount: result.modifiedCount || result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete patient
router.delete('/patients/:id', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    
    const patient = await Patient.findOneAndDelete({
      _id: req.params.id,
      preferredPractitioner: practitioner._id
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
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

// Mark notification as unread
router.patch('/notifications/:id/unread', async (req, res) => {
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

    notification.isRead = false;
    await notification.save();

    res.json({ 
      success: true,
      message: 'Notification marked as unread' 
    });
  } catch (error) {
    console.error('Mark notification unread error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to mark notification as unread',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Archive notification
router.patch('/notifications/:id/archive', async (req, res) => {
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

    notification.isArchived = true;
    await notification.save();

    res.json({ 
      success: true,
      message: 'Notification archived' 
    });
  } catch (error) {
    console.error('Archive notification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to archive notification',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete notification
router.delete('/notifications/:id', async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Notification deleted' 
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete notification',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Bulk mark notifications as read
router.patch('/notifications/bulk-read', async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid notification IDs provided' 
      });
    }

    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        userId: req.user._id
      },
      { isRead: true }
    );

    res.json({ 
      success: true,
      message: 'Notifications marked as read' 
    });
  } catch (error) {
    console.error('Bulk mark read error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to mark notifications as read',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Bulk archive notifications
router.patch('/notifications/bulk-archive', async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid notification IDs provided' 
      });
    }

    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        userId: req.user._id
      },
      { isArchived: true }
    );

    res.json({ 
      success: true,
      message: 'Notifications archived' 
    });
  } catch (error) {
    console.error('Bulk archive error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to archive notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get availability schedule
router.get('/availability', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    
    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner profile not found' });
    }

    res.json({
      success: true,
      schedule: practitioner.availability || {},
      timezone: practitioner.timezone || 'UTC'
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get availability',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update availability schedule
router.put('/availability', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    
    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner profile not found' });
    }

    const { schedule, timezone } = req.body;
    
    practitioner.availability = schedule;
    if (timezone) practitioner.timezone = timezone;
    
    await practitioner.save();

    res.json({
      success: true,
      message: 'Availability updated successfully',
      schedule: practitioner.availability
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update availability',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Toggle availability status
router.patch('/availability/toggle', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    
    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner profile not found' });
    }

    practitioner.isAvailable = !practitioner.isAvailable;
    await practitioner.save();

    res.json({
      success: true,
      message: `Availability ${practitioner.isAvailable ? 'enabled' : 'disabled'}`,
      isAvailable: practitioner.isAvailable
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to toggle availability',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get time slots
router.get('/time-slots', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    const { start, end } = req.query;
    
    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner profile not found' });
    }

    // Generate time slots based on availability and existing appointments
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const appointments = await Appointment.find({
      practitionerId: practitioner._id,
      appointmentDate: { $gte: startDate, $lte: endDate }
    });

    // Mock time slots generation - in real implementation, this would be more sophisticated
    const timeSlots = [];
    const availability = practitioner.availability || {};
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dayAvailability = availability[dayName];
      
      if (dayAvailability && dayAvailability.isWorking) {
        dayAvailability.slots?.forEach(slot => {
          timeSlots.push({
            date: new Date(date),
            startTime: slot.start,
            endTime: slot.end,
            isAvailable: true,
            breakStart: slot.breakStart,
            breakEnd: slot.breakEnd
          });
        });
      }
    }

    res.json(timeSlots);
  } catch (error) {
    console.error('Get time slots error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get time slots',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get sessions (appointments with session context)
router.get('/sessions', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    const { status, date, page = 1, limit = 10 } = req.query;
    
    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner profile not found' });
    }

    let query = { practitionerId: practitioner._id };
    
    if (status && status !== 'all') query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: startDate, $lte: endDate };
    }

    const sessions = await Appointment.find(query)
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phone'
        }
      })
      .populate('therapyPlanId')
      .sort({ appointmentDate: -1, startTime: 1 })
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
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get sessions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update session status
router.patch('/sessions/:id/status', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    const { status } = req.body;
    
    const session = await Appointment.findOne({
      _id: req.params.id,
      practitionerId: practitioner._id
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.status = status;
    await session.save();

    // Create notification for patient
    const notification = new Notification({
      userId: session.patientId,
      title: 'Session Status Updated',
      message: `Your session status has been updated to: ${status}`,
      type: 'appointment',
      priority: 'medium',
      relatedId: session._id,
      relatedModel: 'Appointment'
    });

    await notification.save();
    req.io.to(session.patientId.toString()).emit('notification', notification);

    res.json({
      success: true,
      message: 'Session status updated successfully',
      session
    });
  } catch (error) {
    console.error('Update session status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update session status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete session
router.delete('/sessions/:id', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    
    const session = await Appointment.findOneAndDelete({
      _id: req.params.id,
      practitionerId: practitioner._id
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Create notification for patient
    const notification = new Notification({
      userId: session.patientId,
      title: 'Session Cancelled',
      message: `Your session scheduled for ${new Date(session.appointmentDate).toLocaleDateString()} has been cancelled`,
      type: 'appointment',
      priority: 'high',
      relatedId: session._id,
      relatedModel: 'Appointment'
    });

    await notification.save();
    req.io.to(session.patientId.toString()).emit('notification', notification);

    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete session',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get revenue statistics
router.get('/revenue/stats', async (req, res) => {
  try {
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
      Invoice.aggregate([
        {
          $match: {
            practitionerId: practitioner._id,
            createdAt: { $gte: dateFilter }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Invoice.aggregate([
        {
          $match: {
            practitionerId: practitioner._id,
            paymentStatus: 'paid',
            createdAt: { $gte: dateFilter }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Invoice.aggregate([
        {
          $match: {
            practitionerId: practitioner._id,
            paymentStatus: 'pending',
            createdAt: { $gte: dateFilter }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Invoice.countDocuments({
        practitionerId: practitioner._id,
        createdAt: { $gte: dateFilter }
      }),
      Invoice.countDocuments({
        practitionerId: practitioner._id,
        paymentStatus: 'paid',
        createdAt: { $gte: dateFilter }
      })
    ]);

    // Get revenue trend data
    const revenueTrend = await Invoice.aggregate([
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

    res.json({
      success: true,
      totalRevenue: totalRevenue[0]?.total || 0,
      paidRevenue: paidRevenue[0]?.total || 0,
      pendingRevenue: pendingRevenue[0]?.total || 0,
      totalInvoices,
      paidInvoices,
      paymentRate: totalInvoices > 0 ? ((paidInvoices / totalInvoices) * 100).toFixed(1) : 0,
      revenueTrend
    });
  } catch (error) {
    console.error('Get revenue stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get revenue statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get revenue transactions
router.get('/revenue/transactions', async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Get revenue transactions error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get revenue transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Start new conversation
router.post('/conversations', async (req, res) => {
  try {
    const { patientId, type = 'direct' } = req.body;
    
    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      'participants.userId': { $all: [req.user._id, patientId] },
      type
    });

    if (existingConversation) {
      return res.json({
        success: true,
        conversation: existingConversation,
        message: 'Conversation already exists'
      });
    }

    const conversation = new Conversation({
      participants: [
        { userId: req.user._id, role: 'practitioner' },
        { userId: patientId, role: 'patient' }
      ],
      type,
      createdBy: req.user._id
    });

    await conversation.save();

    res.status(201).json({
      success: true,
      conversation,
      message: 'Conversation created successfully'
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Mark conversation as read
router.patch('/conversations/:id/read', async (req, res) => {
  try {
    // Mark all messages in conversation as read
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
      success: true,
      message: 'Conversation marked as read'
    });
  } catch (error) {
    console.error('Mark conversation read error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to mark conversation as read',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Reply to review
router.post('/reviews/:id/reply', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    const { reply } = req.body;
    
    const review = await Review.findOne({
      _id: req.params.id,
      practitionerId: practitioner._id
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.practitionerReply = {
      content: reply,
      repliedAt: new Date(),
      repliedBy: req.user._id
    };

    await review.save();

    // Create notification for patient
    const notification = new Notification({
      userId: review.patientId,
      title: 'Review Reply',
      message: 'Your practitioner has replied to your review',
      type: 'general',
      priority: 'medium',
      relatedId: review._id,
      relatedModel: 'Review'
    });

    await notification.save();
    req.io.to(review.patientId.toString()).emit('notification', notification);

    res.json({
      success: true,
      message: 'Reply sent successfully',
      review
    });
  } catch (error) {
    console.error('Reply to review error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to reply to review',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Activate emergency mode
router.post('/emergency-mode', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    
    if (!practitioner) {
      return res.status(404).json({ message: 'Practitioner profile not found' });
    }

    practitioner.emergencyMode = {
      isActive: true,
      activatedAt: new Date(),
      reason: req.body.reason || 'Emergency mode activated'
    };

    await practitioner.save();

    // Create system notification
    const notification = new Notification({
      userId: req.user._id,
      title: 'Emergency Mode Activated',
      message: 'Emergency mode has been activated for your practice',
      type: 'system',
      priority: 'high'
    });

    await notification.save();

    res.json({
      success: true,
      message: 'Emergency mode activated successfully',
      emergencyMode: practitioner.emergencyMode
    });
  } catch (error) {
    console.error('Emergency mode error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to activate emergency mode',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Generate reports
router.post('/reports/generate', async (req, res) => {
  try {
    const practitioner = await Practitioner.findOne({ userId: req.user._id });
    const { type, period, dateRange } = req.body;
    
    let startDate, endDate;
    
    if (dateRange) {
      startDate = new Date(dateRange.start);
      endDate = new Date(dateRange.end);
    } else {
      const now = new Date();
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = now;
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = now;
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          endDate = now;
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          endDate = now;
      }
    }

    let reportData = {};
    
    switch (type) {
      case 'appointments':
        reportData = await Appointment.aggregate([
          {
            $match: {
              practitionerId: practitioner._id,
              createdAt: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);
        break;
      case 'revenue':
        reportData = await Invoice.aggregate([
          {
            $match: {
              practitionerId: practitioner._id,
              createdAt: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: '$paymentStatus',
              totalAmount: { $sum: '$totalAmount' },
              count: { $sum: 1 }
            }
          }
        ]);
        break;
      case 'patients':
        reportData = await Patient.aggregate([
          {
            $match: {
              preferredPractitioner: practitioner._id,
              createdAt: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id': 1 } }
        ]);
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    res.json({
      success: true,
      reportType: type,
      period: { startDate, endDate },
      data: reportData,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
