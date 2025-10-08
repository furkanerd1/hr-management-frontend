import React, { useState, useEffect } from 'react';
import { leaveService } from '../../services/leaveService';
import { EmployeeLeaveBalanceResponse } from '../../types';
import { Calendar, Clock } from 'lucide-react';

const LeaveBalance: React.FC = () => {
  const [balance, setBalance] = useState<EmployeeLeaveBalanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaveBalance();
  }, []);

  const loadLeaveBalance = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await leaveService.getMyLeaveBalance();
      if (response.success) {
        setBalance(response.data);
      } else {
        setError('İzin bakiyesi yüklenirken hata oluştu');
      }
    } catch (err: any) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">İzin Bakiyem</h3>
        </div>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">İzin Bakiyem</h3>
        </div>
        <div className="text-red-500 text-sm text-center py-4">
          {error}
        </div>
      </div>
    );
  }

  if (!balance) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">İzin Bakiyem</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800 font-medium">Yıllık İzin</span>
          </div>
          <span className="text-blue-900 font-bold text-lg">
            {balance.vacationBalance} gün
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-pink-600" />
            <span className="text-pink-800 font-medium">Doğum İzni</span>
          </div>
          <span className="text-pink-900 font-bold text-lg">
            {balance.maternityBalance} gün
          </span>
        </div>
        
        <div className="text-xs text-gray-500 text-center mt-4">
          Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
        </div>
      </div>
    </div>
  );
};

export default LeaveBalance;