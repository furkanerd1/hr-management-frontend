import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Edit, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { departmentService } from '../services/departmentService';
import { DepartmentDetailResponse, EmployeeListItem, PaginatedResponse } from '../types';

const DepartmentEmployees: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [department, setDepartment] = useState<DepartmentDetailResponse | null>(null);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sayfalama durumları
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState('fullName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Departman bilgilerini yükle
  useEffect(() => {
    const loadDepartment = async () => {
      if (!id) return;

      try {
        const response = await departmentService.getDepartment(id);
        if (response.success) {
          setDepartment(response.data);
        } else {
          setError(response.message || 'Departman bilgileri yüklenirken hata oluştu');
        }
      } catch (err: any) {
        setError(err.message || 'Beklenmeyen bir hata oluştu');
      }
    };

    loadDepartment();
  }, [id]);

  // Departman çalışanlarını yükle
  const loadEmployees = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await departmentService.getDepartmentEmployees(id, {
        page: currentPage,
        size: pageSize,
        sortBy,
        sortDirection
      });

      if (response.success) {
        const paginatedData = response.data as PaginatedResponse<EmployeeListItem>;
        setEmployees(paginatedData.data || []);
        setTotalPages(paginatedData.totalPages || 0);
        setTotalElements(paginatedData.total || 0);
      } else {
        setError(response.message || 'Çalışanlar yüklenirken hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [id, currentPage, pageSize, sortBy, sortDirection]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
    setCurrentPage(0);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return '⇅';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getStatusBadge = (status: string) => {
    return status === 'ACTIVE' ? (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
        Aktif
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
        Pasif
      </span>
    );
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={() => navigate('/departments')}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          ← Departmanlara Dön
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => navigate('/departments')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-2 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Departmanlara Dön
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {department?.name || 'Departman'} Çalışanları
          </h1>
          <p className="text-gray-600">Departmanda çalışan personel listesi</p>
        </div>
        
        <div>
          {department && (
            <button
              onClick={() => navigate(`/departments/${id}/view`)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              Departman Detayları
            </button>
          )}
        </div>
      </div>

      {/* Yükleme Durumu */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Çalışanlar yükleniyor...</p>
        </div>
      ) : (
        <>
          {/* Sonuç Bilgisi */}
          <div className="mb-4 text-sm text-gray-600">
            Toplam {totalElements} çalışan bulundu (Sayfa {currentPage + 1}/{totalPages || 1})
          </div>

          {/* Çalışanlar Tablosu */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('fullName')}
                  >
                    Ad Soyad {getSortIcon('fullName')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('email')}
                  >
                    E-posta {getSortIcon('email')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefon
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('positionTitle')}
                  >
                    Pozisyon {getSortIcon('positionTitle')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    Durum {getSortIcon('status')}
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
                      <div className="font-medium text-gray-900">{employee.fullName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600">{employee.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600">{employee.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600">{employee.positionTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(employee.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        {/* Sadece HR, MANAGER veya kendi bilgilerini görüntüleyebilir */}
                        {(user?.role === 'HR' || user?.role === 'MANAGER' || employee.id === user?.employeeId) && (
                          <button
                            onClick={() => navigate(`/employees/${employee.id}/view`)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-colors"
                            title="Çalışan Detayları"
                          >
                            <Eye className="w-4 h-4 mr-1.5" />
                            Görüntüle
                          </button>
                        )}
                        {/* Sadece HR ve MANAGER düzenleyebilir */}
                        {(user?.role === 'HR' || user?.role === 'MANAGER') && (
                          <button
                            onClick={() => navigate(`/employees/${employee.id}/edit`)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 rounded-md hover:bg-amber-100 hover:text-amber-700 transition-colors"
                            title="Çalışanı Düzenle"
                          >
                            <Edit className="w-4 h-4 mr-1.5" />
                            Düzenle
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Bu departmanda çalışan bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center space-x-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium"
              >
                Önceki
              </button>
              
              <span className="text-sm text-gray-600 font-medium">
                Sayfa {currentPage + 1} / {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium"
              >
                Sonraki
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DepartmentEmployees;