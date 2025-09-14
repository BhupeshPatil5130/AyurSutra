import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true,
  },
  paymentMethodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
  },
  gatewayTransactionId: {
    type: String,
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  failureReason: {
    type: String,
  },
  refundAmount: {
    type: Number,
    default: 0,
  },
  refundReason: {
    type: String,
  },
  refundedAt: {
    type: Date,
  },
  // Payment gateway details
  gateway: {
    type: String,
    enum: ['razorpay', 'stripe', 'payu', 'ccavenue'],
    required: true,
  },
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

// Index for efficient queries
paymentSchema.index({ patientId: 1, createdAt: -1 });
paymentSchema.index({ invoiceId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
