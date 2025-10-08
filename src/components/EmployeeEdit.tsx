import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { employeeService } from '../services/employeeService';
import { departmentService } from '../services/departmentService';
import { positionService } from '../services/positionService';
import { EmployeeDetailResponse, DepartmentListItem, PositionListItem } from '../types';
import { EmployeeStatus } from '../constants';

const EmployeeEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [employee, setEmployee] = useState<EmployeeDetailResponse | null>(null);
  const [departments, setDepartments] = useState<DepartmentListItem[]>([]);
  const [positions, setPositions] = useState<PositionListItem[]>([]);
  const [managers, setManagers] = useState<EmployeeDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    departmentId: '',
    positionId: '',
    managerId: '',
    status: EmployeeStatus.ACTIVE
  });

  // Sadece HR ve MANAGER bu sayfaya erişebilir
  useEffect(() => {
    if (user && user.role === 'EMPLOYEE') {
      navigate('/profile'); // Employee'ı kendi profil sayfasına yönlendir
      return;
    }
  }, [user, navigate]);

  const loadEmployee = useCallback(async () => {
    try {
      setLoading(true);
      const response = await employeeService.getEmployee(id!);
      const emp = response.data;
      setEmployee(emp);
      
      // Form data'yı doldur
      setFormData({
        firstName: emp.fullName?.split(' ')[0] || '',
        lastName: emp.fullName?.split(' ').slice(1).join(' ') || '',
        phone: emp.phone || '',
        address: emp.address || '',
        departmentId: '', // API'den ID gelmediği için boş
        positionId: '',   // API'den ID gelmediği için boş
        managerId: '',    // API'den ID gelmediği için boş
        status: emp.status
      });
    } catch (error) {
      console.error('Error loading employee:', error);
      setError('Çalışan bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadDropdownData = useCallback(async () => {
    try {
      // Departmanları yükle
      const deptResponse = await departmentService.getDepartmentsForDropdown();
      setDepartments(deptResponse.data.data);

      // Pozisyonları yükle
      const posResponse = await positionService.getPositionsForDropdown();
      setPositions(posResponse.data.data);

      // Manager'ları yükle (HR ve Manager rolündeki kullanıcılar)
      if (user?.role === 'HR') {
        const managersResponse = await employeeService.getAllEmployees({
          page: 0,
          size: 100,
          role: 'MANAGER'
        });
        setManagers(managersResponse.data.data as any);
      }
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  }, [user?.role]);

  useEffect(() => {
    if (id) {
      loadEmployee();
      loadDropdownData();
    }
  }, [id, loadEmployee, loadDropdownData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        departmentId: formData.departmentId,
        positionId: formData.positionId,
        status: formData.status
      };

      // Sadece HR manager atayabilir
      if (user?.role === 'HR') {
        updateData.managerId = formData.managerId || undefined;
      }

      await employeeService.updateEmployee(employee!.id, updateData);
      navigate('/employees');
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Çalışan güncellenirken bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">{error || 'Çalışan bulunamadı'}</h2>
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
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Çalışan Düzenle</h1>
                <p className="text-blue-100">{employee.fullName}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-8">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soyad *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    pattern="^[+]?[0-9]{10,15}$"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departman *
                  </label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Departman Seçin</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pozisyon *
                  </label>
                  <select
                    name="positionId"
                    value={formData.positionId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Pozisyon Seçin</option>
                    {positions.map(pos => (
                      <option key={pos.id} value={pos.id}>
                        {pos.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durum *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={EmployeeStatus.ACTIVE}>Aktif</option>
                    <option value={EmployeeStatus.INACTIVE}>Pasif</option>
                  </select>
                </div>

                {/* Sadece HR manager seçebilir */}
                {user?.role === 'HR' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yönetici
                    </label>
                    <select
                      name="managerId"
                      value={formData.managerId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Yönetici Seçin (Opsiyonel)</option>
                      {managers.map(manager => (
                        <option key={manager.id} value={manager.id}>
                          {manager.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tam adres..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/employees')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {updating ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeEdit;