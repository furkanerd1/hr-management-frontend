import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Users, Calendar, Clock, TrendingUp } from 'lucide-react';
import LeaveBalance from './leaves/LeaveBalance';
import { employeeService } from '../services/employeeService';
import { leaveService } from '../services/leaveService';
import { LeaveStatus } from '../constants';

interface DashboardStats {
  totalEmployees: number;
  pendingLeaves: number;
  todayAttendance: number;
  averagePerformance: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalEmployees: 0,
    pendingLeaves: 0,
    todayAttendance: 0,
    averagePerformance: 0
  });
  const [loading, setLoading] = useState(true);
  const isEmployee = user?.role === 'EMPLOYEE';

  useEffect(() => {
    if (!isEmployee) {
      loadDashboardStats();
    } else {
      setLoading(false);
    }
  }, [isEmployee]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      const [employeesResponse, leavesResponse] = await Promise.all([
        employeeService.getAllEmployees({ page: 0, size: 1 }), // Sadece total count için
        leaveService.getAllLeaveRequests({ page: 0, size: 1, filterRequest: { status: LeaveStatus.PENDING } })
      ]);

      const newStats: DashboardStats = {
        totalEmployees: employeesResponse.success ? employeesResponse.data.total : 0,
        pendingLeaves: leavesResponse.success ? leavesResponse.data.total : 0,
        todayAttendance: 0, // TODO: Backend'den güncel veri al
        averagePerformance: 4.2 // TODO: Backend'den ortalama hesapla
      };

      setDashboardStats(newStats);
    } catch (error) {
      console.error('Dashboard stats yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // HR/Manager için istatistikler
  const hrStats = [
    {
      name: 'Toplam Çalışan',
      value: loading ? '...' : dashboardStats.totalEmployees.toString(),
      icon: Users,
      color: 'bg-blue-500',
      change: '+5.4%',
    },
    {
      name: 'Bekleyen İzinler',
      value: loading ? '...' : dashboardStats.pendingLeaves.toString(),
      icon: Calendar,
      color: 'bg-yellow-500',
      change: '+2.1%',
    },
    {
      name: 'Bugün Giriş',
      value: loading ? '...' : dashboardStats.todayAttendance.toString(),
      icon: Clock,
      color: 'bg-green-500',
      change: '+1.8%',
    },
    {
      name: 'Performans Ortalaması',
      value: loading ? '...' : dashboardStats.averagePerformance.toFixed(1),
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+0.3%',
    },
  ];

  // Employee için basit istatistikler
  const employeeStats = [
    {
      name: 'Toplam İzin Günüm',
      value: '15',
      icon: Calendar,
      color: 'bg-blue-500',
      change: '2025 yılı',
    },
    {
      name: 'Kullandığım İzin',
      value: '8',
      icon: Calendar,
      color: 'bg-green-500',
      change: 'gün',
    },
    {
      name: 'Bu Ay Çalışma',
      value: '22',
      icon: Clock,
      color: 'bg-purple-500',
      change: 'gün',
    },
    {
      name: 'Performans Notum',
      value: '4.5',
      icon: TrendingUp,
      color: 'bg-yellow-500',
      change: '/5.0',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'Yeni çalışan eklendi',
      user: 'Ahmet Yılmaz',
      time: '2 saat önce',
      type: 'employee',
    },
    {
      id: 2,
      action: 'İzin talebi onaylandı',
      user: 'Fatma Kaya',
      time: '4 saat önce',
      type: 'leave',
    },
    {
      id: 3,
      action: 'Performans değerlendirmesi tamamlandı',
      user: 'Mehmet Öz',
      time: '1 gün önce',
      type: 'performance',
    },
    {
      id: 4,
      action: 'Yeni duyuru yayınlandı',
      user: 'HR Departmanı',
      time: '2 gün önce',
      type: 'announcement',
    },
  ];

  const stats = isEmployee ? employeeStats : hrStats;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Merhaba {user?.firstName}, {isEmployee ? 'kişisel panele' : 'sisteme genel bakış'} hoş geldiniz
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Son Aktiviteler</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.user}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
      </div>
    </div>        {/* Quick Actions, Leave Balance veya Check In/Out */}
        {isEmployee ? (
          <LeaveBalance />
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Hızlı Eylemler</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Yeni Çalışan - Sadece HR ve Manager erişebilir */}
                <Link
                  to="/employees/new"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="h-8 w-8 text-blue-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Yeni Çalışan</span>
                </Link>

                {/* İzin Onayı - Sadece HR ve Manager erişebilir */}
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Calendar className="h-8 w-8 text-green-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900">İzin Onayı</span>
                </button>

                {/* Yoklama - Herkes erişebilir */}
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Clock className="h-8 w-8 text-yellow-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Yoklama</span>
                </button>

                {/* Performans - Herkes kendi performansını görebilir */}
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <TrendingUp className="h-8 w-8 text-purple-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Performans</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Employee'ler için ek hızlı eylemler */}
      {isEmployee && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Hızlı Eylemler</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Yeni İzin Talebi */}
                <Link
                  to="/leaves/new"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="h-8 w-8 text-green-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900">İzin Talebi</span>
                </Link>

                {/* Yoklama */}
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Clock className="h-8 w-8 text-yellow-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Yoklama</span>
                </button>

                {/* Performansım */}
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <TrendingUp className="h-8 w-8 text-purple-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Performansım</span>
                </button>

                {/* Maaş Bilgilerim */}
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Users className="h-8 w-8 text-blue-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Maaş Bilgileri</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;