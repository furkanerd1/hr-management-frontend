import { 
  AnnouncementResponse,
  AnnouncementCreateRequest,
  PaginatedResponse, 
  ApiResponse 
} from '../types';
import api from '../config/api';

interface AnnouncementQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

class AnnouncementService {
  private readonly baseUrl = '/api/v1/announcements';

  // Get all announcements
  async getAllAnnouncements(params: AnnouncementQueryParams = {}): Promise<ApiResponse<PaginatedResponse<AnnouncementResponse>>> {
    try {
      const { page = 0, size = 10, sortBy = 'createdAt', sortDirection = 'desc' } = params;
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDirection,
      });

      const response = await api.get(`${this.baseUrl}?${queryParams}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Duyurular yüklenirken hata oluştu');
    }
  }

  // Create new announcement (HR only)
  async createAnnouncement(data: AnnouncementCreateRequest): Promise<ApiResponse<AnnouncementResponse>> {
    try {
      const response = await api.post(this.baseUrl, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Duyuru oluşturulurken hata oluştu');
    }
  }

  // Get announcement by ID
  async getAnnouncementById(id: number): Promise<ApiResponse<AnnouncementResponse>> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Duyuru yüklenirken hata oluştu');
    }
  }

  // Update announcement
  async updateAnnouncement(id: number, data: AnnouncementCreateRequest): Promise<ApiResponse<AnnouncementResponse>> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Duyuru güncellenirken hata oluştu');
    }
  }

  // Delete announcement
  async deleteAnnouncement(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Duyuru silinirken hata oluştu');
    }
  }
}

export const announcementService = new AnnouncementService();
