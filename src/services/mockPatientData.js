// Mock Patient Data Service
// Provides realistic sample data for patient dashboard when API is unavailable

// Enhanced Indian Patient Profiles
export const indianPatientProfiles = [
  {
    _id: "pat001",
    firstName: "Arjun",
    lastName: "Sharma",
    email: "arjun.sharma@ayursutra.com",
    phone: "+91-9876543210",
    dateOfBirth: "1988-05-15",
    gender: "male",
    bloodGroup: "O+",
    height: 175,
    weight: 70,
    address: "45, Lajpat Nagar, New Delhi - 110024",
    avatar: null,
    constitution: "Vata-Pitta",
    occupation: "Software Engineer"
  },
  {
    _id: "pat003",
    firstName: "Ravi",
    lastName: "Kumar",
    email: "ravi.kumar@ayursutra.com",
    phone: "+91-9876543215",
    dateOfBirth: "1992-03-10",
    gender: "male",
    bloodGroup: "B+",
    height: 178,
    weight: 75,
    address: "123, MG Road, Bangalore, Karnataka - 560001",
    avatar: null,
    constitution: "Pitta-Kapha",
    occupation: "Marketing Manager"
  },
  {
    _id: "pat004",
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@ayursutra.com",
    phone: "+91-9876543216",
    dateOfBirth: "1996-07-22",
    gender: "female",
    bloodGroup: "A-",
    height: 165,
    weight: 58,
    address: "45, Sector 15, Gurgaon, Haryana - 122001",
    avatar: null,
    constitution: "Vata-Pitta",
    occupation: "Graphic Designer"
  },
  {
    _id: "pat005",
    firstName: "Arjun",
    lastName: "Singh",
    email: "arjun.singh@ayursutra.com",
    phone: "+91-9876543217",
    dateOfBirth: "1979-11-05",
    gender: "male",
    bloodGroup: "AB+",
    height: 172,
    weight: 82,
    address: "78, Civil Lines, Jaipur, Rajasthan - 302006",
    avatar: null,
    constitution: "Kapha-Pitta",
    occupation: "Business Owner"
  },
  {
    _id: "pat006",
    firstName: "Kavya",
    lastName: "Nair",
    email: "kavya.nair@ayursutra.com",
    phone: "+91-9876543218",
    dateOfBirth: "1990-12-18",
    gender: "female",
    bloodGroup: "O-",
    height: 162,
    weight: 55,
    address: "12, Marine Drive, Kochi, Kerala - 682031",
    avatar: null,
    constitution: "Vata-Kapha",
    occupation: "Yoga Instructor"
  },
  {
    _id: "pat007",
    firstName: "Vikram",
    lastName: "Reddy",
    email: "vikram.reddy@ayursutra.com",
    phone: "+91-9876543219",
    dateOfBirth: "1985-09-14",
    gender: "male",
    bloodGroup: "B-",
    height: 180,
    weight: 78,
    address: "56, Banjara Hills, Hyderabad, Telangana - 500034",
    avatar: null,
    constitution: "Pitta-Vata",
    occupation: "Financial Analyst"
  },
  {
    _id: "pat008",
    firstName: "Meera",
    lastName: "Joshi",
    email: "meera.joshi@ayursutra.com",
    phone: "+91-9876543220",
    dateOfBirth: "1983-04-30",
    gender: "female",
    bloodGroup: "A+",
    height: 158,
    weight: 62,
    address: "89, FC Road, Pune, Maharashtra - 411005",
    avatar: null,
    constitution: "Vata-Pitta",
    occupation: "Teacher"
  }
];

// Get random patient profile
const getRandomPatient = () => {
  const randomIndex = Math.floor(Math.random() * indianPatientProfiles.length);
  return indianPatientProfiles[randomIndex];
};

