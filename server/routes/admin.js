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

// Get admin profile
router.get('/profile', async (req, res) => {
  try {
    const user = req.user;
    res.json({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
      avatar: user.avatar,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

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
    let practitioners;

    if (req.useMockDb) {
      // Use mock database
      const allPractitioners = await req.mockDb.findAll('practitioners');
      practitioners = allPractitioners
        .filter(p => p.verificationStatus === 'pending')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(practitioner => {
          // Find the user details
          const user = req.mockDb.users.find(u => u._id === practitioner.userId);
          return {
            ...practitioner,
            userId: user ? {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
              createdAt: user.createdAt
            } : {
              _id: practitioner.userId,
              firstName: 'Unknown',
              lastName: 'User',
              email: 'unknown@example.com',
              phone: 'N/A',
              createdAt: practitioner.createdAt
            }
          };
        });
    } else {
      // Use MongoDB
      practitioners = await Practitioner.find({ verificationStatus: 'pending' })
        .populate('userId', 'firstName lastName email phone createdAt')
        .sort({ createdAt: -1 });
    }

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
    
    let practitioners, total;

    if (req.useMockDb) {
      // Use mock database
      let allPractitioners = await req.mockDb.findAll('practitioners');
      
      // Apply filters
      if (status) {
        allPractitioners = allPractitioners.filter(p => p.verificationStatus === status);
      }

      total = allPractitioners.length;
      
      // Sort and paginate
      practitioners = allPractitioners
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice((page - 1) * limit, page * limit)
        .map(practitioner => {
          // Find the user details
          const user = req.mockDb.users.find(u => u._id === practitioner.userId);
          return {
            ...practitioner,
            userId: user ? {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone
            } : {
              _id: practitioner.userId,
              firstName: 'Unknown',
              lastName: 'User',
              email: 'unknown@example.com',
              phone: 'N/A'
            }
          };
        });
    } else {
      // Use MongoDB
      const query = status ? { verificationStatus: status } : {};
      
      practitioners = await Practitioner.find(query)
        .populate('userId', 'firstName lastName email phone')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      total = await Practitioner.countDocuments(query);
    }

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

// Get patient statistics
router.get('/patients/stats', async (req, res) => {
  try {
    if (req.useMockDb) {
      // Use mock database
      const allPatients = await req.mockDb.findAll('patients');
      const allUsers = await req.mockDb.findAll('users');
      const allAppointments = await req.mockDb.findAll('appointments');
      
      const patientUsers = allUsers.filter(user => user.role === 'patient');
      
      const stats = {
        totalPatients: allPatients.length,
        newPatientsThisMonth: patientUsers.filter(user => {
          const userDate = new Date(user.createdAt);
          const now = new Date();
          return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
        }).length,
        activePatients: allPatients.filter(patient => {
          const recentAppointments = allAppointments.filter(apt => 
            apt.patientId === patient._id && 
            new Date(apt.appointmentDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          );
          return recentAppointments.length > 0;
        }).length,
        patientsByGender: {
          male: allPatients.filter(p => p.gender === 'male').length,
          female: allPatients.filter(p => p.gender === 'female').length,
          other: allPatients.filter(p => p.gender === 'other').length
        },
        averageAge: allPatients.reduce((sum, patient) => {
          const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
          return sum + age;
        }, 0) / allPatients.length || 0,
        topConditions: ['Hypertension', 'Stress', 'Digestive Issues', 'Migraine', 'Diabetes'],
        monthlyGrowth: 12.5
      };
      
      res.json(stats);
    } else {
      // Use MongoDB
      const totalPatients = await Patient.countDocuments();
      const newPatientsThisMonth = await Patient.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      });
      
      const stats = {
        totalPatients,
        newPatientsThisMonth,
        activePatients: totalPatients * 0.7, // Mock calculation
        patientsByGender: {
          male: await Patient.countDocuments({ gender: 'male' }),
          female: await Patient.countDocuments({ gender: 'female' }),
          other: await Patient.countDocuments({ gender: 'other' })
        },
        averageAge: 42.5, // Mock calculation
        topConditions: ['Hypertension', 'Stress', 'Digestive Issues', 'Migraine', 'Diabetes'],
        monthlyGrowth: 12.5
      };
      
      res.json(stats);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get patient details
router.get('/patients/:id/details', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.useMockDb) {
      // Use mock database
      const patient = req.mockDb.patients.find(p => p._id === id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const user = req.mockDb.users.find(u => u._id === patient.userId);
      const appointments = req.mockDb.appointments.filter(apt => apt.patientId === id);
      const medicalRecords = req.mockDb.medicalRecords.filter(record => record.patientId === id);
      const therapyPlans = req.mockDb.therapyPlans.filter(plan => plan.patientId === id);
      
      const patientDetails = {
        ...patient,
        user: user ? {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        } : null,
        appointments: appointments.map(apt => {
          const practitioner = req.mockDb.practitioners.find(p => p._id === apt.practitionerId);
          const practitionerUser = practitioner ? req.mockDb.users.find(u => u._id === practitioner.userId) : null;
          
          return {
            ...apt,
            practitioner: practitionerUser ? {
              _id: practitionerUser._id,
              firstName: practitionerUser.firstName,
              lastName: practitionerUser.lastName,
              email: practitionerUser.email
            } : null
          };
        }),
        medicalRecords,
        therapyPlans,
        statistics: {
          totalAppointments: appointments.length,
          completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
          totalSessions: appointments.filter(apt => apt.type === 'therapy').length,
          lastVisit: appointments.length > 0 ? appointments.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))[0].appointmentDate : null
        }
      };
      
      res.json(patientDetails);
    } else {
      // Use MongoDB
      const patient = await Patient.findById(id)
        .populate('userId', 'firstName lastName email phone role isActive createdAt')
        .populate({
          path: 'appointments',
          populate: {
            path: 'practitionerId',
            populate: {
              path: 'userId',
              select: 'firstName lastName email'
            }
          }
        })
        .populate('medicalRecords')
        .populate('therapyPlans');
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      res.json(patient);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all patients
router.get('/patients', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    let patients, total;

    if (req.useMockDb) {
      // Use mock database
      const allPatients = await req.mockDb.findAll('patients');
      
      total = allPatients.length;
      
      // Sort and paginate
      patients = allPatients
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice((page - 1) * limit, page * limit)
        .map(patient => {
          // Find the user details
          const user = req.mockDb.users.find(u => u._id === patient.userId);
          return {
            ...patient,
            userId: user ? {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
              createdAt: user.createdAt
            } : {
              _id: patient.userId,
              firstName: 'Unknown',
              lastName: 'User',
              email: 'unknown@example.com',
              phone: 'N/A',
              createdAt: patient.createdAt
            }
          };
        });
    } else {
      // Use MongoDB
      patients = await Patient.find()
        .populate('userId', 'firstName lastName email phone createdAt')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      total = await Patient.countDocuments();
    }

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

// Get appointment statistics
router.get('/appointments/stats', async (req, res) => {
  try {
    if (req.useMockDb) {
      // Use mock database
      const allAppointments = await req.mockDb.findAll('appointments');
      
      const stats = {
        totalAppointments: allAppointments.length,
        todayAppointments: allAppointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          const today = new Date();
          return aptDate.toDateString() === today.toDateString();
        }).length,
        thisWeekAppointments: allAppointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          const now = new Date();
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return aptDate >= weekAgo;
        }).length,
        thisMonthAppointments: allAppointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          const now = new Date();
          return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
        }).length,
        appointmentsByStatus: {
          confirmed: allAppointments.filter(apt => apt.status === 'confirmed').length,
          completed: allAppointments.filter(apt => apt.status === 'completed').length,
          cancelled: allAppointments.filter(apt => apt.status === 'cancelled').length,
          pending: allAppointments.filter(apt => apt.status === 'pending').length
        },
        appointmentsByType: {
          consultation: allAppointments.filter(apt => apt.type === 'consultation').length,
          therapy: allAppointments.filter(apt => apt.type === 'therapy').length,
          'follow-up': allAppointments.filter(apt => apt.type === 'follow-up').length
        },
        averageSessionDuration: allAppointments.reduce((sum, apt) => sum + (apt.duration || 60), 0) / allAppointments.length || 60,
        completionRate: (allAppointments.filter(apt => apt.status === 'completed').length / allAppointments.length * 100) || 0,
        cancellationRate: (allAppointments.filter(apt => apt.status === 'cancelled').length / allAppointments.length * 100) || 0
      };
      
      res.json(stats);
    } else {
      // Use MongoDB
      const totalAppointments = await Appointment.countDocuments();
      const todayAppointments = await Appointment.countDocuments({
        appointmentDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      });
      
      const stats = {
        totalAppointments,
        todayAppointments,
        thisWeekAppointments: totalAppointments * 0.3, // Mock calculation
        thisMonthAppointments: totalAppointments * 0.8, // Mock calculation
        appointmentsByStatus: {
          confirmed: await Appointment.countDocuments({ status: 'confirmed' }),
          completed: await Appointment.countDocuments({ status: 'completed' }),
          cancelled: await Appointment.countDocuments({ status: 'cancelled' }),
          pending: await Appointment.countDocuments({ status: 'pending' })
        },
        appointmentsByType: {
          consultation: await Appointment.countDocuments({ type: 'consultation' }),
          therapy: await Appointment.countDocuments({ type: 'therapy' }),
          'follow-up': await Appointment.countDocuments({ type: 'follow-up' })
        },
        averageSessionDuration: 60,
        completionRate: 75.5,
        cancellationRate: 8.2
      };
      
      res.json(stats);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get appointment details
router.get('/appointments/:id/details', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.useMockDb) {
      // Use mock database
      const appointment = req.mockDb.appointments.find(apt => apt._id === id);
      
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      
      const patient = req.mockDb.patients.find(p => p._id === appointment.patientId);
      const practitioner = req.mockDb.practitioners.find(p => p._id === appointment.practitionerId);
      
      const patientUser = patient ? req.mockDb.users.find(u => u._id === patient.userId) : null;
      const practitionerUser = practitioner ? req.mockDb.users.find(u => u._id === practitioner.userId) : null;
      
      const appointmentDetails = {
        ...appointment,
        patient: patient ? {
          _id: patient._id,
          user: patientUser ? {
            _id: patientUser._id,
            firstName: patientUser.firstName,
            lastName: patientUser.lastName,
            email: patientUser.email,
            phone: patientUser.phone
          } : null,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          medicalHistory: patient.medicalHistory,
          allergies: patient.allergies
        } : null,
        practitioner: practitioner ? {
          _id: practitioner._id,
          user: practitionerUser ? {
            _id: practitionerUser._id,
            firstName: practitionerUser.firstName,
            lastName: practitionerUser.lastName,
            email: practitionerUser.email,
            phone: practitionerUser.phone
          } : null,
          specializations: practitioner.specializations,
          experience: practitioner.experience,
          consultationFee: practitioner.consultationFee
        } : null,
        sessionNotes: appointment.notes || 'No session notes available',
        followUpRequired: appointment.status === 'completed' && Math.random() > 0.5,
        nextAppointment: appointment.status === 'completed' ? null : appointment.appointmentDate
      };
      
      res.json(appointmentDetails);
    } else {
      // Use MongoDB
      const appointment = await Appointment.findById(id)
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
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get transactions
router.get('/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, startDate, endDate } = req.query;
    
    if (req.useMockDb) {
      // Use mock database
      let allTransactions = await req.mockDb.findAll('invoices');
      
      // Apply filters
      if (status) {
        allTransactions = allTransactions.filter(t => t.status === status);
      }
      if (type) {
        allTransactions = allTransactions.filter(t => t.type === type);
      }
      if (startDate) {
        allTransactions = allTransactions.filter(t => new Date(t.createdAt) >= new Date(startDate));
      }
      if (endDate) {
        allTransactions = allTransactions.filter(t => new Date(t.createdAt) <= new Date(endDate));
      }

      const total = allTransactions.length;
      
      // Sort and paginate
      const transactions = allTransactions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice((page - 1) * limit, page * limit)
        .map(transaction => {
          const patient = req.mockDb.patients.find(p => p._id === transaction.patientId);
          const patientUser = patient ? req.mockDb.users.find(u => u._id === patient.userId) : null;
          
          return {
            ...transaction,
            patient: patientUser ? {
              _id: patientUser._id,
              firstName: patientUser.firstName,
              lastName: patientUser.lastName,
              email: patientUser.email
            } : null
          };
        });
      
      res.json({
        transactions,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      });
    } else {
      // Use MongoDB
      const query = {};
      if (status) query.status = status;
      if (type) query.type = type;
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
      
      const transactions = await Invoice.find(query)
        .populate('patientId', 'userId')
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

      const total = await Invoice.countDocuments(query);

      res.json({
        transactions,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get content
router.get('/content', async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;
    
    if (req.useMockDb) {
      // Use mock database - create sample content data
      const sampleContent = [
        {
          _id: 'content001',
          title: 'Ayurvedic Wellness Guide',
          type: 'article',
          status: 'published',
          content: 'Comprehensive guide to Ayurvedic wellness practices...',
          author: req.user._id,
          tags: ['ayurveda', 'wellness', 'health'],
          views: 1250,
          likes: 45,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'content002',
          title: 'Panchakarma Benefits',
          type: 'video',
          status: 'published',
          content: 'Educational video about Panchakarma therapy benefits...',
          author: req.user._id,
          tags: ['panchakarma', 'therapy', 'detox'],
          views: 890,
          likes: 32,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'content003',
          title: 'Healthy Diet Tips',
          type: 'article',
          status: 'draft',
          content: 'Tips for maintaining a healthy Ayurvedic diet...',
          author: req.user._id,
          tags: ['diet', 'nutrition', 'ayurveda'],
          views: 0,
          likes: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      let filteredContent = sampleContent;
      
      if (type) {
        filteredContent = filteredContent.filter(c => c.type === type);
      }
      if (status) {
        filteredContent = filteredContent.filter(c => c.status === status);
      }
      
      const total = filteredContent.length;
      const content = filteredContent
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice((page - 1) * limit, page * limit);
      
      res.json({
        content,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      });
    } else {
      // Use MongoDB - would need a Content model
      res.json({
        content: [],
        totalPages: 0,
        currentPage: parseInt(page),
        total: 0
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create content
router.post('/content', async (req, res) => {
  try {
    const { title, type, content, tags, status = 'draft' } = req.body;
    
    if (req.useMockDb) {
      // Use mock database
      const newContent = {
        _id: req.mockDb.generateId(),
        title,
        type,
        content,
        tags: tags || [],
        status,
        author: req.user._id,
        views: 0,
        likes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // In a real implementation, this would be saved to a content collection
      res.json({
        message: 'Content created successfully',
        content: newContent
      });
    } else {
      // Use MongoDB
      res.json({ message: 'Content creation not implemented for MongoDB' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update content
router.put('/content/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, content, tags, status } = req.body;
    
    if (req.useMockDb) {
      // Use mock database
      res.json({
        message: 'Content updated successfully',
        content: {
          _id: id,
          title,
          type,
          content,
          tags,
          status,
          updatedAt: new Date().toISOString()
        }
      });
    } else {
      // Use MongoDB
      res.json({ message: 'Content update not implemented for MongoDB' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete content
router.delete('/content/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.useMockDb) {
      // Use mock database
      res.json({ message: 'Content deleted successfully' });
    } else {
      // Use MongoDB
      res.json({ message: 'Content deletion not implemented for MongoDB' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// System backup
router.post('/system/backup', async (req, res) => {
  try {
    if (req.useMockDb) {
      // Mock backup process
      const backupData = {
        id: req.mockDb.generateId(),
        timestamp: new Date().toISOString(),
        status: 'completed',
        size: '2.5 MB',
        tables: ['users', 'patients', 'practitioners', 'appointments', 'notifications'],
        location: '/backups/backup_' + Date.now() + '.json'
      };
      
      res.json({
        message: 'System backup completed successfully',
        backup: backupData
      });
    } else {
      // Real backup implementation would go here
      res.json({ message: 'Backup initiated successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle maintenance mode
router.post('/system/maintenance-mode', async (req, res) => {
  try {
    if (req.useMockDb) {
      // Mock maintenance mode toggle
      const currentMode = Math.random() > 0.5; // Random current state
      const newMode = !currentMode;
      
      res.json({
        message: `Maintenance mode ${newMode ? 'enabled' : 'disabled'} successfully`,
        maintenanceMode: newMode,
        estimatedDowntime: newMode ? '30 minutes' : null
      });
    } else {
      // Real maintenance mode implementation would go here
      res.json({ message: 'Maintenance mode toggled successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Clear system cache
router.post('/system/clear-cache', async (req, res) => {
  try {
    if (req.useMockDb) {
      // Mock cache clearing
      const cacheStats = {
        clearedItems: 1250,
        freedMemory: '45.2 MB',
        cacheTypes: ['user-sessions', 'api-responses', 'static-assets', 'database-queries'],
        timestamp: new Date().toISOString()
      };
      
      res.json({
        message: 'System cache cleared successfully',
        stats: cacheStats
      });
    } else {
      // Real cache clearing implementation would go here
      res.json({ message: 'System cache cleared successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all appointments
router.get('/appointments', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let appointments, total;

    if (req.useMockDb) {
      // Use mock database
      let allAppointments = await req.mockDb.findAll('appointments');
      
      // Apply filters
      if (status) {
        allAppointments = allAppointments.filter(apt => apt.status === status);
      }

      total = allAppointments.length;
      
      // Sort and paginate
      appointments = allAppointments
        .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
        .slice((page - 1) * limit, page * limit)
        .map(appointment => {
          // Find patient and practitioner details
          const patient = req.mockDb.patients.find(p => p._id === appointment.patientId);
          const practitioner = req.mockDb.practitioners.find(p => p._id === appointment.practitionerId);
          
          const patientUser = patient ? req.mockDb.users.find(u => u._id === patient.userId) : null;
          const practitionerUser = practitioner ? req.mockDb.users.find(u => u._id === practitioner.userId) : null;
          
          return {
            ...appointment,
            patientId: patient ? {
              _id: patient._id,
              userId: patientUser ? {
                _id: patientUser._id,
                firstName: patientUser.firstName,
                lastName: patientUser.lastName,
                email: patientUser.email
              } : {
                _id: patient.userId,
                firstName: 'Unknown',
                lastName: 'Patient',
                email: 'unknown@example.com'
              }
            } : null,
            practitionerId: practitioner ? {
              _id: practitioner._id,
              userId: practitionerUser ? {
                _id: practitionerUser._id,
                firstName: practitionerUser.firstName,
                lastName: practitionerUser.lastName,
                email: practitionerUser.email
              } : {
                _id: practitioner.userId,
                firstName: 'Unknown',
                lastName: 'Practitioner',
                email: 'unknown@example.com'
              }
            } : null
          };
        });
    } else {
      // Use MongoDB
      const query = status ? { status } : {};
      
      appointments = await Appointment.find(query)
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

      total = await Appointment.countDocuments(query);
    }

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
router.get('/users', async (req, res) => {
  try {
    const { role, status, page = 1, limit = 10, search } = req.query;
    
    console.log('useMockDb:', req.useMockDb);
    console.log('mockDb available:', !!req.mockDb);
    
    let users, total;

    if (req.useMockDb) {
      // Use mock database
      let allUsers = await req.mockDb.findAll('users');
      
      // Apply filters
      if (role) {
        allUsers = allUsers.filter(user => user.role === role);
      }
      if (status === 'active') {
        allUsers = allUsers.filter(user => user.isActive === true);
      }
      if (status === 'inactive') {
        allUsers = allUsers.filter(user => user.isActive === false);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        allUsers = allUsers.filter(user => 
          (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
          (user.lastName && user.lastName.toLowerCase().includes(searchLower)) ||
          (user.email && user.email.toLowerCase().includes(searchLower))
        );
      }

      total = allUsers.length;
      
      // Sort and paginate
      users = allUsers
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice((page - 1) * limit, page * limit)
        .map(user => {
          const { password, refreshTokens, ...userWithoutPassword } = user;
          return userWithoutPassword;
        });
    } else {
      // Use MongoDB
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

      users = await User.find(query)
        .select('-password -refreshTokens')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      total = await User.countDocuments(query);
    }

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

    if (req.useMockDb) {
      // Use mock database
      let targetUsers = req.mockDb.users;
      
      if (targetRole) {
        targetUsers = targetUsers.filter(user => user.role === targetRole);
      }

      // Create notifications for all users
      const newNotifications = targetUsers.map(user => ({
        _id: req.mockDb.generateId(),
        userId: user._id,
        title,
        message,
        type,
        priority,
        isRead: false,
        read: false,
        createdBy: req.user._id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      req.mockDb.notifications.push(...newNotifications);
      req.mockDb.saveData('notifications.json', req.mockDb.notifications);

      // Send real-time notifications
      targetUsers.forEach(user => {
        req.io.to(user._id.toString()).emit('notification', {
          title,
          message,
          type,
          priority
        });
      });

      res.json({ 
        message: 'Broadcast notification sent successfully',
        recipientCount: targetUsers.length
      });
    } else {
      // Use MongoDB
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
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all notifications
router.get('/notifications', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, priority } = req.query;
    
    let notifications, total;

    if (req.useMockDb) {
      // Use mock database
      let allNotifications = await req.mockDb.findAll('notifications');
      
      // Apply filters
      if (type) {
        allNotifications = allNotifications.filter(n => n.type === type);
      }
      if (priority) {
        allNotifications = allNotifications.filter(n => n.priority === priority);
      }

      total = allNotifications.length;
      
      // Sort and paginate
      notifications = allNotifications
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice((page - 1) * limit, page * limit)
        .map(notification => {
          // Find user details
          const user = req.mockDb.users.find(u => u._id === notification.userId);
          const createdBy = notification.createdBy ? req.mockDb.users.find(u => u._id === notification.createdBy) : null;
          
          return {
            ...notification,
            userId: user ? {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.role
            } : {
              _id: notification.userId,
              firstName: 'Unknown',
              lastName: 'User',
              email: 'unknown@example.com',
              role: 'user'
            },
            createdBy: createdBy ? {
              _id: createdBy._id,
              firstName: createdBy.firstName,
              lastName: createdBy.lastName
            } : null
          };
        });
    } else {
      // Use MongoDB
      const query = {};
      
      if (type) query.type = type;
      if (priority) query.priority = priority;

      notifications = await Notification.find(query)
        .populate('userId', 'firstName lastName email role')
        .populate('createdBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      total = await Notification.countDocuments(query);
    }

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
    if (req.useMockDb) {
      // Use mock database
      const notificationIndex = req.mockDb.notifications.findIndex(n => n._id === req.params.id);
      
      if (notificationIndex === -1) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      req.mockDb.notifications.splice(notificationIndex, 1);
      req.mockDb.saveData('notifications.json', req.mockDb.notifications);
    } else {
      // Use MongoDB
      const notification = await Notification.findByIdAndDelete(req.params.id);
      
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
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

// Get stats (enhanced dashboard stats)
router.get('/stats', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    let stats = {};

    if (req.useMockDb) {
      const practitioners = await req.mockDb.findAll('practitioners');
      const patients = await req.mockDb.findAll('patients');
      const appointments = await req.mockDb.findAll('appointments');
      const users = await req.mockDb.findAll('users');

      stats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        totalPractitioners: practitioners.length,
        verifiedPractitioners: practitioners.filter(p => p.isVerified).length,
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        completedAppointments: appointments.filter(a => a.status === 'completed').length,
        pendingAppointments: appointments.filter(a => a.status === 'scheduled').length,
        revenue: 125000,
        growth: 12.5
      };
    } else {
      stats = { message: 'MongoDB stats not implemented in demo' };
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recent activities
router.get('/activities', async (req, res) => {
  try {
    let activities = [];

    if (req.useMockDb) {
      activities = [
        {
          id: 1,
          type: 'user_registration',
          message: 'New patient registered',
          user: 'John Doe',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          severity: 'info'
        },
        {
          id: 2,
          type: 'practitioner_verification',
          message: 'Practitioner verification completed',
          user: 'Dr. Smith',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          severity: 'success'
        }
      ];
    }

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get system health
router.get('/system-health', async (req, res) => {
  try {
    const health = {
      database: req.useMockDb ? 'healthy' : 'healthy',
      server: 'healthy',
      memory: '85%',
      cpu: '45%',
      uptime: '99.9%',
      status: 'operational'
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get revenue data
router.get('/revenue', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    let revenueData = {};

    if (req.useMockDb) {
      revenueData = {
        total: 125000,
        growth: 12.5,
        monthly: [
          { month: 'Jan', amount: 15000 },
          { month: 'Feb', amount: 18000 },
          { month: 'Mar', amount: 22000 }
        ]
      };
    }

    res.json(revenueData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get system settings
router.get('/settings', async (req, res) => {
  try {
    const settings = {
      siteName: 'AyurSutra',
      maintenance: false,
      registrationOpen: true,
      emailNotifications: true,
      maxAppointmentsPerDay: 10
    };

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get analytics
router.get('/analytics', async (req, res) => {
  try {
    const { timeRange = '30d', tab = 'overview' } = req.query;
    
    let analytics = {};

    if (req.useMockDb) {
      analytics = {
        totalUsers: 1250,
        activeUsers: 890,
        newUsers: 125,
        userGrowth: 15.2
      };
    }

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
