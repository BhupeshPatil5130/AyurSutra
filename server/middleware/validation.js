import { body, param, query, validationResult } from 'express-validator';

// Validation result handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('role')
    .isIn(['admin', 'practitioner', 'patient'])
    .withMessage('Role must be admin, practitioner, or patient'),
  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Appointment validation rules
export const validateAppointment = [
  body('patientId')
    .isMongoId()
    .withMessage('Valid patient ID is required'),
  body('practitionerId')
    .isMongoId()
    .withMessage('Valid practitioner ID is required'),
  body('appointmentDate')
    .isISO8601()
    .withMessage('Valid appointment date is required'),
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  body('type')
    .isIn(['consultation', 'therapy', 'follow-up'])
    .withMessage('Type must be consultation, therapy, or follow-up'),
  handleValidationErrors
];

// Patient validation rules
export const validatePatientProfile = [
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Valid date of birth is required'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('emergencyContact.name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Emergency contact name is required'),
  body('emergencyContact.phone')
    .isMobilePhone()
    .withMessage('Valid emergency contact phone is required'),
  handleValidationErrors
];

// Practitioner validation rules
export const validatePractitionerProfile = [
  body('licenseNumber')
    .trim()
    .isLength({ min: 5 })
    .withMessage('License number is required'),
  body('experience')
    .isInt({ min: 0 })
    .withMessage('Experience must be a positive number'),
  body('consultationFee')
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a positive number'),
  body('specializations')
    .isArray({ min: 1 })
    .withMessage('At least one specialization is required'),
  handleValidationErrors
];

// Medical record validation rules
export const validateMedicalRecord = [
  body('patientId')
    .isMongoId()
    .withMessage('Valid patient ID is required'),
  body('recordType')
    .isIn(['consultation', 'therapy-session', 'follow-up', 'lab-report', 'prescription', 'diagnosis'])
    .withMessage('Valid record type is required'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  handleValidationErrors
];

// Message validation rules
export const validateMessage = [
  body('receiverId')
    .isMongoId()
    .withMessage('Valid receiver ID is required'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message content must be between 1 and 2000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file', 'appointment', 'prescription'])
    .withMessage('Invalid message type'),
  handleValidationErrors
];

// Review validation rules
export const validateReview = [
  body('practitionerId')
    .isMongoId()
    .withMessage('Valid practitioner ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
  handleValidationErrors
];

// Therapy plan validation rules
export const validateTherapyPlan = [
  body('patientId')
    .isMongoId()
    .withMessage('Valid patient ID is required'),
  body('name')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Plan name must be between 3 and 200 characters'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive number'),
  body('sessions')
    .isArray({ min: 1 })
    .withMessage('At least one session is required'),
  handleValidationErrors
];

// Common parameter validations
export const validateMongoId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Valid ${paramName} is required`),
  handleValidationErrors
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Common params validation for admin routes
export const validateCommonParams = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'name', 'email', 'status'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  handleValidationErrors
];
