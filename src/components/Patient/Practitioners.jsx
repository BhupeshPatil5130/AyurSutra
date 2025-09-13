import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  User,
  Award,
  Clock,
  Heart,
  MessageCircle,
  Eye,
  X
} from 'lucide-react';

const Practitioners = () => {
  const [practitioners, setPractitioners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPractitioner, setSelectedPractitioner] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [filters, setFilters] = useState({
    specialization: 'all',
    rating: 'all',
    availability: 'all',
    location: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const [bookingForm, setBookingForm] = useState({
    appointmentDate: '',
    startTime: '',
    type: 'consultation',
    notes: ''
  });

  useEffect(() => {
    fetchPractitioners();
  }, [filters, searchTerm]);

  const fetchPractitioners = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filters.specialization !== 'all') queryParams.append('specialization', filters.specialization);
      if (filters.rating !== 'all') queryParams.append('minRating', filters.rating);
      if (searchTerm) queryParams.append('search', searchTerm);
      
      const response = await fetch(`/api/patient/practitioners?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPractitioners(data.practitioners || []);
    } catch (error) {
      console.error('Error fetching practitioners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/patient/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          practitionerId: selectedPractitioner._id,
          ...bookingForm
        })
      });

      if (response.ok) {
        setShowBookingModal(false);
        setBookingForm({
          appointmentDate: '',
          startTime: '',
          type: 'consultation',
          notes: ''
        });
        // Show success message
        alert('Appointment booked successfully!');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

  const PractitionerCard = ({ practitioner }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
          {practitioner.firstName?.charAt(0)}{practitioner.lastName?.charAt(0)}
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Dr. {practitioner.firstName} {practitioner.lastName}
              </h3>
              <p className="text-sm text-gray-600">{practitioner.specializations?.join(', ')}</p>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700">
                {practitioner.rating?.average || 'N/A'}
              </span>
              <span className="text-xs text-gray-500">
                ({practitioner.rating?.count || 0} reviews)
              </span>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Award className="h-4 w-4 mr-2" />
              {practitioner.experience} years experience
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {practitioner.clinicInfo?.address || 'Location not specified'}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              {practitioner.phone}
            </div>
          </div>

          {practitioner.bio && (
            <p className="text-sm text-gray-700 mb-4 line-clamp-2">{practitioner.bio}</p>
          )}

          {/* Specializations */}
          <div className="flex flex-wrap gap-2 mb-4">
            {practitioner.specializations?.slice(0, 3).map((spec, index) => (
              <span key={index} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                {spec}
              </span>
            ))}
            {practitioner.specializations?.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                +{practitioner.specializations.length - 3} more
              </span>
            )}
          </div>

          {/* Availability Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                practitioner.isAvailable ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-gray-600">
                {practitioner.isAvailable ? 'Available' : 'Busy'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSelectedPractitioner(practitioner);
                  setShowProfileModal(true);
                }}
                className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Eye className="h-4 w-4 mr-1" />
                View Profile
              </button>
              <button
                onClick={() => {
                  setSelectedPractitioner(practitioner);
                  setShowBookingModal(true);
                }}
                className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ProfileModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto m-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Practitioner Profile</h2>
          <button
            onClick={() => setShowProfileModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {selectedPractitioner && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {selectedPractitioner.firstName?.charAt(0)}{selectedPractitioner.lastName?.charAt(0)}
              </div>
              
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Dr. {selectedPractitioner.firstName} {selectedPractitioner.lastName}
                </h3>
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="font-medium text-gray-700">
                      {selectedPractitioner.rating?.average || 'N/A'}
                    </span>
                    <span className="text-gray-500">
                      ({selectedPractitioner.rating?.count || 0} reviews)
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-700">{selectedPractitioner.experience} years experience</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {selectedPractitioner.specializations?.map((spec, index) => (
                    <span key={index} className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bio */}
            {selectedPractitioner.bio && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">About</h4>
                <p className="text-gray-700">{selectedPractitioner.bio}</p>
              </div>
            )}

            {/* Education & Certifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedPractitioner.education && selectedPractitioner.education.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Education</h4>
                  <div className="space-y-3">
                    {selectedPractitioner.education.map((edu, index) => (
                      <div key={index} className="border-l-4 border-blue-400 pl-3">
                        <p className="font-medium text-gray-900">{edu.degree}</p>
                        <p className="text-sm text-gray-600">{edu.institution}</p>
                        <p className="text-xs text-gray-500">{edu.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPractitioner.certifications && selectedPractitioner.certifications.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Certifications</h4>
                  <div className="space-y-2">
                    {selectedPractitioner.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact & Clinic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{selectedPractitioner.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{selectedPractitioner.email}</span>
                  </div>
                </div>
              </div>

              {selectedPractitioner.clinicInfo && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Clinic Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-700">{selectedPractitioner.clinicInfo.name}</p>
                        <p className="text-xs text-gray-600">{selectedPractitioner.clinicInfo.address}</p>
                      </div>
                    </div>
                    {selectedPractitioner.clinicInfo.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{selectedPractitioner.clinicInfo.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Availability */}
            {selectedPractitioner.availability && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Availability</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(selectedPractitioner.availability).map(([day, times]) => (
                    <div key={day} className="text-center">
                      <p className="text-sm font-medium text-gray-700 capitalize">{day}</p>
                      {times.isAvailable ? (
                        <div className="text-xs text-gray-600">
                          <p>{times.startTime} - {times.endTime}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-red-600">Closed</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setShowBookingModal(true);
                }}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Message
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const BookingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Book Appointment</h2>
        
        {selectedPractitioner && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {selectedPractitioner.firstName?.charAt(0)}{selectedPractitioner.lastName?.charAt(0)}
              </div>
              <div>
                <p className="font-medium">Dr. {selectedPractitioner.firstName} {selectedPractitioner.lastName}</p>
                <p className="text-sm text-gray-600">{selectedPractitioner.specializations?.[0]}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleBookAppointment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={bookingForm.appointmentDate}
              onChange={(e) => setBookingForm({...bookingForm, appointmentDate: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <select
              value={bookingForm.startTime}
              onChange={(e) => setBookingForm({...bookingForm, startTime: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select time</option>
              <option value="09:00">09:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="14:00">02:00 PM</option>
              <option value="15:00">03:00 PM</option>
              <option value="16:00">04:00 PM</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Type
            </label>
            <select
              value={bookingForm.type}
              onChange={(e) => setBookingForm({...bookingForm, type: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="consultation">Consultation</option>
              <option value="therapy">Therapy Session</option>
              <option value="follow-up">Follow-up</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={bookingForm.notes}
              onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
              placeholder="Any specific concerns or requirements..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowBookingModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Book Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Practitioners</h1>
        <p className="text-gray-600">Discover qualified Ayurvedic practitioners for your wellness journey</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search practitioners by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={filters.specialization}
              onChange={(e) => setFilters({...filters, specialization: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Specializations</option>
              <option value="Panchakarma">Panchakarma</option>
              <option value="Ayurvedic Medicine">Ayurvedic Medicine</option>
              <option value="Herbal Medicine">Herbal Medicine</option>
              <option value="Yoga Therapy">Yoga Therapy</option>
              <option value="Meditation">Meditation</option>
            </select>

            <select
              value={filters.rating}
              onChange={(e) => setFilters({...filters, rating: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>

            <select
              value={filters.availability}
              onChange={(e) => setFilters({...filters, availability: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Availability</option>
              <option value="available">Available Now</option>
              <option value="today">Available Today</option>
            </select>
          </div>
        </div>
      </div>

      {/* Practitioners List */}
      <div className="space-y-4">
        {practitioners.length > 0 ? (
          practitioners.map(practitioner => (
            <PractitionerCard key={practitioner._id} practitioner={practitioner} />
          ))
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No practitioners found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showProfileModal && <ProfileModal />}
      {showBookingModal && <BookingModal />}
    </div>
  );
};

export default Practitioners;
