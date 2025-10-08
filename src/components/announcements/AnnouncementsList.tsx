import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { announcementService } from '../../services/announcementService';
import { AnnouncementResponse, PaginatedResponse } from '../../types';
import { Megaphone, Plus, Calendar, User, AlertCircle } from 'lucide-react';

const AnnouncementsList: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginatedResponse<AnnouncementResponse> | null>(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const canCreateAnnouncements = user?.role === 'HR';

  const loadAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await announcementService.getAllAnnouncements({
        page,
        size,
        sortBy: 'createdAt',
        sortDirection: 'desc'
      });

      if (response.success) {
        setAnnouncements(response.data.data);
        setPagination(response.data);
      } else {
        setError('Duyurular yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
      setError('Duyurular yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const getAnnouncementTypeColor = (type: string) => {
    switch (type) {
      case 'HOLIDAY':
        return 'bg-green-100 text-green-800';
      case 'POLICY':
        return 'bg-blue-100 text-blue-800';
      case 'EVENT':
        return 'bg-purple-100 text-purple-800';
      case 'GENERAL':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAnnouncementTypeText = (type: string) => {
    switch (type) {
      case 'HOLIDAY':
        return 'Tatil';
      case 'POLICY':
        return 'Politika';
      case 'EVENT':
        return 'Etkinlik';
      case 'GENERAL':
        return 'Genel';
      default:
        return 'Diğer';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Hata</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Megaphone className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Duyurular</h1>
            <p className="text-gray-600">Şirket duyurularını görüntüleyin</p>
          </div>
        </div>
        {canCreateAnnouncements && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Yeni Duyuru</span>
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="bg-white shadow rounded-lg">
        {announcements.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Duyuru bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">Henüz hiç duyuru yayınlanmamış.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Megaphone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        {announcement.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAnnouncementTypeColor(announcement.type)}`}>
                        {getAnnouncementTypeText(announcement.type)}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700 line-clamp-3">
                      {announcement.content}
                    </p>
                    <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{announcement.createdBy}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(announcement.createdAt).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Toplam {pagination.total} duyuru
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Önceki
            </button>
            <span className="px-3 py-2 text-sm font-medium text-gray-700">
              {page + 1} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(pagination.totalPages - 1, page + 1))}
              disabled={page >= pagination.totalPages - 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsList;
