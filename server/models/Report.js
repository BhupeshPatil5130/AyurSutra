import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  practitionerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practitioner',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['appointments', 'revenue', 'patients', 'reviews', 'analytics']
  },
  title: {
    type: String,
    required: true
  },
  period: {
    type: String,
    required: true,
    enum: ['7d', '30d', '90d', '1y']
  },
  status: {
    type: String,
    required: true,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true
});

// Index for efficient queries
reportSchema.index({ practitionerId: 1, type: 1, generatedAt: -1 });
reportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Report = mongoose.model('Report', reportSchema);

export default Report;
