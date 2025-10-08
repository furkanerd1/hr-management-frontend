import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { AttendanceDetailResponse } from '../../types';
import { ArrowLeft, Clock, User, Calendar, Building, Briefcase, Edit, Trash2 } from 'lucide-react';

const AttendanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canManageAttendance = user?.role === 'HR' || user?.role === 'MANAGER';

  const loadAttendance = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Debug: Check token
      const token = localStorage.getItem('token');
      console.log('AttendanceDetail - Token exists:', !!token);
      console.log('AttendanceDetail - User:', user);
      
      if (!token) {
        setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        navigate('/login');
        return;
      }

      const response = await attendanceService.getAttendance(id);

      if (response.success) {
        setAttendance(response.data);
      } else {
        setError('Devamsızlık kaydı yüklenirken hata oluştu');
      }
    } catch (error: any) {
      console.error('Error loading attendance:', error);
      
      if (error.response?.status === 401) {
        setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        navigate('/login');
      } else {
        setError('Devamsızlık kaydı yüklenirken hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  }, [id, user, navigate]);

  useEffect(() => {
    if (id) {
      loadAttendance();
    }
  }, [id, loadAttendance]);

  const handleDelete = async () => {
    if (!id || !attendance) return;

    try {
      setDeleteLoading(true);
      const response = await attendanceService.deleteAttendance(id);

      if (response.success) {
        navigate('/attendance');
      } else {
        setError('Devamsızlık kaydı silinirken hata oluştu');
      }
    } catch (error: any) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateWorkingHours = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return '-';
    
    const checkInTime = new Date(`2000-01-01T${checkIn}`);
    const checkOutTime = new Date(`2000-01-01T${checkOut}`);
    
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    const hours = Math.floor(diffHours);
    const minutes = Math.round((diffHours - hours) * 60);
    
    return `${hours} saat ${minutes} dakika`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !attendance) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/attendance')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Devamsızlık Detayı</h1>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error || 'Devamsızlık kaydı bulunamadı'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/attendance')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Devamsızlık Detayı</h1>
              <p className="text-gray-600">{attendance.employeeFullName}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {canManageAttendance && (
            <>
              <button
                onClick={() => navigate(`/attendance/${id}/edit`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Düzenle</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Sil</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Attendance Details */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Devamsızlık Bilgileri</h3>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Çalışan</span>
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{attendance.employeeFullName}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Tarih</span>
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(attendance.date).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Giriş Saati</span>
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{formatTime(attendance.checkInTime)}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Çıkış Saati</span>
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{formatTime(attendance.checkOutTime || '')}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Toplam Çalışma Süresi</span>
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {calculateWorkingHours(attendance.checkInTime, attendance.checkOutTime || '')}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span>Departman</span>
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{attendance.departmentName}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                <Briefcase className="h-4 w-4" />
                <span>Pozisyon</span>
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{attendance.positionName}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{attendance.email}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <Trash2 className="mx-auto h-12 w-12 text-red-600" />
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                Devamsızlık Kaydını Sil
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Bu devamsızlık kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex justify-center space-x-3 mt-6">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50"
                >
                  {deleteLoading ? 'Siliniyor...' : 'Sil'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceDetail;