import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  Star, 
  Settings,
  UserCheck,
  Activity,
  Heart,
  MessageSquare,
  ClipboardList
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  const getNavigationItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { name: 'Dashboard', href: '/admin', icon: Home },
          { name: 'Practitioners', href: '/admin/practitioners', icon: UserCheck },
          { name: 'Patients', href: '/admin/patients', icon: Users },
          { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
          { name: 'Settings', href: '/admin/settings', icon: Settings },
        ];
      case 'practitioner':
        return [
          { name: 'Dashboard', href: '/practitioner', icon: Home },
          { name: 'Appointments', href: '/practitioner/appointments', icon: Calendar },
          { name: 'Patients', href: '/practitioner/patients', icon: Users },
          { name: 'Therapy Plans', href: '/practitioner/therapy-plans', icon: ClipboardList },
          { name: 'Sessions', href: '/practitioner/sessions', icon: Activity },
          { name: 'Reviews', href: '/practitioner/feedback', icon: Star },
          { name: 'Messages', href: '/practitioner/messages', icon: MessageSquare },
          { name: 'Profile', href: '/practitioner/profile', icon: Settings },
        ];
      case 'patient':
        return [
          { name: 'Dashboard', href: '/patient', icon: Home },
          { name: 'Appointments', href: '/patient/appointments', icon: Calendar },
          { name: 'Therapy Plans', href: '/patient/therapy-plans', icon: Heart },
          { name: 'Practitioners', href: '/patient/practitioners', icon: UserCheck },
          { name: 'Medical Records', href: '/patient/medical-records', icon: FileText },
          { name: 'Messages', href: '/patient/messages', icon: MessageSquare },
          { name: 'Reviews', href: '/patient/feedback', icon: Star },
          { name: 'Profile', href: '/patient/profile', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="bg-white shadow-sm border-r h-full">
      <nav className="mt-8">
        <div className="px-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-green-100 text-green-700 border-r-2 border-green-500'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
