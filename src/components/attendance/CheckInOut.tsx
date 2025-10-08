import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, Calendar, Timer, AlertCircle } from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { AttendanceDetailResponse } from '../../types';

const CheckInOut: React.FC = () => {
  const [todayAttendance, setTodayAttendance] = useState<AttendanceDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadTodayAttendance();
  }, []);

  const loadTodayAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await attendanceService.getTodayAttendanceStatus();
      
      if (response.success) {
        setTodayAttendance(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Günlük yoklama durumu yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      const response = await attendanceService.checkIn();
      
      if (response.success) {
        setTodayAttendance(response.data);
      } else {
        setError('Giriş kaydedilirken hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Giriş kaydedilirken hata oluştu');
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      const response = await attendanceService.checkOut();
      
      if (response.success) {
        setTodayAttendance(response.data);
      } else {
        setError('Çıkış kaydedilirken hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Çıkış kaydedilirken hata oluştu');
    } finally {
      setProcessing(false);
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '--:--';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateWorkingTime = () => {
    if (!todayAttendance?.checkInTime) return '--:--';
    
    const checkInTime = new Date(`2000-01-01T${todayAttendance.checkInTime}`);
    const currentTimeToday = new Date();
    const currentTimeForCalc = new Date(`2000-01-01T${currentTimeToday.toTimeString().split(' ')[0]}`);
    
    const diffMs = currentTimeForCalc.getTime() - checkInTime.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getWorkStatus = () => {
    if (!todayAttendance) return 'not_started';
    if (!todayAttendance.checkInTime) return 'not_started';
    if (!todayAttendance.checkOutTime) return 'working';
    return 'completed';
  };

  const workStatus = getWorkStatus();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Yoklama Sistemi
        </h3>
        <div className="text-sm text-gray-500">
          {currentTime.toLocaleDateString('tr-TR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Current Time */}
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {currentTime.toLocaleTimeString('tr-TR')}
        </div>
        <div className="text-sm text-gray-500">Şu anki saat</div>
      </div>

      {/* Work Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Giriş Saati</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatTime(todayAttendance?.checkInTime)}
          </div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Çıkış Saati</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatTime(todayAttendance?.checkOutTime)}
          </div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">
            {workStatus === 'working' ? 'Çalışma Süresi' : 'Toplam Süre'}
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {workStatus === 'working' ? calculateWorkingTime() : 
             workStatus === 'completed' ? attendanceService.calculateWorkHours(todayAttendance?.checkInTime, todayAttendance?.checkOutTime) : '--:--'}
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex justify-center mb-6">
        {workStatus === 'not_started' && (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
            <Calendar className="h-4 w-4" />
            Henüz işe giriş yapmadınız
          </span>
        )}
        {workStatus === 'working' && (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
            <Timer className="h-4 w-4" />
            Çalışıyorsunuz
          </span>
        )}
        {workStatus === 'completed' && (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
            <Clock className="h-4 w-4" />
            Günlük çalışma tamamlandı
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        {workStatus === 'not_started' && (
          <button
            onClick={handleCheckIn}
            disabled={processing}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <LogIn className="h-5 w-5" />
            {processing ? 'İşleniyor...' : 'İşe Giriş Yap'}
          </button>
        )}
        
        {workStatus === 'working' && (
          <button
            onClick={handleCheckOut}
            disabled={processing}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {processing ? 'İşleniyor...' : 'İşten Çıkış Yap'}
          </button>
        )}

        {workStatus === 'completed' && (
          <div className="text-center text-gray-500">
            <p className="text-sm">Bugünlük çalışma saatiniz tamamlandı.</p>
            <p className="text-xs mt-1">Güzel bir gün geçirdiniz! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInOut;