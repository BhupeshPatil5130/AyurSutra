import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  User, 
  Calendar, 
  Filter,
  Heart,
  Award,
  Clock,
  Phone,
  Mail
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PractitionerSearch = () => {
  const [practitioners, setPractitioners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedPractitioner, setSelectedPractitioner] = useState(null);
  const [showPractitionerDetails, setShowPractitionerDetails] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    appointmentDate: '',
    startTime: '',
    type: 'consultation',
    notes: ''
  });

  const specializations = [
    'Panchakarma', 'Vamana', 'Virechana', 'Basti', 'Nasya', 
    'Raktamokshana', 'Abhyanga', 'Shirodhara', 'Ayurvedic Medicine'
  ];

  const appointmentTypes = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'therapy', label: 'Therapy Session' },
    { value: 'follow-up', label: 'Follow-up' }
  ];

  useEffect(() => {
    fetchPractitioners();
  }, [specializationFilter, ratingFilter]);

  const fetchPractitioners = async () => {
    try {
      const params = new URLSearchParams();
      if (specializationFilter) {
        params.append('specialization', specializationFilter);
      }
      if (ratingFilter !== 'all') {
        params.append('minRating', ratingFilter);
      }

      const response = await api.get(`/patient/practitioners?${params}`);
      setPractitioners(response.data);
    } catch (error) {
      console.error('Error fetching practitioners:', error);
      toast.error('Error fetching practitioners');
    } finally {
      setLoading(false);
    }
  };

  const fetchPractitionerDetails = async (practitionerId) => {
    try {
      const response = await api.get(`/patient/practitioners/${practitionerId}`);
      setSelectedPractitioner(response.data);
      setShowPractitionerDetails(true);
    } catch (error) {
      console.error('Error fetching practitioner details:', error);
      toast.error('Error fetching practitioner details');
    }
  };

  const bookAppointment = async () => {
    try {
      await api.post('/patient/appointments', {
        ...bookingData,
        practitionerId: selectedPractitioner._id
      });
      toast.success('Appointment booked successfully');
      setShowBookingModal(false);
      setShowPractitionerDetails(false);
      setBookingData({
        appointmentDate: '',
        startTime: '',
        type: 'consultation',
        notes: ''
      });
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Error booking appointment');
    }
  };

  const renderStars = (rating, size = 'h-4 w-4') => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${size} ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredPractitioners = practitioners.filter(practitioner => {
    const matchesSearch = 
      practitioner.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      practitioner.userId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      practitioner.specializations?.some(spec => 
        spec.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesLocation = !locationFilter || 
      practitioner.clinicAddress?.city?.toLowerCase().includes(locationFilter.toLowerCase()) ||
      practitioner.clinicAddress?.state?.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesLocation;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find Practitioners</h1>
          <p className="text-gray-600">Search and book appointments with verified Ayurvedic practitioners</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search practitioners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <select
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Specializations</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
          
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Ratings</option>
            <option value="4">4+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="5">5 Stars</option>
          </select>
        </div>
      </div>

      {/* Practitioners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPractitioners.map((practitioner) => (
          <div key={practitioner._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {practitioner.userId?.firstName?.charAt(0)}{practitioner.userId?.lastName?.charAt(0)}
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Dr. {practitioner.userId?.firstName} {practitioner.userId?.lastName}
                  </h3>
                  <div className="flex items-center mt-1">
                    {renderStars(practitioner.averageRating || 0)}
                    <span className="text-sm text-gray-600 ml-2">
                      ({practitioner.totalReviews || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>
              {practitioner.isVerified && (
                <Award className="h-5 w-5 text-green-500" title="Verified Practitioner" />
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Heart className="h-4 w-4 mr-2" />
                {practitioner.specializations?.slice(0, 2).join(', ')}
                {practitioner.specializations?.length > 2 && '...'}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {practitioner.clinicAddress?.city}, {practitioner.clinicAddress?.state}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {practitioner.experience || 0}+ years experience
              </div>

              {practitioner.consultationFee && (
                <div className="text-sm font-medium text-gray-900">
                  Consultation Fee: ₹{practitioner.consultationFee}
                </div>
              )}

              {/* Availability Status */}
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  practitioner.isAvailable ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className={`text-sm ${
                  practitioner.isAvailable ? 'text-green-700' : 'text-red-700'
                }`}>
                  {practitioner.isAvailable ? 'Available' : 'Busy'}
                </span>
              </div>
            </div>

            <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => fetchPractitionerDetails(practitioner._id)}
                className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                <User className="h-4 w-4 mr-1" />
                View Profile
              </button>
              <button
                onClick={() => {
                  setSelectedPractitioner(practitioner);
                  setShowBookingModal(true);
                }}
                className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                disabled={!practitioner.isAvailable}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPractitioners.length === 0 && (
        <div className="text-center py-8">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No practitioners found matching your criteria</p>
        </div>
      )}

      {/* Practitioner Details Modal */}
      {showPractitionerDetails && selectedPractitioner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto m-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Practitioner Profile</h3>
              <button
                onClick={() => setShowPractitionerDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Info */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-2xl mx-auto mb-3">
                      {selectedPractitioner.userId?.firstName?.charAt(0)}{selectedPractitioner.userId?.lastName?.charAt(0)}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Dr. {selectedPractitioner.userId?.firstName} {selectedPractitioner.userId?.lastName}
                    </h4>
                    <div className="flex items-center justify-center mt-2">
                      {renderStars(selectedPractitioner.averageRating || 0)}
                      <span className="text-sm text-gray-600 ml-2">
                        ({selectedPractitioner.totalReviews || 0} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{selectedPractitioner.userId?.email}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{selectedPractitioner.phone || 'Not provided'}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">
                        {selectedPractitioner.clinicAddress?.city}, {selectedPractitioner.clinicAddress?.state}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{selectedPractitioner.experience || 0}+ years experience</span>
                    </div>

                    {selectedPractitioner.isVerified && (
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm text-green-700">Verified Practitioner</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Specializations */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Specializations</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedPractitioner.specializations?.map((spec, index) => (
                      <span key={index} className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Education */}
                {selectedPractitioner.education?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3">Education</h5>
                    <div className="space-y-2">
                      {selectedPractitioner.education.map((edu, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="font-medium text-sm">{edu.degree}</div>
                          <div className="text-sm text-gray-600">{edu.institution}</div>
                          <div className="text-xs text-gray-500">{edu.year}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certificates */}
                {selectedPractitioner.certificates?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3">Certificates</h5>
                    <div className="space-y-2">
                      {selectedPractitioner.certificates.map((cert, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="font-medium text-sm">{cert.name}</div>
                          <div className="text-sm text-gray-600">{cert.issuedBy}</div>
                          <div className="text-xs text-gray-500">{cert.year}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clinic Address */}
                {selectedPractitioner.clinicAddress && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3">Clinic Address</h5>
                    <div className="text-sm text-gray-700">
                      <p>{selectedPractitioner.clinicAddress.street}</p>
                      <p>{selectedPractitioner.clinicAddress.city}, {selectedPractitioner.clinicAddress.state}</p>
                      <p>{selectedPractitioner.clinicAddress.zipCode}</p>
                    </div>
                  </div>
                )}

                {/* Availability */}
                {selectedPractitioner.availability?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3">Availability</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedPractitioner.availability.map((slot, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium capitalize">{slot.day}:</span>
                          <span className="ml-2">{slot.startTime} - {slot.endTime}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPractitionerDetails(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => setShowBookingModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={!selectedPractitioner.isAvailable}
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedPractitioner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto m-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Book Appointment</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Practitioner</h4>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedPractitioner.userId?.firstName?.charAt(0)}{selectedPractitioner.userId?.lastName?.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">
                      Dr. {selectedPractitioner.userId?.firstName} {selectedPractitioner.userId?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{selectedPractitioner.specializations?.[0]}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
                  <input
                    type="date"
                    value={bookingData.appointmentDate}
                    onChange={(e) => setBookingData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                  <input
                    type="time"
                    value={bookingData.startTime}
                    onChange={(e) => setBookingData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type</label>
                <select
                  value={bookingData.type}
                  onChange={(e) => setBookingData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  {appointmentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Any specific concerns or requirements..."
                />
              </div>

              {selectedPractitioner.consultationFee && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-900">Consultation Fee:</span>
                    <span className="text-lg font-semibold text-blue-900">₹{selectedPractitioner.consultationFee}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowBookingModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={bookAppointment}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={!bookingData.appointmentDate || !bookingData.startTime}
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PractitionerSearch;
