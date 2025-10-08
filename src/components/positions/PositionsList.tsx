import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { positionService } from '../../services/positionService';
import { PaginatedResponse, PositionListItem, PositionFilterRequest } from '../../types';
import { Eye, Edit, Trash2, FileText } from 'lucide-react';

const PositionsList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [positions, setPositions] = useState<PositionListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Sayfalama
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);

  // Arama ve filtreleme
  const [searchTerm, setSearchTerm] = useState('');
  const [titleFilter, setTitleFilter] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const loadPositions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filterRequest: PositionFilterRequest = {};
      if (searchTerm) filterRequest.searchTerm = searchTerm;
      if (titleFilter) filterRequest.title = titleFilter;

      const response = await positionService.getAllPositions({
        page: currentPage,
        size: pageSize,
        sortBy,
        sortDirection,
        filterRequest
      });

      if (response.success) {
        const paginatedData = response.data as PaginatedResponse<PositionListItem>;
        setPositions(paginatedData.data || []);
        setTotalPages(paginatedData.totalPages || 0);
        setTotalElements(paginatedData.total || 0);
      } else {
        setError(response.message || 'Pozisyonlar yüklenirken hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, titleFilter, sortBy, sortDirection]);

  useEffect(() => {
    loadPositions();
  }, [loadPositions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    // State değişimi useCallback dependency'i tetikleyecek
    // Eğer aynı değerler tekrar set edilirse, loadPositions tetiklenmez
    // Bu yüzden manuel trigger edelim
    loadPositions();
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
    setTitleFilter('');
    setSortBy('title');
    setSortDirection('asc');
    setCurrentPage(0);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return '⇅';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`"${title}" pozisyonunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    try {
      const response = await positionService.deletePosition(id);
      if (response.success) {
        alert('Pozisyon başarıyla silindi');
        loadPositions();
      } else {
        alert('Pozisyon silinirken hata oluştu: ' + response.message);
      }
    } catch (error: any) {
      alert('Pozisyon silinirken hata oluştu: ' + error.message);
    }
  };

  return (
    <div className="p-6">
      {/* Başlık ve Yeni Pozisyon Butonu */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pozisyon Yönetimi</h1>
        {(user?.role === 'HR') && (
          <button
            onClick={() => navigate('/positions/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Yeni Pozisyon Ekle
          </button>
        )}
      </div>

      {/* Arama ve Filtreleme Formu */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
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
                placeholder="Pozisyon adı ara..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pozisyon Adı
              </label>
              <input
                type="text"
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
                placeholder="Pozisyon adı filtrele..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Ara
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Temizle
            </button>
          </div>
        </form>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Pozisyon Tablosu */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2">Pozisyonlar yükleniyor...</p>
          </div>
        ) : positions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Pozisyon bulunamadı</p>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      Pozisyon Adı {getSortIcon('title')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {positions.map((position) => (
                  <tr key={position.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{position.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => navigate(`/positions/${position.id}`)}
                        className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-200 transition-colors inline-flex items-center gap-1.5"
                        title="Detayları Görüntüle"
                      >
                        <Eye className="w-4 h-4" />
                        Görüntüle
                      </button>
                      
                      {user?.role === 'HR' && (
                        <>
                          <button
                            onClick={() => navigate(`/positions/${position.id}/edit`)}
                            className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-md hover:bg-amber-200 transition-colors inline-flex items-center gap-1.5"
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDelete(position.id, position.title)}
                            className="bg-red-100 text-red-700 px-3 py-1.5 rounded-md hover:bg-red-200 transition-colors inline-flex items-center gap-1.5"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                            Sil
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Sayfalama */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{totalElements}</span> pozisyondan{' '}
                    <span className="font-medium">{currentPage * pageSize + 1}</span> -{' '}
                    <span className="font-medium">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> arası gösteriliyor
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Önceki
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = currentPage < 3 ? i : currentPage - 2 + i;
                      if (page >= totalPages) return null;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page + 1}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sonraki
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PositionsList;