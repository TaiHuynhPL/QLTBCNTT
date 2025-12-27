import React, { useState } from 'react';
import { AlertTriangle, Package, ArrowUpRight } from 'lucide-react';

const Consumables = () => {
  // Dữ liệu giả lập từ bảng ConsumableStock và ConsumableModels
  const [stocks] = useState([
    { id: 1, name: 'Hộp mực HP 12A', quantity: 2, min_qty: 5, location: 'Kho A' },
    { id: 2, name: 'Đầu bấm mạng RJ45', quantity: 150, min_qty: 50, location: 'Kho chính' },
    { id: 3, name: 'Cáp nhảy 1.5m', quantity: 3, min_qty: 10, location: 'Kho B' },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Tồn kho Vật tư Tiêu hao</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2">
          <ArrowUpRight size={18} /> Nhập kho mới
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {stocks.map((item) => {
          const isLow = item.quantity < item.min_qty; // Logic cảnh báo từ database [cite: 155]
          
          return (
            <div key={item.id} className={`p-4 rounded-xl border-2 flex items-center justify-between ${isLow ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${isLow ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  <Package size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-500">{item.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-8 text-right">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Tồn kho / Tối thiểu</p>
                  <p className={`text-lg font-mono font-bold ${isLow ? 'text-red-600' : 'text-gray-700'}`}>
                    {item.quantity} / {item.min_qty}
                  </p>
                </div>
                {isLow && (
                  <div className="flex items-center gap-2 text-red-600 animate-pulse">
                    <AlertTriangle size={20} />
                    <span className="text-sm font-medium">Cần đặt hàng ngay!</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Consumables;