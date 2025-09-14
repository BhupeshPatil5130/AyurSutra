# Therapy Scheduling Integration

## Overview
This document outlines the complete integration of the therapy scheduling system with priority queue management between the backend and frontend.

## Backend Structure

### Models
- **`server/models/Therapy.js`** - Mongoose model for therapy sessions
  - `sessionId`: Unique identifier for each session
  - `practitionerId`: ID of the practitioner
  - `patientId`: ID of the patient
  - `timeSlot`: Scheduled time for the therapy
  - `status`: Current status (scheduled, waiting, completed, cancelled)
  - `priority`: Priority level (1=High, 2=Medium, 3=Low)
  - `reason`: Reason for status changes

### Controllers
- **`server/controllers/therapyController.js`** - Business logic for therapy management
  - `scheduleTherapy`: Create new therapy sessions
  - `getReadyTherapies`: Get scheduled therapies (ready queue)
  - `getWaitingTherapies`: Get waiting therapies
  - `moveToWaitingQueue`: Move therapy to waiting queue
  - `rescheduleTherapies`: Auto-reschedule waiting therapies

### Routes
- **`server/routes/therapy.js`** - API endpoints
  - `POST /api/therapies/schedule` - Schedule new therapy
  - `GET /api/therapies/ready` - Get ready queue
  - `GET /api/therapies/waiting` - Get waiting queue
  - `PATCH /api/therapies/cancel/:id` - Move to waiting queue
  - `POST /api/therapies/reschedule` - Auto-reschedule

## Frontend Components

### Services
- **`src/services/therapyService.js`** - API service layer
  - Centralized API calls for therapy management
  - Error handling and response processing

### Components

#### Practitioner Components
- **`src/components/Practitioner/TherapyScheduling.jsx`**
  - Real-time queue management
  - Priority-based sorting
  - Move therapies between queues
  - Auto-reschedule functionality

#### Patient Components
- **`src/components/Patient/TherapyBooking.jsx`**
  - View scheduled sessions
  - Book new therapy sessions
  - Filter and search capabilities
  - Status tracking

#### Admin Components
- **`src/components/Admin/TherapyManagement.jsx`**
  - Complete system overview
  - Bulk operations
  - Analytics and reporting
  - Queue management

## Priority Queue System

### Queue Types
1. **Ready Queue** - Therapies scheduled and ready to be performed
2. **Waiting Queue** - Therapies that need to be rescheduled

### Priority Levels
- **Priority 1 (High)** - Emergency cases, urgent treatments
- **Priority 2 (Medium)** - Regular appointments, standard treatments
- **Priority 3 (Low)** - Follow-ups, routine check-ups

### Sorting Logic
- Ready Queue: Sorted by priority (descending), then by time slot (ascending)
- Waiting Queue: Sorted by priority (descending)

## API Endpoints

### Schedule Therapy
```http
POST /api/therapies/schedule
Content-Type: application/json

{
  "practitionerId": "prac123",
  "patientId": "pat456",
  "timeSlot": "2024-01-15T10:00:00.000Z",
  "priority": 2
}
```

### Get Ready Queue
```http
GET /api/therapies/ready
```

### Get Waiting Queue
```http
GET /api/therapies/waiting
```

### Move to Waiting Queue
```http
PATCH /api/therapies/cancel/:id
Content-Type: application/json

{
  "reason": "Patient emergency"
}
```

### Auto Reschedule
```http
POST /api/therapies/reschedule
```

## Features

### Real-time Updates
- Automatic queue refresh
- Status change notifications
- Priority-based sorting

### Queue Management
- Move therapies between queues
- Bulk rescheduling
- Priority adjustment

### User Interfaces
- **Practitioner**: Queue management, session control
- **Patient**: Booking, status tracking
- **Admin**: System overview, analytics

## Integration Steps

1. **Backend Setup**
   - Ensure therapy routes are registered in `server.js`
   - Verify database connection
   - Test API endpoints

2. **Frontend Integration**
   - Import therapy service in components
   - Add therapy components to routing
   - Implement authentication checks

3. **Testing**
   - Test queue operations
   - Verify priority sorting
   - Check real-time updates

## Usage Examples

### Scheduling a Therapy
```javascript
import therapyService from '../services/therapyService';

const scheduleTherapy = async () => {
  try {
    const result = await therapyService.scheduleTherapy({
      practitionerId: 'prac123',
      patientId: 'pat456',
      timeSlot: new Date().toISOString(),
      priority: 2
    });
    console.log('Therapy scheduled:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Getting Queue Status
```javascript
const getQueueStatus = async () => {
  try {
    const [ready, waiting] = await Promise.all([
      therapyService.getReadyTherapies(),
      therapyService.getWaitingTherapies()
    ]);
    console.log('Ready:', ready.length, 'Waiting:', waiting.length);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Error Handling

- Network errors are caught and logged
- User-friendly error messages
- Automatic retry for failed requests
- Graceful degradation when services are unavailable

## Security

- JWT authentication required for all operations
- Role-based access control
- Input validation and sanitization
- Rate limiting for API endpoints

## Performance

- Efficient database queries with proper indexing
- Pagination for large datasets
- Caching for frequently accessed data
- Optimized sorting algorithms

## Future Enhancements

- Real-time notifications via WebSocket
- Advanced analytics and reporting
- Mobile app integration
- Automated scheduling algorithms
- Integration with calendar systems
