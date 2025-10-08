import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Building, Briefcase, Users, ArrowLeft, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { employeeService } from '../services/employeeService';
import { EmployeeDetailResponse } from '../types';

const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employee, setEmployee] = useState<EmployeeDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEmployee = useCallback(async () => {
    try {
      setLoading(true);
      const response = await employeeService.getEmployee(id!);
      setEmployee(response.data);
    } catch (error) {
      console.error('Error loading employee:', error);
      setError('Çalışan bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadEmployee();
    }
  }, [id, loadEmployee]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">{error}</h2>
          <button 
            onClick={() => navigate('/employees')} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Çalışan bulunamadı</h2>
          <button 
            onClick={() => navigate('/employees')} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const canEdit = user?.role === 'HR' || user?.role === 'MANAGER' || employee.id === user?.employeeId;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/employees')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Çalışanlara Dön
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{employee.fullName}</h1>
                  <p className="text-blue-100">{employee.positionTitle}</p>
                  <p className="text-blue-100">{employee.departmentName}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  employee.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {employee.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                </span>
                <p className="text-blue-100 mt-2 text-sm">
                  Rol: {employee.role === 'HR' ? 'İK' : employee.role === 'MANAGER' ? 'Yönetici' : 'Çalışan'}
                </p>
                
                {/* Edit button */}
                {canEdit && (
                  <Link
                    to={employee.id === user?.employeeId ? '/profile' : `/employees/${employee.id}/edit`}
                    className="mt-3 inline-flex items-center px-3 py-1 border border-white/20 rounded text-sm text-white hover:bg-white/10 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Düzenle
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Employee Details */}
          <div className="px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">E-posta</p>
                    <p className="text-gray-900">{employee.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Telefon</p>
                    <p className="text-gray-900">{employee.phone || 'Belirtilmemiş'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Adres</p>
                    <p className="text-gray-900">{employee.address || 'Belirtilmemiş'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">İşe Başlama Tarihi</p>
                    <p className="text-gray-900">{new Date(employee.hireDate).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Doğum Tarihi</p>
                    <p className="text-gray-900">{new Date(employee.birthDate).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Departman</p>
                    <p className="text-gray-900">{employee.departmentName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pozisyon</p>
                    <p className="text-gray-900">{employee.positionTitle}</p>
                  </div>
                </div>

                {employee.managerFullName && (
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Yönetici</p>
                      <p className="text-gray-900">{employee.managerFullName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;