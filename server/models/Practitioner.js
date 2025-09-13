import mongoose from 'mongoose';

const practitionerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true
  },
  specializations: [{
    type: String,
    enum: ['Vamana', 'Virechana', 'Basti', 'Nasya', 'Raktamokshana', 'Abhyanga', 'Shirodhara', 'Panchakarma', 'General Ayurveda', 'Pulse Diagnosis', 'Herbal Medicine']
  }],
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative']
  },
  education: [{
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    year: { type: Number, required: true },
    grade: String,
    fieldOfStudy: String
  }],
  certificates: [{
    name: { type: String, required: true },
    issuedBy: { type: String, required: true },
    year: { type: Number, required: true },
    documentUrl: String,
    expiryDate: Date,
    isVerified: { type: Boolean, default: false }
  }],
  clinicAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  bio: {
    type: String,
    maxlength: [2000, 'Bio cannot exceed 2000 characters']
  },
  profileImage: String,
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  verificationNotes: String,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    breakStartTime: String,
    breakEndTime: String
  }],
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: [0, 'Consultation fee cannot be negative']
  },
  languages: [{
    type: String,
    enum: ['English', 'Hindi', 'Sanskrit', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati']
  }],
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    upiId: String
  },
  documents: [{
    type: {
      type: String,
      enum: ['license', 'degree', 'certificate', 'id-proof', 'address-proof', 'other'],
      required: true
    },
    name: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  statistics: {
    totalPatients: { type: Number, default: 0 },
    totalAppointments: { type: Number, default: 0 },
    completedAppointments: { type: Number, default: 0 },
    cancelledAppointments: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 }
  },
  preferences: {
    appointmentDuration: { type: Number, default: 60 }, // in minutes
    maxDailyAppointments: { type: Number, default: 10 },
    autoAcceptAppointments: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: true }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full clinic address
practitionerSchema.virtual('fullClinicAddress').get(function() {
  if (!this.clinicAddress) return '';
  const { name, street, city, state, zipCode, country } = this.clinicAddress;
  return [name, street, city, state, zipCode, country].filter(Boolean).join(', ');
});

// Virtual for experience level
practitionerSchema.virtual('experienceLevel').get(function() {
  if (this.experience < 2) return 'Junior';
  if (this.experience < 5) return 'Mid-level';
  if (this.experience < 10) return 'Senior';
  return 'Expert';
});

// Method to calculate average rating
practitionerSchema.methods.updateRating = function(newRating) {
  this.totalReviews += 1;
  this.rating = ((this.rating * (this.totalReviews - 1)) + newRating) / this.totalReviews;
  this.statistics.averageRating = this.rating;
  return this.save();
};

// Indexes
practitionerSchema.index({ userId: 1 });
practitionerSchema.index({ licenseNumber: 1 });
practitionerSchema.index({ verificationStatus: 1 });
practitionerSchema.index({ specializations: 1 });
practitionerSchema.index({ rating: -1 });
practitionerSchema.index({ 'clinicAddress.city': 1 });
practitionerSchema.index({ 'clinicAddress.state': 1 });

export default mongoose.model('Practitioner', practitionerSchema);
