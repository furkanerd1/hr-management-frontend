import api from '../config/api';
import { 
  ApiResponse, 
  PaginatedResponse, 
  LeaveRequestDetailResponse,
  LeaveRequestListItem,
  LeaveRequestCreateRequest,
  LeaveRequestEditRequest,
  LeaveRequestFilterRequest,
  EmployeeLeaveBalanceResponse
} from '../types';

export const leaveService = {
  // Tüm izin taleplerini getir (HR/Manager için)
  getAllLeaveRequests: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    filterRequest?: LeaveRequestFilterRequest;
  }): Promise<ApiResponse<PaginatedResponse<LeaveRequestListItem>>> => {
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

    const response = await api.get(`/api/v1/leaves?${queryParams.toString()}`);
    return response.data;
  },

  // Kullanıcının kendi izin taleplerini getir
  getMyLeaveRequests: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    filterRequest?: LeaveRequestFilterRequest;
  }): Promise<ApiResponse<PaginatedResponse<LeaveRequestListItem>>> => {
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

    const response = await api.get(`/api/v1/leaves/my-requests?${queryParams.toString()}`);
    return response.data;
  },

  // Tek izin talebi getir
  getLeaveRequest: async (id: string): Promise<ApiResponse<LeaveRequestDetailResponse>> => {
    const response = await api.get(`/api/v1/leaves/${id}`);
    return response.data;
  },

  // Yeni izin talebi oluştur
  createLeaveRequest: async (data: LeaveRequestCreateRequest): Promise<ApiResponse<LeaveRequestDetailResponse>> => {
    const response = await api.post('/api/v1/leaves', data);
    return response.data;
  },

  // İzin talebini düzenle
  editLeaveRequest: async (id: string, data: LeaveRequestEditRequest): Promise<ApiResponse<LeaveRequestDetailResponse>> => {
    const response = await api.patch(`/api/v1/leaves/${id}`, data);
    return response.data;
  },

  // İzin talebini iptal et
  cancelLeaveRequest: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/v1/leaves/${id}`);
    return response.data;
  },

  // İzin talebini onayla (HR/Manager)
  approveLeaveRequest: async (id: string): Promise<ApiResponse<LeaveRequestDetailResponse>> => {
    const response = await api.patch(`/api/v1/leaves/${id}/approve`);
    return response.data;
  },

  // İzin talebini reddet (HR/Manager)
  rejectLeaveRequest: async (id: string): Promise<ApiResponse<LeaveRequestDetailResponse>> => {
    const response = await api.patch(`/api/v1/leaves/${id}/reject`);
    return response.data;
  },

  // Kullanıcının izin bakiyesini getir
  getMyLeaveBalance: async (): Promise<ApiResponse<EmployeeLeaveBalanceResponse>> => {
    const response = await api.get('/api/v1/leaves/my-balance');
    return response.data;
  },

  // Belirli bir çalışanın izin bakiyesini getir (HR/Manager)
  getEmployeeLeaveBalance: async (employeeId: string): Promise<ApiResponse<EmployeeLeaveBalanceResponse>> => {
    const response = await api.get(`/api/v1/leaves/${employeeId}/balance`);
    return response.data;
  },

  // Tarih aralığında çakışma kontrolü (frontend-based)
  checkDateConflict: async (startDate: string, endDate: string, excludeId?: string): Promise<ApiResponse<{ hasConflict: boolean; conflictingLeaves: any[] }>> => {
    try {
      // Employee'ın kendi izinlerini getir
      const response = await leaveService.getMyLeaveRequests({
        page: 0,
        size: 100,
        sortBy: 'startDate',
        sortDirection: 'asc',
        filterRequest: { searchTerm: '' }
      });

      if (response.success) {
        const approvedLeaves = response.data.data.filter(leave => 
          leave.status === 'APPROVED' && 
          (excludeId ? leave.id !== excludeId : true)
        );

        const requestStartDate = new Date(startDate);
        const requestEndDate = new Date(endDate);

        const conflictingLeaves = approvedLeaves.filter(leave => {
          const leaveStart = new Date(leave.startDate);
          const leaveEnd = new Date(leave.endDate);
          
          // Tarih çakışması kontrolü
          return (requestStartDate <= leaveEnd && requestEndDate >= leaveStart);
        });

        return {
          success: true,
          message: 'Çakışma kontrolü başarılı',
          data: {
            hasConflict: conflictingLeaves.length > 0,
            conflictingLeaves: conflictingLeaves
          },
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('İzin listesi alınırken hata oluştu');
      }
    } catch (error) {
      console.error('Çakışma kontrolü hatası:', error);
      return {
        success: false,
        message: 'Çakışma kontrolü yapılırken hata oluştu',
        data: { hasConflict: false, conflictingLeaves: [] },
        timestamp: new Date().toISOString()
      };
    }
  }
};