import mongoose from 'mongoose';

const therapyPlanSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  therapyType: {
    type: String,
    enum: ['Vamana', 'Virechana', 'Basti', 'Nasya', 'Raktamokshana', 'Abhyanga', 'Shirodhara', 'Panchakarma'],
    required: true
  },
  duration: {
    type: Number, // in days
    required: true
  },
  sessions: [{
    sessionNumber: Number,
    date: Date,
    duration: Number, // in minutes
    therapyDetails: String,
    medicines: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String
    }],
    instructions: String,
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled'
    },
    notes: String,
    completedAt: Date
  }],
  dietPlan: {
    breakfast: [String],
    lunch: [String],
    dinner: [String],
    restrictions: [String],
    supplements: [String]
  },
  lifestyleRecommendations: [String],
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  totalCost: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

therapyPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('TherapyPlan', therapyPlanSchema);
