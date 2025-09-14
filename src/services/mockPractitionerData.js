// Mock Practitioner Data Service with Indian Cultural Context
import { indianPatientProfiles } from './mockPatientData.js';

// Comprehensive Indian Practitioner Profiles
export const indianPractitionerProfiles = [
  {
    _id: "prac001",
    userId: "507f1f77bcf86cd799439012",
    firstName: "Dr. Rajesh",
    lastName: "Sharma",
    email: "rajesh.sharma@ayursutra.com",
    phone: "+91-9876543210",
    licenseNumber: "AYU12345",
    specializations: ["Panchakarma", "Stress Management", "Detoxification"],
    qualifications: ["BAMS", "MD Ayurveda", "Panchakarma Specialist"],
    experience: 10,
    consultationFee: 1500,
    location: "Mumbai",
    address: "304, Ayurveda Bhavan, Linking Road, Bandra West, Mumbai - 400050",
    rating: 4.8,
    totalReviews: 156,
    availability: {
      Monday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
      Tuesday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
      Wednesday: ["09:00", "10:00", "11:00"],
      Thursday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
      Friday: ["09:00", "10:00", "11:00", "14:00", "15:00"]
    },
    languages: ["English", "Hindi", "Marathi"],
    constitution: "Vata-Pitta",
    treatmentApproach: "Traditional Panchakarma with modern lifestyle integration",
    bio: "Experienced Ayurvedic practitioner specializing in Panchakarma treatments and stress management with 10+ years of clinical experience.",
    achievements: ["Gold Medalist in Panchakarma", "Published researcher in Ayurvedic journals"],
    treatmentSpecialties: ["Abhyanga", "Shirodhara", "Basti", "Nasya", "Stress Relief Therapies"],
    clinicName: "Shree Ayurveda Wellness Center",
    onlineConsultation: true,
    emergencyAvailable: false,
    profileImage: "/images/practitioners/dr-rajesh-sharma.jpg"
  },
  {
    _id: "prac002",
    userId: "507f1f77bcf86cd799439014",
    firstName: "Dr. Priya",
    lastName: "Nair",
    email: "priya.nair@ayursutra.com",
    phone: "+91-9876543211",
    licenseNumber: "AYU67890",
    specializations: ["Digestive Health", "Women's Health", "Herbal Medicine"],
    qualifications: ["BAMS", "MD Ayurveda", "Women's Health Specialist"],
    experience: 8,
    consultationFee: 1200,
    location: "Delhi",
    address: "B-45, Greater Kailash Part 1, New Delhi - 110048",
    rating: 4.6,
    totalReviews: 89,
    availability: {
      Tuesday: ["10:00", "11:00", "14:00", "15:00"],
      Wednesday: ["10:00", "11:00", "14:00", "15:00"],
      Thursday: ["10:00", "11:00", "14:00", "15:00"],
      Friday: ["10:00", "11:00", "14:00", "15:00"],
      Saturday: ["09:00", "10:00", "11:00"]
    },
    languages: ["English", "Hindi", "Malayalam"],
    constitution: "Pitta-Kapha",
    treatmentApproach: "Holistic women's wellness through Ayurvedic principles",
    bio: "Specialist in digestive health and women's wellness through traditional Ayurvedic medicine and herbal formulations.",
    achievements: ["Women's Health Excellence Award", "Digestive Health Research"],
    treatmentSpecialties: ["Herbal Formulations", "Digestive Therapies", "Women's Wellness", "PCOD Treatment"],
    clinicName: "Nair Ayurveda Clinic",
    onlineConsultation: true,
    emergencyAvailable: true,
    profileImage: "/images/practitioners/dr-priya-nair.jpg"
  },
  {
    _id: "prac003",
    userId: "507f1f77bcf86cd799439022",
    firstName: "Dr. Arun",
    lastName: "Krishnamurthy",
    email: "arun.krishnamurthy@ayursutra.com",
    phone: "+91-9876543212",
    licenseNumber: "AYU11111",
    specializations: ["Panchakarma", "Detoxification", "Chronic Diseases", "Rejuvenation Therapy"],
    qualifications: ["BAMS", "MD (Panchakarma)", "PhD (Ayurveda)", "Certified Yoga Instructor"],
    experience: 15,
    consultationFee: 3000,
    location: "Chennai",
    address: "12/3, T. Nagar Main Road, Chennai - 600017",
    rating: 4.9,
    totalReviews: 234,
    availability: {
      Monday: ["08:00", "09:00", "10:00", "16:00", "17:00"],
      Tuesday: ["08:00", "09:00", "10:00", "16:00", "17:00"],
      Wednesday: ["08:00", "09:00", "10:00"],
      Thursday: ["08:00", "09:00", "10:00", "16:00", "17:00"],
      Friday: ["08:00", "09:00", "10:00", "16:00", "17:00"],
      Saturday: ["08:00", "09:00", "10:00"]
    },
    languages: ["English", "Hindi", "Tamil", "Sanskrit"],
    constitution: "Kapha-Pitta",
    treatmentApproach: "Classical Panchakarma with personalized dosha-based treatments",
    bio: "Senior Ayurvedic physician with 15+ years specializing in authentic Panchakarma detoxification and rejuvenation therapies.",
    achievements: ["Gold Medalist in Panchakarma", "International Ayurveda Conference Speaker"],
    treatmentSpecialties: ["Abhyanga", "Shirodhara", "Basti", "Nasya", "Raktamokshana", "Rejuvenation Therapy"],
    clinicName: "Krishnamurthy Panchakarma Center",
    onlineConsultation: true,
    emergencyAvailable: false,
    profileImage: "/images/practitioners/dr-arun-krishnamurthy.jpg"
  }
];

