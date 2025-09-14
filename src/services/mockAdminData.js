// Mock Admin Data Service with Indian Cultural Context
export const mockAdminStats = {
  totalPractitioners: 45,
  pendingVerifications: 8,
  approvedPractitioners: 32,
  totalPatients: 1247,
  totalAppointments: 3456,
  completedAppointments: 2890,
  activeUsers: 1189,
  monthlyRevenue: 125000,
  systemHealth: 98.5,
  newRegistrations: 156,
  ayurvedicCenters: 23,
  panchakarmaSpecialists: 15,
  womenHealthExperts: 12,
  onlineConsultations: 2156,
  traditionalTreatments: 1890,
  herbalPrescriptions: 3245
};

// Indian Admin User Profiles
export const indianAdminProfiles = [
  {
    _id: "admin001",
    userId: "507f1f77bcf86cd799439027",
    firstName: "Rajesh",
    lastName: "Agarwal",
    email: "rajesh.agarwal@ayursutra.com",
    phone: "+91-9876543215",
    role: "Super Admin",
    department: "Operations",
    designation: "Chief Operations Officer",
    address: "A-204, Sector 18, Noida, Uttar Pradesh - 201301",
    permissions: ["all"],
    languages: ["English", "Hindi"],
    joinDate: "2023-01-15",
    lastLogin: "2025-01-15T09:30:00.000Z",
    isActive: true,
    profileImage: "/images/admin/rajesh-agarwal.jpg"
  },
  {
    _id: "admin002",
    userId: "507f1f77bcf86cd799439028",
    firstName: "Priya",
    lastName: "Menon",
    email: "priya.menon@ayursutra.com",
    phone: "+91-9876543216",
    role: "Admin",
    department: "Quality Assurance",
    designation: "Quality Manager",
    address: "12/B, Koramangala, Bangalore, Karnataka - 560034",
    permissions: ["practitioners", "quality", "reports"],
    languages: ["English", "Hindi", "Malayalam", "Kannada"],
    joinDate: "2023-03-20",
    lastLogin: "2025-01-15T08:45:00.000Z",
    isActive: true,
    profileImage: "/images/admin/priya-menon.jpg"
  },
  {
    _id: "admin003",
    userId: "507f1f77bcf86cd799439029",
    firstName: "Amit",
    lastName: "Joshi",
    email: "amit.joshi@ayursutra.com",
    phone: "+91-9876543217",
    role: "Admin",
    department: "Customer Support",
    designation: "Support Manager",
    address: "301, Satellite Road, Ahmedabad, Gujarat - 380015",
    permissions: ["patients", "support", "appointments"],
    languages: ["English", "Hindi", "Gujarati"],
    joinDate: "2023-05-10",
    lastLogin: "2025-01-14T18:20:00.000Z",
    isActive: true,
    profileImage: "/images/admin/amit-joshi.jpg"
  }
];

