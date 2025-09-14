// Mock database for development when MongoDB Atlas is not accessible
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MockDatabase {
  constructor() {
    this.dataPath = path.join(__dirname, '../data');
    this.ensureDataDirectory();
    this.users = this.loadData('users.json', []);
    this.appointments = this.loadData('appointments.json', []);
    this.practitioners = this.loadData('practitioners.json', []);
    this.patients = this.loadData('patients.json', []);
    this.notifications = this.loadData('notifications.json', []);
    this.conversations = this.loadData('conversations.json', []);
    this.messages = this.loadData('messages.json', []);
    this.therapyPlans = this.loadData('therapyPlans.json', []);
    this.medicalRecords = this.loadData('medicalRecords.json', []);
    this.invoices = this.loadData('invoices.json', []);
    this.reviews = this.loadData('reviews.json', []);
    this.paymentMethods = this.loadData('paymentMethods.json', []);
    this.payments = this.loadData('payments.json', []);
    this.vitalSigns = this.loadData('vitalSigns.json', []);
    this.documents = this.loadData('documents.json', []);
    this.healthTracking = this.loadData('healthTracking.json', []);
    this.healthGoals = this.loadData('healthGoals.json', []);
    this.therapySessions = this.loadData('therapySessions.json', []);
    this.dietItems = this.loadData('dietItems.json', []);
    
    this.initializeDemoData();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
  }

  loadData(filename, defaultValue = []) {
    const filePath = path.join(this.dataPath, filename);
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.log(`Error loading ${filename}:`, error.message);
    }
    return defaultValue;
  }

  saveData(filename, data) {
    const filePath = path.join(this.dataPath, filename);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.log(`Error saving ${filename}:`, error.message);
    }
  }

  initializeDemoData() {
    if (this.users.length === 0) {
      const now = new Date().toISOString();
      
      // Initialize Users
      this.users = [
        {
          _id: '507f1f77bcf86cd799439011',
          name: 'Admin User',
          firstName: 'Admin',
          lastName: 'User',
          fullName: 'Admin User',
          email: 'admin@panchakarma.com',
          password: '$2a$10$J1Fb.4OQ0hTTutYttPNOyOpGOMOxv0uD.zbTEc8W6CYSI4Hx.sTTK', // demo123
          role: 'admin',
          isVerified: true,
          isActive: true,
          phone: '+91-9876543210',
          notificationPreferences: {
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
          },
          createdAt: now,
          updatedAt: now
        },
        {
          _id: '507f1f77bcf86cd799439012',
          name: 'Dr. Rajesh Sharma',
          firstName: 'Dr. Rajesh',
          lastName: 'Sharma',
          fullName: 'Dr. Rajesh Sharma',
          email: 'practitioner@panchakarma.com',
          password: '$2a$10$J1Fb.4OQ0hTTutYttPNOyOpGOMOxv0uD.zbTEc8W6CYSI4Hx.sTTK', // demo123
          role: 'practitioner',
          isVerified: true,
          isActive: true,
          specialization: 'Panchakarma Specialist',
          experience: 10,
          location: 'Mumbai',
          consultationFee: 1500,
          phone: '+91-9876543211',
          notificationPreferences: {
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
          },
          createdAt: now,
          updatedAt: now
        },
        {
          _id: '507f1f77bcf86cd799439013',
          name: 'Amit Patel',
          firstName: 'Amit',
          lastName: 'Patel',
          fullName: 'Amit Patel',
          email: 'patient@panchakarma.com',
          password: '$2a$10$J1Fb.4OQ0hTTutYttPNOyOpGOMOxv0uD.zbTEc8W6CYSI4Hx.sTTK', // demo123
          role: 'patient',
          isVerified: true,
          isActive: true,
          age: 35,
          gender: 'male',
          phone: '+91-9876543212',
          notificationPreferences: {
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
          },
          createdAt: now,
          updatedAt: now
        },
        {
          _id: '507f1f77bcf86cd799439014',
          name: 'Dr. Priya Mehta',
          firstName: 'Dr. Priya',
          lastName: 'Mehta',
          fullName: 'Dr. Priya Mehta',
          email: 'priya.mehta@panchakarma.com',
          password: '$2a$10$J1Fb.4OQ0hTTutYttPNOyOpGOMOxv0uD.zbTEc8W6CYSI4Hx.sTTK', // demo123
          role: 'practitioner',
          isVerified: true,
          isActive: true,
          specialization: 'Ayurvedic Medicine',
          experience: 8,
          location: 'Delhi',
          consultationFee: 1200,
          phone: '+91-9876543213',
          notificationPreferences: {
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
          },
          createdAt: now,
          updatedAt: now
        },
        {
          _id: '507f1f77bcf86cd799439015',
          name: 'Sunita Gupta',
          firstName: 'Sunita',
          lastName: 'Gupta',
          fullName: 'Sunita Gupta',
          email: 'sunita.gupta@panchakarma.com',
          password: '$2a$10$J1Fb.4OQ0hTTutYttPNOyOpGOMOxv0uD.zbTEc8W6CYSI4Hx.sTTK', // demo123
          role: 'patient',
          isVerified: true,
          isActive: true,
          age: 42,
          gender: 'female',
          phone: '+91-9876543214',
          notificationPreferences: {
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
          },
          createdAt: now,
          updatedAt: now
        }
      ];
      this.saveData('users.json', this.users);

      // Initialize Appointments
      this.appointments = [
        {
          _id: 'apt001',
          patientId: 'pat001',
          practitionerId: 'prac001',
          patientName: 'Amit Patel',
          practitionerName: 'Dr. Rajesh Sharma',
          appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          startTime: '10:00',
          endTime: '11:00',
          duration: 60,
          type: 'consultation',
          status: 'confirmed',
          notes: 'Initial consultation for stress management',
          fee: 1500,
          createdAt: now,
          updatedAt: now
        },
        {
          _id: 'apt002',
          patientId: 'pat002',
          practitionerId: 'prac002',
          patientName: 'Sunita Gupta',
          practitionerName: 'Dr. Priya Mehta',
          appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
          startTime: '14:30',
          endTime: '15:15',
          duration: 45,
          type: 'follow-up',
          status: 'confirmed',
          notes: 'Follow-up for digestive issues treatment',
          fee: 1200,
          createdAt: now,
          updatedAt: now
        },
        {
          _id: 'apt003',
          patientId: 'pat001',
          practitionerId: 'prac001',
          patientName: 'Amit Patel',
          practitionerName: 'Dr. Rajesh Sharma',
          appointmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last week
          startTime: '11:00',
          endTime: '12:00',
          duration: 60,
          type: 'therapy',
          status: 'completed',
          notes: 'Abhyanga massage therapy session',
          fee: 1500,
          createdAt: now,
          updatedAt: now
        }
      ];
      this.saveData('appointments.json', this.appointments);

      // Initialize Practitioners
      this.practitioners = [
        {
          _id: 'prac001',
          userId: '507f1f77bcf86cd799439012',
          licenseNumber: 'AYU12345',
          specializations: ['Panchakarma', 'Stress Management', 'Detoxification'],
          experience: 10,
          consultationFee: 1500,
          location: 'Mumbai',
          bio: 'Experienced Ayurvedic practitioner specializing in Panchakarma therapies',
          education: ['BAMS - Mumbai University', 'MD Ayurveda - Gujarat Ayurved University'],
          certifications: ['Panchakarma Specialist', 'Ayurvedic Medicine'],
          availability: [
            { day: 'Monday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
            { day: 'Tuesday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
            { day: 'Wednesday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
            { day: 'Thursday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
            { day: 'Friday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] }
          ],
          rating: 4.8,
          totalReviews: 156,
          isVerified: true,
          createdAt: now,
          updatedAt: now
        },
        {
          _id: 'prac002',
          userId: '507f1f77bcf86cd799439014',
          licenseNumber: 'AYU67890',
          specializations: ['Ayurvedic Medicine', 'Women Health', 'Digestive Disorders'],
          experience: 8,
          consultationFee: 1200,
          location: 'Delhi',
          bio: 'Dedicated to womens health and digestive wellness through Ayurveda',
          education: ['BAMS - Delhi University', 'PG Diploma in Ayurvedic Medicine'],
          certifications: ['Ayurvedic Medicine', 'Womens Health Specialist'],
          availability: [
            { day: 'Monday', slots: ['10:00', '11:00', '14:00', '15:00', '16:00'] },
            { day: 'Tuesday', slots: ['10:00', '11:00', '14:00', '15:00', '16:00'] },
            { day: 'Wednesday', slots: ['10:00', '11:00', '14:00', '15:00', '16:00'] },
            { day: 'Thursday', slots: ['10:00', '11:00', '14:00', '15:00', '16:00'] },
            { day: 'Saturday', slots: ['09:00', '10:00', '11:00', '12:00'] }
          ],
          rating: 4.6,
          totalReviews: 89,
          isVerified: true,
          createdAt: now,
          updatedAt: now
        }
      ];
      this.saveData('practitioners.json', this.practitioners);

      // Initialize Patients
      this.patients = [
        {
          _id: 'pat001',
          userId: '507f1f77bcf86cd799439013',
          dateOfBirth: '1988-05-15',
          gender: 'male',
          bloodGroup: 'O+',
          height: 175,
          weight: 70,
          emergencyContact: {
            name: 'Priya Patel',
            relationship: 'Wife',
            phone: '+91-9876543220'
          },
          medicalHistory: ['Hypertension', 'Stress'],
          allergies: ['Peanuts'],
          currentMedications: [],
          lifestyle: {
            diet: 'Vegetarian',
            exercise: 'Moderate',
            smoking: false,
            alcohol: 'Occasional'
          },
          createdAt: now,
          updatedAt: now
        },
        {
          _id: 'pat002',
          userId: '507f1f77bcf86cd799439015',
          dateOfBirth: '1981-08-22',
          gender: 'female',
          bloodGroup: 'A+',
          height: 160,
          weight: 65,
          emergencyContact: {
            name: 'Rajesh Gupta',
            relationship: 'Husband',
            phone: '+91-9876543221'
          },
          medicalHistory: ['Digestive Issues', 'Migraine'],
          allergies: [],
          currentMedications: ['Ayurvedic digestive tablets'],
          lifestyle: {
            diet: 'Vegetarian',
            exercise: 'Light',
            smoking: false,
            alcohol: 'Never'
          },
          createdAt: now,
          updatedAt: now
        }
      ];
      this.saveData('patients.json', this.patients);

      // Initialize Therapy Plans
      this.therapyPlans = [
        {
          _id: 'tp001',
          patientId: 'pat001',
          practitionerId: 'prac001',
          title: 'Stress Management & Detox Program',
          description: 'Comprehensive 21-day Panchakarma program for stress relief and detoxification',
          duration: 21,
          startDate: now,
          status: 'active',
          sessions: [
            {
              day: 1,
              therapy: 'Abhyanga',
              duration: 60,
              notes: 'Full body oil massage with warm sesame oil',
              completed: true
            },
            {
              day: 2,
              therapy: 'Shirodhara',
              duration: 45,
              notes: 'Continuous oil pouring on forehead for mental relaxation',
              completed: false
            },
            {
              day: 3,
              therapy: 'Udvartana',
              duration: 60,
              notes: 'Herbal powder massage for weight management',
              completed: false
            }
          ],
          dietPlan: {
            breakfast: 'Warm lemon water, oats with fruits',
            lunch: 'Rice, dal, vegetables, buttermilk',
            dinner: 'Light khichdi with ghee',
            restrictions: ['No spicy food', 'No cold drinks', 'No processed food']
          },
          medications: [
            {
              name: 'Triphala Churna',
              dosage: '1 tsp with warm water',
              timing: 'Before bed',
              duration: '21 days'
            }
          ],
          progress: 15,
          createdAt: now,
          updatedAt: now
        }
      ];
      this.saveData('therapyPlans.json', this.therapyPlans);

      // Initialize Medical Records
      this.medicalRecords = [
        {
          _id: 'mr001',
          patientId: 'pat001',
          practitionerId: 'prac001',
          appointmentId: 'apt003',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          chiefComplaint: 'Chronic stress and fatigue',
          symptoms: ['Headache', 'Sleep disturbance', 'Digestive issues'],
          diagnosis: 'Vata imbalance due to stress',
          treatment: 'Abhyanga massage with Mahanarayan oil',
          prescription: [
            {
              medicine: 'Saraswatarishta',
              dosage: '15ml twice daily',
              duration: '15 days'
            }
          ],
          vitalSigns: {
            bloodPressure: '130/85',
            pulse: 78,
            temperature: 98.6,
            weight: 70
          },
          followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: now,
          updatedAt: now
        }
      ];
      this.saveData('medicalRecords.json', this.medicalRecords);

      // Initialize Notifications
      this.notifications = [
        {
          _id: 'not001',
          userId: '507f1f77bcf86cd799439013',
          title: 'Appointment Reminder',
          message: 'Your appointment with Dr. Rajesh Sharma is tomorrow at 10:00 AM',
          type: 'appointment',
          priority: 'high',
          isRead: false,
          read: false,
          createdAt: now
        },
        {
          _id: 'not002',
          userId: '507f1f77bcf86cd799439012',
          title: 'New Patient Registration',
          message: 'A new patient has registered and is requesting consultation',
          type: 'patient',
          priority: 'medium',
          isRead: false,
          read: false,
          createdAt: now
        },
        {
          _id: 'not003',
          userId: '507f1f77bcf86cd799439015',
          title: 'Therapy Plan Updated',
          message: 'Your therapy plan has been updated with new sessions',
          type: 'therapy',
          priority: 'medium',
          isRead: true,
          read: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      this.saveData('notifications.json', this.notifications);

      // Initialize Reviews
      this.reviews = [
        {
          _id: 'rev001',
          patientId: 'pat001',
          practitionerId: 'prac001',
          appointmentId: 'apt003',
          rating: 5,
          comment: 'Excellent treatment! Dr. Sharma is very knowledgeable and the therapy was very effective.',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: 'rev002',
          patientId: 'pat002',
          practitionerId: 'prac002',
          rating: 4,
          comment: 'Dr. Priya is very caring and her treatment approach is holistic. Highly recommended!',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      this.saveData('reviews.json', this.reviews);

      // Initialize Invoices
      this.invoices = [
        {
          _id: 'inv001',
          patientId: 'pat001',
          practitionerId: 'prac001',
          appointmentId: 'apt003',
          invoiceNumber: 'INV-2024-001',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          items: [
            {
              description: 'Consultation Fee',
              quantity: 1,
              rate: 1500,
              amount: 1500
            }
          ],
          subtotal: 1500,
          tax: 270,
          totalAmount: 1770,
          total: 1770,
          status: 'paid',
          paymentStatus: 'paid',
          paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          paymentMethod: 'UPI',
          createdAt: now,
          updatedAt: now
        }
      ];
      this.saveData('invoices.json', this.invoices);

      // Initialize Payment Methods
      this.paymentMethods = [
        {
          _id: 'pm001',
          patientId: 'pat001',
          type: 'card',
          last4: '4242',
          brand: 'visa',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true,
          isActive: true,
          createdAt: now,
          updatedAt: now
        },
        {
          _id: 'pm002',
          patientId: 'pat001',
          type: 'upi',
          upiId: 'patient@paytm',
          isDefault: false,
          isActive: true,
          createdAt: now,
          updatedAt: now
        }
      ];
      this.saveData('paymentMethods.json', this.paymentMethods);

      // Initialize Payments
      this.payments = [
        {
          _id: 'pay001',
          patientId: 'pat001',
          invoiceId: 'inv001',
          paymentMethodId: 'pm001',
          amount: 1770,
          currency: 'INR',
          status: 'completed',
          transactionId: 'txn_123456789',
          gateway: 'razorpay',
          createdAt: now,
          updatedAt: now
        }
      ];
      this.saveData('payments.json', this.payments);

      // Initialize Vital Signs
      this.vitalSigns = [
        {
          _id: 'vs001',
          patientId: 'pat001',
          type: 'blood_pressure',
          value: '120/80',
          unit: 'mmHg',
          systolic: 120,
          diastolic: 80,
          recordedAt: now,
          notes: 'Normal range',
          location: 'home',
          createdAt: now,
          updatedAt: now
        },
        {
          _id: 'vs002',
          patientId: 'pat001',
          type: 'weight',
          value: '70',
          unit: 'kg',
          recordedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Morning weight',
          location: 'home',
          createdAt: now,
          updatedAt: now
        }
      ];
      this.saveData('vitalSigns.json', this.vitalSigns);

      // Initialize Documents
      this.documents = [
        {
          _id: 'doc001',
          patientId: 'pat001',
          title: 'Blood Test Report',
          type: 'lab_report',
          fileName: 'blood_test_2024.pdf',
          originalFileName: 'blood_test_2024.pdf',
          fileUrl: '/uploads/blood_test_2024.pdf',
          fileSize: 245760,
          mimeType: 'application/pdf',
          folder: 'medical_reports',
          tags: ['blood', 'test', 'lab'],
          isPublic: false,
          accessLevel: 'private',
          status: 'ready',
          uploadedBy: 'pat001',
          createdAt: now,
          updatedAt: now
        }
      ];
      this.saveData('documents.json', this.documents);

      // Initialize Health Tracking
      this.healthTracking = [
        {
          _id: 'ht001',
          patientId: 'pat001',
          metric: 'weight',
          value: 70,
          unit: 'kg',
          recordedAt: now,
          location: 'home',
          device: 'Smart Scale',
          tags: ['daily', 'morning'],
          createdAt: now,
          updatedAt: now
        }
      ];
      this.saveData('healthTracking.json', this.healthTracking);

      // Initialize Health Goals
      this.healthGoals = [
        {
          _id: 'hg001',
          patientId: 'pat001',
          title: 'Weight Management',
          description: 'Maintain healthy weight through diet and exercise',
          metric: 'weight',
          targetValue: 65,
          currentValue: 70,
          unit: 'kg',
          startDate: now,
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          priority: 'high',
          category: 'fitness',
          progress: 85,
          milestones: [
            {
              value: 68,
              date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              description: 'First milestone',
              achieved: false
            }
          ],
          createdAt: now,
          updatedAt: now
        }
      ];
      this.saveData('healthGoals.json', this.healthGoals);

      // Initialize Therapy Sessions
      this.therapySessions = [
        {
          _id: 'ts001',
          patientId: 'pat001',
          practitionerId: 'prac001',
          therapyPlanId: 'tp001',
          sessionNumber: 1,
          title: 'Initial Consultation',
          description: 'First therapy session for stress management',
          scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration: 60,
          status: 'scheduled',
          sessionType: 'consultation',
          location: 'clinic',
          createdAt: now,
          updatedAt: now
        }
      ];
      this.saveData('therapySessions.json', this.therapySessions);

      // Initialize Diet Items
      this.dietItems = [
        {
          _id: 'di001',
          patientId: 'pat001',
          therapyPlanId: 'tp001',
          name: 'Herbal Tea',
          description: 'Tulsi and ginger tea',
          category: 'beverage',
          quantity: '1 cup',
          unit: 'cup',
          timing: 'morning',
          frequency: 'daily',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          completed: false,
          priority: 'medium',
          status: 'active',
          startDate: now,
          benefits: ['digestive health', 'immunity'],
          createdAt: now,
          updatedAt: now
        }
      ];
      this.saveData('dietItems.json', this.dietItems);

      console.log('✅ Comprehensive demo data initialized successfully');
    }
  }

  // User operations
  findUser(query) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = this.users.find(u => {
          if (query._id) return u._id === query._id;
          if (query.email) return u.email === query.email;
          return false;
        });
        resolve(user);
      }, 10); // Small delay to simulate async operation
    });
  }

  // Add findOne method for compatibility
  findOne(collection, query) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = this[collection] || [];
        const item = data.find(item => {
          return Object.keys(query).every(key => item[key] === query[key]);
        });
        resolve(item);
      }, 10);
    });
  }

  createUser(userData) {
    return new Promise((resolve) => {
      const newUser = {
        _id: this.generateId(),
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.users.push(newUser);
      this.saveData('users.json', this.users);
      resolve(newUser);
    });
  }

  updateUser(id, updateData) {
    return new Promise((resolve) => {
      const userIndex = this.users.findIndex(u => u._id === id);
      if (userIndex !== -1) {
        this.users[userIndex] = { ...this.users[userIndex], ...updateData, updatedAt: new Date().toISOString() };
        this.saveData('users.json', this.users);
        resolve(this.users[userIndex]);
      } else {
        resolve(null);
      }
    });
  }

  // Generic find operations
  find(collection, query = {}) {
    return new Promise((resolve) => {
      const data = this[collection] || [];
      if (Object.keys(query).length === 0) {
        resolve(data);
      } else {
        const filtered = data.filter(item => {
          return Object.keys(query).every(key => item[key] === query[key]);
        });
        resolve(filtered);
      }
    });
  }

  // Generic create operations
  create(collection, data) {
    return new Promise((resolve) => {
      const newItem = {
        _id: this.generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      if (!this[collection]) {
        this[collection] = [];
      }
      
      this[collection].push(newItem);
      this.saveData(`${collection}.json`, this[collection]);
      resolve(newItem);
    });
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Add findAll method for compatibility with admin routes
  findAll(collection) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = this[collection] || [];
        resolve(data);
      }, 10);
    });
  }

  // Add countDocuments method for compatibility
  countDocuments(collection, query = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = this[collection] || [];
        if (Object.keys(query).length === 0) {
          resolve(data.length);
        } else {
          const filtered = data.filter(item => {
            return Object.keys(query).every(key => {
              if (key.includes('.')) {
                // Handle nested properties like 'verificationStatus'
                const keys = key.split('.');
                let value = item;
                for (const k of keys) {
                  value = value?.[k];
                }
                return value === query[key];
              }
              return item[key] === query[key];
            });
          });
          resolve(filtered.length);
        }
      }, 10);
    });
  }

  // Health check
  isConnected() {
    return true;
  }
}

export default new MockDatabase();
