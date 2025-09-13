import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Settings } from 'lucide-react';
import NotificationDropdown from '../Notification';

const Header = () => {
  const { user, logout } = useAuth();

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'practitioner':
        return 'bg-green-100 text-green-800';
      case 'patient':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-green-600">
              🌿 Panchakarma
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationDropdown />
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleColor(user?.role)}`}>
                  {user?.role}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-600"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
