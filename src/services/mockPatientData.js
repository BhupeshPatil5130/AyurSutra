// Mock Patient Data Service
// Provides realistic sample data for patient dashboard when API is unavailable

export const mockPatientData = {
  patient: {
    _id: "pat001",
    firstName: "Arjun",
    lastName: "Sharma",
    email: "arjun.sharma@email.com",
    phone: "+91-9876543210",
    dateOfBirth: "1988-05-15",
    gender: "male",
    bloodGroup: "O+",
    height: 175,
    weight: 70,
    avatar: null
  },

  // Dashboard overview data
  dashboardStats: {
    treatmentProgress: 75,
    healthScore: 88,
    completedSessions: 12,
    nextAppointment: {
      date: "2025-09-16T10:00:00Z",
      practitioner: "Dr. Priya Patel",
      type: "Consultation",
      status: "confirmed"
    }
  },

  // Health vitals
  vitals: {
    temperature: "98.4°F",
    bloodPressure: "118/76",
    weight: "70 kg",
    heartRate: "72 bpm",
    energyLevel: 4,
    lastUpdated: "2025-09-14T06:00:00Z"
  },

  // Today's schedule
  todaySchedule: [
    {
      id: "sch001",
      title: "Morning Meditation Session",
      time: "07:00 AM",
      practitioner: "Yoga Instructor Maya",
      status: "completed",
      type: "therapy"
    },
    {
      id: "sch002", 
      title: "Ayurvedic Consultation",
      time: "10:00 AM",
      practitioner: "Dr. Priya Patel",
      status: "confirmed",
      type: "consultation"
    },
    {
      id: "sch003",
      title: "Herbal Medicine Pickup",
      time: "03:00 PM", 
      practitioner: "Pharmacy",
      status: "pending",
      type: "medication"
    }
  ],

  // Current treatment plan
  currentTreatment: {
    name: "Stress Management & Digestive Health Program",
    progress: 75,
    sessionsLeft: 4,
    milestones: 3,
    startDate: "2025-08-01",
    endDate: "2025-10-15",
    nextSteps: [
      "Complete daily pranayama practice",
      "Follow prescribed diet plan",
      "Take herbal supplements as directed",
      "Attend weekly consultation sessions"
    ]
  },

  // Recent notifications
  notifications: [
    {
      id: "not001",
      type: "appointment",
      title: "Appointment Reminder",
      message: "Your consultation with Dr. Priya Patel is scheduled for tomorrow at 10:00 AM",
      time: "2 hours ago",
      read: false
    },
    {
      id: "not002", 
      type: "message",
      title: "New Message from Dr. Patel",
      message: "Please continue your current meditation routine. Great progress!",
      time: "1 day ago",
      read: false
    },
    {
      id: "not003",
      type: "reminder", 
      title: "Medicine Reminder",
      message: "Time to take your evening Triphala supplement",
      time: "1 day ago",
      read: true
    },
    {
      id: "not004",
      type: "payment",
      title: "Payment Confirmation",
      message: "Payment of ₹2,500 for consultation has been processed successfully",
      time: "2 days ago", 
      read: true
    }
  ],

  // Recent activity
  recentActivity: [
    {
      action: "Completed Yoga Session",
      details: "45-minute Hatha Yoga with Instructor Maya",
      timestamp: "Today, 7:45 AM"
    },
    {
      action: "Updated Health Vitals",
      details: "Recorded weight, blood pressure, and energy levels",
      timestamp: "Yesterday, 8:00 AM"
    },
    {
      action: "Submitted Feedback",
      details: "5-star review for Dr. Rajesh Kumar's consultation",
      timestamp: "2 days ago"
    },
    {
      action: "Booked Appointment",
      details: "Scheduled follow-up consultation with Dr. Priya Patel",
      timestamp: "3 days ago"
    }
  ],

  // Health tips
  healthTips: [
    {
      title: "Morning Hydration",
      description: "Start your day with warm water and lemon to boost digestion and metabolism"
    },
    {
      title: "Mindful Eating",
      description: "Eat slowly and chew thoroughly to improve nutrient absorption and reduce digestive stress"
    },
    {
      title: "Evening Routine",
      description: "Practice gentle stretching or meditation before bed to improve sleep quality"
    }
  ],

  // Appointments data
  appointments: [
    {
      id: "apt001",
      date: "2025-09-16T10:00:00Z",
      startTime: "10:00",
      endTime: "11:00", 
      status: "confirmed",
      type: "consultation",
      practitionerId: {
        _id: "prac001",
        userId: {
          firstName: "Priya",
          lastName: "Patel",
          email: "priya.patel@ayursutra.com",
          phone: "+91-9876543221"
        },
        specializations: ["Panchakarma", "Digestive Health"],
        consultationFee: 2500
      },
      notes: "Follow-up consultation for stress management program",
      symptoms: ["Stress", "Digestive issues"],
      consultationType: "video"
    },
    {
      id: "apt002",
      date: "2025-09-12T14:00:00Z", 
      startTime: "14:00",
      endTime: "15:00",
      status: "completed",
      type: "therapy",
      practitionerId: {
        _id: "prac002",
        userId: {
          firstName: "Rajesh",
          lastName: "Kumar", 
          email: "rajesh.kumar@ayursutra.com",
          phone: "+91-9876543222"
        },
        specializations: ["Yoga Therapy", "Meditation"],
        consultationFee: 1500
      },
      notes: "Yoga therapy session completed successfully",
      feedback: {
        rating: 5,
        comment: "Excellent session, feeling much more relaxed"
      }
    },
    {
      id: "apt003",
      date: "2025-09-20T11:00:00Z",
      startTime: "11:00", 
      endTime: "12:00",
      status: "scheduled",
      type: "consultation",
      practitionerId: {
        _id: "prac003",
        userId: {
          firstName: "Meera",
          lastName: "Joshi",
          email: "meera.joshi@ayursutra.com", 
          phone: "+91-9876543223"
        },
        specializations: ["Herbal Medicine", "Women's Health"],
        consultationFee: 2000
      },
      notes: "Initial consultation for holistic wellness program"
    }
  ],

  // Practitioners data
  practitioners: [
    {
      _id: "prac001",
      userId: {
        firstName: "Priya",
        lastName: "Patel",
        email: "priya.patel@ayursutra.com",
        phone: "+91-9876543221"
      },
      specializations: ["Panchakarma", "Digestive Health", "Stress Management"],
      consultationFee: 2500,
      rating: 4.8,
      totalReviews: 156,
      experience: 12,
      qualifications: ["BAMS", "MD (Ayurveda)", "Panchakarma Specialist"],
      languages: ["English", "Hindi", "Gujarati"],
      availability: {
        Monday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
        Tuesday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
        Wednesday: ["09:00", "10:00", "11:00"],
        Thursday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
        Friday: ["09:00", "10:00", "11:00", "14:00", "15:00"]
      },
      bio: "Dr. Priya Patel is a renowned Ayurvedic physician with over 12 years of experience in Panchakarma and digestive health treatments."
    },
    {
      _id: "prac002", 
      userId: {
        firstName: "Rajesh",
        lastName: "Kumar",
        email: "rajesh.kumar@ayursutra.com",
        phone: "+91-9876543222"
      },
      specializations: ["Yoga Therapy", "Meditation", "Pranayama"],
      consultationFee: 1500,
      rating: 4.9,
      totalReviews: 203,
      experience: 15,
      qualifications: ["Certified Yoga Instructor", "Meditation Teacher", "Ayurveda Lifestyle Counselor"],
      languages: ["English", "Hindi", "Sanskrit"],
      availability: {
        Monday: ["07:00", "08:00", "17:00", "18:00"],
        Tuesday: ["07:00", "08:00", "17:00", "18:00"],
        Wednesday: ["07:00", "08:00", "17:00", "18:00"],
        Thursday: ["07:00", "08:00", "17:00", "18:00"],
        Friday: ["07:00", "08:00", "17:00", "18:00"],
        Saturday: ["07:00", "08:00", "09:00", "10:00"]
      },
      bio: "Rajesh Kumar is a certified yoga therapist and meditation teacher specializing in stress relief and mental wellness through ancient practices."
    },
    {
      _id: "prac003",
      userId: {
        firstName: "Meera", 
        lastName: "Joshi",
        email: "meera.joshi@ayursutra.com",
        phone: "+91-9876543223"
      },
      specializations: ["Herbal Medicine", "Women's Health", "Nutrition"],
      consultationFee: 2000,
      rating: 4.7,
      totalReviews: 89,
      experience: 8,
      qualifications: ["BAMS", "Diploma in Herbal Medicine", "Nutrition Counselor"],
      languages: ["English", "Hindi", "Marathi"],
      availability: {
        Tuesday: ["10:00", "11:00", "14:00", "15:00"],
        Wednesday: ["10:00", "11:00", "14:00", "15:00"],
        Thursday: ["10:00", "11:00", "14:00", "15:00"],
        Friday: ["10:00", "11:00", "14:00", "15:00"],
        Saturday: ["09:00", "10:00", "11:00"]
      },
      bio: "Dr. Meera Joshi specializes in women's health and herbal medicine, helping patients achieve optimal wellness through natural remedies."
    }
  ],

  // Therapy plans
  therapyPlans: [
    {
      id: "tp001",
      name: "Stress Management & Digestive Health Program",
      status: "active",
      startDate: "2025-08-01",
      endDate: "2025-10-15", 
      progress: 75,
      practitionerId: {
        _id: "prac001",
        userId: {
          firstName: "Priya",
          lastName: "Patel"
        }
      },
      description: "Comprehensive 10-week program focusing on stress reduction and digestive health improvement through Ayurvedic treatments, yoga, and dietary modifications.",
      goals: [
        "Reduce stress levels by 50%",
        "Improve digestive function",
        "Establish healthy daily routine",
        "Learn stress management techniques"
      ],
      treatments: [
        {
          name: "Panchakarma Detox",
          frequency: "Weekly",
          duration: "2 hours",
          completed: 6,
          total: 8
        },
        {
          name: "Yoga Therapy",
          frequency: "3x per week", 
          duration: "1 hour",
          completed: 18,
          total: 24
        },
        {
          name: "Herbal Medicine",
          frequency: "Daily",
          duration: "Ongoing",
          completed: 45,
          total: 60
        }
      ]
    }
  ],

  // Medical records
  medicalRecords: [
    {
      id: "rec001",
      title: "Initial Consultation Report",
      date: "2025-08-01",
      type: "consultation",
      practitioner: "Dr. Priya Patel",
      summary: "Patient presents with chronic stress and digestive issues. Recommended comprehensive Ayurvedic treatment plan.",
      details: {
        symptoms: ["Chronic stress", "Digestive discomfort", "Sleep issues", "Low energy"],
        diagnosis: "Vata-Pitta imbalance with digestive dysfunction",
        treatment: "Panchakarma therapy, yoga, herbal medicine, dietary modifications",
        medications: ["Triphala", "Ashwagandha", "Brahmi"]
      }
    },
    {
      id: "rec002",
      title: "Progress Assessment - Week 4",
      date: "2025-08-28",
      type: "assessment",
      practitioner: "Dr. Priya Patel", 
      summary: "Significant improvement in stress levels and digestive function. Patient responding well to treatment.",
      details: {
        improvements: ["Better sleep quality", "Reduced stress", "Improved digestion", "Increased energy"],
        vitals: {
          weight: "69 kg",
          bloodPressure: "120/78",
          pulse: "70 bpm"
        },
        recommendations: ["Continue current medications", "Increase yoga practice", "Maintain dietary guidelines"]
      }
    }
  ],

  // Payment/Invoice data
  invoices: [
    {
      id: "inv001",
      date: "2025-09-12",
      amount: 2500,
      status: "paid",
      description: "Consultation with Dr. Priya Patel",
      practitioner: "Dr. Priya Patel",
      paymentMethod: "UPI",
      transactionId: "TXN123456789"
    },
    {
      id: "inv002", 
      date: "2025-09-10",
      amount: 1500,
      status: "paid",
      description: "Yoga Therapy Session",
      practitioner: "Rajesh Kumar",
      paymentMethod: "Credit Card",
      transactionId: "TXN123456790"
    },
    {
      id: "inv003",
      date: "2025-09-16",
      amount: 2500,
      status: "pending",
      description: "Upcoming Consultation with Dr. Priya Patel",
      practitioner: "Dr. Priya Patel",
      dueDate: "2025-09-16"
    }
  ],

  // Health tracking data
  healthTracking: {
    weight: [
      { date: "2025-09-01", value: 72 },
      { date: "2025-09-05", value: 71.5 },
      { date: "2025-09-10", value: 70.8 },
      { date: "2025-09-14", value: 70 }
    ],
    bloodPressure: [
      { date: "2025-09-01", systolic: 125, diastolic: 82 },
      { date: "2025-09-05", systolic: 122, diastolic: 80 },
      { date: "2025-09-10", systolic: 120, diastolic: 78 },
      { date: "2025-09-14", systolic: 118, diastolic: 76 }
    ],
    stressLevel: [
      { date: "2025-09-01", value: 8 },
      { date: "2025-09-05", value: 6 },
      { date: "2025-09-10", value: 5 },
      { date: "2025-09-14", value: 3 }
    ],
    sleepHours: [
      { date: "2025-09-01", value: 6 },
      { date: "2025-09-05", value: 6.5 },
      { date: "2025-09-10", value: 7 },
      { date: "2025-09-14", value: 7.5 }
    ]
  }
};