// Mock Dashboard Data for Practitioners
export const mockPractitionerDashboard = {
  todayStats: {
    totalAppointments: 12,
    completedConsultations: 8,
    pendingConsultations: 4,
    totalEarnings: 18000,
    newPatients: 3,
    followUpPatients: 5
  },
  weeklyStats: {
    totalAppointments: 67,
    totalEarnings: 98500,
    patientSatisfaction: 4.7,
    averageConsultationTime: 35
  },
  upcomingAppointments: [
    {
      _id: "apt001",
      patientName: "Arjun Sharma",
      patientId: "pat001",
      time: "10:00",
      type: "Follow-up",
      condition: "Stress Management",
      duration: 30,
      consultationFee: 1500,
      mode: "In-person"
    },
    {
      _id: "apt002",
      patientName: "Meera Patel",
      patientId: "pat002",
      time: "11:00",
      type: "New Consultation",
      condition: "Digestive Issues",
      duration: 45,
      consultationFee: 1500,
      mode: "Online"
    },
    {
      _id: "apt003",
      patientName: "Vikram Singh",
      patientId: "pat003",
      time: "14:00",
      type: "Treatment Review",
      condition: "Joint Pain",
      duration: 30,
      consultationFee: 1500,
      mode: "In-person"
    }
  ],
  recentPatients: [
    {
      _id: "pat001",
      name: "Arjun Sharma",
      lastVisit: "2025-01-14",
      condition: "Stress, Anxiety",
      constitution: "Vata-Pitta",
      treatmentPlan: "Panchakarma + Meditation",
      progress: "Improving",
      nextAppointment: "2025-01-20"
    },
    {
      _id: "pat002",
      name: "Meera Patel",
      lastVisit: "2025-01-13",
      condition: "PCOD, Irregular Periods",
      constitution: "Kapha-Pitta",
      treatmentPlan: "Herbal Medicine + Lifestyle",
      progress: "Good",
      nextAppointment: "2025-01-27"
    }
  ],
  treatmentPlans: [
    {
      _id: "tp001",
      patientName: "Arjun Sharma",
      planName: "Stress Relief Program",
      startDate: "2025-01-01",
      duration: "3 months",
      progress: 65,
      nextSession: "2025-01-20",
      treatments: ["Abhyanga", "Shirodhara", "Pranayama"]
    },
    {
      _id: "tp002",
      patientName: "Meera Patel",
      planName: "Women's Wellness Package",
      startDate: "2024-12-15",
      duration: "6 months",
      progress: 40,
      nextSession: "2025-01-22",
      treatments: ["Herbal Medicine", "Yoga", "Diet Counseling"]
    }
  ],
  notifications: [
    {
      _id: "not001",
      type: "appointment",
      title: "नया अपॉइंटमेंट | New Appointment",
      message: "Arjun Sharma has booked an appointment for tomorrow at 10:00 AM",
      time: "2 hours ago",
      priority: "medium",
      read: false
    },
    {
      _id: "not002",
      type: "payment",
      title: "भुगतान प्राप्त | Payment Received",
      message: "₹1,500 received from Meera Patel via UPI",
      time: "4 hours ago",
      priority: "low",
      read: false
    },
    {
      _id: "not003",
      type: "review",
      title: "नई समीक्षा | New Review",
      message: "Vikram Singh left a 5-star review for your treatment",
      time: "1 day ago",
      priority: "low",
      read: true
    }
  ],
  monthlyEarnings: {
    January: 125000,
    December: 118000,
    November: 132000,
    October: 128000
  },
  patientDemographics: {
    ageGroups: {
      "18-30": 25,
      "31-45": 35,
      "46-60": 30,
      "60+": 10
    },
    genderDistribution: {
      male: 45,
      female: 55
    },
    constitutionTypes: {
      "Vata": 30,
      "Pitta": 35,
      "Kapha": 25,
      "Mixed": 10
    }
  }
};

