import api from '../config/api';
import { 
  ApiResponse, 
  PaginatedResponse, 
  DepartmentDetailResponse,
  DepartmentListItem,
  DepartmentCreateRequest,
  DepartmentUpdateRequest,
  DepartmentFilterRequest
} from '../types';

export const departmentService = {
  // Tüm departmanları getir (sayfalama ve filtreleme ile)
  getAllDepartments: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    filterRequest?: DepartmentFilterRequest;
  }): Promise<ApiResponse<PaginatedResponse<DepartmentListItem>>> => {
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

    const response = await api.get(`/api/v1/departments?${queryParams.toString()}`);
    return response.data;
  },

  // Dropdown için basit departman listesi
  getDepartmentsForDropdown: async (): Promise<ApiResponse<PaginatedResponse<DepartmentListItem>>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', '0');
    queryParams.append('size', '100');
    queryParams.append('sortBy', 'name');
    queryParams.append('sortDirection', 'asc');
    queryParams.append('filterRequest.searchTerm', '');

    const response = await api.get(`/api/v1/departments?${queryParams.toString()}`);
    return response.data;
  },

  // Tek departman getir
  getDepartment: async (id: string): Promise<ApiResponse<DepartmentDetailResponse>> => {
    const response = await api.get(`/api/v1/departments/${id}`);
    return response.data;
  },

  // Yeni departman oluştur
  createDepartment: async (data: DepartmentCreateRequest): Promise<ApiResponse<DepartmentDetailResponse>> => {
    const response = await api.post('/api/v1/departments', data);
    return response.data;
  },

  // Departman güncelle
  updateDepartment: async (id: string, data: DepartmentUpdateRequest): Promise<ApiResponse<DepartmentDetailResponse>> => {
    const response = await api.put(`/api/v1/departments/${id}`, data);
    return response.data;
  },

  // Departman sil
  deleteDepartment: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/v1/departments/${id}`);
    return response.data;
  },

  // Departmana ait çalışanları getir
  getDepartmentEmployees: async (
    departmentId: string,
    params?: {
      page?: number;
      size?: number;
      sortBy?: string;
      sortDirection?: 'asc' | 'desc';
    }
  ) => {
    const queryParams = new URLSearchParams();
    
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    
    // Boş filter request ekle (gerekli parametre)
    queryParams.append('filterRequest.searchTerm', '');

    const response = await api.get(`/api/v1/employees/department/${departmentId}?${queryParams.toString()}`);
    return response.data;
  }
};