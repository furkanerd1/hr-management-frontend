import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { departmentService } from '../services/departmentService';
import { DepartmentCreateRequest, DepartmentUpdateRequest } from '../types';

const DepartmentForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState<DepartmentCreateRequest>({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  // HR kontrolü
  useEffect(() => {
    if (user?.role !== 'HR') {
      navigate('/departments');
      return;
    }
  }, [user, navigate]);

  // Düzenleme modunda veri yükleme
  useEffect(() => {
    const loadDepartment = async () => {
      if (!isEditing || !id) return;

      try {
        setInitialLoading(true);
        setError(null);

        const response = await departmentService.getDepartment(id);
        if (response.success) {
          const dept = response.data;
          setFormData({
            name: dept.name,
            description: dept.description || ''
          });
        } else {
          setError(response.message || 'Departman bilgileri yüklenirken hata oluştu');
        }
      } catch (err: any) {
        setError(err.message || 'Beklenmeyen bir hata oluştu');
      } finally {
        setInitialLoading(false);
      }
    };

    loadDepartment();
  }, [isEditing, id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Departman adı zorunludur';
    }
    if (formData.name.length < 2) {
      return 'Departman adı en az 2 karakter olmalıdır';
    }
    if (formData.name.length > 100) {
      return 'Departman adı en fazla 100 karakter olabilir';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let response;
      if (isEditing && id) {
        response = await departmentService.updateDepartment(id, formData as DepartmentUpdateRequest);
      } else {
        response = await departmentService.createDepartment(formData);
      }

      if (response.success) {
        const action = isEditing ? 'güncellendi' : 'oluşturuldu';
        alert(`Departman başarıyla ${action}`);
        navigate('/departments');
      } else {
        setError(response.message || 'İşlem sırasında hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // İlk yükleme durumu
  if (initialLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Departman bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/departments')}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-2 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Departmanlara Dön
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditing ? 'Departman Düzenle' : 'Yeni Departman Oluştur'}
        </h1>
        <p className="text-gray-600">
          {isEditing ? 'Departman bilgilerini güncelleyin' : 'Yeni bir departman oluşturun'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Departman Adı */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Departman Adı *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              maxLength={100}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Örnek: İnsan Kaynakları"
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.name.length}/100 karakter
            </div>
          </div>

          {/* Açıklama */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Departman hakkında açıklama yazın..."
            />
            <div className="text-xs text-gray-500 mt-1">
              İsteğe bağlı alan
            </div>
          </div>

          {/* Form Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/departments')}
              className="inline-flex items-center px-6 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 hover:text-gray-700 transition-colors"
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  İşleniyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Güncelle' : 'Oluştur'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Form Kuralları */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Form Kuralları:</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Departman adı zorunludur ve 2-100 karakter arasında olmalıdır</li>
          <li>• Açıklama alanı isteğe bağlıdır</li>
          <li>• Sadece HR rolündeki kullanıcılar departman oluşturabilir/güncelleyebilir</li>
        </ul>
      </div>
    </div>
  );
};

export default DepartmentForm;