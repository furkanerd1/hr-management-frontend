import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { employeeService } from '../services/employeeService';
import { departmentService } from '../services/departmentService';
import { positionService } from '../services/positionService';
import { EmployeeListItem, DepartmentListItem, PositionListItem } from '../types';
import { UserRole, EmployeeStatus } from '../constants';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  User
} from 'lucide-react';

const EmployeesList: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentListItem[]>([]);
  const [positions, setPositions] = useState<PositionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const pageSize = 10;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Load employees
  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        sortBy: 'firstName',
        sortDirection: 'asc' as const,
        ...(searchTerm && { searchTerm }),
        ...(selectedDepartment && { departmentId: selectedDepartment }),
        ...(selectedPosition && { positionId: selectedPosition }),
        ...(selectedStatus && { status: selectedStatus as 'ACTIVE' | 'INACTIVE' }),
        ...(selectedRole && { role: selectedRole as 'EMPLOYEE' | 'MANAGER' | 'HR' })
      };

      console.log('EmployeesList - Calling API with params:', params);
      const response = await employeeService.getAllEmployees(params);

      console.log('EmployeesList - API Response received:', response);
      console.log('EmployeesList - Response data:', response.data);
      console.log('EmployeesList - Employees array:', response.data?.data);
      console.log('EmployeesList - Employees count:', response.data?.data?.length);

      if (response.success && response.data) {
        console.log('EmployeesList - Setting employees to state:', response.data.data);
        setEmployees(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalEmployees(response.data.total);
      } else {
        setError(response.message || 'Çalışanlar yüklenirken hata oluştu');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Çalışanlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedDepartment, selectedPosition, selectedStatus, selectedRole]);

  // Load dropdown data
  const loadDropdownData = async () => {
    try {
      const [deptResponse, posResponse] = await Promise.all([
        departmentService.getDepartmentsForDropdown(),
        positionService.getPositionsForDropdown()
      ]);

      if (deptResponse.success && deptResponse.data) {
        setDepartments(deptResponse.data.data);
      }

      if (posResponse.success && posResponse.data) {
        setPositions(posResponse.data.data);
      }
    } catch (error) {
      console.error('Dropdown veriler yüklenirken hata:', error);
    }
  };

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    console.log('EmployeesList - useEffect triggered, calling loadEmployees');
    console.log('Current filters:', { searchTerm, selectedDepartment, selectedPosition, selectedStatus, selectedRole });
    loadEmployees();
  }, [loadEmployees, searchTerm, selectedDepartment, selectedPosition, selectedStatus, selectedRole]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    loadEmployees();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedPosition('');
    setSelectedStatus('');
    setSelectedRole('');
    setCurrentPage(0);
  };

  const getStatusBadge = (status: EmployeeStatus) => {
    const badgeClass = status === EmployeeStatus.ACTIVE 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
        {status === EmployeeStatus.ACTIVE ? 'Aktif' : 'Pasif'}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Çalışanlar</h1>
            <p className="text-sm text-gray-500">Toplam {totalEmployees} çalışan</p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0">
          {/* Sadece HR yeni çalışan ekleyebilir */}
          {user?.role === 'HR' && (
            <Link
              to="/employees/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Çalışan
            </Link>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-6">
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Çalışan ara..."
                  value={searchTerm}
                  onChange={(e) => {
                    console.log('Search input changed:', e.target.value);
                    setSearchTerm(e.target.value);
                  }}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtrele
            </button>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departman</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    console.log('Department changed:', e.target.value);
                    setSelectedDepartment(e.target.value);
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tüm Departmanlar</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pozisyon</label>
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tüm Pozisyonlar</option>
                  {positions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tüm Durumlar</option>
                  <option value={EmployeeStatus.ACTIVE}>Aktif</option>
                  <option value={EmployeeStatus.INACTIVE}>Pasif</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tüm Roller</option>
                  <option value={UserRole.HR}>İK</option>
                  <option value={UserRole.MANAGER}>Yönetici</option>
                  <option value={UserRole.EMPLOYEE}>Çalışan</option>
                </select>
              </div>

              <div className="lg:col-span-4">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Filtreleri Temizle
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Employees Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Çalışan bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">Arama kriterlerinizi değiştirmeyi deneyin.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Çalışan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      E-posta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departman
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pozisyon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.fullName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.departmentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.positionTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(employee.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          {/* Herkes kendi profilini ve HR/MANAGER diğerlerinin profilini görüntüleyebilir */}
                          {(user?.role === 'HR' || user?.role === 'MANAGER' || employee.id === user?.employeeId) && (
                            <Link
                              to={`/employees/${employee.id}/view`}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-colors"
                              title="Çalışan Detayları"
                            >
                              <Eye className="w-4 h-4 mr-1.5" />
                              Görüntüle
                            </Link>
                          )}
                          
                          {/* Sadece HR ve MANAGER diğer çalışanları düzenleyebilir, herkes kendi profilini düzenleyebilir */}
                          {(user?.role === 'HR' || user?.role === 'MANAGER' || employee.id === user?.employeeId) && (
                            <Link
                              to={employee.id === user?.employeeId ? `/profile` : `/employees/${employee.id}/edit`}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 rounded-md hover:bg-amber-100 hover:text-amber-700 transition-colors"
                              title="Düzenle"
                            >
                              <Edit className="w-4 h-4 mr-1.5" />
                              Düzenle
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Önceki
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sonraki
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{currentPage * pageSize + 1}</span>
                      {' '}-{' '}
                      <span className="font-medium">
                        {Math.min((currentPage + 1) * pageSize, totalEmployees)}
                      </span>
                      {' '}arası, toplam{' '}
                      <span className="font-medium">{totalEmployees}</span> sonuç
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNumber = currentPage <= 2 ? i : currentPage - 2 + i;
                        if (pageNumber >= totalPages) return null;
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNumber
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber + 1}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeesList;