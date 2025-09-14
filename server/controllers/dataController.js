import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.join(process.cwd(), 'server/data');

// Generic data controller for CRUD operations
class DataController {
  constructor(fileName) {
    this.fileName = fileName;
    this.filePath = path.join(DATA_DIR, `${fileName}.json`);
  }

  async readData() {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${this.fileName}:`, error);
      return [];
    }
  }

  async writeData(data) {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${this.fileName}:`, error);
      return false;
    }
  }

  // Get all records with optional filtering
  async getAll(req, res) {
    try {
      const data = await this.readData();
      const { practitionerId, patientId, status, type, limit, offset } = req.query;
      
      let filteredData = data;

      // Apply filters
      if (practitionerId) {
        filteredData = filteredData.filter(item => item.practitionerId === practitionerId);
      }
      if (patientId) {
        filteredData = filteredData.filter(item => item.patientId === patientId);
      }
      if (status) {
        filteredData = filteredData.filter(item => item.status === status);
      }
      if (type) {
        filteredData = filteredData.filter(item => item.type === type);
      }

      // Apply pagination
      if (limit) {
        const startIndex = offset ? parseInt(offset) : 0;
        const endIndex = startIndex + parseInt(limit);
        filteredData = filteredData.slice(startIndex, endIndex);
      }

      res.json({
        success: true,
        data: filteredData,
        total: data.length,
        filtered: filteredData.length
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get single record by ID
  async getById(req, res) {
    try {
      const data = await this.readData();
      const item = data.find(record => record.id === req.params.id);
      
      if (!item) {
        return res.status(404).json({ success: false, error: 'Record not found' });
      }

      res.json({ success: true, data: item });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Create new record
  async create(req, res) {
    try {
      const data = await this.readData();
      const newRecord = {
        id: uuidv4(),
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      data.push(newRecord);
      const success = await this.writeData(data);

      if (success) {
        res.status(201).json({ success: true, data: newRecord });
      } else {
        res.status(500).json({ success: false, error: 'Failed to save data' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Update existing record
  async update(req, res) {
    try {
      const data = await this.readData();
      const index = data.findIndex(record => record.id === req.params.id);
      
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Record not found' });
      }

      const updatedRecord = {
        ...data[index],
        ...req.body,
        updatedAt: new Date().toISOString()
      };

      data[index] = updatedRecord;
      const success = await this.writeData(data);

      if (success) {
        res.json({ success: true, data: updatedRecord });
      } else {
        res.status(500).json({ success: false, error: 'Failed to update data' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Delete record
  async delete(req, res) {
    try {
      const data = await this.readData();
      const index = data.findIndex(record => record.id === req.params.id);
      
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Record not found' });
      }

      const deletedRecord = data.splice(index, 1)[0];
      const success = await this.writeData(data);

      if (success) {
        res.json({ success: true, data: deletedRecord });
      } else {
        res.status(500).json({ success: false, error: 'Failed to delete data' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Search records
  async search(req, res) {
    try {
      const data = await this.readData();
      const { query, ...filters } = req.query;
      
      let results = data;

      // Text search across all fields
      if (query) {
        results = results.filter(item =>
          Object.values(item).some(value =>
            value && value.toString().toLowerCase().includes(query.toLowerCase())
          )
        );
      }

      // Apply additional filters
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          results = results.filter(item => 
            item[key] && item[key].toString().toLowerCase().includes(filters[key].toLowerCase())
          );
        }
      });

      res.json({ success: true, data: results });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Bulk operations
  async bulk(req, res) {
    try {
      const { operation, items } = req.body;
      const data = await this.readData();
      let results = [];

      switch (operation) {
        case 'create':
          items.forEach(item => {
            const newRecord = {
              id: uuidv4(),
              ...item,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            data.push(newRecord);
            results.push(newRecord);
          });
          break;

        case 'update':
          items.forEach(item => {
            const index = data.findIndex(record => record.id === item.id);
            if (index !== -1) {
              data[index] = {
                ...data[index],
                ...item,
                updatedAt: new Date().toISOString()
              };
              results.push(data[index]);
            }
          });
          break;

        case 'delete':
          items.forEach(item => {
            const index = data.findIndex(record => record.id === item.id);
            if (index !== -1) {
              results.push(data.splice(index, 1)[0]);
            }
          });
          break;

        default:
          return res.status(400).json({ success: false, error: 'Invalid operation' });
      }

      const success = await this.writeData(data);
      if (success) {
        res.json({ success: true, data: results });
      } else {
        res.status(500).json({ success: false, error: 'Failed to perform bulk operation' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

// Create controllers for each data type
export const appointmentController = new DataController('appointments');
export const patientController = new DataController('patients');
export const practitionerController = new DataController('practitioners');
export const medicalRecordController = new DataController('medicalRecords');
export const therapyPlanController = new DataController('therapyPlans');
export const invoiceController = new DataController('invoices');
export const reviewController = new DataController('reviews');
export const notificationController = new DataController('notifications');
export const userController = new DataController('users');

// Specialized controllers with additional methods
export class AppointmentController extends DataController {
  constructor() {
    super('appointments');
  }

  // Get appointments by date range
  async getByDateRange(req, res) {
    try {
      const { startDate, endDate, practitionerId, patientId } = req.query;
      const data = await this.readData();
      
      let filteredData = data.filter(appointment => {
        const appointmentDate = new Date(appointment.appointmentDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return appointmentDate >= start && appointmentDate <= end;
      });

      if (practitionerId) {
        filteredData = filteredData.filter(apt => apt.practitionerId === practitionerId);
      }
      if (patientId) {
        filteredData = filteredData.filter(apt => apt.patientId === patientId);
      }

      res.json({ success: true, data: filteredData });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get available time slots
  async getAvailableSlots(req, res) {
    try {
      const { practitionerId, date } = req.query;
      const appointments = await this.readData();
      
      // Get practitioner's schedule (this would come from a schedule data file)
      const practitionerSchedule = {
        startTime: '09:00',
        endTime: '18:00',
        slotDuration: 30, // minutes
        breakTime: { start: '13:00', end: '14:00' }
      };

      // Generate all possible slots
      const allSlots = generateTimeSlots(
        practitionerSchedule.startTime,
        practitionerSchedule.endTime,
        practitionerSchedule.slotDuration,
        practitionerSchedule.breakTime
      );

      // Filter out booked slots
      const bookedSlots = appointments
        .filter(apt => 
          apt.practitionerId === practitionerId && 
          apt.appointmentDate.startsWith(date) &&
          apt.status !== 'cancelled'
        )
        .map(apt => new Date(apt.appointmentDate).toTimeString().slice(0, 5));

      const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

      res.json({ success: true, data: availableSlots });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export class PatientController extends DataController {
  constructor() {
    super('patients');
  }

  // Get patient's complete medical history
  async getMedicalHistory(req, res) {
    try {
      const patientId = req.params.id;
      
      // Get data from multiple sources
      const appointments = await new DataController('appointments').readData();
      const medicalRecords = await new DataController('medicalRecords').readData();
      const therapyPlans = await new DataController('therapyPlans').readData();

      const patientAppointments = appointments.filter(apt => apt.patientId === patientId);
      const patientRecords = medicalRecords.filter(record => record.patientId === patientId);
      const patientTherapyPlans = therapyPlans.filter(plan => plan.patientId === patientId);

      const medicalHistory = {
        appointments: patientAppointments,
        medicalRecords: patientRecords,
        therapyPlans: patientTherapyPlans,
        summary: {
          totalAppointments: patientAppointments.length,
          totalRecords: patientRecords.length,
          activePlans: patientTherapyPlans.filter(plan => plan.status === 'active').length
        }
      };

      res.json({ success: true, data: medicalHistory });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

// Helper function to generate time slots
function generateTimeSlots(startTime, endTime, duration, breakTime) {
  const slots = [];
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  const breakStart = breakTime ? parseTime(breakTime.start) : null;
  const breakEnd = breakTime ? parseTime(breakTime.end) : null;

  let current = start;
  while (current < end) {
    const timeString = formatTime(current);
    
    // Skip break time
    if (!breakStart || !breakEnd || current < breakStart || current >= breakEnd) {
      slots.push(timeString);
    }
    
    current += duration;
  }

  return slots;
}

function parseTime(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Export specialized controllers
export const enhancedAppointmentController = new AppointmentController();
export const enhancedPatientController = new PatientController();
