import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { salaryService } from '../../services/salaryService';
import { SalaryDetailResponse } from '../../types';
import { 
  DollarSign, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  Building, 
  Briefcase,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const SalaryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [salary, setSalary] = useState<SalaryDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadSalary = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await salaryService.getSalary(id);
        
        if (response.success) {
          setSalary(response.data);
        } else {
          setError(response.message || 'Maaş detayı yüklenirken hata oluştu');
        }
      } catch (err: any) {
        setError(err.message || 'Beklenmeyen bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadSalary();
  }, [id]);

  const handleDelete = async () => {
    if (!salary?.id) return;

    try {
      setDeleting(true);
      const response = await salaryService.deleteSalary(salary.id);
      
      if (response.success) {
        navigate('/salaries');
      } else {
        setError(response.message || 'Maaş kaydı silinirken hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Beklenmeyen bir hata oluştu');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Maaş detayı yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  if (!salary) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Maaş kaydı bulunamadı</p>
      </div>
    );
  }

  const canEdit = user?.role === 'HR';
  const canDelete = user?.role === 'HR';

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
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
              <h1 className="text-2xl font-bold text-gray-800">Maaş Detayı</h1>
              <p className="text-gray-600">
                {salary.employeeFullName}
              </p>
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <Link
              to={`/salaries/${salary.id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Düzenle
            </Link>
            {canDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors inline-flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Sil
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Salary Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Salary Details Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Maaş Bilgileri</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Temel Maaş
                  </label>
                  <p className="text-lg font-semibold text-gray-800">
                    {formatCurrency(salary.salary)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Prim
                  </label>
                  <p className="text-lg font-semibold text-gray-800">
                    {formatCurrency(salary.bonus)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Toplam Maaş
                  </label>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(salary.totalSalary)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Geçerlilik Tarihi
                  </label>
                  <div className="flex items-center text-gray-800">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(salary.effectiveDate)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes - Remove since it's not in the API */}
        </div>

        {/* Employee Information Sidebar */}
        <div className="space-y-6">
          {/* Employee Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Çalışan Bilgileri</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">
                    {salary.employeeFullName}
                  </p>
                  <p className="text-sm text-gray-600">#{salary.employeeId}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Building className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">
                    {salary.departmentName}
                  </p>
                  <p className="text-sm text-gray-600">Departman</p>
                </div>
              </div>

              <div className="flex items-center">
                <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">
                    {salary.positionName}
                  </p>
                  <p className="text-sm text-gray-600">Pozisyon</p>
                </div>
              </div>
            </div>

            <Link
              to={`/employees/${salary.employeeId}/view`}
              className="mt-4 w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors inline-flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              Çalışan Detayı
            </Link>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">İstatistikler</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Prim Oranı</span>
                <span className="font-semibold text-blue-600">
                  %{((salary.bonus / salary.salary) * 100).toFixed(1)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Toplam Oran</span>
                <span className="font-semibold text-green-600">
                  %{((salary.totalSalary / salary.salary) * 100).toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Hızlı İşlemler</h3>
            
            <div className="space-y-3">
              <Link
                to={`/salaries/employee/${salary.employeeId}`}
                className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors inline-flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Maaş Geçmişi
              </Link>

              <Link
                to={`/salaries/new?employeeId=${salary.employeeId}`}
                className="w-full bg-green-100 text-green-700 px-4 py-2 rounded-md hover:bg-green-200 transition-colors inline-flex items-center justify-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Yeni Maaş
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Maaş Kaydını Sil
            </h3>
            <p className="text-gray-600 mb-6">
              Bu maaş kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Siliniyor...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Sil
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryDetail;