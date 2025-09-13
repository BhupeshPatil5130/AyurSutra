import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Practitioner from '../models/Practitioner.js';
import Patient from '../models/Patient.js';
import TherapyPlan from '../models/TherapyPlan.js';
import Appointment from '../models/Appointment.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Invoice from '../models/Invoice.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/panchakarma');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Practitioner.deleteMany({});
    await Patient.deleteMany({});
    await TherapyPlan.deleteMany({});
    await Appointment.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
    await MedicalRecord.deleteMany({});
    await Invoice.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});

    console.log('Cleared existing data');

    // Create demo users
    const hashedPassword = await bcrypt.hash('demo123', 12);

    // Admin user
    const adminUser = new User({
      email: 'admin@panchakarma.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890',
      role: 'admin'
    });
    await adminUser.save();

    // Practitioner user
    const practitionerUser = new User({
      email: 'practitioner@panchakarma.com',
      password: hashedPassword,
      firstName: 'Dr. Rajesh',
      lastName: 'Sharma',
      phone: '+1234567891',
      role: 'practitioner'
    });
    await practitionerUser.save();

    // Patient user
    const patientUser = new User({
      email: 'patient@panchakarma.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567892',
      role: 'patient'
    });
    await patientUser.save();

    // Additional practitioner users
    const practitioner2User = new User({
      email: 'practitioner2@panchakarma.com',
      password: hashedPassword,
      firstName: 'Dr. Priya',
      lastName: 'Patel',
      phone: '+1234567893',
      role: 'practitioner'
    });
    await practitioner2User.save();

    // Additional patient users
    const patient2User = new User({
      email: 'patient2@panchakarma.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1234567894',
      role: 'patient'
    });
    await patient2User.save();

    console.log('Created demo users');

    // Create practitioner profiles
    const practitioner1 = new Practitioner({
      userId: practitionerUser._id,
      licenseNumber: 'LIC001',
      specializations: ['Panchakarma', 'Abhyanga', 'Shirodhara'],
      experience: 10,
      education: [
        {
          degree: 'BAMS',
          institution: 'Gujarat Ayurved University',
          year: 2010
        },
        {
          degree: 'MD Panchakarma',
          institution: 'Rajiv Gandhi University of Health Sciences',
          year: 2013
        }
      ],
      certificates: [
        {
          name: 'Panchakarma Specialist Certification',
          issuedBy: 'Ayurvedic Medical Association',
          year: 2014
        }
      ],
      clinicAddress: {
        street: '123 Wellness Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      },
      bio: 'Experienced Ayurvedic practitioner specializing in Panchakarma therapies with over 10 years of practice.',
      verificationStatus: 'approved',
      verifiedBy: adminUser._id,
      verifiedAt: new Date(),
      rating: 4.8,
      totalReviews: 25,
      availability: [
        { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Saturday', startTime: '09:00', endTime: '13:00', isAvailable: true },
        { day: 'Sunday', startTime: '09:00', endTime: '13:00', isAvailable: false }
      ],
      consultationFee: 2000
    });
    await practitioner1.save();

    const practitioner2 = new Practitioner({
      userId: practitioner2User._id,
      licenseNumber: 'LIC002',
      specializations: ['Virechana', 'Basti', 'Nasya'],
      experience: 8,
      education: [
        {
          degree: 'BAMS',
          institution: 'Banaras Hindu University',
          year: 2012
        }
      ],
      clinicAddress: {
        street: '456 Health Avenue',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        country: 'India'
      },
      bio: 'Dedicated Ayurvedic doctor with expertise in detoxification therapies.',
      verificationStatus: 'pending',
      rating: 4.5,
      totalReviews: 15,
      availability: [
        { day: 'Monday', startTime: '10:00', endTime: '18:00', isAvailable: true },
        { day: 'Tuesday', startTime: '10:00', endTime: '18:00', isAvailable: true },
        { day: 'Wednesday', startTime: '10:00', endTime: '18:00', isAvailable: true },
        { day: 'Thursday', startTime: '10:00', endTime: '18:00', isAvailable: true },
        { day: 'Friday', startTime: '10:00', endTime: '18:00', isAvailable: true }
      ],
      consultationFee: 1800
    });
    await practitioner2.save();

    console.log('Created practitioner profiles');

    // Create patient profiles
    const patient1 = new Patient({
      userId: patientUser._id,
      dateOfBirth: new Date('1985-06-15'),
      gender: 'male',
      bloodGroup: 'O+',
      height: { value: 175, unit: 'cm' },
      weight: { value: 70, unit: 'kg' },
      address: {
        street: '789 Patient Lane',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400002',
        country: 'India'
      },
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+1234567899',
        relationship: 'Spouse',
        email: 'jane.doe@email.com'
      },
      medicalHistory: [
        {
          condition: 'Hypertension',
          diagnosedDate: new Date('2020-01-15'),
          status: 'active',
          notes: 'Controlled with medication',
          treatingPhysician: 'Dr. Smith'
        }
      ],
      allergies: [
        {
          allergen: 'Peanuts',
          severity: 'moderate',
          reaction: 'Skin rash and breathing difficulty',
          notes: 'Avoid all peanut products'
        }
      ],
      currentMedications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          startDate: new Date('2020-01-15'),
          prescribedBy: 'Dr. Smith',
          notes: 'For blood pressure control'
        }
      ],
      healthGoals: [
        {
          title: 'Stress Reduction',
          description: 'Reduce daily stress through meditation and yoga',
          targetValue: 30,
          currentValue: 10,
          unit: 'minutes/day',
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          status: 'active',
          progress: 33
        },
        {
          title: 'Better Sleep',
          description: 'Improve sleep quality and duration',
          targetValue: 8,
          currentValue: 6,
          unit: 'hours',
          targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          status: 'active',
          progress: 75
        }
      ],
      vitalSigns: [
        {
          date: new Date(),
          bloodPressure: { systolic: 130, diastolic: 85 },
          heartRate: 72,
          temperature: 98.6,
          weight: 70,
          height: 175,
          bmi: 22.9,
          recordedBy: practitionerUser._id
        }
      ],
      preferences: {
        preferredLanguage: 'en',
        preferredCommunication: 'email',
        appointmentReminders: true,
        healthTips: true,
        marketingEmails: false
      },
      insurance: {
        provider: 'Health Insurance Corp',
        policyNumber: 'HIC123456789',
        validUntil: new Date('2024-12-31'),
        coverageAmount: 500000
      }
    });
    await patient1.save();

    const patient2 = new Patient({
      userId: patient2User._id,
      dateOfBirth: new Date('1990-03-22'),
      gender: 'female',
      bloodGroup: 'A+',
      height: { value: 165, unit: 'cm' },
      weight: { value: 65, unit: 'kg' },
      address: {
        street: '321 Wellness Road',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110002',
        country: 'India'
      },
      emergencyContact: {
        name: 'Michael Johnson',
        phone: '+1234567895',
        relationship: 'Spouse',
        email: 'michael.johnson@email.com'
      },
      healthGoals: [
        {
          title: 'Weight Management',
          description: 'Maintain healthy weight through proper diet and exercise',
          targetValue: 60,
          currentValue: 65,
          unit: 'kg',
          targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
          status: 'active',
          progress: 0
        }
      ],
      preferences: {
        preferredLanguage: 'en',
        preferredCommunication: 'sms',
        appointmentReminders: true,
        healthTips: true,
        marketingEmails: true
      }
    });
    await patient2.save();

    console.log('Created patient profiles');

    // Create therapy plans
    const therapyPlan1 = new TherapyPlan({
      patientId: patient1._id,
      practitionerId: practitioner1._id,
      title: 'Stress Relief Panchakarma Program',
      description: 'Comprehensive 21-day Panchakarma program focusing on stress reduction and mental wellness.',
      therapyType: 'Panchakarma',
      duration: 21,
      sessions: [
        {
          sessionNumber: 1,
          date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          duration: 90,
          therapyDetails: 'Initial consultation and Abhyanga massage',
          instructions: 'Light diet recommended before session',
          status: 'scheduled'
        },
        {
          sessionNumber: 2,
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          duration: 120,
          therapyDetails: 'Shirodhara therapy',
          instructions: 'Avoid heavy meals 2 hours before session',
          status: 'scheduled'
        }
      ],
      dietPlan: {
        breakfast: ['Warm water with lemon', 'Oatmeal with fruits'],
        lunch: ['Vegetable soup', 'Brown rice', 'Dal'],
        dinner: ['Light khichdi', 'Herbal tea'],
        restrictions: ['Avoid cold foods', 'No processed foods'],
        supplements: ['Triphala', 'Ashwagandha']
      },
      lifestyleRecommendations: [
        'Practice yoga daily',
        'Meditation for 20 minutes',
        'Early to bed, early to rise',
        'Regular oil massage'
      ],
      startDate: new Date(),
      totalCost: 25000,
      status: 'active'
    });
    await therapyPlan1.save();

    console.log('Created therapy plans');

    // Create appointments
    const appointment1 = new Appointment({
      patientId: patient1._id,
      practitionerId: practitioner1._id,
      therapyPlanId: therapyPlan1._id,
      appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      startTime: '10:00',
      endTime: '11:30',
      duration: 90,
      type: 'therapy',
      status: 'confirmed',
      fee: 2000
    });
    await appointment1.save();

    const appointment2 = new Appointment({
      patientId: patient1._id,
      practitionerId: practitioner1._id,
      appointmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last week
      startTime: '14:00',
      endTime: '15:00',
      duration: 60,
      type: 'consultation',
      status: 'completed',
      notes: 'Initial consultation completed. Patient shows signs of stress and digestive issues.',
      diagnosis: 'Vata imbalance with Pitta aggravation',
      treatment: 'Recommended Panchakarma therapy',
      fee: 1500,
      paymentStatus: 'paid'
    });
    await appointment2.save();

    console.log('Created appointments');

    // Create reviews
    const review1 = new Review({
      patientId: patient1._id,
      practitionerId: practitioner1._id,
      appointmentId: appointment2._id,
      rating: 5,
      comment: 'Excellent consultation! Dr. Sharma was very thorough and explained everything clearly.',
      aspects: {
        professionalism: 5,
        effectiveness: 5,
        communication: 5,
        punctuality: 4
      },
      wouldRecommend: true
    });
    await review1.save();

    console.log('Created reviews');

    // Create notifications
    const notifications = [
      {
        userId: practitioner2User._id,
        title: 'Profile Verification Pending',
        message: 'Your practitioner profile is under review. You will be notified once verified.',
        type: 'verification',
        priority: 'medium'
      },
      {
        userId: patientUser._id,
        title: 'Upcoming Appointment',
        message: 'You have an appointment tomorrow at 10:00 AM with Dr. Rajesh Sharma',
        type: 'reminder',
        priority: 'high',
        relatedId: appointment1._id,
        relatedModel: 'Appointment'
      },
      {
        userId: practitionerUser._id,
        title: 'New Review Received',
        message: 'You received a 5-star review from John Doe',
        type: 'feedback',
        priority: 'low',
        relatedId: review1._id,
        relatedModel: 'Review'
      }
    ];

    await Notification.insertMany(notifications);
    console.log('Created notifications');

    // Create medical records
    const medicalRecord1 = new MedicalRecord({
      patientId: patient1._id,
      practitionerId: practitioner1._id,
      appointmentId: appointment2._id,
      recordType: 'consultation',
      title: 'Initial Consultation - Stress and Digestive Issues',
      description: 'Patient presents with chronic stress and digestive problems. Detailed assessment conducted.',
      symptoms: [
        {
          name: 'Chronic stress',
          severity: 'moderate',
          duration: '6 months',
          notes: 'Work-related stress affecting sleep and digestion'
        },
        {
          name: 'Digestive issues',
          severity: 'mild',
          duration: '3 months',
          notes: 'Bloating and irregular bowel movements'
        }
      ],
      diagnosis: [
        {
          condition: 'Vata imbalance with Pitta aggravation',
          severity: 'moderate',
          status: 'confirmed',
          notes: 'Classic presentation of stress-induced dosha imbalance'
        }
      ],
      treatment: [
        {
          type: 'therapy',
          name: 'Panchakarma Program',
          duration: '21 days',
          instructions: 'Complete detoxification and rejuvenation program',
          startDate: new Date()
        },
        {
          type: 'lifestyle',
          name: 'Stress Management',
          instructions: 'Daily meditation and yoga practice',
          duration: 'Ongoing'
        }
      ],
      vitalSigns: {
        bloodPressure: { systolic: 130, diastolic: 85 },
        heartRate: 72,
        temperature: 98.6,
        weight: 70,
        height: 175,
        bmi: 22.9
      },
      followUpInstructions: 'Follow prescribed diet and lifestyle changes. Return in 2 weeks for progress evaluation.',
      nextAppointmentDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'final'
    });
    await medicalRecord1.save();

    // Create invoices
    const invoice1 = new Invoice({
      invoiceNumber: 'INV-2024-001',
      patientId: patient1._id,
      practitionerId: practitioner1._id,
      appointmentId: appointment2._id,
      items: [
        {
          description: 'Initial Consultation',
          quantity: 1,
          unitPrice: 1500,
          totalPrice: 1500,
          serviceType: 'consultation'
        }
      ],
      subtotal: 1500,
      tax: { rate: 18, amount: 270 },
      discount: { type: 'percentage', value: 0, amount: 0 },
      totalAmount: 1770,
      status: 'paid',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      paymentDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      paidAmount: 1770,
      remainingAmount: 0
    });
    await invoice1.save();

    const invoice2 = new Invoice({
      invoiceNumber: 'INV-2024-002',
      patientId: patient1._id,
      practitionerId: practitioner1._id,
      items: [
        {
          description: 'Panchakarma Therapy Session',
          quantity: 1,
          unitPrice: 2000,
          totalPrice: 2000,
          serviceType: 'therapy'
        }
      ],
      subtotal: 2000,
      tax: { rate: 18, amount: 360 },
      totalAmount: 2360,
      status: 'sent',
      paymentStatus: 'pending',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      paidAmount: 0,
      remainingAmount: 2360
    });
    await invoice2.save();

    // Create conversations and messages
    const conversation1 = new Conversation({
      participants: [
        { userId: patientUser._id, role: 'patient', joinedAt: new Date() },
        { userId: practitionerUser._id, role: 'practitioner', joinedAt: new Date() }
      ],
      title: 'Consultation Follow-up',
      lastMessage: {
        content: 'Thank you for the consultation. I have a few questions about the diet plan.',
        senderId: patientUser._id,
        timestamp: new Date()
      },
      status: 'active',
      priority: 'normal'
    });
    await conversation1.save();

    const messages = [
      {
        conversationId: conversation1._id,
        senderId: patientUser._id,
        receiverId: practitionerUser._id,
        content: 'Hello Dr. Sharma, thank you for the consultation yesterday.',
        messageType: 'text',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        conversationId: conversation1._id,
        senderId: practitionerUser._id,
        receiverId: patientUser._id,
        content: 'Hello John! You\'re welcome. How are you feeling today?',
        messageType: 'text',
        isRead: true,
        readAt: new Date(Date.now() - 90 * 60 * 1000),
        createdAt: new Date(Date.now() - 90 * 60 * 1000) // 1.5 hours ago
      },
      {
        conversationId: conversation1._id,
        senderId: patientUser._id,
        receiverId: practitionerUser._id,
        content: 'I\'m feeling better, but I have some questions about the diet plan you recommended.',
        messageType: 'text',
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      }
    ];

    await Message.insertMany(messages);

    console.log('Created medical records, invoices, and conversations');

    console.log('\n=== DEMO ACCOUNTS CREATED ===');
    console.log('Admin: admin@panchakarma.com / demo123');
    console.log('Practitioner: practitioner@panchakarma.com / demo123');
    console.log('Patient: patient@panchakarma.com / demo123');
    console.log('Additional Practitioner: practitioner2@panchakarma.com / demo123');
    console.log('Additional Patient: patient2@panchakarma.com / demo123');
    console.log('================================\n');
    console.log('✅ Database seeded successfully with comprehensive demo data!');
    console.log('📊 Created: Users, Practitioners, Patients, Appointments, Therapy Plans');
    console.log('📋 Created: Medical Records, Invoices, Reviews, Notifications');
    console.log('💬 Created: Conversations and Messages');
    console.log('🏥 Ready for testing all Panchakarma platform features!\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
