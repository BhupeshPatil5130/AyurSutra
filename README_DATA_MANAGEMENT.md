# AyurSutra Data Management System

## Overview
Comprehensive data management system for the AyurSutra Ayurvedic healthcare platform, providing full CRUD operations and advanced data handling across all user roles.

## Features Implemented

### 🏥 Patient Data Management
- **Appointments Management**: Create, view, edit, and cancel appointments
- **Medical Records**: Comprehensive medical history with Ayurvedic context
- **Therapy Plans**: Personal treatment plans and progress tracking
- **Health Goals**: Set and track wellness objectives
- **Bilingual Support**: Hindi/English interface throughout

### 👨‍⚕️ Practitioner Data Management
- **Patient Records**: Complete patient management system
- **Appointment Scheduling**: Advanced scheduling with time slot management
- **Therapy Plan Creation**: Design custom treatment protocols
- **Treatment Management**: Track medicines, dosages, and instructions
- **Schedule Management**: Availability and booking slot management
- **Analytics Dashboard**: Patient statistics and earnings tracking

### 🔧 Admin Data Management
- **User Management**: Complete system user administration
- **Practitioner Verification**: Manage practitioner credentials and licenses
- **Patient Oversight**: System-wide patient data management
- **Appointment Monitoring**: Global appointment tracking and management
- **Invoice Management**: Financial records and billing oversight
- **Notification System**: System-wide communication management
- **Analytics & Reporting**: Comprehensive system analytics

## Technical Architecture

### Frontend Components
```
src/
├── components/
│   ├── shared/
│   │   ├── DataTable.jsx           # Reusable data table with sorting, pagination, export
│   │   ├── DataManagementForm.jsx  # Universal form component with validation
│   │   └── index.js                # Shared component exports
│   ├── Patient/
│   │   └── PatientDataManagement.jsx
│   ├── Practitioner/
│   │   └── PractitionerDataManagement.jsx
│   └── Admin/
│       └── AdminDataManagement.jsx
└── utils/
    └── dataManager.js              # Unified data management utilities
```

### Backend API
```
server/
├── controllers/
│   └── dataController.js          # Generic CRUD controllers
├── routes/
│   └── dataRoutes.js              # RESTful API endpoints
└── data/                          # JSON data storage
    ├── appointments.json
    ├── patients.json
    ├── practitioners.json
    ├── medicalRecords.json
    ├── therapyPlans.json
    ├── invoices.json
    ├── reviews.json
    ├── notifications.json
    └── users.json
```

## API Endpoints

### Generic CRUD Operations
- `GET /api/data/{type}` - Get all records with filtering
- `GET /api/data/{type}/:id` - Get specific record
- `POST /api/data/{type}` - Create new record
- `PUT /api/data/{type}/:id` - Update existing record
- `DELETE /api/data/{type}/:id` - Delete record
- `GET /api/data/{type}/search` - Search records
- `POST /api/data/{type}/bulk` - Bulk operations

### Specialized Endpoints
- `GET /api/data/appointments/date-range` - Appointments by date range
- `GET /api/data/appointments/available-slots` - Available time slots
- `GET /api/data/patients/:id/medical-history` - Complete patient history
- `GET /api/data/analytics/dashboard` - Role-based analytics

### Utility Endpoints
- `POST /api/data/export` - Export data (CSV/JSON)
- `POST /api/data/validate` - Data validation
- `GET /api/health` - System health check
- `GET /api/docs` - API documentation

## Data Types Supported
- `appointments` - Appointment scheduling and management
- `patients` - Patient records and profiles
- `practitioners` - Healthcare provider information
- `medical-records` - Medical history and diagnoses
- `therapy-plans` - Treatment plans and protocols
- `invoices` - Billing and payment records
- `reviews` - Patient feedback and ratings
- `notifications` - System notifications
- `users` - User accounts and authentication

## Features

### 🔍 Advanced Search & Filtering
- Full-text search across all fields
- Role-based data filtering
- Date range filtering
- Status-based filtering
- Real-time search results

### 📊 Data Export & Import
- CSV export with proper formatting
- JSON export for system backups
- Bulk data operations
- Data validation before import

### 🌐 Internationalization
- Bilingual interface (Hindi/English)
- Culturally appropriate data fields
- Indian phone number validation
- Regional date/time formatting

### 🔒 Security & Validation
- Role-based access control
- Input validation and sanitization
- Data integrity checks
- Audit trail logging

### 📱 Responsive Design
- Mobile-first approach
- Touch-friendly interfaces
- Adaptive layouts
- Cross-browser compatibility

## Ayurvedic-Specific Features

### 🌿 Traditional Medicine Integration
- Dosha constitution tracking (Vata, Pitta, Kapha)
- Traditional treatment categories (Shodhana, Shamana, Rasayana)
- Panchakarma therapy management
- Herbal medicine prescriptions
- Lifestyle and dietary recommendations

### 🏥 Indian Healthcare Context
- CCIM compliance tracking
- Indian medical license validation
- UPI payment integration
- Regional language support
- Cultural practice integration

## Usage Instructions

### For Patients
1. Navigate to "Data Management" in patient portal
2. Use tabs to switch between data types
3. Click "Add New" to create records
4. Use search to find specific information
5. Export data for personal records

### For Practitioners
1. Access "Data Management" from practitioner dashboard
2. Manage patient records and appointments
3. Create and track therapy plans
4. Schedule availability and time slots
5. Generate reports and analytics

### For Administrators
1. Use admin panel "Data Management" section
2. Oversee all system data
3. Manage user accounts and permissions
4. Monitor system analytics
5. Export system-wide reports

## Development Setup

### Prerequisites
- Node.js 16+
- React 18+
- Express.js 4+

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start backend API
cd server && npm start
```

### Environment Variables
```env
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

## Data Validation Rules

### Common Validations
- Required fields validation
- Email format validation
- Indian phone number format
- Date range validation
- Numeric field validation

### Ayurvedic-Specific Validations
- Dosha type validation
- Treatment category validation
- Medicine dosage format
- Therapy duration limits

## Performance Optimizations
- Lazy loading of large datasets
- Pagination for better performance
- Debounced search queries
- Optimized API responses
- Client-side caching

## Future Enhancements
- Real-time data synchronization
- Advanced analytics dashboard
- Machine learning insights
- Integration with external systems
- Mobile app support

## Support
For technical support or feature requests, please contact the development team.

---
*Built with ❤️ for the AyurSutra Ayurvedic Healthcare Platform*
