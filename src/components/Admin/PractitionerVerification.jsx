import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  User, 
  FileText, 
  Award, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  Star,
  Clock,
  AlertTriangle
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PractitionerVerification = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [practitioner, setPractitioner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');

  useEffect(() => {
    if (id) {
      fetchPractitionerDetails();
    }
  }, [id]);

  const fetchPractitionerDetails = async () => {
    try {
      const response = await api.get(`/admin/practitioners/${id}`);
      setPractitioner(response.data);
    } catch (error) {
      toast.error('Error fetching practitioner details');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (status) => {
    if (!verificationNotes.trim() && status === 'rejected') {
      toast.error('Please provide notes for rejection');
      return;
    }

    setVerifying(true);
    try {
      await api.post(`/admin/practitioners/${id}/verify`, {
        status,
        notes: verificationNotes
      });
      
      toast.success(`Practitioner ${status} successfully`);
      navigate('/admin/practitioners');
    } catch (error) {
      toast.error('Error updating verification status');
      console.error('Error:', error);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!practitioner) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-500">Practitioner not found</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Practitioner Verification</h1>
          <p className="text-gray-600">Review and verify practitioner profile</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(practitioner.verificationStatus)}`}>
          {practitioner.verificationStatus.charAt(0).toUpperCase() + practitioner.verificationStatus.slice(1)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <User className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold">Personal Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="mt-1 text-sm text-gray-900">
                  {practitioner.userId.firstName} {practitioner.userId.lastName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">{practitioner.userId.email}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <div className="mt-1 flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">{practitioner.userId.phone}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">License Number</label>
                <p className="mt-1 text-sm text-gray-900">{practitioner.licenseNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Experience</label>
                <p className="mt-1 text-sm text-gray-900">{practitioner.experience} years</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Consultation Fee</label>
                <p className="mt-1 text-sm text-gray-900">₹{practitioner.consultationFee}</p>
              </div>
            </div>

            {practitioner.bio && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <p className="mt-1 text-sm text-gray-900">{practitioner.bio}</p>
              </div>
            )}
          </div>

          {/* Specializations */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Star className="h-6 w-6 text-yellow-500 mr-2" />
              <h2 className="text-lg font-semibold">Specializations</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {practitioner.specializations.map((spec, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Award className="h-6 w-6 text-green-500 mr-2" />
              <h2 className="text-lg font-semibold">Education</h2>
            </div>
            <div className="space-y-3">
              {practitioner.education.map((edu, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  <p className="text-sm text-gray-500">{edu.year}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Certificates */}
          {practitioner.certificates && practitioner.certificates.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 text-purple-500 mr-2" />
                <h2 className="text-lg font-semibold">Certificates</h2>
              </div>
              <div className="space-y-3">
                {practitioner.certificates.map((cert, index) => (
                  <div key={index} className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-medium text-gray-900">{cert.name}</h3>
                    <p className="text-sm text-gray-600">{cert.issuedBy}</p>
                    <p className="text-sm text-gray-500">{cert.year}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clinic Address */}
          {practitioner.clinicAddress && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <MapPin className="h-6 w-6 text-red-500 mr-2" />
                <h2 className="text-lg font-semibold">Clinic Address</h2>
              </div>
              <div className="text-sm text-gray-900">
                <p>{practitioner.clinicAddress.street}</p>
                <p>{practitioner.clinicAddress.city}, {practitioner.clinicAddress.state}</p>
                <p>{practitioner.clinicAddress.zipCode}, {practitioner.clinicAddress.country}</p>
              </div>
            </div>
          )}
        </div>

        {/* Verification Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Verification Actions</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Notes
                </label>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Add notes about the verification decision..."
                />
              </div>

              {practitioner.verificationStatus === 'pending' && (
                <div className="space-y-3">
                  <button
                    onClick={() => handleVerification('approved')}
                    disabled={verifying}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {verifying ? 'Processing...' : 'Approve Practitioner'}
                  </button>
                  
                  <button
                    onClick={() => handleVerification('rejected')}
                    disabled={verifying}
                    className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    {verifying ? 'Processing...' : 'Reject Application'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Availability */}
          {practitioner.availability && practitioner.availability.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-indigo-500 mr-2" />
                <h2 className="text-lg font-semibold">Availability</h2>
              </div>
              <div className="space-y-2">
                {practitioner.availability.map((slot, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-900">{slot.day}</span>
                    <span className="text-sm text-gray-600">
                      {slot.isAvailable ? `${slot.startTime} - ${slot.endTime}` : 'Not Available'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Registration Date */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Calendar className="h-6 w-6 text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold">Registration Info</h2>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Registered: </span>
                <span className="text-sm text-gray-900">
                  {new Date(practitioner.userId.createdAt).toLocaleDateString()}
                </span>
              </div>
              {practitioner.verifiedAt && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Verified: </span>
                  <span className="text-sm text-gray-900">
                    {new Date(practitioner.verifiedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PractitionerVerification;
