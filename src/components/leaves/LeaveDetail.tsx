import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { leaveService } from '../../services/leaveService';
import { LeaveRequestDetailResponse } from '../../types';
import { LeaveType, LeaveStatus } from '../../constants';
import { ArrowLeft, Edit, CheckCircle, XCircle, Trash2, Clock, Calendar } from 'lucide-react';

const LeaveDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leave, setLeave] = useState<LeaveRequestDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isHROrManager = user?.role === 'HR' || user?.role === 'MANAGER';
  const canApprove = isHROrManager && leave?.status === 'PENDING';
  const canEdit = leave?.employeeId === user?.employeeId && leave?.status === 'PENDING';
  const canCancel = leave?.employeeId === user?.employeeId && leave?.status === 'PENDING';

  const loadLeave = useCallback(async (leaveId: string) => {
    try {
      setLoading(true);
      setError(null);

      if (user?.role === 'EMPLOYEE') {
        // Employee için - listeden ID'ye göre filtrele
        const response = await leaveService.getMyLeaveRequests({
          page: 0,
          size: 100, // Çok sayıda kayıt getir ki istediğimiz kaydı bulalım
          sortBy: 'createdAt',
          sortDirection: 'desc',
          filterRequest: { searchTerm: '' }
        });

        if (response.success && response.data.data) {
          const foundLeave = response.data.data.find((leave) => leave.id === leaveId);
          if (foundLeave) {
            // Liste response'unu detail format'ına çevir
            const detailData: any = {
              id: foundLeave.id,
              employeeId: foundLeave.employeeId,
              employeeFullName: foundLeave.employeeFullName,
              email: user?.email || '',
              departmentName: '',
              positionName: '',
              leaveType: foundLeave.leaveType,
              startDate: foundLeave.startDate,
              endDate: foundLeave.endDate,
              totalDays: foundLeave.totalDays,
              reason: '',
              status: foundLeave.status,
              approverName: '',
              approvedAt: null,
              createdAt: new Date().toISOString()
            };
            setLeave(detailData);
          } else {
            setError('İzin talebi bulunamadı veya bu talebe erişim yetkiniz bulunmuyor.');
          }
        } else {
          setError(response.message || 'İzin talepleri yüklenirken hata oluştu');
        }
      } else {
        // HR/Manager için normal endpoint
        const response = await leaveService.getLeaveRequest(leaveId);
        if (response.success) {
          setLeave(response.data);
        } else {
          setError(response.message || 'İzin talebi bilgileri yüklenirken hata oluştu');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [user?.role, user?.email]);

  useEffect(() => {
    if (id) {
      loadLeave(id);
    }
  }, [id, loadLeave]);

  const handleApprove = async () => {
    if (!leave || !id) return;

    if (!window.confirm('Bu izin talebini onaylamak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await leaveService.approveLeaveRequest(id);
      if (response.success) {
        alert('İzin talebi başarıyla onaylandı');
        loadLeave(id);
      } else {
        alert('İzin talebi onaylanırken hata oluştu: ' + response.message);
      }
    } catch (error: any) {
      alert('İzin talebi onaylanırken hata oluştu: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!leave || !id) return;

    if (!window.confirm('Bu izin talebini reddetmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await leaveService.rejectLeaveRequest(id);
      if (response.success) {
        alert('İzin talebi başarıyla reddedildi');
        loadLeave(id);
      } else {
        alert('İzin talebi reddedilirken hata oluştu: ' + response.message);
      }
    } catch (error: any) {
      alert('İzin talebi reddedilirken hata oluştu: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!leave || !id) return;

    if (!window.confirm('Bu izin talebini iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await leaveService.cancelLeaveRequest(id);
      if (response.success) {
        alert('İzin talebi başarıyla iptal edildi');
        navigate('/leaves');
      } else {
        alert('İzin talebi iptal edilirken hata oluştu: ' + response.message);
      }
    } catch (error: any) {
      alert('İzin talebi iptal edilirken hata oluştu: ' + error.message);
    } finally {
      setActionLoading(false);
    }
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
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'APPROVED': 'bg-green-100 text-green-800 border-green-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status];
  };

  const getStatusIcon = (status: LeaveStatus) => {
    const icons: Record<LeaveStatus, React.ReactNode> = {
      'PENDING': <Clock className="w-5 h-5" />,
      'APPROVED': <CheckCircle className="w-5 h-5" />,
      'REJECTED': <XCircle className="w-5 h-5" />
    };
    return icons[status];
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">İzin talebi bilgileri yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!leave) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          İzin talebi bulunamadı
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Başlık ve İşlem Butonları */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/leaves')}
            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </button>
          <h1 className="text-2xl font-bold text-gray-800">İzin Talebi Detayı</h1>
        </div>
        
        <div className="flex gap-2">
          {canEdit && (
            <button
              onClick={() => navigate(`/leaves/${id}/edit`)}
              className="bg-amber-100 text-amber-700 px-4 py-2 rounded-md hover:bg-amber-200 transition-colors inline-flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Düzenle
            </button>
          )}
          
          {canApprove && (
            <>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="bg-green-100 text-green-700 px-4 py-2 rounded-md hover:bg-green-200 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Onayla
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Reddet
              </button>
            </>
          )}
          
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              İptal Et
            </button>
          )}
        </div>
      </div>

      {/* İzin Talebi Bilgileri */}
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        {/* Durum Kartı */}
        <div className={`border-2 rounded-lg p-4 ${getStatusColor(leave.status)}`}>
          <div className="flex items-center gap-3">
            {getStatusIcon(leave.status)}
            <div>
              <h3 className="font-semibold text-lg">
                {getStatusLabel(leave.status)}
              </h3>
              {leave.status === 'APPROVED' && leave.approverName && leave.approvedAt && (
                <p className="text-sm opacity-75">
                  {leave.approverName} tarafından {new Date(leave.approvedAt).toLocaleString('tr-TR')} tarihinde onaylandı
                </p>
              )}
              {leave.status === 'REJECTED' && leave.approverName && leave.approvedAt && (
                <p className="text-sm opacity-75">
                  {leave.approverName} tarafından {new Date(leave.approvedAt).toLocaleString('tr-TR')} tarihinde reddedildi
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Çalışan Bilgileri */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Çalışan Bilgileri
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Çalışan Adı</label>
                <p className="text-gray-900 font-medium">{leave.employeeFullName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">E-posta</label>
                <p className="text-gray-900">{leave.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Departman</label>
                <p className="text-gray-900">{leave.departmentName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Pozisyon</label>
                <p className="text-gray-900">{leave.positionName}</p>
              </div>
            </div>
          </div>

          {/* İzin Detayları */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              İzin Detayları
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">İzin Türü</label>
                <p className="text-gray-900 font-medium">{getLeaveTypeLabel(leave.leaveType)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Başlangıç Tarihi</label>
                <p className="text-gray-900">{new Date(leave.startDate).toLocaleDateString('tr-TR')}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Bitiş Tarihi</label>
                <p className="text-gray-900">{new Date(leave.endDate).toLocaleDateString('tr-TR')}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Toplam Gün Sayısı</label>
                <p className="text-gray-900 font-medium text-lg">{leave.totalDays} gün</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Talep Tarihi</label>
                <p className="text-gray-900">{new Date(leave.createdAt).toLocaleString('tr-TR')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Açıklama */}
        {leave.reason && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Açıklama</h3>
            <div className="bg-gray-50 border rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-wrap">{leave.reason}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveDetail;