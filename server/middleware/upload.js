import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for different file types
const createCloudinaryStorage = (folder, allowedFormats) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `panchakarma/${folder}`,
      allowed_formats: allowedFormats,
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto' }
      ]
    }
  });
};

// Storage configurations for different file types
const profileImageStorage = createCloudinaryStorage('profiles', ['jpg', 'jpeg', 'png', 'webp']);
const documentStorage = createCloudinaryStorage('documents', ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']);
const medicalImageStorage = createCloudinaryStorage('medical', ['jpg', 'jpeg', 'png', 'dicom']);

// File filter function
const fileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;
    
    // Check file extension and mime type
    const isValidExtension = allowedTypes.extensions.includes(fileExtension);
    const isValidMimeType = allowedTypes.mimeTypes.some(type => mimeType.startsWith(type));
    
    if (isValidExtension && isValidMimeType) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.extensions.join(', ')}`), false);
    }
  };
};

// File type configurations
const fileTypes = {
  images: {
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
    mimeTypes: ['image/']
  },
  documents: {
    extensions: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'],
    mimeTypes: ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },
  medical: {
    extensions: ['.jpg', '.jpeg', '.png', '.dicom'],
    mimeTypes: ['image/', 'application/dicom']
  }
};

// Create multer instances for different upload types
export const uploadProfileImage = multer({
  storage: profileImageStorage,
  fileFilter: fileFilter(fileTypes.images),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  }
});

export const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: fileFilter(fileTypes.documents),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5
  }
});

export const uploadMedicalImage = multer({
  storage: medicalImageStorage,
  fileFilter: fileFilter(fileTypes.medical),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for medical images
    files: 10
  }
});

// Generic upload middleware
export const uploadGeneric = multer({
  storage: documentStorage,
  fileFilter: fileFilter(fileTypes.documents),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
    files: 10
  }
});

// Error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          message: 'File too large',
          error: 'File size exceeds the allowed limit'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          message: 'Too many files',
          error: 'Number of files exceeds the allowed limit'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          message: 'Unexpected file field',
          error: 'File field name does not match expected field'
        });
      default:
        return res.status(400).json({
          message: 'Upload error',
          error: error.message
        });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      message: 'Invalid file type',
      error: error.message
    });
  }
  
  next(error);
};

// Utility function to delete file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};

// Utility function to get file info from Cloudinary URL
export const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  // Extract public_id from Cloudinary URL
  const matches = url.match(/\/v\d+\/(.+)\./);
  return matches ? matches[1] : null;
};

// Middleware to validate file upload requirements
export const validateFileUpload = (requirements) => {
  return (req, res, next) => {
    const { maxFiles, requiredFields, optionalFields } = requirements;
    
    // Check if files are present when required
    if (requiredFields && requiredFields.length > 0) {
      const missingFields = requiredFields.filter(field => !req.files || !req.files[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: 'Missing required files',
          missingFields
        });
      }
    }
    
    // Check total file count
    if (maxFiles && req.files) {
      const totalFiles = Object.values(req.files).reduce((total, files) => {
        return total + (Array.isArray(files) ? files.length : 1);
      }, 0);
      
      if (totalFiles > maxFiles) {
        return res.status(400).json({
          message: 'Too many files',
          error: `Maximum ${maxFiles} files allowed, received ${totalFiles}`
        });
      }
    }
    
    next();
  };
};

export default {
  uploadProfileImage,
  uploadDocument,
  uploadMedicalImage,
  uploadGeneric,
  handleUploadError,
  deleteFromCloudinary,
  getPublicIdFromUrl,
  validateFileUpload
};
