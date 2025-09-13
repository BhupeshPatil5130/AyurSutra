import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MessageSquare, 
  User, 
  Calendar, 
  Search, 
  Filter, 
  TrendingUp,
  Heart,
  ThumbsUp,
  Award,
  BarChart3
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const FeedbackManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [ratingFilter]);

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams();
      if (ratingFilter !== 'all') {
        params.append('rating', ratingFilter);
      }

      const response = await api.get(`/practitioner/reviews?${params}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Error fetching reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/practitioner/reviews/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingBgColor = (rating) => {
    if (rating >= 4.5) return 'bg-green-100';
    if (rating >= 3.5) return 'bg-yellow-100';
    if (rating >= 2.5) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.patientId?.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.patientId?.userId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

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

  const renderRatingDistribution = () => {
    const distribution = stats.ratingDistribution || {};
    const total = stats.totalReviews || 1;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map(rating => {
          const count = distribution[rating] || 0;
          const percentage = (count / total) * 100;
          
          return (
            <div key={rating} className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 w-12">
                <span className="text-sm font-medium">{rating}</span>
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8">{count}</span>
            </div>
          );
        })}
      </div>
    );
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
          <p className="text-gray-600">View and analyze patient feedback and ratings</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                </p>
                <span className="text-sm text-gray-500 ml-1">/ 5.0</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalReviews || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ThumbsUp className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Positive Reviews</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.positiveReviews || 0}
              </p>
              <p className="text-xs text-gray-500">4+ stars</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.monthlyReviews || 0}
              </p>
              <p className="text-xs text-gray-500">New reviews</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Rating Distribution</h3>
          {renderRatingDistribution()}
        </div>

        {/* Recent Feedback Highlights */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Highlights</h3>
          {stats.recentHighlights?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentHighlights.map((highlight, index) => (
                <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      {renderStars(highlight.rating, 'h-4 w-4')}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {highlight.patientName}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(highlight.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">{highlight.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No recent highlights available</p>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews by patient name or comment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div key={review._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {review.isAnonymous ? '?' : (
                        <>
                          {review.patientId?.userId?.firstName?.charAt(0)}
                          {review.patientId?.userId?.lastName?.charAt(0)}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {review.isAnonymous 
                          ? 'Anonymous Patient' 
                          : `${review.patientId?.userId?.firstName} ${review.patientId?.userId?.lastName}`
                        }
                      </h4>
                      <div className={`px-2 py-1 rounded-full ${getRatingBgColor(review.rating)}`}>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating, 'h-4 w-4')}
                          <span className={`text-sm font-medium ${getRatingColor(review.rating)}`}>
                            {review.rating}.0
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                      {review.appointmentId && (
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          Session: {new Date(review.appointmentId.appointmentDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {review.comment && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    )}

                    {/* Aspect Ratings */}
                    {review.aspects && Object.keys(review.aspects).length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(review.aspects).map(([aspect, rating]) => (
                          <div key={aspect} className="text-center">
                            <p className="text-xs text-gray-600 capitalize mb-1">{aspect}</p>
                            <div className="flex items-center justify-center">
                              {renderStars(rating, 'h-3 w-3')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No reviews found</p>
          </div>
        )}
      </div>

      {/* Feedback Insights */}
      {stats.insights && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Feedback Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.insights.mostPraised && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Most Praised Aspects</h4>
                <div className="space-y-2">
                  {stats.insights.mostPraised.map((aspect, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-green-700 capitalize">{aspect.name}</span>
                      <div className="flex items-center">
                        {renderStars(aspect.averageRating, 'h-3 w-3')}
                        <span className="text-xs text-green-600 ml-1">
                          ({aspect.count} reviews)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.insights.improvementAreas && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Areas for Improvement</h4>
                <div className="space-y-2">
                  {stats.insights.improvementAreas.map((aspect, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-yellow-700 capitalize">{aspect.name}</span>
                      <div className="flex items-center">
                        {renderStars(aspect.averageRating, 'h-3 w-3')}
                        <span className="text-xs text-yellow-600 ml-1">
                          ({aspect.count} reviews)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;
