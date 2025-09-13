import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
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
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    serviceType: {
      type: String,
      enum: ['consultation', 'therapy', 'medicine', 'test', 'other']
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 }
  },
  discount: {
    type: { type: String, enum: ['percentage', 'fixed'] },
    value: { type: Number, default: 0 },
    amount: { type: Number, default: 0 }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank-transfer', 'wallet']
  },
  paymentDate: Date,
  dueDate: {
    type: Date,
    required: true
  },
  notes: String,
  terms: String,
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  remainingAmount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate totals
invoiceSchema.pre('save', function(next) {
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Calculate tax amount
  this.tax.amount = (this.subtotal * this.tax.rate) / 100;
  
  // Calculate discount amount
  if (this.discount.type === 'percentage') {
    this.discount.amount = (this.subtotal * this.discount.value) / 100;
  } else {
    this.discount.amount = this.discount.value;
  }
  
  // Calculate total amount
  this.totalAmount = this.subtotal + this.tax.amount - this.discount.amount;
  
  // Calculate remaining amount
  this.remainingAmount = this.totalAmount - this.paidAmount;
  
  next();
});

// Indexes
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ patientId: 1 });
invoiceSchema.index({ practitionerId: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ paymentStatus: 1 });
invoiceSchema.index({ dueDate: 1 });

export default mongoose.model('Invoice', invoiceSchema);