export const mockPractitioners = [
  {
    _id: 'prac_001',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh.kumar@ayursutra.com',
    phone: '+91-9876543210',
    specialization: 'Panchakarma Therapy',
    location: 'Mumbai, Maharashtra',
    verificationStatus: 'pending',
    isActive: true,
    rating: 4.8,
    reviewCount: 127,
    experienceStartDate: '2018-03-15',
    licenseNumber: 'AYU-MH-2018-001',
    createdAt: '2023-01-15T10:30:00Z',
    education: [
      {
        degree: 'BAMS',
        institution: 'Mumbai University',
        year: '2017'
      },
      {
        degree: 'MD Ayurveda',
        institution: 'Tilak Maharashtra Vidyapeeth',
        year: '2019'
      }
    ],
    certifications: [
      {
        name: 'Panchakarma Specialist',
        issuedBy: 'National Ayurveda Board',
        year: '2020'
      }
    ],
    documents: [
      {
        type: 'License Certificate',
        filename: 'license_rajesh_kumar.pdf'
      },
      {
        type: 'Educational Certificate',
        filename: 'education_rajesh_kumar.pdf'
      }
    ]
  },
  {
    _id: 'prac_002',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@ayursutra.com',
    phone: '+91-9876543211',
    specialization: 'Ayurvedic Medicine',
    location: 'Delhi, India',
    verificationStatus: 'verified',
    isActive: true,
    rating: 4.9,
    reviewCount: 203,
    experienceStartDate: '2015-06-20',
    licenseNumber: 'AYU-DL-2015-002',
    createdAt: '2022-11-20T14:45:00Z',
    education: [
      {
        degree: 'BAMS',
        institution: 'Delhi University',
        year: '2014'
      }
    ],
    certifications: [
      {
        name: 'Ayurvedic Physician',
        issuedBy: 'Central Council of Indian Medicine',
        year: '2015'
      }
    ],
    documents: [
      {
        type: 'License Certificate',
        filename: 'license_priya_sharma.pdf'
      }
    ]
  },
  {
    _id: 'prac_003',
    firstName: 'Amit',
    lastName: 'Patel',
    email: 'amit.patel@ayursutra.com',
    phone: '+91-9876543212',
    specialization: 'Herbal Medicine',
    location: 'Ahmedabad, Gujarat',
    verificationStatus: 'under_review',
    isActive: true,
    rating: 4.6,
    reviewCount: 89,
    experienceStartDate: '2019-09-10',
    licenseNumber: 'AYU-GJ-2019-003',
    createdAt: '2023-02-28T09:15:00Z',
    education: [
      {
        degree: 'BAMS',
        institution: 'Gujarat Ayurved University',
        year: '2018'
      }
    ],
    certifications: [
      {
        name: 'Herbal Medicine Specialist',
        issuedBy: 'Gujarat Ayurved Board',
        year: '2019'
      }
    ],
    documents: [
      {
        type: 'License Certificate',
        filename: 'license_amit_patel.pdf'
      },
      {
        type: 'Specialization Certificate',
        filename: 'herbal_cert_amit_patel.pdf'
      }
    ]
  },
  {
    _id: 'prac_004',
    firstName: 'Sunita',
    lastName: 'Reddy',
    email: 'sunita.reddy@ayursutra.com',
    phone: '+91-9876543213',
    specialization: 'Yoga Therapy',
    location: 'Hyderabad, Telangana',
    verificationStatus: 'rejected',
    isActive: false,
    rating: 4.3,
    reviewCount: 45,
    experienceStartDate: '2020-01-15',
    licenseNumber: 'AYU-TG-2020-004',
    createdAt: '2023-03-10T16:20:00Z',
    education: [
      {
        degree: 'BNYS',
        institution: 'NTR University of Health Sciences',
        year: '2019'
      }
    ],
    certifications: [
      {
        name: 'Yoga Instructor',
        issuedBy: 'Yoga Alliance India',
        year: '2020'
      }
    ],
    documents: [
      {
        type: 'License Certificate',
        filename: 'license_sunita_reddy.pdf'
      }
    ]
  },
  {
    _id: 'prac_005',
    firstName: 'Vikram',
    lastName: 'Singh',
    email: 'vikram.singh@ayursutra.com',
    phone: '+91-9876543214',
    specialization: 'Pulse Diagnosis',
    location: 'Jaipur, Rajasthan',
    verificationStatus: 'verified',
    isActive: true,
    rating: 4.7,
    reviewCount: 156,
    experienceStartDate: '2016-04-12',
    licenseNumber: 'AYU-RJ-2016-005',
    createdAt: '2022-08-05T11:30:00Z',
    education: [
      {
        degree: 'BAMS',
        institution: 'Rajasthan University of Health Sciences',
        year: '2015'
      },
      {
        degree: 'MD Ayurveda',
        institution: 'National Institute of Ayurveda',
        year: '2017'
      }
    ],
    certifications: [
      {
        name: 'Pulse Diagnosis Expert',
        issuedBy: 'National Institute of Ayurveda',
        year: '2018'
      }
    ],
    documents: [
      {
        type: 'License Certificate',
        filename: 'license_vikram_singh.pdf'
      },
      {
        type: 'MD Certificate',
        filename: 'md_vikram_singh.pdf'
      }
    ]
  }
];

