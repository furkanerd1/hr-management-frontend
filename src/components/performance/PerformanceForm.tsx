import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { performanceService } from '../../services/performanceService';
import { employeeService } from '../../services/employeeService';
import { PerformanceReviewCreateRequest, EmployeeListItem } from '../../types';
import { Award, ArrowLeft, Save, AlertCircle, Star } from 'lucide-react';

const PerformanceForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<PerformanceReviewCreateRequest>({
    employeeId: '',
    rating: 3,
    comments: '',
    reviewDate: new Date().toISOString().split('T')[0]
  });

  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employeesLoading, setEmployeesLoading] = useState(true);

  const canManageReviews = user?.role === 'HR' || user?.role === 'MANAGER';

  useEffect(() => {
    if (!canManageReviews) {
      return;
    }

    const loadData = async () => {
      await loadEmployees();
    };

    const loadReviewData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await performanceService.getReview(id);
        
        if (response.success) {
          const review = response.data;
          setFormData({
            employeeId: review.employeeId,
            rating: review.rating,
            comments: review.comments,
            reviewDate: review.reviewDate.split('T')[0]
          });
        } else {
          setError('Performans değerlendirmesi yüklenirken hata oluştu');
        }
      } catch (err: any) {
        setError(err.message || 'Beklenmeyen bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    if (isEdit) {
      loadReviewData();
    }
  }, [id, isEdit, canManageReviews]);

  const loadEmployees = async () => {
    try {
      setEmployeesLoading(true);
      const response = await employeeService.getAllEmployees({
        page: 0,
        size: 1000,
        sortBy: 'firstName',
        sortDirection: 'asc'
      });

      if (response.success) {
        setEmployees(response.data.data);
      } else {
        setError('Çalışanlar yüklenirken hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Beklenmeyen bir hata oluştu');
    } finally {
      setEmployeesLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId) {
      setError('Lütfen bir çalışan seçin');
      return;
    }

    if (!formData.comments.trim()) {
      setError('Lütfen değerlendirme yorumu girin');
      return;
    }

    if (formData.rating < 1 || formData.rating > 5) {
      setError('Puan 1-5 arasında olmalıdır');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const requestData = {
        ...formData,
        comments: formData.comments.trim()
      };

      let response;
      if (isEdit && id) {
        response = await performanceService.updateReview(id, requestData);
      } else {
        response = await performanceService.createReview(requestData);
      }
      
      if (response.success) {
        navigate('/performance');
      } else {
        setError(response.message || 'Performans değerlendirmesi kaydedilirken hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-6 h-6 cursor-pointer transition-colors ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-200'
        }`}
        onClick={() => setFormData(prev => ({ ...prev, rating: i + 1 }))}
      />
    ));
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Çok Zayıf';
      case 2: return 'Zayıf';
      case 3: return 'Orta';
      case 4: return 'İyi';
      case 5: return 'Mükemmel';
      default: return '';
    }
  };

  if (!canManageReviews) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Bu işlem için yetkiniz bulunmamaktadır.
          </div>
        </div>
      </div>
    );
  }

  if (employeesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Çalışanlar yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/performance')}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Geri
        </button>
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isEdit ? 'Değerlendirme Düzenle' : 'Yeni Performans Değerlendirmesi'}
            </h1>
            <p className="text-gray-600">
              {isEdit ? 'Mevcut değerlendirmeyi düzenleyin' : 'Çalışan için yeni performans değerlendirmesi oluşturun'}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Çalışan *
                </label>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  disabled={isEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                  required
                >
                  <option value="">Çalışan seçin...</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.fullName} - {employee.departmentName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Puan *
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {renderStars(formData.rating)}
                    <span className="ml-3 text-lg font-medium text-gray-700">
                      {formData.rating}/5 - {getRatingText(formData.rating)}
                    </span>
                  </div>
                  <input
                    type="range"
                    name="rating"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Değerlendirme Yorumu *
                </label>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Çalışanın performansı hakkında detaylı yorumunuzu yazın..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
                <div className="text-sm text-gray-500 mt-1">
                  {formData.comments.length} karakter
                </div>
              </div>

              {/* Review Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Değerlendirme Tarihi *
                </label>
                <input
                  type="date"
                  name="reviewDate"
                  value={formData.reviewDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/performance')}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {isEdit ? 'Güncelle' : 'Kaydet'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Employee Info */}
          {formData.employeeId && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Seçili Çalışan</h3>
              
              {(() => {
                const selectedEmployee = employees.find(emp => emp.id === formData.employeeId);
                if (!selectedEmployee) return <p className="text-gray-500">Çalışan bulunamadı</p>;
                
                return (
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-800">{selectedEmployee.fullName}</p>
                      <p className="text-sm text-gray-600">{selectedEmployee.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Departman</p>
                      <p className="font-medium text-gray-800">{selectedEmployee.departmentName}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Pozisyon</p>
                      <p className="font-medium text-gray-800">{selectedEmployee.positionTitle}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Rating Guide */}
          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">Puanlama Rehberi</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-purple-700">⭐ (1 Puan)</span>
                <span className="text-purple-600">Çok Zayıf</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-700">⭐⭐ (2 Puan)</span>
                <span className="text-purple-600">Zayıf</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-700">⭐⭐⭐ (3 Puan)</span>
                <span className="text-purple-600">Orta</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-700">⭐⭐⭐⭐ (4 Puan)</span>
                <span className="text-purple-600">İyi</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-700">⭐⭐⭐⭐⭐ (5 Puan)</span>
                <span className="text-purple-600">Mükemmel</span>
              </div>
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Bilgi</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Objektif ve yapıcı değerlendirme yapın</li>
              <li>• Somut örnekler verin</li>
              <li>• Gelişim alanlarını belirtin</li>
              <li>• Başarıları takdir edin</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceForm;