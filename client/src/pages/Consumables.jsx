import React, { useState, useEffect } from 'react';
import { AlertTriangle, Package, ArrowUpRight } from 'lucide-react';
import axios from '../api/axiosClient';

const Consumables = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get('/consumables/stock')
      .then(res => setStocks(res.data.data))
      .catch(err => setError(err.response?.data?.error || 'Không thể tải dữ liệu tồn kho vật tư'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-700 tracking-tight mb-1 drop-shadow-sm">Tồn kho Vật tư Tiêu hao</h2>
        <button className="bg-indigo-500 text-white px-5 py-2 rounded-xl hover:bg-indigo-600 shadow-md transition-all font-semibold flex items-center gap-2">
          <ArrowUpRight size={18} /> Nhập kho mới
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="text-center py-8">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : stocks.map((item) => {
          const isLow = item.quantity < item.min_qty;
          return (
            <div key={item.id} className={`p-6 rounded-2xl shadow-md border flex items-center justify-between ${isLow ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'} transition-all`}>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-full ${isLow ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'} shadow-sm`}>
                  <Package size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                  <p className="text-sm text-gray-500">{item.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-8 text-right">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Tồn kho / Tối thiểu</p>
                  <p className={`text-xl font-mono font-bold ${isLow ? 'text-red-600' : 'text-gray-700'}`}>
                    {item.quantity} / {item.min_qty}
                  </p>
                </div>
                {isLow && (
                  <div className="flex items-center gap-2 text-red-600 animate-pulse">
                    <AlertTriangle size={22} />
                    <span className="text-base font-semibold">Cần đặt hàng ngay!</span>
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