export const mockPatients = [
  {
    _id: 'pat_001',
    firstName: 'Anita',
    lastName: 'Gupta',
    email: 'anita.gupta@email.com',
    phone: '+91-9876543220',
    dateOfBirth: '1985-07-15',
    gender: 'Female',
    location: 'Mumbai, Maharashtra',
    isActive: true,
    registrationDate: '2023-01-20T10:00:00Z',
    lastVisit: '2024-01-10T14:30:00Z',
    totalAppointments: 12,
    medicalConditions: ['Stress', 'Digestive Issues'],
    preferredPractitioner: 'prac_001'
  },
  {
    _id: 'pat_002',
    firstName: 'Rohit',
    lastName: 'Mehta',
    email: 'rohit.mehta@email.com',
    phone: '+91-9876543221',
    dateOfBirth: '1978-12-03',
    gender: 'Male',
    location: 'Delhi, India',
    isActive: true,
    registrationDate: '2022-11-15T09:15:00Z',
    lastVisit: '2024-01-08T11:00:00Z',
    totalAppointments: 8,
    medicalConditions: ['Arthritis', 'High Blood Pressure'],
    preferredPractitioner: 'prac_002'
  },
  {
    _id: 'pat_003',
    firstName: 'Kavya',
    lastName: 'Nair',
    email: 'kavya.nair@email.com',
    phone: '+91-9876543222',
    dateOfBirth: '1992-04-28',
    gender: 'Female',
    location: 'Bangalore, Karnataka',
    isActive: true,
    registrationDate: '2023-06-10T16:45:00Z',
    lastVisit: '2024-01-12T10:30:00Z',
    totalAppointments: 5,
    medicalConditions: ['Anxiety', 'Sleep Disorders'],
    preferredPractitioner: 'prac_005'
  }
];

export const mockAppointments = [
  {
    _id: 'app_001',
    patientId: 'pat_001',
    practitionerId: 'prac_001',
    patientName: 'Anita Gupta',
    practitionerName: 'Dr. Rajesh Kumar',
    appointmentDate: '2024-01-15T10:00:00Z',
    duration: 60,
    status: 'scheduled',
    type: 'Consultation',
    notes: 'Follow-up for stress management therapy',
    fee: 1500,
    createdAt: '2024-01-10T14:30:00Z'
  },
  {
    _id: 'app_002',
    patientId: 'pat_002',
    practitionerId: 'prac_002',
    patientName: 'Rohit Mehta',
    practitionerName: 'Dr. Priya Sharma',
    appointmentDate: '2024-01-14T14:30:00Z',
    duration: 45,
    status: 'completed',
    type: 'Treatment',
    notes: 'Panchakarma session for arthritis',
    fee: 2000,
    createdAt: '2024-01-08T11:00:00Z'
  },
  {
    _id: 'app_003',
    patientId: 'pat_003',
    practitionerId: 'prac_005',
    patientName: 'Kavya Nair',
    practitionerName: 'Dr. Vikram Singh',
    appointmentDate: '2024-01-16T16:00:00Z',
    duration: 30,
    status: 'pending',
    type: 'Consultation',
    notes: 'Initial consultation for sleep disorders',
    fee: 1200,
    createdAt: '2024-01-12T10:30:00Z'
  },
  {
    _id: 'app_004',
    patientId: 'pat_001',
    practitionerId: 'prac_001',
    patientName: 'Anita Gupta',
    practitionerName: 'Dr. Rajesh Kumar',
    appointmentDate: '2024-01-13T11:00:00Z',
    duration: 60,
    status: 'cancelled',
    type: 'Treatment',
    notes: 'Patient requested cancellation',
    fee: 1800,
    createdAt: '2024-01-11T09:15:00Z'
  }
];

export const mockNotifications = [
  {
    _id: 'notif_001',
    type: 'verification_pending',
    title: 'New Practitioner Verification Required',
    message: 'Dr. Rajesh Kumar has submitted documents for verification',
    isRead: false,
    createdAt: '2024-01-14T09:30:00Z',
    priority: 'high',
    actionUrl: '/admin/practitioners/prac_001'
  },
  {
    _id: 'notif_002',
    type: 'system_alert',
    title: 'System Maintenance Scheduled',
    message: 'Scheduled maintenance on January 20th from 2:00 AM to 4:00 AM',
    isRead: false,
    createdAt: '2024-01-13T16:45:00Z',
    priority: 'medium',
    actionUrl: '/admin/system-settings'
  },
  {
    _id: 'notif_003',
    type: 'appointment_surge',
    title: 'High Appointment Volume',
    message: '25% increase in appointments this week',
    isRead: true,
    createdAt: '2024-01-12T14:20:00Z',
    priority: 'low',
    actionUrl: '/admin/appointments'
  }
];