export const mockPatientData = {
  patient: getRandomPatient(),

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

  // Health vitals with Ayurvedic parameters
  vitals: {
    temperature: "98.4°F",
    bloodPressure: "118/76",
    weight: "70 kg",
    heartRate: "72 bpm",
    energyLevel: 4,
    doshaBalance: {
      vata: "Balanced",
      pitta: "Slightly Elevated", 
      kapha: "Balanced"
    },
    agni: "Strong", // Digestive fire
    ojas: "Good", // Vital essence
    prana: "Flowing well", // Life force
    lastUpdated: "2025-09-14T06:00:00Z"
  },

  // Today's schedule with Indian treatments
  todaySchedule: [
    {
      id: "sch001",
      title: "प्रातःकालीन प्राणायाम (Morning Pranayama)",
      time: "06:30 AM",
      practitioner: "Yoga Acharya Ramesh",
      status: "completed",
      type: "therapy",
      description: "Anulom Vilom & Bhramari Pranayama"
    },
    {
      id: "sch002", 
      title: "पंचकर्म परामर्श (Panchakarma Consultation)",
      time: "10:00 AM",
      practitioner: "Dr. Priya Patel (BAMS, MD)",
      status: "confirmed",
      type: "consultation",
      description: "Vata dosha assessment & treatment planning"
    },
    {
      id: "sch003",
      title: "अभ्यंग मसाज (Abhyanga Massage)",
      time: "02:00 PM", 
      practitioner: "Therapist Sunita",
      status: "confirmed",
      type: "therapy",
      description: "Full body oil massage with sesame oil"
    },
    {
      id: "sch004",
      title: "आयुर्वेदिक दवा (Ayurvedic Medicine Pickup)",
      time: "04:00 PM", 
      practitioner: "Ayurvedic Pharmacy",
      status: "pending",
      type: "medication",
      description: "Ashwagandha, Brahmi, Triphala churna"
    }
  ],

  // Current Ayurvedic treatment plan
  currentTreatment: {
    name: "पंचकर्म डिटॉक्स & स्ट्रेस मैनेजमेंट प्रोग्राम (Panchakarma Detox & Stress Management)",
    progress: 75,
    sessionsLeft: 4,
    milestones: 3,
    startDate: "2025-08-01",
    endDate: "2025-10-15",
    constitution: "Vata-Pitta",
    primaryDosha: "Vata",
    nextSteps: [
      "Continue daily Pranayama (Anulom Vilom) for 15 minutes",
      "Follow Vata-pacifying diet with warm, cooked foods",
      "Take prescribed Ayurvedic medicines: Ashwagandha, Brahmi, Triphala",
      "Attend weekly Panchakarma sessions",
      "Practice Yoga Nidra for deep relaxation"
    ],
    treatments: [
      "Abhyanga (Oil Massage)",
      "Shirodhara (Oil Pouring Therapy)",
      "Basti (Medicated Enema)",
      "Pranayama & Meditation"
    ]
  },

  // Recent notifications with Indian context
  notifications: [
    {
      id: "not001",
      type: "appointment",
      title: "अपॉइंटमेंट रिमाइंडर (Appointment Reminder)",
      message: "Your Panchakarma consultation with Dr. Priya Patel is scheduled for tomorrow at 10:00 AM",
      time: "2 hours ago",
      read: false
    },
    {
      id: "not002", 
      type: "message",
      title: "डॉक्टर का संदेश (Doctor's Message)",
      message: "Continue your Pranayama practice. Your Vata dosha is showing excellent balance. Keep up the good work!",
      time: "1 day ago",
      read: false
    },
    {
      id: "not003",
      type: "reminder", 
      title: "दवा रिमाइंडर (Medicine Reminder)",
      message: "Time to take your evening Triphala churna with warm water",
      time: "1 day ago",
      read: true
    },
    {
      id: "not004",
      type: "payment",
      title: "भुगतान पुष्टि (Payment Confirmation)",
      message: "Payment of ₹2,500 for Ayurvedic consultation has been processed via UPI",
      time: "2 days ago", 
      read: true
    },
    {
      id: "not005",
      type: "reminder",
      title: "योग सत्र (Yoga Session)",
      message: "Your morning Surya Namaskara session starts in 30 minutes",
      time: "3 hours ago",
      read: true
    }
  ],

  // Recent activity with Indian treatments
  recentActivity: [
    {
      action: "Completed Surya Namaskara",
      details: "12 rounds of Sun Salutation with Pranayama",
      timestamp: "Today, 6:45 AM"
    },
    {
      action: "Panchakarma Session Completed",
      details: "Abhyanga massage with warm sesame oil - feeling very relaxed",
      timestamp: "Yesterday, 2:00 PM"
    },
    {
      action: "Dosha Assessment Updated",
      details: "Vata dosha showing improvement, Pitta slightly elevated",
      timestamp: "Yesterday, 10:30 AM"
    },
    {
      action: "Ayurvedic Medicine Taken",
      details: "Morning dose: Ashwagandha 500mg, Brahmi 250mg",
      timestamp: "Today, 8:00 AM"
    },
    {
      action: "Meditation Session",
      details: "20-minute Vipassana meditation - achieved deep stillness",
      timestamp: "Yesterday, 7:00 PM"
    },
    {
      action: "Diet Plan Updated",
      details: "Added more Vata-pacifying foods: warm soups, ghee, dates",
      timestamp: "2 days ago"
    }
  ],

  // Indian Ayurvedic Health Tips
  healthTips: [
    {
      title: "प्रातःकाल जल सेवन (Morning Hydration)",
      description: "Start your day with warm water mixed with lemon and honey to boost Agni (digestive fire) and cleanse Ama (toxins)"
    },
    {
      title: "सात्विक आहार (Sattvic Diet)",
      description: "Include fresh, seasonal, and locally grown foods. Favor warm, cooked meals over cold or processed foods for better digestion"
    },
    {
      title: "दिनचर्या (Daily Routine)",
      description: "Follow a consistent daily routine aligned with natural circadian rhythms. Wake up before sunrise and sleep by 10 PM"
    },
    {
      title: "प्राणायाम (Pranayama)",
      description: "Practice breathing exercises like Anulom Vilom and Bhramari for 10-15 minutes daily to balance Vata dosha"
    },
    {
      title: "तेल मालिश (Oil Massage)",
      description: "Regular self-massage with warm sesame or coconut oil improves circulation and calms the nervous system"
    },
    {
      title: "त्रिफला सेवन (Triphala Consumption)",
      description: "Take Triphala churna with warm water before bed to support digestion and natural detoxification"
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
          firstName: "Dr. Priya",
          lastName: "Patel",
          email: "priya.patel@ayursutra.com",
          phone: "+91-9876543221"
        },
        specializations: ["Panchakarma", "Digestive Health", "Vata Disorders"],
        consultationFee: 2500,
        qualifications: ["BAMS", "MD (Panchakarma)"],
        experience: 12
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
