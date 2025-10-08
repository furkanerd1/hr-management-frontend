import api from '../config/api';
import { 
  ApiResponse, 
  PaginatedResponse, 
  Employee, 
  EmployeeListItem, 
  EmployeeFilterRequest,
  RegisterRequest,
  EmployeeUpdateRequest,
  EmployeeDetailResponse
} from '../types';

// Parameters interface for getAllEmployees
export interface GetEmployeesParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  searchTerm?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  departmentId?: string;
  positionId?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  role?: 'EMPLOYEE' | 'MANAGER' | 'HR';
  hireDateAfter?: string;
  hireDateBefore?: string;
}

export const employeeService = {
  // Tüm çalışanları getir (paginated)
  getAllEmployees: async (params?: GetEmployeesParams): Promise<ApiResponse<PaginatedResponse<EmployeeListItem>>> => {
    try {
      console.log('Employee Service - getAllEmployees called with params:', params);
      
      // Build query parameters manually - backend expects specific format
      const searchParams = new URLSearchParams();
      
      // Basic pagination and sorting
      searchParams.append('page', (params?.page || 0).toString());
      searchParams.append('size', (params?.size || 10).toString());
      searchParams.append('sortBy', params?.sortBy || 'firstName');
      searchParams.append('sortDirection', params?.sortDirection || 'asc');
      
      // FilterRequest - backend requires at least empty searchTerm
      searchParams.append('filterRequest.searchTerm', params?.searchTerm || '');
      
      // Add other filter parameters only if provided
      if (params?.firstName) searchParams.append('filterRequest.firstName', params.firstName);
      if (params?.lastName) searchParams.append('filterRequest.lastName', params.lastName);
      if (params?.email) searchParams.append('filterRequest.email', params.email);
      if (params?.departmentId) searchParams.append('filterRequest.departmentId', params.departmentId);
      if (params?.positionId) searchParams.append('filterRequest.positionId', params.positionId);
      if (params?.status) searchParams.append('filterRequest.status', params.status);
      if (params?.role) searchParams.append('filterRequest.role', params.role);
      if (params?.hireDateAfter) searchParams.append('filterRequest.hireDateAfter', params.hireDateAfter);
      if (params?.hireDateBefore) searchParams.append('filterRequest.hireDateBefore', params.hireDateBefore);
      
      const url = `/api/v1/employees?${searchParams.toString()}`;
      console.log('Final URL:', url);
      
      const response = await api.get<ApiResponse<PaginatedResponse<EmployeeListItem>>>(url);
      
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  // Tek çalışan getir
  getEmployee: async (id: string): Promise<ApiResponse<EmployeeDetailResponse>> => {
    const response = await api.get(`/api/v1/employees/${id}`);
    return response.data;
  },

  // Kendi profilini getir
  getMyProfile: async (): Promise<ApiResponse<EmployeeDetailResponse>> => {
    const response = await api.get('/api/v1/employees/me');
    return response.data;
  },

  // Departmana göre çalışanları getir
  getEmployeesByDepartment: async (
    departmentId: string,
    page = 0,
    size = 10,
    sortBy = 'firstName',
    sortDirection = 'asc',
    filterRequest: EmployeeFilterRequest = {}
  ): Promise<ApiResponse<PaginatedResponse<EmployeeListItem>>> => {
    const params = {
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDirection,
      filterRequest
    };
    
    const response = await api.get(`/api/v1/employees/department/${departmentId}`, { params });
    return response.data;
  },

  // Yeni çalışan oluştur (register endpoint'ini kullanarak)
  createEmployee: async (employeeData: RegisterRequest): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/v1/auth/register', employeeData);
    return response.data;
  },

  // Çalışan güncelle
  updateEmployee: async (id: string, employeeData: EmployeeUpdateRequest): Promise<ApiResponse<Employee>> => {
    const response = await api.put(`/api/v1/employees/${id}`, employeeData);
    return response.data;
  }
};