export const mockSystemAnalytics = {
  userGrowth: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    patients: [120, 145, 167, 189, 210, 247],
    practitioners: [15, 18, 22, 28, 35, 45]
  },
  appointmentTrends: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    scheduled: [45, 52, 48, 61],
    completed: [42, 49, 45, 58],
    cancelled: [3, 3, 3, 3]
  },
  revenueData: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    revenue: [85000, 92000, 98000, 105000, 118000, 125000],
    expenses: [25000, 27000, 28000, 30000, 32000, 35000]
  },
  popularServices: [
    { name: 'Panchakarma Therapy', count: 156, percentage: 35 },
    { name: 'Ayurvedic Consultation', count: 134, percentage: 30 },
    { name: 'Herbal Medicine', count: 89, percentage: 20 },
    { name: 'Yoga Therapy', count: 67, percentage: 15 }
  ]
};

export const mockAuditLogs = [
  {
    _id: 'audit_001',
    action: 'PRACTITIONER_VERIFIED',
    performedBy: 'admin_001',
    performedByName: 'Admin User',
    targetId: 'prac_002',
    targetType: 'practitioner',
    details: 'Verified Dr. Priya Sharma',
    timestamp: '2024-01-14T10:30:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    _id: 'audit_002',
    action: 'PATIENT_REGISTERED',
    performedBy: 'system',
    performedByName: 'System',
    targetId: 'pat_003',
    targetType: 'patient',
    details: 'New patient registration: Kavya Nair',
    timestamp: '2024-01-13T16:45:00Z',
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  },
  {
    _id: 'audit_003',
    action: 'APPOINTMENT_CANCELLED',
    performedBy: 'pat_001',
    performedByName: 'Anita Gupta',
    targetId: 'app_004',
    targetType: 'appointment',
    details: 'Appointment cancelled by patient',
    timestamp: '2024-01-12T14:20:00Z',
    ipAddress: '192.168.1.110',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
  }
];

// API simulation functions
export const simulateApiDelay = (ms = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const generatePaginatedResponse = (data, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    total: data.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(data.length / limit)
  };
};

export const filterData = (data, filters) => {
  return data.filter(item => {
    return Object.keys(filters).every(key => {
      if (!filters[key] || filters[key] === 'all') return true;
      
      if (key === 'search') {
        const searchTerm = filters[key].toLowerCase();
        return Object.values(item).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm)
        );
      }
      
      return item[key] === filters[key];
    });
  });
};

// Enhanced Admin Dashboard Data with Indian Context
export const mockAdminDashboard = {
  todayStats: {
    newRegistrations: 23,
    pendingVerifications: 8,
    completedAppointments: 156,
    totalRevenue: 234500,
    activeUsers: 1189,
    systemAlerts: 3
  },
  weeklyStats: {
    userGrowth: 12.5,
    appointmentGrowth: 8.3,
    revenueGrowth: 15.2,
    practitionerGrowth: 6.7
  },
  recentActivities: [
    {
      _id: "act001",
      type: "practitioner_verification",
      title: "चिकित्सक सत्यापन | Practitioner Verified",
      message: "Dr. Arun Krishnamurthy from Chennai has been verified",
      timestamp: "2025-01-15T10:30:00.000Z",
      priority: "medium",
      icon: "verified"
    },
    {
      _id: "act002",
      type: "system_alert",
      title: "सिस्टम अलर्ट | System Alert",
      message: "High server load detected - Auto-scaling initiated",
      timestamp: "2025-01-15T09:45:00.000Z",
      priority: "high",
      icon: "warning"
    },
    {
      _id: "act003",
      type: "payment_received",
      title: "भुगतान प्राप्त | Payment Received",
      message: "₹25,000 commission received from Mumbai center",
      timestamp: "2025-01-15T08:20:00.000Z",
      priority: "low",
      icon: "payment"
    }
  ],
  regionalStats: {
    "North India": { practitioners: 15, patients: 456, revenue: 67800 },
    "South India": { practitioners: 18, patients: 523, revenue: 78900 },
    "West India": { practitioners: 8, patients: 234, revenue: 34500 },
    "East India": { practitioners: 4, patients: 134, revenue: 19800 }
  },
  ayurvedicSpecialties: {
    "Panchakarma": { practitioners: 15, appointments: 234, satisfaction: 4.8 },
    "Women's Health": { practitioners: 12, appointments: 189, satisfaction: 4.7 },
    "Digestive Health": { practitioners: 10, appointments: 156, satisfaction: 4.6 },
    "Mental Health": { practitioners: 8, appointments: 123, satisfaction: 4.9 }
  }
};

