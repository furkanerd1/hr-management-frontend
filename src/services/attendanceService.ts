import { 
  AttendanceListItem, 
  AttendanceDetailResponse, 
  AttendanceCreateRequest, 
  AttendanceUpdateRequest,
  AttendanceFilterRequest,
  PaginatedResponse, 
  ApiResponse 
} from '../types';
import api from '../config/api';

interface AttendanceQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filterRequest?: AttendanceFilterRequest;
}

class AttendanceService {
  private readonly baseUrl = '/api/v1/attendance';

  // Get all attendance records (HR/Manager only)
  async getAllAttendances(params: AttendanceQueryParams = {}): Promise<ApiResponse<PaginatedResponse<AttendanceListItem>>> {
    try {
      const { page = 0, size = 10, sortBy = 'date', sortDirection = 'desc', filterRequest } = params;
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDirection,
      });

      if (filterRequest) {
        queryParams.append('filterRequest', JSON.stringify(filterRequest));
      }

      const response = await api.get(`${this.baseUrl}?${queryParams}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Devamsızlık kayıtları yüklenirken hata oluştu');
    }
  }

  // Get attendance by ID (HR/Manager only)
  async getAttendance(id: string): Promise<ApiResponse<AttendanceDetailResponse>> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Devamsızlık kaydı yüklenirken hata oluştu');
    }
  }

  // Create manual attendance record (HR/Manager only)
  async createAttendance(data: AttendanceCreateRequest): Promise<ApiResponse<AttendanceDetailResponse>> {
    try {
      const response = await api.post(`${this.baseUrl}/manual`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Devamsızlık kaydı oluşturulurken hata oluştu');
    }
  }

  // Update attendance record (HR/Manager only)
  async updateAttendance(id: string, data: AttendanceUpdateRequest): Promise<ApiResponse<AttendanceDetailResponse>> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Devamsızlık kaydı güncellenirken hata oluştu');
    }
  }

  // Delete attendance record (HR/Manager only)
  async deleteAttendance(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Devamsızlık kaydı silinirken hata oluştu');
    }
  }

  // Check-in for today (Employee only)
  async checkIn(): Promise<ApiResponse<AttendanceDetailResponse>> {
    try {
      const response = await api.post(`${this.baseUrl}/check-in`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Giriş kaydedilirken hata oluştu');
    }
  }

  // Check-out for today (Employee only)
  async checkOut(): Promise<ApiResponse<AttendanceDetailResponse>> {
    try {
      const response = await api.post(`${this.baseUrl}/check-out`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Çıkış kaydedilirken hata oluştu');
    }
  }

  // Get my attendance records (Employee only)
  async getMyAttendances(params: AttendanceQueryParams = {}): Promise<ApiResponse<PaginatedResponse<AttendanceListItem>>> {
    try {
      const { page = 0, size = 10, sortBy = 'date', sortDirection = 'desc', filterRequest } = params;
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDirection,
      });

      if (filterRequest) {
        queryParams.append('filterRequest', JSON.stringify(filterRequest));
      }

      const response = await api.get(`${this.baseUrl}/my-attendance?${queryParams}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Devamsızlık kayıtlarınız yüklenirken hata oluştu');
    }
  }

  // Get employee attendance history (HR/Manager only)
  async getEmployeeAttendanceHistory(
    employeeId: string, 
    params: AttendanceQueryParams = {}
  ): Promise<ApiResponse<PaginatedResponse<AttendanceListItem>>> {
    try {
      const { page = 0, size = 10, sortBy = 'date', sortDirection = 'desc', filterRequest } = params;
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDirection,
      });

      if (filterRequest) {
        queryParams.append('filterRequest', JSON.stringify(filterRequest));
      }

      const response = await api.get(`${this.baseUrl}/employee/${employeeId}?${queryParams}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Çalışan devamsızlık geçmişi yüklenirken hata oluştu');
    }
  }

  // Get today's attendance status for employee
  async getTodayAttendanceStatus(): Promise<ApiResponse<AttendanceDetailResponse | null>> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await this.getMyAttendances({
        page: 0,
        size: 1,
        filterRequest: { startDate: today, endDate: today }
      });
      
      if (response.success && response.data.data.length > 0) {
        const attendance = response.data.data[0];
        return { 
          success: true, 
          data: {
            id: attendance.id,
            employeeId: attendance.employeeId,
            employeeFullName: attendance.employeeFullName,
            email: attendance.email,
            departmentName: attendance.departmentName,
            positionName: attendance.positionName,
            date: attendance.date,
            checkInTime: attendance.checkInTime || '',
            checkOutTime: attendance.checkOutTime,
            createdAt: '',
            updatedAt: ''
          },
          message: 'Bugünkü devamsızlık durumu alındı',
          timestamp: new Date().toISOString()
        };
      }
      
      return { 
        success: true, 
        data: null, 
        message: 'Bugün henüz giriş yapılmamış',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Bugünkü durum kontrol edilirken hata oluştu');
    }
  }

  // Helper method to format time
  formatTime(time: string): string {
    try {
      const date = new Date(`2000-01-01T${time}`);
      return date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch (error) {
      return time;
    }
  }

  // Helper method to calculate work hours
  calculateWorkHours(checkInTime?: string, checkOutTime?: string): string {
    if (!checkInTime || !checkOutTime) {
      return 'Henüz tamamlanmadı';
    }

    try {
      const checkIn = new Date(`2000-01-01T${checkInTime}`);
      const checkOut = new Date(`2000-01-01T${checkOutTime}`);
      
      const diffMs = checkOut.getTime() - checkIn.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      const hours = Math.floor(diffHours);
      const minutes = Math.round((diffHours - hours) * 60);
      
      return `${hours}s ${minutes}dk`;
    } catch (error) {
      return 'Hesaplanamadı';
    }
  }

  // Helper method to get work status
  getWorkStatus(checkInTime?: string, checkOutTime?: string): 'working' | 'completed' | 'not_started' {
    if (!checkInTime) return 'not_started';
    if (!checkOutTime) return 'working';
    return 'completed';
  }
}

export const attendanceService = new AttendanceService();