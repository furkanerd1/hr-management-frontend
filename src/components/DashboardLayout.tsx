import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Building, 
  Briefcase, 
  Calendar, 
  CreditCard, 
  BarChart3, 
  Clock, 
  Bell, 
  Megaphone, 
  LogOut,
  User,
  Timer
} from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-based navigation
  const getNavigationItems = () => {
    // Role'e göre navigation items döndür
    if (user?.role === 'HR' || user?.role === 'MANAGER') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Çalışanlar', href: '/employees', icon: Users },
        { name: 'Departmanlar', href: '/departments', icon: Building },
        { name: 'Pozisyonlar', href: '/positions', icon: Briefcase },
        { name: 'İzin Talepleri', href: '/leaves', icon: Calendar },
        { name: 'Maaşlar', href: '/salaries', icon: CreditCard },
        { name: 'Performans', href: '/performance', icon: BarChart3 },
        { name: 'Yoklama', href: '/attendance', icon: Clock },
        { name: 'Bildirimler', href: '/notifications', icon: Bell },
        { name: 'Duyurular', href: '/announcements', icon: Megaphone },
      ];
    } else {
      // EMPLOYEE role
      return [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Giriş/Çıkış', href: '/checkin-checkout', icon: Timer },
        { name: 'Yoklama', href: '/attendance', icon: Clock },
        { name: 'Performansım', href: '/my-performance', icon: BarChart3 },
        { name: 'İzin Taleplerim', href: '/leaves', icon: Calendar },
        { name: 'Maaş Geçmişim', href: '/my-salary-history', icon: CreditCard },
        { name: 'Bildirimlerim', href: '/my-notifications', icon: Bell },
        { name: 'Duyurular', href: '/announcements', icon: Megaphone },
      ];
    }
  };

  const navigation = getNavigationItems();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 bg-blue-600">
          <h1 className="text-xl font-semibold text-white">HR Sistem</h1>
          <button
            className="lg:hidden text-white hover:text-gray-200"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-3 py-3 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-blue-600 mb-1 transition-colors"
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t">
          <Link 
            to="/profile" 
            className="flex items-center mb-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              Hoş geldiniz, {user?.firstName}!
            </h2>
            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-gray-500 hover:text-gray-700 cursor-pointer" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;