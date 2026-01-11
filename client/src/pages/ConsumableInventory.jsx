import { useState, useRef } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { showToast } from '../utils/toast';
import ConsumableStockList from '../components/ConsumableStockList';
import ConsumableCheckoutList from '../components/ConsumableCheckoutList';
import ConsumableAlertList from '../components/ConsumableAlertList';

const ConsumableInventory = () => {
  const [activeTab, setActiveTab] = useState('stock');
  const [alerts, setAlerts] = useState([]);
  const stockListRef = useRef();
  const checkoutListRef = useRef();

  const handleAddNew = () => {
    if (activeTab === 'stock' && stockListRef.current) {
    //   stockListRef.current.openAddModal();
    } else if (activeTab === 'checkout' && checkoutListRef.current) {
      checkoutListRef.current.openCheckoutModal();
    }
  };

  return (
    <div className="p-8 h-full bg-gray-50 overflow-y-auto">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-700 tracking-tight mb-1 drop-shadow-sm">Quản lý Vật tư Tiêu hao</h1>
          <p className="text-gray-600">Quản lý tồn kho, xuất kho, và theo dõi cảnh báo</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-indigo-500 text-white px-5 py-2 rounded-xl hover:bg-indigo-600 shadow-md transition-all font-semibold"
        >
          <Plus size={20} /> Thêm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6 border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex-1 py-4 px-6 font-semibold transition ${
              activeTab === 'stock'
                ? 'text-cyan-600 border-b-2 border-cyan-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tồn kho
          </button>
          <button
            onClick={() => setActiveTab('checkout')}
            className={`flex-1 py-4 px-6 font-semibold transition ${
              activeTab === 'checkout'
                ? 'text-cyan-600 border-b-2 border-cyan-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Xuất kho
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 py-4 px-6 font-semibold transition flex items-center justify-center gap-2 ${
              activeTab === 'alerts'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <AlertCircle size={18} /> Cảnh báo
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'stock' && <ConsumableStockList ref={stockListRef} />}
          {activeTab === 'checkout' && <ConsumableCheckoutList ref={checkoutListRef} />}
          {activeTab === 'alerts' && <ConsumableAlertList />}
        </div>
      </div>
    </div>
  );
};

export default ConsumableInventory;
