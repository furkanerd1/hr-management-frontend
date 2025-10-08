import { 
  NotificationResponse,
  PaginatedResponse, 
  ApiResponse 
} from '../types';
import api from '../config/api';

interface NotificationQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

class NotificationService {
  private readonly baseUrl = '/api/v1/notifications';

  // Get user's notifications
  async getMyNotifications(params: NotificationQueryParams = {}): Promise<ApiResponse<PaginatedResponse<NotificationResponse>>> {
    try {
      const { page = 0, size = 10, sortBy = 'createdAt', sortDirection = 'desc' } = params;
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDirection,
      });

      const response = await api.get(`${this.baseUrl}/my-notifications?${queryParams}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Bildirimler yüklenirken hata oluştu');
    }
  }

  // Mark notification as read
  async markAsRead(id: string): Promise<ApiResponse<NotificationResponse>> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}/read`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Bildirim okundu olarak işaretlenirken hata oluştu');
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<ApiResponse<void>> {
    try {
      const response = await api.patch(`${this.baseUrl}/read-all`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Tüm bildirimler okundu olarak işaretlenirken hata oluştu');
    }
  }

  // Delete notification
  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Bildirim silinirken hata oluştu');
    }
  }

  // Get notification type color
  getNotificationTypeColor(type: string): string {
    switch (type) {
      case 'LEAVE':
        return 'text-blue-600 bg-blue-100';
      case 'PERFORMANCE':
        return 'text-purple-600 bg-purple-100';
      case 'ANNOUNCEMENT':
        return 'text-green-600 bg-green-100';
      case 'GENERAL':
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  // Get notification type icon
  getNotificationTypeText(type: string): string {
    switch (type) {
      case 'LEAVE':
        return 'İzin';
      case 'PERFORMANCE':
        return 'Performans';
      case 'ANNOUNCEMENT':
        return 'Duyuru';
      case 'GENERAL':
      default:
        return 'Genel';
    }
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    try {
      const response = await this.getMyNotifications({ page: 0, size: 100 });
      if (response.success) {
        return response.data.data.filter(notification => !notification.isRead).length;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }
}

export const notificationService = new NotificationService();