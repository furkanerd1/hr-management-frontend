import React from 'react';
import CheckInOut from '../components/attendance/CheckInOut';

const CheckInCheckOutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Giriş/Çıkış Sistemi</h1>
        <p className="mt-2 text-gray-600">
          Çalışma saatlerinizi takip edin. Giriş ve çıkış işlemlerinizi buradan yapabilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Check In/Out Component */}
        <div className="lg:col-span-2">
          <CheckInOut />
        </div>

        {/* Information Panel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Kullanım Bilgileri</h3>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900">Giriş Yapmak İçin:</h4>
              <p>Mesai saatiniz başladığında "Giriş Yap" butonuna tıklayın.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Çıkış Yapmak İçin:</h4>
              <p>Mesai saatiniz bittiğinde "Çıkış Yap" butonuna tıklayın.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Çalışma Saatleri:</h4>
              <p>Giriş yaptıktan sonra çalışma süreniz otomatik olarak hesaplanır.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Durum Takibi:</h4>
              <p>Günlük attendance durumunuz gerçek zamanlı olarak güncellenir.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInCheckOutPage;