import api from '../config/api';
import { 
  ApiResponse, 
  PaginatedResponse, 
  SalaryListItem,
  SalaryDetailResponse, 
  SalaryCreateRequest, 
  SalaryFilterRequest 
} from '../types';
import { API_BASE_URL } from '../constants';

export const salaryService = {
  // Tüm maaşları getir (HR için)
  getAllSalaries: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    filterRequest?: SalaryFilterRequest;
  }): Promise<ApiResponse<PaginatedResponse<SalaryListItem>>> => {
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

    const response = await api.get(`/api/v1/salaries?${queryParams.toString()}`);
    return response.data;
  },

  // Tek maaş detayı getir (HR için)
  getSalary: async (id: string): Promise<ApiResponse<SalaryDetailResponse>> => {
    const response = await api.get(`/api/v1/salaries/${id}`);
    return response.data;
  },

  // Yeni maaş oluştur (HR için)
  createSalary: async (data: SalaryCreateRequest): Promise<ApiResponse<SalaryDetailResponse>> => {
    try {
      console.log('SalaryService: Creating salary with data:', data);
      console.log('SalaryService: API endpoint: POST /api/v1/salaries');
      const response = await api.post('/api/v1/salaries', data);
      console.log('SalaryService: Response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('SalaryService: Create salary error:', error);
      if (error.response) {
        console.error('SalaryService: Error response data:', error.response.data);
        console.error('SalaryService: Error response status:', error.response.status);
        console.error('SalaryService: Full URL:', `${API_BASE_URL}/api/v1/salaries`);
      }
      throw error;
    }
  },

  // Maaş sil (HR için)
  deleteSalary: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/v1/salaries/${id}`);
    return response.data;
  },

  // Kullanıcının kendi maaş geçmişi (Employee için)
  getMySalaryHistory: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    filterRequest?: SalaryFilterRequest;
  }): Promise<ApiResponse<PaginatedResponse<SalaryListItem>>> => {
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

    const response = await api.get(`/api/v1/salaries/my-history?${queryParams.toString()}`);
    return response.data;
  },

  // Belirli çalışanın maaş geçmişi (HR/Manager için)
  getEmployeeSalaryHistory: async (employeeId: string, params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    filterRequest?: SalaryFilterRequest;
  }): Promise<ApiResponse<PaginatedResponse<SalaryListItem>>> => {
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

    const response = await api.get(`/api/v1/salaries/employee/${employeeId}?${queryParams.toString()}`);
    return response.data;
  }
};