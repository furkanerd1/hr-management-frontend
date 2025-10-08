import React, { useState, useEffect, useCallback } from 'react';
import { salaryService } from '../../services/salaryService';
import { SalaryListItem, SalaryFilterRequest } from '../../types';
import { DollarSign, TrendingUp, Calendar, Filter } from 'lucide-react';

const MySalaryHistory: React.FC = () => {
  const [salaries, setSalaries] = useState<SalaryListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10);
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SalaryFilterRequest>({
    searchTerm: ''
  });

  const loadMySalaryHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await salaryService.getMySalaryHistory({
        page: currentPage,
        size: pageSize,
        sortBy: 'effectiveDate',
        sortDirection: 'desc',
        filterRequest: filters
      });

      if (response.success) {
        setSalaries(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.total);
      } else {
        setError(response.message || 'Maaş geçmişi yüklenirken hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  useEffect(() => {
    loadMySalaryHistory();
  }, [loadMySalaryHistory]);

  const handleFilterChange = (key: keyof SalaryFilterRequest, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  const applyFilters = () => {
    setCurrentPage(0);
    setShowFilters(false);
    loadMySalaryHistory();
  };

  const clearFilters = () => {
    setFilters({ searchTerm: '' });
    setCurrentPage(0);
    loadMySalaryHistory();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const calculateGrowth = (current: number, previous?: number) => {
    if (!previous || previous === 0) return null;
    const growth = ((current - previous) / previous) * 100;
    return growth;
  };

  const currentSalary = salaries.length > 0 ? salaries[0] : null;
  const previousSalary = salaries.length > 1 ? salaries[1] : null;
  const salaryGrowth = currentSalary && previousSalary 
    ? calculateGrowth(currentSalary.totalSalary, previousSalary.totalSalary) 
    : null;

  return (
    <div className="p-6">
      {/* Başlık ve İstatistikler */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Maaş Geçmişim</h1>
            <p className="text-gray-600">Maaş ödemelerinizin detaylı geçmişi</p>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Güncel Maaş */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Güncel Maaş</p>
                <p className="text-2xl font-bold text-green-600">
                  {currentSalary ? formatCurrency(currentSalary.totalSalary) : '-'}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            {currentSalary && (
              <p className="text-xs text-gray-500 mt-2">
                Son güncelleme: {formatDate(currentSalary.effectiveDate)}
              </p>
            )}
          </div>

          {/* Maaş Artışı */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Son Artış</p>
                <p className={`text-2xl font-bold ${
                  salaryGrowth && salaryGrowth > 0 ? 'text-green-600' : 
                  salaryGrowth && salaryGrowth < 0 ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {salaryGrowth ? `%${salaryGrowth.toFixed(1)}` : '-'}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            {previousSalary && (
              <p className="text-xs text-gray-500 mt-2">
                Önceki: {formatCurrency(previousSalary.totalSalary)}
              </p>
            )}
          </div>

          {/* Toplam Kayıt */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Kayıt</p>
                <p className="text-2xl font-bold text-gray-800">{totalItems}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Maaş değişim kayıtları
            </p>
          </div>
        </div>

        {/* Filtreler */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Maaş Geçmişi</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtrele
          </button>
        </div>

        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlangıç Tarihi
                </label>
                <input
                  type="date"
                  value={filters.effectiveDateAfter || ''}
                  onChange={(e) => handleFilterChange('effectiveDateAfter', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  value={filters.effectiveDateBefore || ''}
                  onChange={(e) => handleFilterChange('effectiveDateBefore', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={applyFilters}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Filtrele
              </button>
              <button
                onClick={clearFilters}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Temizle
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Maaş geçmişi yükleniyor...</span>
        </div>
      )}

      {/* Salary History Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Geçerlilik Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Maaş
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toplam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Değişim
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salaries.length > 0 ? (
                salaries.map((salary, index) => {
                  const previousSalary = salaries[index + 1];
                  const growth = previousSalary ? calculateGrowth(salary.totalSalary, previousSalary.totalSalary) : null;
                  
                  return (
                    <tr key={salary.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(salary.effectiveDate)}
                        </div>
                        {index === 0 && (
                          <div className="text-xs text-green-600 font-medium">
                            Güncel
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(salary.salary)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(salary.bonus)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">
                          {formatCurrency(salary.totalSalary)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {growth !== null ? (
                          <div className={`text-sm font-medium ${
                            growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">-</div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Maaş geçmişi bulunamadı
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Önceki
                </button>
                <span className="relative inline-flex items-center px-4 py-2 text-sm text-gray-700">
                  Sayfa {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MySalaryHistory;