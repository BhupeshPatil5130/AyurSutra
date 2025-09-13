import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  Users, 
  Calendar, 
  Heart, 
  Star, 
  Shield, 
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: <Calendar className="h-8 w-8 text-green-600" />,
      title: "Easy Appointment Booking",
      description: "Book appointments with certified Panchakarma practitioners with just a few clicks."
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Expert Practitioners",
      description: "Connect with verified and experienced Ayurvedic practitioners specialized in Panchakarma."
    },
    {
      icon: <Heart className="h-8 w-8 text-green-600" />,
      title: "Personalized Treatment",
      description: "Get customized therapy plans based on your unique constitution and health needs."
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "Secure & Private",
      description: "Your health data is protected with enterprise-grade security and privacy measures."
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Patient",
      content: "The Panchakarma treatment I received through this platform completely transformed my health. The practitioners are truly knowledgeable.",
      rating: 5
    },
    {
      name: "Dr. Rajesh Kumar",
      role: "Ayurvedic Practitioner",
      content: "This platform has helped me reach more patients and provide better care with its comprehensive management tools.",
      rating: 5
    },
    {
      name: "Anita Patel",
      role: "Patient",
      content: "Easy to use, professional service, and excellent results. I highly recommend this platform for authentic Panchakarma treatments.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Panchakarma Care</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Authentic <span className="text-green-600">Panchakarma</span>
              <br />
              Treatments Online
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with certified Ayurvedic practitioners for personalized Panchakarma treatments. 
              Experience the ancient wisdom of Ayurveda with modern convenience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors flex items-center justify-center"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 rounded-lg text-lg font-medium transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600">
              Experience the best of Ayurvedic care with our comprehensive platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to start your Panchakarma journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Create Account
              </h3>
              <p className="text-gray-600">
                Sign up and complete your health profile to get personalized recommendations
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Find Practitioner
              </h3>
              <p className="text-gray-600">
                Browse and select from our verified Ayurvedic practitioners based on your needs
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Start Treatment
              </h3>
              <p className="text-gray-600">
                Begin your personalized Panchakarma treatment plan with expert guidance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Real experiences from our community
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Healing Journey?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of satisfied users who have transformed their health with authentic Panchakarma treatments
          </p>
          <Link
            to="/login"
            className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-medium transition-colors inline-flex items-center"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Leaf className="h-8 w-8 text-green-400" />
                <span className="ml-2 text-xl font-bold">Panchakarma Care</span>
              </div>
              <p className="text-gray-400">
                Connecting you with authentic Ayurvedic treatments and certified practitioners.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Practitioners</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Treatments</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>info@panchakarmacare.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Mumbai, India</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Panchakarma Care. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
