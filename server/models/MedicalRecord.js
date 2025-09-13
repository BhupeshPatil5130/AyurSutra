import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  practitionerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practitioner',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  recordType: {
    type: String,
    enum: ['consultation', 'therapy-session', 'follow-up', 'lab-report', 'prescription', 'diagnosis'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Record title is required'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  symptoms: [{
    name: { type: String, required: true },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'mild'
    },
    duration: String,
    notes: String
  }],
  diagnosis: [{
    condition: { type: String, required: true },
    icd10Code: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'mild'
    },
    status: {
      type: String,
      enum: ['suspected', 'confirmed', 'ruled-out'],
      default: 'suspected'
    },
    notes: String
  }],
  treatment: [{
    type: {
      type: String,
      enum: ['medication', 'therapy', 'lifestyle', 'diet', 'exercise', 'other'],
      required: true
    },
    name: { type: String, required: true },
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String,
    startDate: Date,
    endDate: Date
  }],
  vitalSigns: {
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
    bmi: Number
  },
  labResults: [{
    testName: { type: String, required: true },
    value: String,
    unit: String,
    referenceRange: String,
    status: {
      type: String,
      enum: ['normal', 'abnormal', 'critical'],
      default: 'normal'
    },
    testDate: Date,
    labName: String,
    notes: String
  }],
  attachments: [{
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: String,
    fileSize: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  followUpInstructions: String,
  nextAppointmentDate: Date,
  isPrivate: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: { type: Date, default: Date.now },
    permissions: {
      type: String,
      enum: ['read', 'write'],
      default: 'read'
    }
  }],
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'final', 'amended'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Indexes
medicalRecordSchema.index({ patientId: 1, createdAt: -1 });
medicalRecordSchema.index({ practitionerId: 1 });
medicalRecordSchema.index({ recordType: 1 });
medicalRecordSchema.index({ status: 1 });
medicalRecordSchema.index({ tags: 1 });

export default mongoose.model('MedicalRecord', medicalRecordSchema);
