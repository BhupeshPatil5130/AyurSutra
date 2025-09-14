import mongoose from 'mongoose';

const dietItemSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  therapyPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TherapyPlan',
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    enum: [
      'breakfast',
      'lunch',
      'dinner',
      'snack',
      'beverage',
      'supplement',
      'herbal_tea',
      'avoid',
      'limit'
    ],
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  timing: {
    type: String,
    required: true,
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'as_needed'],
    default: 'daily',
  },
  days: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  }],
  // Compliance tracking
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Nutritional information
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbohydrates: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number,
    vitamins: [String],
    minerals: [String],
  },
  // Health benefits
  benefits: [{
    type: String,
  }],
  // Contraindications
  contraindications: [{
    condition: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
    },
    notes: String,
  }],
  // Preparation instructions
  preparation: {
    instructions: String,
    cookingTime: Number, // in minutes
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
    },
    ingredients: [String],
    steps: [String],
  },
  // Notes and comments
  notes: {
    type: String,
  },
  practitionerNotes: {
    type: String,
  },
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  // Status
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active',
  },
  // Start and end dates
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  // Reminders
  reminders: [{
    time: String, // HH:MM format
    enabled: {
      type: Boolean,
      default: true,
    },
    message: String,
  }],
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
dietItemSchema.index({ patientId: 1, category: 1, status: 1 });
dietItemSchema.index({ therapyPlanId: 1 });
dietItemSchema.index({ completed: 1, completedAt: -1 });
dietItemSchema.index({ priority: 1 });
dietItemSchema.index({ tags: 1 });

// Virtual for compliance rate
dietItemSchema.virtual('complianceRate').get(function() {
  // This would need to be calculated based on completion history
  return this.completed ? 100 : 0;
});

// Virtual for is overdue
dietItemSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'active' || this.completed) return false;
  
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const todayDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
  
  // Check if today is in the days array and item is not completed
  return this.days.includes(todayDay) && !this.completed;
});

// Method to mark as completed
dietItemSchema.methods.markCompleted = function(completedBy) {
  this.completed = true;
  this.completedAt = new Date();
  this.completedBy = completedBy;
  return this.save();
};

// Method to reset completion
dietItemSchema.methods.resetCompletion = function() {
  this.completed = false;
  this.completedAt = undefined;
  this.completedBy = undefined;
  return this.save();
};

// Method to add reminder
dietItemSchema.methods.addReminder = function(time, message) {
  this.reminders.push({
    time,
    message: message || `Time to have ${this.name}`,
    enabled: true,
  });
  return this.save();
};

// Method to toggle reminder
dietItemSchema.methods.toggleReminder = function(reminderIndex) {
  if (this.reminders[reminderIndex]) {
    this.reminders[reminderIndex].enabled = !this.reminders[reminderIndex].enabled;
  }
  return this.save();
};

// Static method to get items for today
dietItemSchema.statics.getForToday = function(patientId) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
  
  return this.find({
    patientId,
    status: 'active',
    $or: [
      { days: { $in: [today] } },
      { frequency: 'daily' }
    ]
  }).sort({ priority: -1, timing: 1 });
};

// Static method to get compliance stats
dietItemSchema.statics.getComplianceStats = function(patientId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        patientId: new mongoose.Types.ObjectId(patientId),
        status: 'active',
        startDate: { $lte: endDate },
        $or: [
          { endDate: { $gte: startDate } },
          { endDate: { $exists: false } }
        ]
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [
              { $and: ['$completed', { $gte: ['$completedAt', startDate] }, { $lte: ['$completedAt', endDate] }] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        category: '$_id',
        total: 1,
        completed: 1,
        complianceRate: {
          $multiply: [
            { $divide: ['$completed', '$total'] },
            100
          ]
        }
      }
    }
  ]);
};

// Static method to get overdue items
dietItemSchema.statics.getOverdue = function(patientId) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
  
  return this.find({
    patientId,
    status: 'active',
    completed: false,
    $or: [
      { days: { $in: [today] } },
      { frequency: 'daily' }
    ]
  }).sort({ priority: -1, timing: 1 });
};

const DietItem = mongoose.model('DietItem', dietItemSchema);

export default DietItem;
