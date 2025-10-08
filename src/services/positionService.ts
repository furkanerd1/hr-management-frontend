import api from '../config/api';
import { 
  ApiResponse, 
  PaginatedResponse, 
  PositionDetailResponse,
  PositionListItem,
  PositionCreateRequest,
  PositionUpdateRequest,
  PositionFilterRequest
} from '../types';

export const positionService = {
  // Tüm pozisyonları getir (sayfalama ve filtreleme ile)
  getAllPositions: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    filterRequest?: PositionFilterRequest;
  }): Promise<ApiResponse<PaginatedResponse<PositionListItem>>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    
    // Filter parametrelerini ekle - backend boş filter gerektirir
    const filterRequest = params?.filterRequest || {};
    
    // Eğer hiçbir filtre yoksa en azından boş searchTerm ekle
    if (Object.keys(filterRequest).length === 0) {
      queryParams.append('filterRequest.searchTerm', '');
    } else {
      Object.keys(filterRequest).forEach(key => {
        const value = (filterRequest as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(`filterRequest.${key}`, value.toString());
        } else if (key === 'searchTerm') {
          // searchTerm her zaman gönderilmeli, boş olsa bile
          queryParams.append('filterRequest.searchTerm', '');
        }
      });
    }

    const response = await api.get(`/api/v1/positions?${queryParams.toString()}`);
    return response.data;
  },

  // Dropdown için basit pozisyon listesi
  getPositionsForDropdown: async (): Promise<ApiResponse<PaginatedResponse<PositionListItem>>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', '0');
    queryParams.append('size', '100');
    queryParams.append('sortBy', 'title');
    queryParams.append('sortDirection', 'asc');
    queryParams.append('filterRequest.searchTerm', '');

    const response = await api.get(`/api/v1/positions?${queryParams.toString()}`);
    return response.data;
  },

  // Tek pozisyon getir
  getPosition: async (id: string): Promise<ApiResponse<PositionDetailResponse>> => {
    const response = await api.get(`/api/v1/positions/${id}`);
    return response.data;
  },

  // Yeni pozisyon oluştur
  createPosition: async (data: PositionCreateRequest): Promise<ApiResponse<PositionDetailResponse>> => {
    const response = await api.post('/api/v1/positions', data);
    return response.data;
  },

  // Pozisyon güncelle
  updatePosition: async (id: string, data: PositionUpdateRequest): Promise<ApiResponse<PositionDetailResponse>> => {
    const response = await api.put(`/api/v1/positions/${id}`, data);
    return response.data;
  },

  // Pozisyon sil
  deletePosition: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/v1/positions/${id}`);
    return response.data;
  }
};