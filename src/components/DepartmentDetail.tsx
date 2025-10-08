import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { departmentService } from '../services/departmentService';
import { DepartmentDetailResponse } from '../types';

const DepartmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [department, setDepartment] = useState<DepartmentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDepartment = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await departmentService.getDepartment(id);
        if (response.success) {
          setDepartment(response.data);
        } else {
          setError(response.message || 'Departman bilgileri yüklenirken hata oluştu');
        }
      } catch (err: any) {
        setError(err.message || 'Beklenmeyen bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadDepartment();
  }, [id]);

  const handleDelete = async () => {
    if (!department || !id) return;
    
    if (!window.confirm(`"${department.name}" departmanını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    try {
      const response = await departmentService.deleteDepartment(id);
      if (response.success) {
        alert('Departman başarıyla silindi');
        navigate('/departments');
      } else {
        alert('Departman silinirken hata oluştu: ' + response.message);
      }
    } catch (error: any) {
      alert('Departman silinirken hata oluştu: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Departman bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={() => navigate('/departments')}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          ← Departmanlara Dön
        </button>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-600">Departman bulunamadı</div>
        <button
          onClick={() => navigate('/departments')}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          ← Departmanlara Dön
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => navigate('/departments')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-2 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Departmanlara Dön
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{department.name}</h1>
          <p className="text-gray-600">Departman Detayları</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/departments/${id}/employees`)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 hover:text-green-700 transition-colors"
          >
            <Users className="w-4 h-4 mr-2" />
            Çalışanları Görüntüle
          </button>
          {user?.role === 'HR' && (
            <>
              <button
                onClick={() => navigate(`/departments/${id}/edit`)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-amber-600 bg-amber-50 rounded-md hover:bg-amber-100 hover:text-amber-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Düzenle
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Sil
              </button>
            </>
          )}
        </div>
      </div>

      {/* Department Info Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Temel Bilgiler */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Temel Bilgiler
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Departman Adı</label>
                <div className="text-gray-900 font-medium">{department.name}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Açıklama</label>
                <div className="text-gray-900">
                  {department.description || 'Açıklama mevcut değil'}
                </div>
              </div>
            </div>
          </div>

          {/* Sistem Bilgileri */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Sistem Bilgileri
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Oluşturulma Tarihi</label>
                <div className="text-gray-900">{formatDate(department.createdAt)}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Son Güncellenme</label>
                <div className="text-gray-900">{formatDate(department.updatedAt)}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Departman ID</label>
                <div className="text-gray-900 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {department.id}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetail;