import React, { useState, useEffect, useCallback } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Building, Briefcase, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { employeeService } from '../services/employeeService';
import { departmentService } from '../services/departmentService';
import { positionService } from '../services/positionService';
import { EmployeeDetailResponse, DepartmentListItem, PositionListItem } from '../types';
import { EmployeeStatus } from '../constants';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<EmployeeDetailResponse | null>(null);
  const [departments, setDepartments] = useState<DepartmentListItem[]>([]);
  const [positions, setPositions] = useState<PositionListItem[]>([]);
  const [managers, setManagers] = useState<EmployeeDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    departmentId: '',
    positionId: '',
    managerId: ''
  });

  const loadProfile = useCallback(async () => {
    try {
      const response = await employeeService.getMyProfile();
      setProfile(response.data);
      
      // Form data'yı doldur
      if (response.data) {
        setFormData({
          firstName: response.data.fullName?.split(' ')[0] || '',
          lastName: response.data.fullName?.split(' ').slice(1).join(' ') || '',
          phone: response.data.phone || '',
          address: response.data.address || '',
          departmentId: '', // API'den gelmediği için boş bırakıyoruz
          positionId: '',   // API'den gelmediği için boş bırakıyoruz
          managerId: ''     // API'den gelmediği için boş bırakıyoruz
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDropdownData = useCallback(async () => {
    try {
      // Departmanları yükle
      const deptResponse = await departmentService.getDepartmentsForDropdown();
      setDepartments(deptResponse.data.data);

      // Pozisyonları yükle
      const posResponse = await positionService.getPositionsForDropdown();
      setPositions(posResponse.data.data);

      // Manager'ları yükle (HR ve Manager rolündeki kullanıcılar)
      if (user?.role === 'HR' || user?.role === 'MANAGER') {
        const managersResponse = await employeeService.getAllEmployees({
          page: 0,
          size: 100,
          role: 'MANAGER'
        });
        // Type assertion çünkü managers listesi için EmployeeDetailResponse kullanıyoruz
        setManagers(managersResponse.data.data as any);
      }
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  }, [user?.role]);

  useEffect(() => {
    const loadData = async () => {
      await loadProfile();
      await loadDropdownData();
    };
    loadData();
  }, [loadProfile, loadDropdownData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      // Role'e göre güncelleme verisini filtrele
      let updateData: any;

      if (user?.role === 'EMPLOYEE') {
        // Employee'lar sadece kişisel bilgilerini güncelleyebilir
        updateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address
        };
      } else {
        // HR ve MANAGER tüm bilgileri güncelleyebilir
        updateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          departmentId: formData.departmentId,
          positionId: formData.positionId,
          status: EmployeeStatus.ACTIVE
        };

        // Sadece HR manager atayabilir
        if (user?.role === 'HR') {
          updateData.managerId = formData.managerId || undefined;
        }
      }

      await employeeService.updateEmployee(profile!.id, updateData);

      // Profili yeniden yükle
      await loadProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Profil güncellenirken bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    // Form data'yı sıfırla
    if (profile) {
      setFormData({
        firstName: profile.fullName?.split(' ')[0] || '',
        lastName: profile.fullName?.split(' ').slice(1).join(' ') || '',
        phone: profile.phone || '',
        address: profile.address || '',
        departmentId: '', // API'den department ID gelmediği için boş
        positionId: '',   // API'den position ID gelmediği için boş
        managerId: ''     // API'den manager ID gelmediği için boş
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Profil yüklenemedi</h2>
          <button 
            onClick={loadProfile} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{profile.fullName}</h1>
                  <p className="text-blue-100">{profile.positionTitle}</p>
                  <p className="text-blue-100">{profile.departmentName}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  profile.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {profile.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                </span>
                <p className="text-blue-100 mt-2 text-sm">
                  Rol: {profile.role === 'HR' ? 'İK' : profile.role === 'MANAGER' ? 'Yönetici' : 'Çalışan'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            {!isEditing ? (
              // View Mode
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-semibold text-gray-900">Profil Bilgileri</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Düzenle
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">E-posta</p>
                        <p className="text-gray-900">{profile.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Telefon</p>
                        <p className="text-gray-900">{profile.phone || 'Belirtilmemiş'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Adres</p>
                        <p className="text-gray-900">{profile.address || 'Belirtilmemiş'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">İşe Başlama Tarihi</p>
                        <p className="text-gray-900">{new Date(profile.hireDate).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Doğum Tarihi</p>
                        <p className="text-gray-900">{new Date(profile.birthDate).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Departman</p>
                        <p className="text-gray-900">{profile.departmentName}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Briefcase className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Pozisyon</p>
                        <p className="text-gray-900">{profile.positionTitle}</p>
                      </div>
                    </div>

                    {profile.managerFullName && (
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Yönetici</p>
                          <p className="text-gray-900">{profile.managerFullName}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleSubmit}>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-semibold text-gray-900">Profil Düzenle</h2>
                  <div className="space-x-3">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {updating ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad
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
                      Soyad
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
                      Telefon
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

                  {/* Sadece HR ve MANAGER departman değiştirebilir */}
                  {(user?.role === 'HR' || user?.role === 'MANAGER') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Departman
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
                  )}

                  {/* Sadece HR ve MANAGER pozisyon değiştirebilir */}
                  {(user?.role === 'HR' || user?.role === 'MANAGER') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pozisyon
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
                  )}

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
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;