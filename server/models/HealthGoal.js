import mongoose from 'mongoose';

const healthGoalSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  metric: {
    type: String,
    required: true,
    enum: [
      'weight',
      'blood_pressure',
      'heart_rate',
      'blood_sugar',
      'steps',
      'calories_burned',
      'sleep_hours',
      'water_intake',
      'exercise_minutes',
      'mood',
      'pain_level',
      'energy_level'
    ],
  },
  targetValue: {
    type: Number,
    required: true,
  },
  currentValue: {
    type: Number,
    default: 0,
  },
  unit: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  targetDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  category: {
    type: String,
    enum: [
      'fitness',
      'nutrition',
      'mental_health',
      'chronic_condition',
      'preventive_care',
      'recovery',
      'lifestyle',
      'other'
    ],
    default: 'lifestyle',
  },
  // Progress tracking
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  milestones: [{
    value: Number,
    date: Date,
    description: String,
    achieved: {
      type: Boolean,
      default: false,
    },
    achievedAt: Date,
  }],
  // Reminders
  reminders: [{
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'custom'],
    },
    frequency: Number, // For custom reminders
    time: String, // HH:MM format
    days: [String], // For weekly reminders
    enabled: {
      type: Boolean,
      default: true,
    },
  }],
  // Notes and updates
  notes: [{
    content: String,
    addedAt: {
      type: Date,
      default: Date.now,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  // Practitioner involvement
  practitionerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practitioner',
  },
  practitionerNotes: {
    type: String,
  },
  // Tags for categorization
  tags: [{
    type: String,
  }],
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

// Index for efficient queries
healthGoalSchema.index({ patientId: 1, status: 1, targetDate: 1 });
healthGoalSchema.index({ metric: 1 });
healthGoalSchema.index({ category: 1 });
healthGoalSchema.index({ practitionerId: 1 });

// Virtual for days remaining
healthGoalSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const target = new Date(this.targetDate);
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Virtual for is overdue
healthGoalSchema.virtual('isOverdue').get(function() {
  return this.status === 'active' && new Date() > new Date(this.targetDate);
});

// Virtual for is completed
healthGoalSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed' || this.progress >= 100;
});

// Method to update progress
healthGoalSchema.methods.updateProgress = function(newValue) {
  this.currentValue = newValue;
  
  // Calculate progress percentage
  if (this.targetValue > 0) {
    this.progress = Math.min(100, Math.max(0, (newValue / this.targetValue) * 100));
  }
  
  // Check if goal is completed
  if (this.progress >= 100 && this.status === 'active') {
    this.status = 'completed';
  }
  
  // Check milestones
  this.milestones.forEach(milestone => {
    if (!milestone.achieved && newValue >= milestone.value) {
      milestone.achieved = true;
      milestone.achievedAt = new Date();
    }
  });
  
  return this.save();
};

// Method to add milestone
healthGoalSchema.methods.addMilestone = function(value, description) {
  this.milestones.push({
    value,
    description,
    date: new Date(),
    achieved: false,
  });
  return this.save();
};

// Method to add note
healthGoalSchema.methods.addNote = function(content, addedBy) {
  this.notes.push({
    content,
    addedBy,
    addedAt: new Date(),
  });
  return this.save();
};

// Static method to get goals by status
healthGoalSchema.statics.getByStatus = function(patientId, status) {
  return this.find({ patientId, status }).sort({ targetDate: 1 });
};

// Static method to get overdue goals
healthGoalSchema.statics.getOverdue = function(patientId) {
  return this.find({
    patientId,
    status: 'active',
    targetDate: { $lt: new Date() }
  }).sort({ targetDate: 1 });
};

// Static method to get goals due soon
healthGoalSchema.statics.getDueSoon = function(patientId, days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    patientId,
    status: 'active',
    targetDate: { $lte: futureDate, $gte: new Date() }
  }).sort({ targetDate: 1 });
};

const HealthGoal = mongoose.model('HealthGoal', healthGoalSchema);

export default HealthGoal;
