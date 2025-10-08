import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { leaveService } from '../../services/leaveService';
import { LeaveRequestCreateRequest, LeaveRequestEditRequest } from '../../types';
import { LeaveType } from '../../constants';
import { ArrowLeft, Save, X, Calendar } from 'lucide-react';

const LeaveForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;
  
  const [formData, setFormData] = useState<LeaveRequestCreateRequest>({
    leaveType: LeaveType.VACATION,
    startDate: '',
    endDate: '',
    reason: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [totalDays, setTotalDays] = useState(0);
  const [dateConflictWarning, setDateConflictWarning] = useState<string | null>(null);

  const calculateTotalDays = useCallback(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end >= start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 çünkü başlangıç günü dahil
        setTotalDays(diffDays);
      } else {
        setTotalDays(0);
      }
    } else {
      setTotalDays(0);
    }
  }, [formData.startDate, formData.endDate]);

  const checkDateConflict = useCallback(async () => {
    if (!formData.startDate || !formData.endDate) {
      setDateConflictWarning(null);
      return;
    }

    try {
      setDateConflictWarning(null);

      const response = await leaveService.checkDateConflict(
        formData.startDate,
        formData.endDate,
        isEdit ? id : undefined
      );

      if (response.success) {
        if (response.data.hasConflict) {
          setDateConflictWarning('⚠️ Seçtiğiniz tarih aralığında onaylanmış izinleriniz bulunmaktadır. Bu tarihler için izin talebi oluşturamazsınız.');
        }
      } else {
        console.warn('Tarih çakışma kontrolü uyarısı:', response.message);
      }
    } catch (error) {
      console.error('Tarih çakışma kontrolü hatası:', error);
      // Network hatalarında sessiz kalır, kullanıcı submit ederken tekrar kontrol edilecek
    }
  }, [formData.startDate, formData.endDate, isEdit, id]);

  const loadLeave = useCallback(async (leaveId: string) => {
    try {
      setLoading(true);
      const response = await leaveService.getLeaveRequest(leaveId);
      if (response.success) {
        const leave = response.data;
        
        // Sadece kendi talebini düzenleyebilir ve pending durumda olmalı
        if (leave.employeeId !== user?.employeeId || leave.status !== 'PENDING') {
          setError('Bu izin talebini düzenleme yetkiniz bulunmuyor.');
          return;
        }

        setFormData({
          leaveType: leave.leaveType,
          startDate: leave.startDate,
          endDate: leave.endDate,
          reason: leave.reason || ''
        });
      } else {
        setError('İzin talebi bilgileri yüklenirken hata oluştu');
      }
    } catch (err: any) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [user?.employeeId]);

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.leaveType) {
      errors.leaveType = 'İzin türü seçiniz';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Başlangıç tarihi seçiniz';
    }
    
    if (!formData.endDate) {
      errors.endDate = 'Bitiş tarihi seçiniz';
    }
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Saati sıfırla
      
      if (start < today && !isEdit) {
        errors.startDate = 'Başlangıç tarihi bugünden önce olamaz';
      }
      
      if (end < start) {
        errors.endDate = 'Bitiş tarihi başlangıç tarihinden önce olamaz';
      }
    }
    
    if (totalDays > 365) {
      errors.endDate = 'İzin süresi 365 günden fazla olamaz';
    }
    
    if (totalDays < 1) {
      errors.endDate = 'En az 1 günlük izin alabilirsiniz';
    }

    // Tarih çakışma uyarısı varsa hata olarak ekle
    if (dateConflictWarning) {
      errors.dateConflict = dateConflictWarning;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Form submit edilmeden önce son bir kez tarih çakışması kontrolü yap
    try {
      const conflictResponse = await leaveService.checkDateConflict(
        formData.startDate,
        formData.endDate,
        isEdit ? id : undefined
      );

      if (conflictResponse.success && conflictResponse.data.hasConflict) {
        setError('Seçtiğiniz tarih aralığında zaten onaylanmış izinleriniz bulunmaktadır. Lütfen farklı tarihler seçiniz.');
        return;
      }
    } catch (conflictError) {
      console.error('Tarih çakışma kontrolü hatası:', conflictError);
      setError('Tarih çakışması kontrolü sırasında hata oluştu. Lütfen tekrar deneyiniz.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let response;
      if (isEdit && id) {
        const updateData: LeaveRequestEditRequest = {
          leaveType: formData.leaveType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          reason: formData.reason?.trim()
        };
        response = await leaveService.editLeaveRequest(id, updateData);
      } else {
        const createData: LeaveRequestCreateRequest = {
          leaveType: formData.leaveType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          reason: formData.reason?.trim()
        };
        response = await leaveService.createLeaveRequest(createData);
      }

      if (response.success) {
        alert(isEdit ? 'İzin talebi başarıyla güncellendi' : 'İzin talebi başarıyla oluşturuldu');
        navigate('/leaves');
      } else {
        setError(response.message || 'İşlem sırasında hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  // useEffect'ler - tüm callback'lerden sonra
  useEffect(() => {
    if (isEdit && id) {
      loadLeave(id);
    }
  }, [id, isEdit, loadLeave]);

  useEffect(() => {
    calculateTotalDays();
  }, [calculateTotalDays]);

  useEffect(() => {
    // Tarih değiştiğinde çakışma kontrolü yap (debounce ile)
    const timeoutId = setTimeout(() => {
      checkDateConflict();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [checkDateConflict]);

  return (
    <div className="p-6">
      {/* Başlık */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/leaves')}
          className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri Dön
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? 'İzin Talebini Düzenle' : 'Yeni İzin Talebi'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* İzin Türü */}
            <div>
              <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 mb-1">
                İzin Türü *
              </label>
              <select
                id="leaveType"
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.leaveType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="VACATION">Yıllık İzin</option>
                <option value="SICK">Hastalık İzni</option>
                <option value="UNPAID">Ücretsiz İzin</option>
                <option value="MATERNITY">Doğum İzni</option>
              </select>
              {validationErrors.leaveType && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.leaveType}</p>
              )}
            </div>

            {/* Toplam Gün */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Toplam Gün Sayısı
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700 font-medium">
                {totalDays > 0 ? `${totalDays} gün` : '-'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Başlangıç Tarihi */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Başlangıç Tarihi *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.startDate && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.startDate}</p>
              )}
            </div>

            {/* Bitiş Tarihi */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Bitiş Tarihi *
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.endDate && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.endDate}</p>
              )}
            </div>
          </div>

          {/* Tarih Çakışma Uyarısı */}
          {dateConflictWarning && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    {dateConflictWarning}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Genel hata mesajları için */}
          {validationErrors.dateConflict && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {validationErrors.dateConflict}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Açıklama */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="İzin alma sebebinizi açıklayın (isteğe bağlı)"
            />
          </div>

          {/* Bilgi Kutusu */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-blue-800 text-sm">
                <p className="font-medium mb-1">İzin Talebi Hakkında:</p>
                <ul className="space-y-1 text-xs">
                  <li>• İzin talebiniz onay sürecine alınacak ve size bilgilendirme yapılacaktır</li>
                  <li>• Talep onaylanmadan önce düzenleme yapabilirsiniz</li>
                  <li>• Acil durumlar için direkt yöneticinize de bilgi veriniz</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form Butonları */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/leaves')}
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
              {loading ? 'Kaydediliyor...' : (isEdit ? 'Güncelle' : 'Talep Oluştur')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveForm;