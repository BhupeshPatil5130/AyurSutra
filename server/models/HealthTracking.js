import mongoose from 'mongoose';

const healthTrackingSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  metric: {
    type: String,
    required: true,
    enum: [
      'weight',
      'blood_pressure',
      'heart_rate',
      'blood_sugar',
      'temperature',
      'steps',
      'calories_burned',
      'sleep_hours',
      'water_intake',
      'mood',
      'pain_level',
      'energy_level',
      'stress_level'
    ],
  },
  value: {
    type: Number,
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
  // For blood pressure, store both values
  systolic: {
    type: Number,
  },
  diastolic: {
    type: Number,
  },
  // For mood tracking (1-10 scale)
  moodValue: {
    type: Number,
    min: 1,
    max: 10,
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
  deviceId: {
    type: String,
  },
  // Location where measurement was taken
  location: {
    type: String,
    enum: ['home', 'clinic', 'hospital', 'gym', 'other'],
    default: 'home',
  },
  // Weather conditions (for outdoor activities)
  weather: {
    temperature: Number,
    humidity: Number,
    condition: String,
  },
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  // Tags for categorization
  tags: [{
    type: String,
  }],
  // Goal association
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthGoal',
  },
}, { timestamps: true });

// Index for efficient queries
healthTrackingSchema.index({ patientId: 1, metric: 1, recordedAt: -1 });
healthTrackingSchema.index({ recordedAt: -1 });
healthTrackingSchema.index({ metric: 1 });
healthTrackingSchema.index({ goalId: 1 });

// Virtual for formatted value
healthTrackingSchema.virtual('formattedValue').get(function() {
  if (this.metric === 'blood_pressure' && this.systolic && this.diastolic) {
    return `${this.systolic}/${this.diastolic} ${this.unit}`;
  }
  return `${this.value} ${this.unit}`;
});

// Virtual for health status based on metric ranges
healthTrackingSchema.virtual('healthStatus').get(function() {
  const value = this.value;
  
  switch (this.metric) {
    case 'weight':
      // This would need BMI calculation for proper assessment
      return 'normal';
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
    case 'blood_sugar':
      if (value < 70) return 'low';
      if (value > 140) return 'high';
      return 'normal';
    case 'temperature':
      if (value < 36.1) return 'low';
      if (value > 37.2) return 'high';
      return 'normal';
    case 'steps':
      if (value < 5000) return 'low';
      if (value > 10000) return 'excellent';
      return 'good';
    case 'sleep_hours':
      if (value < 6) return 'insufficient';
      if (value > 9) return 'excessive';
      return 'optimal';
    case 'mood':
      if (value < 4) return 'low';
      if (value > 7) return 'high';
      return 'normal';
    case 'pain_level':
      if (value < 3) return 'mild';
      if (value > 7) return 'severe';
      return 'moderate';
    default:
      return 'normal';
  }
  
  return 'normal';
});

// Static method to get trends for a metric
healthTrackingSchema.statics.getTrends = async function(patientId, metric, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const data = await this.find({
    patientId,
    metric,
    recordedAt: { $gte: startDate }
  }).sort({ recordedAt: 1 });
  
  if (data.length < 2) {
    return { trend: 'insufficient_data', change: 0, changePercent: 0 };
  }
  
  const firstValue = data[0].value;
  const lastValue = data[data.length - 1].value;
  const change = lastValue - firstValue;
  const changePercent = firstValue !== 0 ? (change / firstValue) * 100 : 0;
  
  let trend = 'stable';
  if (changePercent > 5) trend = 'increasing';
  else if (changePercent < -5) trend = 'decreasing';
  
  return {
    trend,
    change,
    changePercent: Math.round(changePercent * 100) / 100,
    firstValue,
    lastValue,
    dataPoints: data.length
  };
};

// Static method to get daily averages
healthTrackingSchema.statics.getDailyAverages = async function(patientId, metric, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const data = await this.aggregate([
    {
      $match: {
        patientId: new mongoose.Types.ObjectId(patientId),
        metric,
        recordedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$recordedAt' },
          month: { $month: '$recordedAt' },
          day: { $dayOfMonth: '$recordedAt' }
        },
        averageValue: { $avg: '$value' },
        count: { $sum: 1 },
        minValue: { $min: '$value' },
        maxValue: { $max: '$value' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
  
  return data;
};

const HealthTracking = mongoose.model('HealthTracking', healthTrackingSchema);

export default HealthTracking;
