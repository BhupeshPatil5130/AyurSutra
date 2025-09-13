import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  height: {
    value: Number,
    unit: { type: String, default: 'cm' }
  },
  weight: {
    value: Number,
    unit: { type: String, default: 'kg' }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  emergencyContact: {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true },
    email: String
  },
  medicalHistory: [{
    condition: { type: String, required: true },
    diagnosedDate: Date,
    status: {
      type: String,
      enum: ['active', 'resolved', 'chronic'],
      default: 'active'
    },
    notes: String,
    treatingPhysician: String
  }],
  allergies: [{
    allergen: { type: String, required: true },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'mild'
    },
    reaction: String,
    notes: String
  }],
  currentMedications: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    startDate: Date,
    endDate: Date,
    prescribedBy: String,
    notes: String
  }],
  vitalSigns: [{
    date: { type: Date, default: Date.now },
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    temperature: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    weight: Number,
    height: Number,
    bmi: Number,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  healthGoals: [{
    title: { type: String, required: true },
    description: String,
    targetValue: Number,
    currentValue: Number,
    unit: String,
    targetDate: Date,
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'cancelled'],
      default: 'active'
    },
    progress: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  }],
  documents: [{
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['lab-report', 'prescription', 'medical-record', 'insurance', 'other'],
      required: true
    },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    size: Number,
    isPrivate: { type: Boolean, default: false }
  }],
  paymentMethods: [{
    type: {
      type: String,
      enum: ['card', 'bank', 'upi', 'wallet'],
      required: true
    },
    cardNumber: String,
    cardHolderName: String,
    expiryMonth: Number,
    expiryYear: Number,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    upiId: String,
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  }],
  preferences: {
    preferredLanguage: { type: String, default: 'en' },
    preferredCommunication: {
      type: String,
      enum: ['email', 'sms', 'phone', 'app'],
      default: 'email'
    },
    appointmentReminders: { type: Boolean, default: true },
    healthTips: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false }
  },
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    validUntil: Date,
    coverageAmount: Number
  },
  profileImage: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for age calculation
patientSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for BMI calculation
patientSchema.virtual('currentBMI').get(function() {
  if (!this.height?.value || !this.weight?.value) return null;
  const heightInMeters = this.height.value / 100;
  return (this.weight.value / (heightInMeters * heightInMeters)).toFixed(1);
});

// Indexes
patientSchema.index({ userId: 1 });
patientSchema.index({ 'emergencyContact.phone': 1 });
patientSchema.index({ bloodGroup: 1 });

export default mongoose.model('Patient', patientSchema);
