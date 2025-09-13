import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  uploadProfileImage, 
  uploadDocument, 
  uploadMedicalImage, 
  uploadGeneric,
  handleUploadError,
  deleteFromCloudinary,
  getPublicIdFromUrl,
  validateFileUpload
} from '../middleware/upload.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Practitioner from '../models/Practitioner.js';
import MedicalRecord from '../models/MedicalRecord.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Upload profile image
router.post('/profile-image', 
  uploadProfileImage.single('profileImage'),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const imageUrl = req.file.path;
      const publicId = req.file.filename;

      // Update user's profile image based on role
      if (req.user.role === 'patient') {
        const patient = await Patient.findOne({ userId: req.user._id });
        if (patient) {
          // Delete old image if exists
          if (patient.profileImage) {
            const oldPublicId = getPublicIdFromUrl(patient.profileImage);
            if (oldPublicId) {
              await deleteFromCloudinary(oldPublicId);
            }
          }
          patient.profileImage = imageUrl;
          await patient.save();
        }
      } else if (req.user.role === 'practitioner') {
        const practitioner = await Practitioner.findOne({ userId: req.user._id });
        if (practitioner) {
          // Delete old image if exists
          if (practitioner.profileImage) {
            const oldPublicId = getPublicIdFromUrl(practitioner.profileImage);
            if (oldPublicId) {
              await deleteFromCloudinary(oldPublicId);
            }
          }
          practitioner.profileImage = imageUrl;
          await practitioner.save();
        }
      }

      res.json({
        message: 'Profile image uploaded successfully',
        imageUrl,
        publicId
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Upload documents (certificates, licenses, etc.)
router.post('/documents',
  uploadDocument.array('documents', 5),
  handleUploadError,
  validateFileUpload({ maxFiles: 5 }),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const { documentType, description } = req.body;
      const uploadedFiles = req.files.map(file => ({
        url: file.path,
        publicId: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        documentType: documentType || 'general',
        description: description || '',
        uploadedAt: new Date()
      }));

      // Update practitioner documents if user is practitioner
      if (req.user.role === 'practitioner') {
        const practitioner = await Practitioner.findOne({ userId: req.user._id });
        if (practitioner) {
          if (!practitioner.documents) {
            practitioner.documents = [];
          }
          practitioner.documents.push(...uploadedFiles);
          await practitioner.save();
        }
      }

      // Update patient documents if user is patient
      if (req.user.role === 'patient') {
        const patient = await Patient.findOne({ userId: req.user._id });
        if (patient) {
          if (!patient.documents) {
            patient.documents = [];
          }
          patient.documents.push(...uploadedFiles);
          await patient.save();
        }
      }

      res.json({
        message: 'Documents uploaded successfully',
        files: uploadedFiles
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Upload medical images/reports
router.post('/medical-images',
  uploadMedicalImage.array('medicalImages', 10),
  handleUploadError,
  validateFileUpload({ maxFiles: 10 }),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const { patientId, recordId, imageType, description } = req.body;

      const uploadedFiles = req.files.map(file => ({
        url: file.path,
        publicId: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        imageType: imageType || 'general',
        description: description || '',
        uploadedAt: new Date()
      }));

      // If recordId is provided, attach to medical record
      if (recordId) {
        const medicalRecord = await MedicalRecord.findById(recordId);
        if (medicalRecord) {
          if (!medicalRecord.attachments) {
            medicalRecord.attachments = [];
          }
          medicalRecord.attachments.push(...uploadedFiles);
          await medicalRecord.save();
        }
      }

      res.json({
        message: 'Medical images uploaded successfully',
        files: uploadedFiles
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Generic file upload
router.post('/files',
  uploadGeneric.array('files', 10),
  handleUploadError,
  validateFileUpload({ maxFiles: 10 }),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const { category, description } = req.body;

      const uploadedFiles = req.files.map(file => ({
        url: file.path,
        publicId: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        category: category || 'general',
        description: description || '',
        uploadedBy: req.user._id,
        uploadedAt: new Date()
      }));

      res.json({
        message: 'Files uploaded successfully',
        files: uploadedFiles
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Delete file
router.delete('/files/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Delete from Cloudinary
    const result = await deleteFromCloudinary(publicId);
    
    if (result.result === 'ok') {
      // Remove from user documents if exists
      if (req.user.role === 'practitioner') {
        const practitioner = await Practitioner.findOne({ userId: req.user._id });
        if (practitioner && practitioner.documents) {
          practitioner.documents = practitioner.documents.filter(
            doc => doc.publicId !== publicId
          );
          await practitioner.save();
        }
      }

      if (req.user.role === 'patient') {
        const patient = await Patient.findOne({ userId: req.user._id });
        if (patient && patient.documents) {
          patient.documents = patient.documents.filter(
            doc => doc.publicId !== publicId
          );
          await patient.save();
        }
      }

      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's uploaded files
router.get('/my-files', async (req, res) => {
  try {
    let documents = [];

    if (req.user.role === 'practitioner') {
      const practitioner = await Practitioner.findOne({ userId: req.user._id });
      documents = practitioner?.documents || [];
    } else if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      documents = patient?.documents || [];
    }

    res.json({ documents });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get file info
router.get('/files/:publicId/info', async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // This would typically fetch file metadata from your database
    // For now, we'll return basic info
    res.json({
      publicId,
      message: 'File info retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
