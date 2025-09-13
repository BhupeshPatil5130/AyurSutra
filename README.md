# 🌿 Panchakarma Management System

A comprehensive MERN stack web application for managing Panchakarma therapy practices with three distinct user roles: Admin, Practitioners, and Patients.

## Features

### 🔐 Authentication & Authorization
- Role-based access control (Admin, Practitioner, Patient)
- JWT-based authentication
- Demo login accounts for testing

### 👨‍⚕️ Admin Features
- Practitioner verification system
- View and manage all practitioners and patients
- Monitor appointments and system statistics
- User management (activate/deactivate accounts)

### 🧘‍♂️ Practitioner Features
- Profile management with verification status
- Patient management and appointment scheduling
- Create and manage personalized therapy plans
- View patient feedback and ratings
- Real-time notifications for appointments

### 🙋‍♀️ Patient Features
- Book appointments with verified practitioners
- View personalized therapy plans and progress
- Rate and review practitioners (5-star system)
- Track wellness journey and session history
- Receive appointment reminders and notifications

### 🔔 Notification System
- Real-time notifications using Socket.io
- In-app notification dropdown
- Appointment reminders and status updates
- Verification status notifications

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Socket.io** for real-time notifications
- **bcryptjs** for password hashing

### Frontend
- **React 19** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **date-fns** for date formatting

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud) - Optional, uses mock database in development
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd AyurSutra
```

2. **Install Backend Dependencies**
```bash
cd server
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ..
npm install
```

4. **Environment Setup (Optional)**
Create a `.env` file in the `server` directory for production:
```env
MONGODB_URI=mongodb://localhost:27017/ayursutra
JWT_SECRET=ayursutra_jwt_secret_key_2024
PORT=8001
NODE_ENV=production
FRONTEND_URL=http://localhost:5173
```

**Note:** The application works out-of-the-box with a mock database in development mode. No MongoDB setup required for testing.

5. **Start the Application**

**Option 1: Start both frontend and backend together**
```bash
npm run start:full
```

**Option 2: Start separately**

Backend (Terminal 1):
```bash
cd server
npm start
```

Frontend (Terminal 2):
```bash
npm run dev
```

6. **Test API Connections**
```bash
npm run test:api
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8001/api

## Demo Accounts

### Admin
- **Email:** admin@panchakarma.com
- **Password:** demo123
- **Demo Login:** Use `/api/auth/demo-login/admin` endpoint

### Practitioner
- **Email:** practitioner@panchakarma.com
- **Password:** demo123
- **Demo Login:** Use `/api/auth/demo-login/practitioner` endpoint

### Patient
- **Email:** patient@panchakarma.com
- **Password:** demo123
- **Demo Login:** Use `/api/auth/demo-login/patient` endpoint

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/demo-login/:role` - Demo login

### Admin Routes
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/practitioners/pending` - Pending verifications
- `POST /api/admin/practitioners/:id/verify` - Verify practitioner
- `GET /api/admin/notification-settings` - Get notification preferences
- `PUT /api/admin/notification-settings` - Update notification preferences
- `GET /api/admin/notifications` - Get admin notifications
- `PUT /api/admin/notifications/:id/read` - Mark notification as read

### Practitioner Routes
- `GET /api/practitioner/dashboard` - Dashboard statistics
- `GET /api/practitioner/appointments` - View appointments
- `POST /api/practitioner/therapy-plans` - Create therapy plan
- `GET /api/practitioner/notification-settings` - Get notification preferences
- `PUT /api/practitioner/notification-settings` - Update notification preferences
- `GET /api/practitioner/notifications` - Get practitioner notifications
- `PUT /api/practitioner/notifications/:id/read` - Mark notification as read

### Patient Routes
- `GET /api/patient/dashboard` - Dashboard statistics
- `POST /api/patient/appointments` - Book appointment
- `POST /api/patient/reviews` - Submit review
- `GET /api/patient/notification-settings` - Get notification preferences
- `PUT /api/patient/notification-settings` - Update notification preferences
- `GET /api/patient/notifications` - Get patient notifications
- `PUT /api/patient/notifications/:id/read` - Mark notification as read

### Global Notifications (Legacy)
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read

## Project Structure

```
├── server/                 # Backend application
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication middleware
│   ├── scripts/           # Database seeding scripts
│   └── server.js          # Express server setup
├── src/                   # Frontend application
│   ├── components/        # React components
│   │   ├── Admin/         # Admin dashboard components
│   │   ├── Auth/          # Authentication components
│   │   ├── Layout/        # Layout components
│   │   ├── Patient/       # Patient dashboard components
│   │   └── Practitioner/  # Practitioner dashboard components
│   ├── context/           # React context providers
│   ├── utils/             # Utility functions
│   └── App.jsx            # Main App component
└── README.md
```

## Features in Detail

### Practitioner Verification Workflow
1. Practitioner registers and fills profile information
2. Admin reviews practitioner credentials and documents
3. Admin approves or rejects with feedback
4. Approved practitioners can schedule appointments
5. Real-time notifications keep users informed

### Therapy Plan Management
- Practitioners create personalized treatment plans
- Include session details, diet plans, and lifestyle recommendations
- Track progress and update plans as needed
- Patients can view detailed therapy information

### Review & Rating System
- 5-star rating system with detailed aspects
- Anonymous review option
- Practitioner rating calculation and display
- Feedback helps improve service quality

### Real-time Notifications
- Appointment confirmations and reminders
- Verification status updates
- New review notifications
- System-wide announcements

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
