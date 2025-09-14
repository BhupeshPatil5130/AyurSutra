import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['card', 'upi', 'netbanking', 'wallet'],
  },
  // Card details
  last4: {
    type: String,
    required: function() {
      return this.type === 'card';
    }
  },
  brand: {
    type: String,
    enum: ['visa', 'mastercard', 'amex', 'rupay'],
    required: function() {
      return this.type === 'card';
    }
  },
  expiryMonth: {
    type: Number,
    min: 1,
    max: 12,
    required: function() {
      return this.type === 'card';
    }
  },
  expiryYear: {
    type: Number,
    required: function() {
      return this.type === 'card';
    }
  },
  // UPI details
  upiId: {
    type: String,
    required: function() {
      return this.type === 'upi';
    }
  },
  // Wallet details
  walletType: {
    type: String,
    enum: ['paytm', 'phonepe', 'gpay', 'amazon_pay'],
    required: function() {
      return this.type === 'wallet';
    }
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

// Ensure only one default payment method per patient
paymentMethodSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await PaymentMethod.updateMany(
      { patientId: this.patientId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

export default PaymentMethod;
