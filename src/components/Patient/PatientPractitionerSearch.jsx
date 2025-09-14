import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, MapPin, Star, Clock, DollarSign, User,
  Phone, Video, MessageSquare, Calendar, Award, Shield,
  ChevronDown, Heart, Eye, BookOpen, RefreshCw, SlidersHorizontal,
  Stethoscope, GraduationCap, Languages
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { getPractitioners } from '../../services/mockPatientData';


const PatientPractitionerSearch = () => {
  const [practitioners, setPractitioners] = useState([]);
  const [filteredPractitioners, setFilteredPractitioners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPractitioner, setSelectedPractitioner] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    specialization: '',
    location: '',
    rating: '',
    experience: '',
    consultationFee: '',
    availability: '',
    language: ''
  });

  const specializations = [
    { value: 'Panchakarma', label: 'Panchakarma Specialist', icon: '🌿' },
    { value: 'Digestive Health', label: 'Digestive Health', icon: '🫁' },
    { value: 'Herbal Medicine', label: 'Herbal Medicine', icon: '🌱' },
    { value: 'Yoga Therapy', label: 'Yoga Therapy', icon: '🧘' },
    { value: 'Meditation', label: 'Meditation & Mindfulness', icon: '🕯️' },
    { value: 'Stress Management', label: 'Stress Management', icon: '💆' },
    { value: 'Women\'s Health', label: 'Women\'s Health', icon: '👩' },
    { value: 'Nutrition', label: 'Ayurvedic Nutrition', icon: '🥗' }
  ];

  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 
    'Pune', 'Hyderabad', 'Ahmedabad', 'Jaipur', 'Online'
  ];

  const languages = [
    'English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 
    'Gujarati', 'Bengali', 'Kannada', 'Malayalam', 'Sanskrit'
  ];

  useEffect(() => {
    fetchPractitioners();
  }, []);

  useEffect(() => {
    filterPractitioners();
  }, [practitioners, searchTerm, filters]);

  const fetchPractitioners = async () => {
    try {
      setLoading(true);
      setUsingMockData(false);
      const response = await api.get('/patient/practitioners');
      setPractitioners(response.data.practitioners || []);
    } catch (error) {
      console.error('Error fetching practitioners:', error);
      // Use mock data as fallback
      const mockPractitioners = getPractitioners();
      setPractitioners(mockPractitioners);
      setUsingMockData(true);
      
    } finally {
      setLoading(false);
    }
  };

  const filterPractitioners = () => {
    let filtered = [...practitioners];

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(practitioner => 
        practitioner.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        practitioner.userId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        practitioner.specializations?.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Specialization filter
    if (filters.specialization) {
      filtered = filtered.filter(practitioner => 
        practitioner.specializations?.includes(filters.specialization)
      );
    }

    // Rating filter
    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(practitioner => 
        (practitioner.rating || 0) >= minRating
      );
    }

    // Experience filter
    if (filters.experience) {
      const minExperience = parseInt(filters.experience);
      filtered = filtered.filter(practitioner => 
        (practitioner.experience || 0) >= minExperience
      );
    }

    // Fee filter
    if (filters.consultationFee) {
      const maxFee = parseInt(filters.consultationFee);
      filtered = filtered.filter(practitioner => 
        (practitioner.consultationFee || 0) <= maxFee
      );
    }

    // Language filter
    if (filters.language) {
      filtered = filtered.filter(practitioner => 
        practitioner.languages?.includes(filters.language)
      );
    }

    setFilteredPractitioners(filtered);
  };

  const handleBookAppointment = (practitioner) => {
    navigate('/patient/appointments', { 
      state: { selectedPractitioner: practitioner } 
    });
  };

  const clearFilters = () => {
    setFilters({
      specialization: '',
      location: '',
      rating: '',
      experience: '',
      consultationFee: '',
      availability: '',
      language: ''
    });
    setSearchTerm('');
  };

  useEffect(() => {
    filterPractitioners();
  }, [searchTerm, filters, practitioners]);

  const bookConsultation = async (practitionerId) => {
    try {
      const response = await api.post('/patient/appointments/book', {
        practitionerId,
        type: 'consultation'
      });
      
    } catch (error) {
      console.error('Error booking consultation:', error);
      
    }
  };

  const sendMessage = async (practitionerId) => {
    try {
      const response = await api.post('/patient/conversations', {
        practitionerId,
        message: 'Hello, I would like to inquire about your services.'
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find Practitioners</h1>
          <p className="text-gray-600">Discover qualified Ayurvedic practitioners near you</p>
        </div>
        <button
          onClick={fetchPractitioners}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, specialization, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <SlidersHorizontal className="h-5 w-5 mr-2" />
            Filters
            <ChevronDown className={`h-4 w-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                <select
                  value={filters.specialization}
                  onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Specializations</option>
                  {specializations.map((spec) => (
                    <option key={spec.value} value={spec.value}>{spec.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3.0">3.0+ Stars</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <select
                  value={filters.experience}
                  onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Any Experience</option>
                  <option value="1">1+ Years</option>
                  <option value="5">5+ Years</option>
                  <option value="10">10+ Years</option>
                  <option value="15">15+ Years</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee</label>
                <select
                  value={filters.consultationFee}
                  onChange={(e) => setFilters(prev => ({ ...prev, consultationFee: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Any Price</option>
                  <option value="0-1000">₹0 - ₹1,000</option>
                  <option value="1000-2000">₹1,000 - ₹2,000</option>
                  <option value="2000-3000">₹2,000 - ₹3,000</option>
                  <option value="3000-5000">₹3,000 - ₹5,000</option>
                  <option value="5000-10000">₹5,000+</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={filters.language}
                  onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Any Language</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {filteredPractitioners.length} practitioners found
              </span>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredPractitioners.length > 0 ? (
          filteredPractitioners.map((practitioner) => (
            <div key={practitioner._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Practitioner Header */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {practitioner.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{practitioner.name}</h3>
                    <p className="text-sm text-gray-600">{practitioner.specialization}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.floor(practitioner.rating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {practitioner.rating} ({practitioner.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Practitioner Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="h-4 w-4 mr-2" />
                    {practitioner.experience} years experience
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {practitioner.location}
                    {practitioner.onlineConsultation && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Online Available
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    ₹{practitioner.consultationFee} consultation fee
                  </div>
                  
                  {practitioner.languages && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {practitioner.languages.join(', ')}
                    </div>
                  )}
                  
                  {practitioner.nextAvailable && (
                    <div className="flex items-center text-sm text-green-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Next available: {new Date(practitioner.nextAvailable).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Certifications */}
                {practitioner.certifications && practitioner.certifications.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Certifications</h4>
                    <div className="flex flex-wrap gap-1">
                      {practitioner.certifications.slice(0, 3).map((cert, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {cert}
                        </span>
                      ))}
                      {practitioner.certifications.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{practitioner.certifications.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {practitioner.bio && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-3">{practitioner.bio}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => bookConsultation(practitioner._id)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Consultation
                  </button>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedPractitioner(practitioner)}
                      className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    
                    <button
                      onClick={() => sendMessage(practitioner._id)}
                      className="flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </button>
                    
                    {practitioner.onlineConsultation && (
                      <button className="flex items-center justify-center px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200">
                        <Video className="h-4 w-4 mr-1" />
                        Video
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No practitioners found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search criteria or filters to find more practitioners.
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Practitioner Detail Modal */}
      {selectedPractitioner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Practitioner Details</h3>
              <button
                onClick={() => setSelectedPractitioner(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Practitioner Info */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedPractitioner.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedPractitioner.name}</h4>
                  <p className="text-gray-600">{selectedPractitioner.specialization}</p>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.floor(selectedPractitioner.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {selectedPractitioner.rating} ({selectedPractitioner.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Professional Details</h5>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Experience:</span> {selectedPractitioner.experience} years</p>
                    <p><span className="font-medium">Location:</span> {selectedPractitioner.location}</p>
                    <p><span className="font-medium">Consultation Fee:</span> ₹{selectedPractitioner.consultationFee}</p>
                    <p><span className="font-medium">Languages:</span> {selectedPractitioner.languages?.join(', ')}</p>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Availability</h5>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Next Available:</span> {new Date(selectedPractitioner.nextAvailable).toLocaleDateString()}</p>
                    <p><span className="font-medium">Online Consultation:</span> {selectedPractitioner.onlineConsultation ? 'Available' : 'Not Available'}</p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h5 className="font-medium text-gray-900 mb-2">About</h5>
                <p className="text-sm text-gray-600">{selectedPractitioner.bio}</p>
              </div>

              {/* Certifications */}
              {selectedPractitioner.certifications && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Certifications</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedPractitioner.certifications.map((cert, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => bookConsultation(selectedPractitioner._id)}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Consultation
                </button>
                <button
                  onClick={() => sendMessage(selectedPractitioner._id)}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientPractitionerSearch;
