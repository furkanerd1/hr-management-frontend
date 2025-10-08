import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { leaveService } from '../../services/leaveService';
import { PaginatedResponse, LeaveRequestListItem, LeaveRequestFilterRequest } from '../../types';
import { LeaveType, LeaveStatus } from '../../constants';
import { Eye, Plus, Calendar, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';

const LeavesList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequestListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Sayfalama
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);

  // Arama ve filtreleme
  const [searchTerm, setSearchTerm] = useState('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<LeaveType | ''>('');
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | ''>('');
  const [startDateAfter, setStartDateAfter] = useState('');
  const [startDateBefore, setStartDateBefore] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const isHROrManager = user?.role === 'HR' || user?.role === 'MANAGER';

  const loadLeaves = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filterRequest: LeaveRequestFilterRequest = {};
      if (searchTerm) filterRequest.searchTerm = searchTerm;
      if (leaveTypeFilter) filterRequest.leaveType = leaveTypeFilter;
      if (statusFilter) filterRequest.status = statusFilter;
      if (startDateAfter) filterRequest.startDateAfter = startDateAfter;
      if (startDateBefore) filterRequest.startDateBefore = startDateBefore;

      let response;
      if (isHROrManager) {
        // HR ve Manager tüm izin taleplerini görebilir
        response = await leaveService.getAllLeaveRequests({
          page: currentPage,
          size: pageSize,
          sortBy,
          sortDirection,
          filterRequest
        });
      } else {
        // Normal çalışan sadece kendi taleplerini görebilir
        response = await leaveService.getMyLeaveRequests({
          page: currentPage,
          size: pageSize,
          sortBy,
          sortDirection,
          filterRequest
        });
      }

      if (response.success) {
        const paginatedData = response.data as PaginatedResponse<LeaveRequestListItem>;
        setLeaves(paginatedData.data || []);
        setTotalPages(paginatedData.totalPages || 0);
        setTotalElements(paginatedData.total || 0);
      } else {
        setError(response.message || 'İzin talepleri yüklenirken hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, leaveTypeFilter, statusFilter, startDateAfter, startDateBefore, sortBy, sortDirection, isHROrManager]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    loadLeaves();
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
    setLeaveTypeFilter('');
    setStatusFilter('');
    setStartDateAfter('');
    setStartDateBefore('');
    setSortBy('createdAt');
    setSortDirection('desc');
    setCurrentPage(0);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return '⇅';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getLeaveTypeLabel = (type: LeaveType): string => {
    const labels: Record<LeaveType, string> = {
      'VACATION': 'Yıllık İzin',
      'SICK': 'Hastalık İzni',
      'UNPAID': 'Ücretsiz İzin',
      'MATERNITY': 'Doğum İzni'
    };
    return labels[type];
  };

  const getStatusLabel = (status: LeaveStatus): string => {
    const labels: Record<LeaveStatus, string> = {
      'PENDING': 'Bekliyor',
      'APPROVED': 'Onaylandı',
      'REJECTED': 'Reddedildi'
    };
    return labels[status];
  };

  const getStatusColor = (status: LeaveStatus): string => {
    const colors: Record<LeaveStatus, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getStatusIcon = (status: LeaveStatus) => {
    const icons: Record<LeaveStatus, React.ReactNode> = {
      'PENDING': <Clock className="w-4 h-4" />,
      'APPROVED': <CheckCircle className="w-4 h-4" />,
      'REJECTED': <XCircle className="w-4 h-4" />
    };
    return icons[status];
  };

  return (
    <div className="p-6">
      {/* Başlık ve Yeni İzin Talebi Butonu */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isHROrManager ? 'İzin Talepleri Yönetimi' : 'İzin Taleplerim'}
        </h1>
        <button
          onClick={() => navigate('/leaves/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Yeni İzin Talebi
        </button>
      </div>

      {/* Arama ve Filtreleme Formu */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {isHROrManager && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Genel Arama
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Çalışan adı ara..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İzin Türü
              </label>
              <select
                value={leaveTypeFilter}
                onChange={(e) => setLeaveTypeFilter(e.target.value as LeaveType | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tüm Türler</option>
                <option value="VACATION">Yıllık İzin</option>
                <option value="SICK">Hastalık İzni</option>
                <option value="UNPAID">Ücretsiz İzin</option>
                <option value="MATERNITY">Doğum İzni</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as LeaveStatus | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tüm Durumlar</option>
                <option value="PENDING">Bekliyor</option>
                <option value="APPROVED">Onaylandı</option>
                <option value="REJECTED">Reddedildi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Başlangıç Tarihi (Sonra)
              </label>
              <input
                type="date"
                value={startDateAfter}
                onChange={(e) => setStartDateAfter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Başlangıç Tarihi (Önce)
              </label>
              <input
                type="date"
                value={startDateBefore}
                onChange={(e) => setStartDateBefore(e.target.value)}
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

      {/* İzin Talepleri Tablosu */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2">İzin talepleri yükleniyor...</p>
          </div>
        ) : leaves.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>İzin talebi bulunamadı</p>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {isHROrManager && (
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('employeeFullName')}
                    >
                      <div className="flex items-center">
                        Çalışan {getSortIcon('employeeFullName')}
                      </div>
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İzin Türü
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('startDate')}
                  >
                    <div className="flex items-center">
                      Tarih Aralığı {getSortIcon('startDate')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gün Sayısı
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
                {leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50">
                    {isHROrManager && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{leave.employeeFullName}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{getLeaveTypeLabel(leave.leaveType)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">
                        {new Date(leave.startDate).toLocaleDateString('tr-TR')} - {new Date(leave.endDate).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{leave.totalDays} gün</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                        {getStatusIcon(leave.status)}
                        {getStatusLabel(leave.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => navigate(`/leaves/${leave.id}`)}
                        className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-200 transition-colors inline-flex items-center gap-1.5"
                        title="Detayları Görüntüle"
                      >
                        <Eye className="w-4 h-4" />
                        Detay
                      </button>
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
                    <span className="font-medium">{totalElements}</span> talepten{' '}
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

export default LeavesList;