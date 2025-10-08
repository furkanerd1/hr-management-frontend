import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { positionService } from '../../services/positionService';
import { PositionDetailResponse } from '../../types';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

const PositionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [position, setPosition] = useState<PositionDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPosition(id);
    }
  }, [id]);

  const loadPosition = async (positionId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await positionService.getPosition(positionId);
      if (response.success) {
        setPosition(response.data);
      } else {
        setError(response.message || 'Pozisyon bilgileri yüklenirken hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!position || !id) return;

    if (!window.confirm(`"${position.title}" pozisyonunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    try {
      const response = await positionService.deletePosition(id);
      if (response.success) {
        alert('Pozisyon başarıyla silindi');
        navigate('/positions');
      } else {
        alert('Pozisyon silinirken hata oluştu: ' + response.message);
      }
    } catch (error: any) {
      alert('Pozisyon silinirken hata oluştu: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Pozisyon bilgileri yükleniyor...</span>
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
      </div>
    );
  }

  if (!position) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Pozisyon bulunamadı
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Başlık ve İşlem Butonları */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/positions')}
            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{position.title}</h1>
        </div>
        
        {user?.role === 'HR' && (
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/positions/${id}/edit`)}
              className="bg-amber-100 text-amber-700 px-4 py-2 rounded-md hover:bg-amber-200 transition-colors inline-flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Düzenle
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition-colors inline-flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Sil
            </button>
          </div>
        )}
      </div>

      {/* Pozisyon Bilgileri */}
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Temel Bilgiler</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Pozisyon Adı</label>
                <p className="text-gray-900 font-medium">{position.title}</p>
              </div>
              
              {position.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">Açıklama</label>
                  <p className="text-gray-900">{position.description}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sistem Bilgileri</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Oluşturma Tarihi</label>
                <p className="text-gray-900">{new Date(position.createdAt).toLocaleString('tr-TR')}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Son Güncelleme</label>
                <p className="text-gray-900">{new Date(position.updatedAt).toLocaleString('tr-TR')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionDetail;