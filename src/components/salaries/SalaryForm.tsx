import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { salaryService } from '../../services/salaryService';
import { employeeService } from '../../services/employeeService';
import { SalaryCreateRequest, EmployeeListItem } from '../../types';
import { DollarSign, ArrowLeft, Save, AlertCircle } from 'lucide-react';

const SalaryForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);
  const preSelectedEmployeeId = searchParams.get('employeeId');

  const [formData, setFormData] = useState<SalaryCreateRequest>({
    employeeId: preSelectedEmployeeId || '',
    salary: 17000,
    bonus: 0, // Backend expects bonus to always be provided
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employeesLoading, setEmployeesLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await loadEmployees();
    };

    const loadSalaryData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await salaryService.getSalary(id);
        
        if (response.success) {
          const salary = response.data;
          setFormData({
            employeeId: salary.employeeId,
            salary: salary.salary,
            bonus: salary.bonus,
            effectiveDate: salary.effectiveDate.split('T')[0]
          });
        } else {
          setError('Maaş bilgileri yüklenirken hata oluştu');
        }
      } catch (err: any) {
        setError(err.message || 'Beklenmeyen bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    if (isEdit) {
      loadSalaryData();
    }
  }, [id, isEdit]);

  const loadEmployees = async () => {
    try {
      setEmployeesLoading(true);
      const response = await employeeService.getAllEmployees({
        page: 0,
        size: 1000, // Load all employees for selection
        sortBy: 'fullName',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salary' || name === 'bonus'
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId) {
      setError('Lütfen bir çalışan seçin');
      return;
    }

    if (!formData.employeeId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      setError('Geçerli bir çalışan seçin');
      return;
    }

    if (formData.salary <= 0) {
      setError('Maaş tutarı 0\'dan büyük olmalıdır');
      return;
    }

    if (formData.salary < 17000) {
      setError('Maaş tutarı asgari ücretten (17.000 TL) düşük olamaz');
      return;
    }

    if (!formData.effectiveDate) {
      setError('Geçerlilik tarihi seçin');
      return;
    }

    // Check if effective date is today or future
    const today = new Date().toISOString().split('T')[0];
    if (formData.effectiveDate < today) {
      setError('Geçerlilik tarihi bugünden eski olamaz');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare data for API - always send bonus (backend expects it)
      const requestData: SalaryCreateRequest = {
        employeeId: formData.employeeId,
        salary: formData.salary,
        bonus: formData.bonus || 0, // Always provide bonus, default to 0
        effectiveDate: formData.effectiveDate // Should be YYYY-MM-DD format
      };

      console.log('Sending salary data:', requestData);
      console.log('EffectiveDate format:', formData.effectiveDate, 'Type:', typeof formData.effectiveDate);

      const response = await salaryService.createSalary(requestData);
      
      console.log('API Response:', response);
      
      if (response.success) {
        navigate('/salaries');
      } else {
        console.error('API Error Response:', response);
        setError(response.message || 'Maaş kaydedilirken hata oluştu');
      }
    } catch (err: any) {
      console.error('Salary creation error:', err);
      setError(err.message || 'Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return formData.salary + (formData.bonus || 0);
  };

  if (user?.role !== 'HR') {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Bu işlem için yetkiniz bulunmamaktadır.
        </div>
      </div>
    );
  }

  if (employeesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Çalışanlar yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/salaries')}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Geri
        </button>
        <div className="flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isEdit ? 'Maaş Düzenle' : 'Yeni Maaş'}
            </h1>
            <p className="text-gray-600">
              {isEdit ? 'Mevcut maaş bilgilerini düzenleyin' : 'Çalışan için yeni maaş kaydı oluşturun'}
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
                  disabled={isEdit || Boolean(preSelectedEmployeeId)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
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

              {/* Salary Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temel Maaş (₺) *
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary || ''}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prim (₺)
                  </label>
                  <input
                    type="number"
                    name="bonus"
                    value={formData.bonus || ''}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Effective Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Geçerlilik Tarihi *
                </label>
                <input
                  type="date"
                  name="effectiveDate"
                  value={formData.effectiveDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]} // Today or future dates only
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/salaries')}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
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

        {/* Sidebar - Summary */}
        <div className="space-y-6">
          {/* Salary Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Maaş Özeti</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Temel Maaş:</span>
                <span className="font-semibold text-gray-800">
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                    minimumFractionDigits: 0,
                  }).format(formData.salary || 0)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Prim:</span>
                <span className="font-semibold text-gray-800">
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                    minimumFractionDigits: 0,
                  }).format(formData.bonus || 0)}
                </span>
              </div>

              <hr className="my-2" />

              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-800">Toplam:</span>
                <span className="text-xl font-bold text-green-600">
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                    minimumFractionDigits: 0,
                  }).format(calculateTotal())}
                </span>
              </div>

              {(formData.bonus || 0) > 0 && (
                <div className="text-sm text-gray-600">
                  Prim oranı: %{(((formData.bonus || 0) / formData.salary) * 100).toFixed(1)}
                </div>
              )}
            </div>
          </div>

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

          {/* Help Card */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Bilgi</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Temel maaş alanı zorunludur</li>
              <li>• Prim alanı opsiyoneldir</li>
              <li>• Geçerlilik tarihi maaşın başlangıç tarihidir</li>
              <li>• Toplam maaş otomatik hesaplanır</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryForm;