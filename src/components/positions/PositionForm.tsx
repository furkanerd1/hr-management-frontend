import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { positionService } from '../../services/positionService';
import { PositionCreateRequest, PositionUpdateRequest } from '../../types';
import { ArrowLeft, Save, X } from 'lucide-react';

const PositionForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;
  
  const [formData, setFormData] = useState<PositionCreateRequest>({
    title: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (user?.role !== 'HR') {
      navigate('/positions');
      return;
    }
    
    if (isEdit && id) {
      loadPosition(id);
    }
  }, [id, isEdit, user, navigate]);

  const loadPosition = async (positionId: string) => {
    try {
      setLoading(true);
      const response = await positionService.getPosition(positionId);
      if (response.success) {
        const position = response.data;
        setFormData({
          title: position.title,
          description: position.description || ''
        });
      } else {
        setError('Pozisyon bilgileri yüklenirken hata oluştu');
      }
    } catch (err: any) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Pozisyon adı zorunludur';
    } else if (formData.title.length < 2) {
      errors.title = 'Pozisyon adı en az 2 karakter olmalıdır';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let response;
      if (isEdit && id) {
        const updateData: PositionUpdateRequest = {
          title: formData.title.trim(),
          description: formData.description?.trim()
        };
        response = await positionService.updatePosition(id, updateData);
      } else {
        const createData: PositionCreateRequest = {
          title: formData.title.trim(),
          description: formData.description?.trim()
        };
        response = await positionService.createPosition(createData);
      }

      if (response.success) {
        alert(isEdit ? 'Pozisyon başarıyla güncellendi' : 'Pozisyon başarıyla oluşturuldu');
        navigate('/positions');
      } else {
        setError(response.message || 'İşlem sırasında hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validation error'u temizle
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (user?.role !== 'HR') {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Bu sayfaya erişim yetkiniz bulunmuyor.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Başlık */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/positions')}
          className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri Dön
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? 'Pozisyon Düzenle' : 'Yeni Pozisyon Ekle'}
        </h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Pozisyon Adı *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Örn: Yazılım Geliştirici, İnsan Kaynakları Uzmanı"
            />
            {validationErrors.title && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Pozisyon açıklaması (isteğe bağlı)"
            />
          </div>

          {/* Form Butonları */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/positions')}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Kaydediliyor...' : (isEdit ? 'Güncelle' : 'Kaydet')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PositionForm;