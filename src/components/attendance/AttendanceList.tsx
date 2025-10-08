import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { AttendanceListItem, PaginatedResponse } from '../../types';
import { 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  Building,
  CheckCircle,
  XCircle,
  Clock3
} from 'lucide-react';

const AttendanceList: React.FC = () => {
  const { user } = useAuth();
  const [attendances, setAttendances] = useState<AttendanceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginatedResponse<AttendanceListItem> | null>(null);
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const canManageAttendance = user?.role === 'HR' || user?.role === 'MANAGER';

  const loadAttendances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filterRequest: any = {};
      if (searchTerm) filterRequest.searchTerm = searchTerm;
      if (startDate) filterRequest.startDate = startDate;
      if (endDate) filterRequest.endDate = endDate;

      const response = await attendanceService.getAllAttendances({
        page,
        size,
        sortBy: 'date',
        sortDirection: 'desc',
        filterRequest
      });

      if (response.success) {
        setAttendances(response.data.data);
        setPagination(response.data);
      } else {
        setError('Devamsızlık kayıtları yüklenirken hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [page, size, searchTerm, startDate, endDate]);

  useEffect(() => {
    if (canManageAttendance) {
      loadAttendances();
    } else {
      setError('Bu sayfaya erişim izniniz yok');
      setLoading(false);
    }
  }, [loadAttendances, canManageAttendance]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadAttendances();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu devamsızlık kaydını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await attendanceService.deleteAttendance(id);
      loadAttendances();
    } catch (err: any) {
      setError(err.message || 'Kayıt silinirken hata oluştu');
    }
  };

  const getStatusColor = (checkInTime?: string, checkOutTime?: string) => {
    if (!checkInTime) return 'text-gray-500';
    if (!checkOutTime) return 'text-blue-600';
    return 'text-green-600';
  };

  const getStatusIcon = (checkInTime?: string, checkOutTime?: string) => {
    if (!checkInTime) return <XCircle className="w-4 h-4" />;
    if (!checkOutTime) return <Clock3 className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusText = (checkInTime?: string, checkOutTime?: string) => {
    if (!checkInTime) return 'Gelmedi';
    if (!checkOutTime) return 'Çalışıyor';
    return 'Tamamlandı';
  };

  if (!canManageAttendance) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Bu sayfaya erişim izniniz yok. Sadece HR ve Yöneticiler devamsızlık kayıtlarını görüntüleyebilir.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Devamsızlık Yönetimi</h1>
            <p className="text-gray-600">Çalışan devamsızlık kayıtlarını görüntüleyin ve yönetin</p>
          </div>
        </div>
        <Link
          to="/attendance/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Yeni Kayıt
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arama
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Çalışan adı, email..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-end">
              <div className="flex gap-2 w-full">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2 flex-1"
                >
                  <Filter className="w-4 h-4" />
                  Filtrele
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors flex-1"
                >
                  Temizle
                </button>
              </div>
            </div>
          </div>
        </form>
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Yükleniyor...</span>
        </div>
      )}

      {/* Attendance List */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {attendances.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Devamsızlık kaydı bulunamadı
              </h3>
              <p className="text-gray-600">
                Kriterlere uygun devamsızlık kaydı bulunmuyor
              </p>
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
                        Tarih
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giriş
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Çıkış
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Çalışma Süresi
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendances.map((attendance) => (
                      <tr key={attendance.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="w-8 h-8 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {attendance.employeeFullName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {attendance.email}
                              </div>
                              <div className="flex items-center text-xs text-gray-400 mt-1">
                                <Building className="w-3 h-3 mr-1" />
                                {attendance.departmentName} - {attendance.positionName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {new Date(attendance.date).toLocaleDateString('tr-TR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attendance.checkInTime 
                            ? attendanceService.formatTime(attendance.checkInTime)
                            : '-'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attendance.checkOutTime 
                            ? attendanceService.formatTime(attendance.checkOutTime)
                            : '-'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${getStatusColor(attendance.checkInTime, attendance.checkOutTime)}`}>
                            {getStatusIcon(attendance.checkInTime, attendance.checkOutTime)}
                            <span className="ml-2 text-sm">
                              {getStatusText(attendance.checkInTime, attendance.checkOutTime)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attendanceService.calculateWorkHours(attendance.checkInTime, attendance.checkOutTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Link
                              to={`/attendance/${attendance.id}`}
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/attendance/${attendance.id}/edit`}
                              className="text-green-600 hover:text-green-800 inline-flex items-center"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(attendance.id)}
                              className="text-red-600 hover:text-red-800 inline-flex items-center"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 0}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Önceki
                      </button>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page >= pagination.totalPages - 1}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sonraki
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">{pagination.total}</span> sonuçtan{' '}
                          <span className="font-medium">{page * size + 1}</span> -{' '}
                          <span className="font-medium">
                            {Math.min((page + 1) * size, pagination.total)}
                          </span>{' '}
                          arası gösteriliyor
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 0}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Önceki
                          </button>
                          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            const pageNum = Math.max(0, Math.min(pagination.totalPages - 5, page - 2)) + i;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setPage(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  pageNum === page
                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum + 1}
                              </button>
                            );
                          })}
                          <button
                            onClick={() => setPage(page + 1)}
                            disabled={page >= pagination.totalPages - 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Sonraki
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceList;