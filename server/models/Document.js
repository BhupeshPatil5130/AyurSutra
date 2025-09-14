import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'lab_report',
      'scan',
      'prescription',
      'insurance',
      'id_proof',
      'medical_certificate',
      'discharge_summary',
      'consultation_notes',
      'other'
    ],
  },
  fileName: {
    type: String,
    required: true,
  },
  originalFileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  folder: {
    type: String,
    default: 'general',
    enum: [
      'medical_reports',
      'scans',
      'prescriptions',
      'insurance',
      'general',
      'id_documents',
      'certificates'
    ],
  },
  tags: [{
    type: String,
  }],
  description: {
    type: String,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true,
  },
  shareExpiresAt: {
    type: Date,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Document metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  // Version control
  version: {
    type: Number,
    default: 1,
  },
  parentDocument: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  },
  // Access control
  accessLevel: {
    type: String,
    enum: ['private', 'practitioner', 'public'],
    default: 'private',
  },
  // Document status
  status: {
    type: String,
    enum: ['uploading', 'processing', 'ready', 'error'],
    default: 'ready',
  },
  processingError: {
    type: String,
  },
}, { timestamps: true });

// Index for efficient queries
documentSchema.index({ patientId: 1, folder: 1, createdAt: -1 });
documentSchema.index({ type: 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ shareToken: 1 });
documentSchema.index({ uploadedBy: 1 });

// Virtual for file size in human readable format
documentSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for file extension
documentSchema.virtual('fileExtension').get(function() {
  return this.fileName.split('.').pop().toLowerCase();
});

// Virtual for is image
documentSchema.virtual('isImage').get(function() {
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  return imageTypes.includes(this.fileExtension);
});

// Virtual for is pdf
documentSchema.virtual('isPdf').get(function() {
  return this.fileExtension === 'pdf';
});

// Method to generate share token
documentSchema.methods.generateShareToken = function() {
  const crypto = require('crypto');
  this.shareToken = crypto.randomBytes(32).toString('hex');
  this.shareExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  return this.shareToken;
};

// Method to check if share token is valid
documentSchema.methods.isShareTokenValid = function() {
  if (!this.shareToken || !this.shareExpiresAt) return false;
  return new Date() < this.shareExpiresAt;
};

const Document = mongoose.model('Document', documentSchema);

export default Document;
