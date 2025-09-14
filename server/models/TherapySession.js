import mongoose from 'mongoose';

const therapySessionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  practitionerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practitioner',
    required: true,
  },
  therapyPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TherapyPlan',
    required: true,
  },
  sessionNumber: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    default: 60,
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled',
  },
  // Session details
  sessionType: {
    type: String,
    enum: [
      'consultation',
      'therapy',
      'follow_up',
      'assessment',
      'emergency',
      'group_session',
      'online_session'
    ],
    default: 'therapy',
  },
  location: {
    type: String,
    enum: ['clinic', 'home', 'online', 'hospital'],
    default: 'clinic',
  },
  // Online session details
  meetingLink: {
    type: String,
  },
  meetingId: {
    type: String,
  },
  // Session notes
  notes: {
    type: String,
  },
  practitionerNotes: {
    type: String,
  },
  patientNotes: {
    type: String,
  },
  // Exercises and activities
  exercises: [{
    name: String,
    description: String,
    duration: Number, // in minutes
    repetitions: Number,
    sets: Number,
    completed: {
      type: Boolean,
      default: false,
    },
    notes: String,
  }],
  // Diet and lifestyle recommendations
  dietRecommendations: [{
    item: String,
    quantity: String,
    timing: String,
    notes: String,
  }],
  lifestyleRecommendations: [{
    activity: String,
    frequency: String,
    duration: String,
    notes: String,
  }],
  // Session outcomes
  outcomes: [{
    metric: String,
    value: String,
    unit: String,
    notes: String,
  }],
  // Pain and discomfort tracking
  painLevel: {
    before: Number,
    after: Number,
    notes: String,
  },
  // Patient feedback
  patientFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comments: String,
    wouldRecommend: Boolean,
  },
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false,
  },
  followUpDate: {
    type: Date,
  },
  followUpNotes: {
    type: String,
  },
  // Session completion
  startedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  actualDuration: {
    type: Number, // in minutes
  },
  // Cancellation details
  cancelledAt: {
    type: Date,
  },
  cancellationReason: {
    type: String,
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

// Index for efficient queries
therapySessionSchema.index({ patientId: 1, scheduledDate: -1 });
therapySessionSchema.index({ practitionerId: 1, scheduledDate: -1 });
therapySessionSchema.index({ therapyPlanId: 1 });
therapySessionSchema.index({ status: 1 });
therapySessionSchema.index({ sessionType: 1 });

// Virtual for session duration in hours
therapySessionSchema.virtual('durationInHours').get(function() {
  return this.duration / 60;
});

// Virtual for is overdue
therapySessionSchema.virtual('isOverdue').get(function() {
  return this.status === 'scheduled' && new Date() > this.scheduledDate;
});

// Virtual for is upcoming
therapySessionSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  const sessionTime = new Date(this.scheduledDate);
  const timeDiff = sessionTime - now;
  return timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000; // Within 24 hours
});

// Method to start session
therapySessionSchema.methods.startSession = function() {
  this.status = 'in_progress';
  this.startedAt = new Date();
  return this.save();
};

// Method to complete session
therapySessionSchema.methods.completeSession = function(notes, outcomes) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.notes = notes;
  this.outcomes = outcomes;
  
  if (this.startedAt) {
    this.actualDuration = Math.round((this.completedAt - this.startedAt) / (1000 * 60));
  }
  
  return this.save();
};

// Method to cancel session
therapySessionSchema.methods.cancelSession = function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  this.cancelledBy = cancelledBy;
  return this.save();
};

// Method to reschedule session
therapySessionSchema.methods.reschedule = function(newDate) {
  this.scheduledDate = newDate;
  this.status = 'scheduled';
  return this.save();
};

// Static method to get upcoming sessions
therapySessionSchema.statics.getUpcoming = function(patientId, days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    patientId,
    status: 'scheduled',
    scheduledDate: { $gte: new Date(), $lte: futureDate }
  }).sort({ scheduledDate: 1 });
};

// Static method to get session history
therapySessionSchema.statics.getHistory = function(patientId, limit = 10) {
  return this.find({
    patientId,
    status: { $in: ['completed', 'cancelled'] }
  })
  .sort({ scheduledDate: -1 })
  .limit(limit);
};

// Static method to get sessions by date range
therapySessionSchema.statics.getByDateRange = function(patientId, startDate, endDate) {
  return this.find({
    patientId,
    scheduledDate: { $gte: startDate, $lte: endDate }
  }).sort({ scheduledDate: 1 });
};

const TherapySession = mongoose.model('TherapySession', therapySessionSchema);

export default TherapySession;
