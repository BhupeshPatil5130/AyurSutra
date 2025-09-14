# Therapy Scheduling Integration Example

## Adding Components to Existing Routes

### 1. Practitioner Routes
Add to your existing practitioner router:

```javascript
// In your practitioner router file
import TherapyScheduling from '../components/Practitioner/TherapyScheduling';

// Add route
<Route path="/therapy-scheduling" element={<TherapyScheduling />} />
```

### 2. Patient Routes
Add to your existing patient router:

```javascript
// In your patient router file
import TherapyBooking from '../components/Patient/TherapyBooking';

// Add route
<Route path="/therapy-booking" element={<TherapyBooking />} />
```

### 3. Admin Routes
Add to your existing admin router:

```javascript
// In your admin router file
import TherapyManagement from '../components/Admin/TherapyManagement';

// Add route
<Route path="/therapy-management" element={<TherapyManagement />} />
```

## Navigation Updates

### Practitioner Navigation
Add to your practitioner navigation menu:

```javascript
{
  name: 'Therapy Scheduling',
  href: '/practitioner/therapy-scheduling',
  icon: Calendar,
  current: location.pathname === '/practitioner/therapy-scheduling'
}
```

### Patient Navigation
Add to your patient navigation menu:

```javascript
{
  name: 'Book Therapy',
  href: '/patient/therapy-booking',
  icon: BookOpen,
  current: location.pathname === '/patient/therapy-booking'
}
```

### Admin Navigation
Add to your admin navigation menu:

```javascript
{
  name: 'Therapy Management',
  href: '/admin/therapy-management',
  icon: Settings,
  current: location.pathname === '/admin/therapy-management'
}
```

## Quick Test

1. Start your backend server
2. Navigate to any of the therapy components
3. Test the queue operations
4. Verify real-time updates

## API Testing

Use these curl commands to test the API:

```bash
# Schedule a therapy
curl -X POST http://localhost:8001/api/therapies/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "practitionerId": "prac123",
    "patientId": "pat456",
    "timeSlot": "2024-01-15T10:00:00.000Z",
    "priority": 2
  }'

# Get ready queue
curl http://localhost:8001/api/therapies/ready

# Get waiting queue
curl http://localhost:8001/api/therapies/waiting
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend allows the frontend origin
2. **Authentication**: Make sure JWT tokens are properly set
3. **API Base URL**: Verify the correct port in `src/utils/api.js`
4. **Database**: Ensure MongoDB is running or mock database is working

### Debug Steps

1. Check browser console for errors
2. Verify network requests in DevTools
3. Test API endpoints directly
4. Check server logs for errors