// Helper function to get dashboard data with fallback
export const getDashboardData = (timeRange = 'week') => {
  return {
    patient: mockPatientData.patient,
    ...mockPatientData.dashboardStats,
    vitals: mockPatientData.vitals,
    todaySchedule: mockPatientData.todaySchedule,
    currentTreatment: mockPatientData.currentTreatment,
    notifications: mockPatientData.notifications,
    recentActivity: mockPatientData.recentActivity,
    healthTips: mockPatientData.healthTips,
    healthAlert: timeRange === 'week' ? "Remember to take your evening Triphala supplement" : null
  };
};

// Helper function to get appointments with filters
export const getAppointments = (filters = {}) => {
  let appointments = [...mockPatientData.appointments];
  
  if (filters.status) {
    appointments = appointments.filter(apt => apt.status === filters.status);
  }
  
  if (filters.type === 'upcoming') {
    appointments = appointments.filter(apt => 
      ['scheduled', 'confirmed'].includes(apt.status) && 
      new Date(apt.date) >= new Date()
    );
  } else if (filters.type === 'past') {
    appointments = appointments.filter(apt => new Date(apt.date) < new Date());
  }
  
  return appointments.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Helper function to get practitioners with filters
export const getPractitioners = (filters = {}) => {
  let practitioners = [...mockPatientData.practitioners];
  
  if (filters.specialization) {
    practitioners = practitioners.filter(p => 
      p.specializations.includes(filters.specialization)
    );
  }
  
  return practitioners.sort((a, b) => b.rating - a.rating);
};

export default mockPatientData;
