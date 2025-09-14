import mongoose from 'mongoose';

const therapySchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  practitionerId: { type: String, required: true },
  patientId: { type: String, required: true },
  timeSlot: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['scheduled', 'waiting', 'completed', 'cancelled'], 
    default: 'scheduled' 
  },
  priority: { type: Number, default: 1 },
  reason: { type: String }
});

export default mongoose.model('Therapy', therapySchema);
