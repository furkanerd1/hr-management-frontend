import React, { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../../services/notificationService';
import { NotificationResponse, PaginatedResponse } from '../../types';
import { 
  Bell, 
  Trash2, 
  CheckCircle, 
  Circle,
  Clock,
  User,
  Award,
  Megaphone,
  X
} from 'lucide-react';

const MyNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginatedResponse<NotificationResponse> | null>(null);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await notificationService.getMyNotifications({
        page,
        size,
        sortBy: 'createdAt',
        sortDirection: 'desc'
      });

      if (response.success) {
        let filteredNotifications = response.data.data;
        
        if (filter === 'unread') {
          filteredNotifications = filteredNotifications.filter(n => !n.isRead);
        } else if (filter === 'read') {
          filteredNotifications = filteredNotifications.filter(n => n.isRead);
        }

        setNotifications(filteredNotifications);
        setPagination(response.data);
      } else {
        setError('Bildirimler yüklenirken hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [page, size, filter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      loadNotifications();
    } catch (err: any) {
      setError(err.message || 'Bildirim okundu olarak işaretlenirken hata oluştu');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      loadNotifications();
    } catch (err: any) {
      setError(err.message || 'Tüm bildirimler okundu olarak işaretlenirken hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu bildirimi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await notificationService.deleteNotification(id);
      loadNotifications();
    } catch (err: any) {
      setError(err.message || 'Bildirim silinirken hata oluştu');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LEAVE':
        return <Clock className="w-5 h-5" />;
      case 'PERFORMANCE':
        return <Award className="w-5 h-5" />;
      case 'ANNOUNCEMENT':
        return <Megaphone className="w-5 h-5" />;
      case 'GENERAL':
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Bildirimlerim</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}
            </p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Tümünü Okundu İşaretle
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => {setFilter('all'); setPage(0);}}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Tümü ({pagination?.total || 0})
          </button>
          <button
            onClick={() => {setFilter('unread'); setPage(0);}}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Okunmamış ({unreadCount})
          </button>
          <button
            onClick={() => {setFilter('read'); setPage(0);}}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'read'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Okunmuş ({(pagination?.total || 0) - unreadCount})
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center justify-between">
          {error}
          <button 
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Yükleniyor...</span>
        </div>
      )}

      {/* Notifications List */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'Henüz bildirim yok' : 
                 filter === 'unread' ? 'Okunmamış bildirim yok' : 'Okunmuş bildirim yok'}
              </h3>
              <p className="text-gray-600">
                {filter === 'all' ? 'Size henüz bildirim gönderilmemiş' :
                 filter === 'unread' ? 'Tüm bildirimleriniz okunmuş' : 'Henüz okunmuş bildirim yok'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Notification Icon */}
                      <div className={`p-2 rounded-full ${notificationService.getNotificationTypeColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${notificationService.getNotificationTypeColor(notification.type)}`}>
                            {notificationService.getNotificationTypeText(notification.type)}
                          </span>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        
                        <p className={`text-sm ${!notification.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                          {notification.message}
                        </p>
                        
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Okundu işaretle"
                        >
                          <Circle className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Önceki
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pagination.totalPages - 1}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sonraki
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{pagination.total}</span> sonuçtan{' '}
                      <span className="font-medium">{page * size + 1}</span> -{' '}
                      <span className="font-medium">
                        {Math.min((page + 1) * size, pagination.total)}
                      </span>{' '}
                      arası gösteriliyor
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 0}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Önceki
                      </button>
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNum = Math.max(0, Math.min(pagination.totalPages - 5, page - 2)) + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNum === page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page >= pagination.totalPages - 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sonraki
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyNotifications;