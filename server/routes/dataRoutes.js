import express from 'express';
import {
  appointmentController,
  patientController,
  practitionerController,
  medicalRecordController,
  therapyPlanController,
  invoiceController,
  reviewController,
  notificationController,
  userController,
  enhancedAppointmentController,
  enhancedPatientController
} from '../controllers/dataController.js';

const router = express.Router();

// Generic CRUD routes for each data type
const createCRUDRoutes = (path, controller) => {
  router.get(`/${path}`, controller.getAll.bind(controller));
  router.get(`/${path}/search`, controller.search.bind(controller));
  router.get(`/${path}/:id`, controller.getById.bind(controller));
  router.post(`/${path}`, controller.create.bind(controller));
  router.put(`/${path}/:id`, controller.update.bind(controller));
  router.delete(`/${path}/:id`, controller.delete.bind(controller));
  router.post(`/${path}/bulk`, controller.bulk.bind(controller));
};

// Create routes for all data types
createCRUDRoutes('appointments', appointmentController);
createCRUDRoutes('patients', patientController);
createCRUDRoutes('practitioners', practitionerController);
createCRUDRoutes('medical-records', medicalRecordController);
createCRUDRoutes('therapy-plans', therapyPlanController);
createCRUDRoutes('invoices', invoiceController);
createCRUDRoutes('reviews', reviewController);
createCRUDRoutes('notifications', notificationController);
createCRUDRoutes('users', userController);

// Specialized appointment routes
router.get('/appointments/date-range', enhancedAppointmentController.getByDateRange.bind(enhancedAppointmentController));
router.get('/appointments/available-slots', enhancedAppointmentController.getAvailableSlots.bind(enhancedAppointmentController));

// Specialized patient routes
router.get('/patients/:id/medical-history', enhancedPatientController.getMedicalHistory.bind(enhancedPatientController));

// Analytics and reporting routes
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const { role, userId } = req.query;
    
    // Get data for analytics
    const appointments = await appointmentController.readData();
    const patients = await patientController.readData();
    const practitioners = await practitionerController.readData();
    const invoices = await invoiceController.readData();

    let analytics = {};

    if (role === 'admin') {
      analytics = {
        totalUsers: patients.length + practitioners.length,
        totalPatients: patients.length,
        totalPractitioners: practitioners.length,
        totalAppointments: appointments.length,
        todayAppointments: appointments.filter(apt => 
          apt.appointmentDate.startsWith(new Date().toISOString().split('T')[0])
        ).length,
        pendingAppointments: appointments.filter(apt => apt.status === 'scheduled').length,
        completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
        totalRevenue: invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
        monthlyRevenue: invoices
          .filter(inv => {
            const invDate = new Date(inv.createdAt);
            const currentMonth = new Date().getMonth();
            return invDate.getMonth() === currentMonth;
          })
          .reduce((sum, inv) => sum + (inv.amount || 0), 0)
      };
    } else if (role === 'practitioner') {
      const practitionerAppointments = appointments.filter(apt => apt.practitionerId === userId);
      const practitionerInvoices = invoices.filter(inv => inv.practitionerId === userId);
      
      analytics = {
        totalPatients: new Set(practitionerAppointments.map(apt => apt.patientId)).size,
        totalAppointments: practitionerAppointments.length,
        todayAppointments: practitionerAppointments.filter(apt => 
          apt.appointmentDate.startsWith(new Date().toISOString().split('T')[0])
        ).length,
        upcomingAppointments: practitionerAppointments.filter(apt => 
          new Date(apt.appointmentDate) > new Date() && apt.status === 'scheduled'
        ).length,
        completedAppointments: practitionerAppointments.filter(apt => apt.status === 'completed').length,
        totalEarnings: practitionerInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
        monthlyEarnings: practitionerInvoices
          .filter(inv => {
            const invDate = new Date(inv.createdAt);
            const currentMonth = new Date().getMonth();
            return invDate.getMonth() === currentMonth;
          })
          .reduce((sum, inv) => sum + (inv.amount || 0), 0)
      };
    } else if (role === 'patient') {
      const patientAppointments = appointments.filter(apt => apt.patientId === userId);
      const patientInvoices = invoices.filter(inv => inv.patientId === userId);
      
      analytics = {
        totalAppointments: patientAppointments.length,
        upcomingAppointments: patientAppointments.filter(apt => 
          new Date(apt.appointmentDate) > new Date() && apt.status === 'scheduled'
        ).length,
        completedAppointments: patientAppointments.filter(apt => apt.status === 'completed').length,
        totalSpent: patientInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
        pendingPayments: patientInvoices
          .filter(inv => inv.paymentStatus === 'pending')
          .reduce((sum, inv) => sum + (inv.amount || 0), 0)
      };
    }

    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export and import routes