// Mock Admin Services with Indian Cultural Context
export const mockAdminServices = {
  // Get admin dashboard data
  getDashboardData: async (adminId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAdminDashboard;
  },

  // Get admin profile
  getAdminProfile: async (adminId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return indianAdminProfiles.find(admin => admin._id === adminId) || indianAdminProfiles[0];
  },

  // Verify practitioner
  verifyPractitioner: async (practitionerId, adminId, decision) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      success: true,
      message: decision === 'approve' 
        ? "चिकित्सक सत्यापित | Practitioner verified successfully"
        : "चिकित्सक अस्वीकृत | Practitioner verification rejected"
    };
  },

  // Get system analytics
  getSystemAnalytics: async (period) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      ...mockSystemAnalytics,
      ayurvedicTrends: {
        panchakarmaGrowth: 15.3,
        herbalMedicineGrowth: 12.8,
        onlineConsultationGrowth: 25.6,
        traditionalTherapyGrowth: 8.9
      },
      regionalPerformance: mockAdminDashboard.regionalStats
    };
  },

  // Manage user roles
  updateUserRole: async (userId, newRole, adminId) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      success: true,
      message: "उपयोगकर्ता भूमिका अपडेट | User role updated successfully"
    };
  },

  // Generate reports
  generateReport: async (reportType, filters) => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return {
      success: true,
      reportId: `report_${Date.now()}`,
      message: "रिपोर्ट तैयार | Report generated successfully",
      downloadUrl: `/reports/download/${reportType}_${Date.now()}.pdf`
    };
  },

  // System health check
  getSystemHealth: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      overall: 98.5,
      database: 99.2,
      api: 98.8,
      storage: 97.9,
      network: 98.1,
      ayurvedicServices: 99.0,
      paymentGateway: 98.3
    };
  },

  // Send notifications
  sendNotification: async (recipients, message, type) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      message: "सूचना भेजी गई | Notification sent successfully",
      recipientCount: recipients.length
    };
  }
};

// Ayurvedic Quality Standards for Admin
export const ayurvedicQualityStandards = {
  practitionerRequirements: {
    minimumEducation: ["BAMS"],
    requiredCertifications: ["Valid License", "State Registration"],
    experienceMinimum: 2,
    continuingEducation: "20 hours annually",
    languageRequirements: ["Hindi or Regional Language", "Basic English"]
  },
  treatmentStandards: {
    consultationMinimum: 30,
    followUpRequired: true,
    documentationRequired: true,
    patientConsentRequired: true,
    traditionalMethodsPreferred: true
  },
  facilityStandards: {
    hygieneCertification: "Required",
    ayurvedicEquipment: "Traditional + Modern",
    herbalMedicineStorage: "Proper Storage Conditions",
    emergencyProtocols: "First Aid + Referral System"
  }
};

// Indian Regulatory Compliance
export const indianRegulatoryCompliance = {
  ccim: {
    name: "Central Council of Indian Medicine",
    requirements: ["BAMS Registration", "Annual Renewal", "Ethical Guidelines"],
    website: "https://ccim.gov.in"
  },
  stateBoards: {
    requirements: ["State License", "Local Registration", "Tax Compliance"],
    renewalPeriod: "Annual"
  },
  drugLicensing: {
    required: "For Herbal Medicine Dispensing",
    authority: "State Drug Control Department",
    validity: "5 Years"
  },
  gst: {
    registration: "Required for Revenue > ₹20 Lakhs",
    rate: "5% for Medical Services",
    filing: "Monthly/Quarterly"
  }
};

export default mockAdminServices;
