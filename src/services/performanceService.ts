import api from '../config/api';
import { 
  ApiResponse, 
  PaginatedResponse, 
  PerformanceReviewListItem,
  PerformanceReviewDetailResponse, 
  PerformanceReviewCreateRequest, 
  PerformanceReviewUpdateRequest,
  PerformanceReviewFilterRequest 
} from '../types';

export const performanceService = {
  // Tüm performans değerlendirmelerini getir (HR/Manager için)
  getAllReviews: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    filterRequest?: PerformanceReviewFilterRequest;
  }): Promise<ApiResponse<PaginatedResponse<PerformanceReviewListItem>>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    
    // Filter parametrelerini ekle
    const filterRequest = params?.filterRequest || {};
    
    if (Object.keys(filterRequest).length === 0) {
      queryParams.append('filterRequest.searchTerm', '');
    } else {
      Object.keys(filterRequest).forEach(key => {
        const value = (filterRequest as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(`filterRequest.${key}`, value.toString());
        } else if (key === 'searchTerm') {
          queryParams.append('filterRequest.searchTerm', '');
        }
      });
    }

    const response = await api.get(`/api/v1/performance-reviews?${queryParams.toString()}`);
    return response.data;
  },

  // Tek performans değerlendirmesi getir
  getReview: async (id: string): Promise<ApiResponse<PerformanceReviewDetailResponse>> => {
    const response = await api.get(`/api/v1/performance-reviews/${id}`);
    return response.data;
  },

  // Yeni performans değerlendirmesi oluştur (HR/Manager için)
  createReview: async (data: PerformanceReviewCreateRequest): Promise<ApiResponse<PerformanceReviewDetailResponse>> => {
    const response = await api.post('/api/v1/performance-reviews', data);
    return response.data;
  },

  // Performans değerlendirmesi güncelle (HR/Manager için)
  updateReview: async (id: string, data: PerformanceReviewUpdateRequest): Promise<ApiResponse<PerformanceReviewDetailResponse>> => {
    const response = await api.patch(`/api/v1/performance-reviews/${id}`, data);
    return response.data;
  },

  // Performans değerlendirmesi sil (HR/Manager için)
  deleteReview: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/v1/performance-reviews/${id}`);
    return response.data;
  },

  // Kullanıcının kendi performans değerlendirmeleri
  getMyReviews: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    filterRequest?: PerformanceReviewFilterRequest;
  }): Promise<ApiResponse<PaginatedResponse<PerformanceReviewListItem>>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    
    const filterRequest = params?.filterRequest || {};
    
    if (Object.keys(filterRequest).length === 0) {
      queryParams.append('filterRequest.searchTerm', '');
    } else {
      Object.keys(filterRequest).forEach(key => {
        const value = (filterRequest as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(`filterRequest.${key}`, value.toString());
        } else if (key === 'searchTerm') {
          queryParams.append('filterRequest.searchTerm', '');
        }
      });
    }

    const response = await api.get(`/api/v1/performance-reviews/my-reviews?${queryParams.toString()}`);
    return response.data;
  },

  // Çalışanın performans geçmişi (HR/Manager için)
  getEmployeePerformanceHistory: async (
    employeeId: string,
    params?: {
      page?: number;
      size?: number;
      sortBy?: string;
      sortDirection?: 'asc' | 'desc';
      filterRequest?: PerformanceReviewFilterRequest;
    }
  ): Promise<ApiResponse<PaginatedResponse<PerformanceReviewListItem>>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    
    const filterRequest = params?.filterRequest || {};
    
    if (Object.keys(filterRequest).length === 0) {
      queryParams.append('filterRequest.searchTerm', '');
    } else {
      Object.keys(filterRequest).forEach(key => {
        const value = (filterRequest as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(`filterRequest.${key}`, value.toString());
        } else if (key === 'searchTerm') {
          queryParams.append('filterRequest.searchTerm', '');
        }
      });
    }

    const response = await api.get(`/api/v1/performance-reviews/employee/${employeeId}?${queryParams.toString()}`);
    return response.data;
  }
};