// Mock Practitioner Services
export const mockPractitionerServices = {
  // Get practitioner profile
  getPractitionerProfile: async (practitionerId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return indianPractitionerProfiles.find(p => p._id === practitionerId) || indianPractitionerProfiles[0];
  },

  // Get dashboard data
  getDashboardData: async (practitionerId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPractitionerDashboard;
  },

  // Get appointments
  getAppointments: async (practitionerId, date) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockPractitionerDashboard.upcomingAppointments;
  },

  // Get patient list
  getPatients: async (practitionerId) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return indianPatientProfiles.slice(0, 10);
  },

  // Update availability
  updateAvailability: async (practitionerId, availability) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: "उपलब्धता अपडेट की गई | Availability updated successfully" };
  },

  // Add treatment plan
  addTreatmentPlan: async (practitionerId, patientId, plan) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return { 
      success: true, 
      message: "उपचार योजना जोड़ी गई | Treatment plan added successfully",
      planId: `tp_${Date.now()}`
    };
  },

  // Get earnings report
  getEarningsReport: async (practitionerId, period) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      totalEarnings: 125000,
      consultations: 85,
      averageFee: 1470,
      topTreatments: [
        { name: "Panchakarma", earnings: 45000, sessions: 30 },
        { name: "Stress Management", earnings: 35000, sessions: 25 },
        { name: "Women's Health", earnings: 25000, sessions: 20 }
      ]
    };
  },

  // Send prescription
  sendPrescription: async (practitionerId, patientId, prescription) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return { 
      success: true, 
      message: "प्रिस्क्रिप्शन भेजी गई | Prescription sent successfully" 
    };
  }
};

// Ayurvedic Treatment Templates
export const treatmentTemplates = {
  stressManagement: {
    name: "तनाव प्रबंधन | Stress Management Program",
    duration: "3 months",
    treatments: [
      "Abhyanga (Oil Massage)",
      "Shirodhara (Oil Pouring)",
      "Pranayama (Breathing Exercises)",
      "Meditation Sessions",
      "Herbal Supplements"
    ],
    medicines: [
      "Brahmi Ghrita",
      "Saraswatarishta",
      "Ashwagandha Churna",
      "Jatamansi Tablets"
    ],
    lifestyle: [
      "Early morning yoga",
      "Regular sleep schedule",
      "Sattvic diet",
      "Digital detox periods"
    ]
  },
  digestiveHealth: {
    name: "पाचन स्वास्थ्य | Digestive Health Program",
    duration: "2 months",
    treatments: [
      "Virechana (Purgation)",
      "Basti (Medicated Enema)",
      "Abhyanga with digestive oils",
      "Dietary counseling"
    ],
    medicines: [
      "Triphala Churna",
      "Hingwashtak Churna",
      "Avipattikar Churna",
      "Dadimashtak Churna"
    ],
    lifestyle: [
      "Regular meal timings",
      "Warm water consumption",
      "Avoid cold foods",
      "Mindful eating practices"
    ]
  },
  womensHealth: {
    name: "महिला स्वास्थ्य | Women's Health Program",
    duration: "4 months",
    treatments: [
      "Uttarbasti (Uterine irrigation)",
      "Yoni Prakshalan",
      "Specialized Abhyanga",
      "Yoga for women's health"
    ],
    medicines: [
      "Shatavari Kalpa",
      "Ashokarishta",
      "Chandraprabha Vati",
      "Kumaryasava"
    ],
    lifestyle: [
      "Regular exercise",
      "Stress management",
      "Balanced nutrition",
      "Adequate rest"
    ]
  }
};

export default mockPractitionerServices;
