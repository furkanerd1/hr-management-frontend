import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Users, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { departmentService } from '../services/departmentService';
import { DepartmentListItem, DepartmentFilterRequest, PaginatedResponse } from '../types';

const DepartmentsList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [departments, setDepartments] = useState<DepartmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sayfalama ve filtreleme durumları
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Arama ve filtreleme
  const [searchTerm, setSearchTerm] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filterRequest: DepartmentFilterRequest = {};
      if (searchTerm) filterRequest.searchTerm = searchTerm;
      if (nameFilter) filterRequest.name = nameFilter;

      const response = await departmentService.getAllDepartments({
        page: currentPage,
        size: pageSize,
        sortBy,
        sortDirection,
        filterRequest
      });

      if (response.success) {
        const paginatedData = response.data as PaginatedResponse<DepartmentListItem>;
        setDepartments(paginatedData.data || []);
        setTotalPages(paginatedData.totalPages || 0);
        setTotalElements(paginatedData.total || 0);
      } else {
        setError(response.message || 'Departmanlar yüklenirken hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, nameFilter, sortBy, sortDirection]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    // State değişimi useCallback dependency'i tetikleyecek
    // Eğer aynı değerler tekrar set edilirse, loadDepartments tetiklenmez
    // Bu yüzden manuel trigger edelim
    loadDepartments();
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
    setCurrentPage(0);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setNameFilter('');
    setSortBy('name');
    setSortDirection('asc');
    setCurrentPage(0);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return '⇅';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" departmanını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    try {
      const response = await departmentService.deleteDepartment(id);
      if (response.success) {
        alert('Departman başarıyla silindi');
        loadDepartments();
      } else {
        alert('Departman silinirken hata oluştu: ' + response.message);
      }
    } catch (error: any) {
      alert('Departman silinirken hata oluştu: ' + error.message);
    }
  };

  return (
    <div className="p-6">
      {/* Başlık ve Yeni Departman Butonu */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Departman Yönetimi</h1>
        {(user?.role === 'HR') && (
          <button
            onClick={() => navigate('/departments/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Yeni Departman Ekle
          </button>
        )}
      </div>

      {/* Arama ve Filtreleme */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Genel Arama
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Departman ara..."
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departman Adı
              </label>
              <input
                type="text"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="Departman adı..."
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Ara
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors font-medium"
              >
                Temizle
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Yükleme Durumu */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Departmanlar yükleniyor...</p>
        </div>
      ) : (
        <>
          {/* Sonuç Bilgisi */}
          <div className="mb-4 text-sm text-gray-600">
            Toplam {totalElements} departman bulundu (Sayfa {currentPage + 1}/{totalPages})
          </div>

          {/* Departmanlar Tablosu */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    Departman Adı {getSortIcon('name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departments.map((department) => (
                  <tr key={department.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{department.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => navigate(`/departments/${department.id}/view`)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-colors"
                          title="Departman Detayları"
                        >
                          <Eye className="w-4 h-4 mr-1.5" />
                          Görüntüle
                        </button>
                        <button
                          onClick={() => navigate(`/departments/${department.id}/employees`)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 hover:text-green-700 transition-colors"
                          title="Departman Çalışanları"
                        >
                          <Users className="w-4 h-4 mr-1.5" />
                          Çalışanlar
                        </button>
                        {(user?.role === 'HR') && (
                          <>
                            <button
                              onClick={() => navigate(`/departments/${department.id}/edit`)}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 rounded-md hover:bg-amber-100 hover:text-amber-700 transition-colors"
                              title="Departman Düzenle"
                            >
                              <Edit className="w-4 h-4 mr-1.5" />
                              Düzenle
                            </button>
                            <button
                              onClick={() => handleDelete(department.id, department.name)}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 hover:text-red-700 transition-colors"
                              title="Departman Sil"
                            >
                              <Trash2 className="w-4 h-4 mr-1.5" />
                              Sil
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {departments.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                      Departman bulunamadı
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

export default DepartmentsList;