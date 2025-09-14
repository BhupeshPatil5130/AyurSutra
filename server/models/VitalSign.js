import mongoose from 'mongoose';

const vitalSignSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'blood_pressure',
      'heart_rate',
      'temperature',
      'weight',
      'height',
      'bmi',
      'blood_sugar',
      'oxygen_saturation',
      'respiratory_rate',
      'pain_level'
    ],
  },
  value: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  recordedAt: {
    type: Date,
    default: Date.now,
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notes: {
    type: String,
  },
  // For blood pressure, store systolic and diastolic separately
  systolic: {
    type: Number,
  },
  diastolic: {
    type: Number,
  },
  // For pain level (1-10 scale)
  painLevel: {
    type: Number,
    min: 1,
    max: 10,
  },
  // Device information
  device: {
    type: String,
  },
  // Location where measurement was taken
  location: {
    type: String,
    enum: ['home', 'clinic', 'hospital', 'other'],
    default: 'home',
  },
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

// Index for efficient queries
vitalSignSchema.index({ patientId: 1, type: 1, recordedAt: -1 });
vitalSignSchema.index({ recordedAt: -1 });

// Virtual for formatted value
vitalSignSchema.virtual('formattedValue').get(function() {
  if (this.type === 'blood_pressure' && this.systolic && this.diastolic) {
    return `${this.systolic}/${this.diastolic} ${this.unit}`;
  }
  return `${this.value} ${this.unit}`;
});

// Virtual for health status based on vital ranges
vitalSignSchema.virtual('healthStatus').get(function() {
  const value = parseFloat(this.value);
  
  switch (this.type) {
    case 'blood_pressure':
      if (this.systolic && this.diastolic) {
        if (this.systolic < 120 && this.diastolic < 80) return 'normal';
        if (this.systolic < 130 && this.diastolic < 80) return 'elevated';
        if (this.systolic < 140 || this.diastolic < 90) return 'high_stage_1';
        return 'high_stage_2';
      }
      break;
    case 'heart_rate':
      if (value < 60) return 'low';
      if (value > 100) return 'high';
      return 'normal';
    case 'temperature':
      if (value < 36.1) return 'low';
      if (value > 37.2) return 'high';
      return 'normal';
    case 'bmi':
      if (value < 18.5) return 'underweight';
      if (value < 25) return 'normal';
      if (value < 30) return 'overweight';
      return 'obese';
    default:
      return 'normal';
  }
  
  return 'normal';
});

const VitalSign = mongoose.model('VitalSign', vitalSignSchema);

export default VitalSign;
