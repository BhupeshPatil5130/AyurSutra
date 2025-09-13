import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['patient', 'practitioner'],
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastReadAt: Date
  }],
  title: {
    type: String,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  lastMessage: {
    content: String,
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'closed'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  tags: [String],
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
conversationSchema.index({ 'participants.userId': 1 });
conversationSchema.index({ status: 1 });
conversationSchema.index({ updatedAt: -1 });

export default mongoose.model('Conversation', conversationSchema);