router.post('/export', async (req, res) => {
  try {
    const { dataType, format, filters } = req.body;
    const controller = getControllerByType(dataType);
    
    if (!controller) {
      return res.status(400).json({ success: false, error: 'Invalid data type' });
    }

    const data = await controller.readData();
    let filteredData = data;

    // Apply filters if provided
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          filteredData = filteredData.filter(item => 
            item[key] && item[key].toString().toLowerCase().includes(filters[key].toLowerCase())
          );
        }
      });
    }

    // Format data based on requested format
    let exportData;
    switch (format) {
      case 'csv':
        exportData = convertToCSV(filteredData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${dataType}_${new Date().toISOString().split('T')[0]}.csv"`);
        break;
      case 'json':
        exportData = JSON.stringify(filteredData, null, 2);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${dataType}_${new Date().toISOString().split('T')[0]}.json"`);
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid format' });
    }

    res.send(exportData);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Data validation route
router.post('/validate', (req, res) => {
  try {
    const { dataType, data } = req.body;
    const validationRules = getValidationRules(dataType);
    const errors = validateData(data, validationRules);
    
    res.json({
      success: errors.length === 0,
      valid: errors.length === 0,
      errors
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper functions
function getControllerByType(dataType) {
  const controllers = {
    appointments: appointmentController,
    patients: patientController,
    practitioners: practitionerController,
    'medical-records': medicalRecordController,
    'therapy-plans': therapyPlanController,
    invoices: invoiceController,
    reviews: reviewController,
    notifications: notificationController,
    users: userController
  };
  return controllers[dataType];
}

function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

function getValidationRules(dataType) {
  const rules = {
    appointments: {
      patientId: { required: true },
      practitionerId: { required: true },
      appointmentDate: { required: true, type: 'date' },
      type: { required: true },
      status: { required: true }
    },
    patients: {
      name: { required: true, minLength: 2 },
      email: { required: true, type: 'email' },
      phone: { required: true, pattern: /^[+]?91?[6-9]\d{9}$/ },
      age: { required: true, type: 'number', min: 1, max: 120 },
      gender: { required: true }
    },
    practitioners: {
      name: { required: true, minLength: 2 },
      email: { required: true, type: 'email' },
      phone: { required: true, pattern: /^[+]?91?[6-9]\d{9}$/ },
      specialization: { required: true },
      qualification: { required: true },
      licenseNumber: { required: true }
    }
  };
  return rules[dataType] || {};
}

function validateData(data, rules) {
  const errors = [];
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    if (rule.required && (!value || value === '')) {
      errors.push(`${field} is required`);
      return;
    }
    
    if (value) {
      if (rule.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push(`${field} must be a valid email`);
      }
      
      if (rule.type === 'number' && isNaN(value)) {
        errors.push(`${field} must be a number`);
      }
      
      if (rule.min && value < rule.min) {
        errors.push(`${field} must be at least ${rule.min}`);
      }
      
      if (rule.max && value > rule.max) {
        errors.push(`${field} must be at most ${rule.max}`);
      }
      
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`);
      }
      
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(`${field} format is invalid`);
      }
    }
  });
  
  return errors;
}

export default router;
