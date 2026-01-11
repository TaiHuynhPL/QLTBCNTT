import { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { showToast } from '../utils/toast';
import SupplierList from '../components/SupplierList';
import AssetModelList from '../components/AssetModelList';
import CategoryConsumableModelList from '../components/CategoryConsumableModelList';

const Categories = () => {
  const [activeTab, setActiveTab] = useState('suppliers');
  const supplierListRef = useRef();
  const assetModelListRef = useRef();
  const consumableModelListRef = useRef();

  const handleAddNew = () => {
    if (activeTab === 'suppliers' && supplierListRef.current) {
      supplierListRef.current.openAddModal();
    } else if (activeTab === 'assetModels' && assetModelListRef.current) {
      assetModelListRef.current.openAddModal();
    } else if (activeTab === 'consumableModels' && consumableModelListRef.current) {
      consumableModelListRef.current.openAddModal();
    }
  };

  return (
    <div className="p-8 h-full bg-gray-50">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-700 tracking-tight mb-1 drop-shadow-sm">Danh mục</h1>
          <p className="text-gray-600">Quản lý Nhà cung cấp, Loại Tài sản, và Loại Vật tư</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-indigo-500 text-white hover:bg-indigo-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow transition"
        >
          <Plus size={20} /> Thêm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6 border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`flex-1 py-4 px-6 font-semibold transition ${
              activeTab === 'suppliers'
                ? 'text-cyan-600 border-b-2 border-cyan-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Nhà cung cấp
          </button>
          <button
            onClick={() => setActiveTab('assetModels')}
            className={`flex-1 py-4 px-6 font-semibold transition ${
              activeTab === 'assetModels'
                ? 'text-cyan-600 border-b-2 border-cyan-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Loại Tài sản
          </button>
          <button
            onClick={() => setActiveTab('consumableModels')}
            className={`flex-1 py-4 px-6 font-semibold transition ${
              activeTab === 'consumableModels'
                ? 'text-cyan-600 border-b-2 border-cyan-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Loại Vật tư
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'suppliers' && <SupplierList ref={supplierListRef} />}
          {activeTab === 'assetModels' && <AssetModelList ref={assetModelListRef} />}
          {activeTab === 'consumableModels' && <CategoryConsumableModelList ref={consumableModelListRef} />}
        </div>
      </div>
    </div>
  );
};

export default Categories;
