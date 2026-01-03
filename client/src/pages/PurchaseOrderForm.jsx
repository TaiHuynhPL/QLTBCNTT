import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Package, Zap, Lock } from 'lucide-react';
import axios from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export default function PurchaseOrderForm() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  // State Header
  const [poInfo, setPoInfo] = useState({
    order_code: `PO${Date.now()}`,
    supplier_id: '',
    order_date: new Date().toISOString().split('T')[0],
    status: 'Draft',
    notes: ''
  });
  // State Details (Mảng các dòng items)
  const [items, setItems] = useState([
    { id: Date.now(), type: 'asset', model_id: '', consumable_model_id: '', quantity: 1, unit_price: 0, total: 0 }
  ]);
  // State lấy danh sách NCC và Model từ API
  const [suppliers, setSuppliers] = useState([]);
  const [assetModels, setAssetModels] = useState([]);
  const [consumableModels, setConsumableModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      axios.get('/suppliers'),
      axios.get('/asset-models'),
      axios.get('/consumable-models')
    ])
      .then(([supRes, assetRes, consumableRes]) => {
        setSuppliers(supRes.data.data?.suppliers || supRes.data.data || []);
        setAssetModels(assetRes.data.data?.assetModels || assetRes.data.data || []);
        setConsumableModels(consumableRes.data.data?.consumableModels || consumableRes.data.data || []);
      })
      .catch(err => setError(err.response?.data?.error || 'Không thể tải dữ liệu nhà cung cấp hoặc model'))
      .finally(() => setLoading(false));
  }, []);

  // Tính tổng tiền đơn hàng
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  // Xử lý thay đổi dòng chi tiết
  const handleItemChange = (id, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Nếu thay đổi loại (asset/consumable), reset model và giá
        if (field === 'type') {
          updatedItem.model_id = '';
          updatedItem.consumable_model_id = '';
          updatedItem.unit_price = 0;
          updatedItem.total = 0;
        }
        
        // Nếu thay đổi model asset, tự động điền giá gợi ý
        if (field === 'model_id' && updatedItem.type === 'asset' && value) {
          const selectedModel = assetModels.find(m => String(m.id) === String(value));
          if (selectedModel) {
            updatedItem.unit_price = selectedModel.price_est || 0;
          }
        }
        
        // Nếu thay đổi model consumable, tự động điền giá gợi ý
        if (field === 'consumable_model_id' && updatedItem.type === 'consumable' && value) {
          const selectedModel = consumableModels.find(m => String(m.consumable_model_id) === String(value));
          if (selectedModel) {
            updatedItem.unit_price = selectedModel.price_est || 0;
          }
        }
        
        // Tính lại thành tiền
        updatedItem.total = Number(updatedItem.quantity) * Number(updatedItem.unit_price);
        return updatedItem;
      }
      return item;
    }));
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), type: 'asset', model_id: '', consumable_model_id: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasPermission('createPO')) {
      alert('Bạn không có quyền tạo đơn hàng!');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await axios.post('/purchase-orders', {
        order_code: poInfo.order_code,
        order_date: poInfo.order_date,
        supplier_id: poInfo.supplier_id,
        status: poInfo.status,
        notes: poInfo.notes,
        detail_orders: items.map(item => {
          const detail = {
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total
          };
          // Thêm asset_model_id nếu là asset
          if (item.type === 'asset') {
            detail.asset_model_id = item.model_id;
          }
          // Thêm consumable_model_id nếu là consumable
          if (item.type === 'consumable') {
            detail.consumable_model_id = item.consumable_model_id;
          }
          return detail;
        })
      });
      navigate('/purchase-orders');
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi tạo đơn hàng!');
      alert(err.response?.data?.error || 'Lỗi khi tạo đơn hàng!');
    } finally {
      setLoading(false);
    }
  };
console.log(poInfo);
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <button onClick={() => navigate('/purchase-orders')} className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors text-base font-medium">
          <ArrowLeft size={22} className="mr-2" /> Quay lại
        </button>
        <h1 className="text-3xl font-bold text-gray-900 drop-shadow">Tạo Đơn Đặt Hàng Mới</h1>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Thông tin chung */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-6 border-b pb-3 text-lg">Thông tin chung</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Mã đơn hàng <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full border-gray-200 rounded-lg shadow-sm p-3 border focus:ring-2 focus:ring-indigo-400 focus:outline-none text-base"
                  value={poInfo.order_code}
                  onChange={e => setPoInfo({...poInfo, order_code: e.target.value})}
                  placeholder="Nhập mã đơn hàng"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Nhà cung cấp <span className="text-red-500">*</span></label>
                <select 
                  required
                  className="w-full border-gray-200 rounded-lg shadow-sm p-3 border focus:ring-2 focus:ring-cyan-400 focus:outline-none text-base"
                  value={poInfo.supplier_id}
                  onChange={e => setPoInfo({...poInfo, supplier_id: e.target.value})}
                >
                  <option value="">-- Chọn NCC --</option>
                  {suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Ngày đặt hàng</label>
                <input 
                  type="date" 
                  required
                  className="w-full border-gray-200 rounded-lg shadow-sm p-3 border focus:ring-2 focus:ring-indigo-400 focus:outline-none text-base"
                  value={poInfo.order_date}
                  onChange={e => setPoInfo({...poInfo, order_date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Trạng thái đơn hàng <span className="text-red-500">*</span></label>
                <select
                  required
                  disabled={true}
                  className="w-full border-gray-200 rounded-lg shadow-sm p-3 border focus:ring-2 focus:ring-indigo-400 focus:outline-none text-base"
                  value={poInfo.status}
                  onChange={e => setPoInfo({...poInfo, status: e.target.value})}
                >
                  <option value="Draft">Nháp</option>
                  <option value="Pending Approval">Chờ duyệt</option>
                  <option value="Approved">Đã duyệt</option>
                  <option value="Rejected">Từ chối</option>
                  <option value="Completed">Hoàn thành</option>
                  <option value="Cancelled">Đã hủy</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea 
                  className="w-full border-gray-200 rounded-lg shadow-sm p-3 border focus:ring-2 focus:ring-cyan-400 focus:outline-none text-base"
                  rows={3}
                  value={poInfo.notes}
                  onChange={e => setPoInfo({...poInfo, notes: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Right: Chi tiết đơn hàng */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-3 gap-4">
               <h3 className="font-semibold text-gray-800 text-lg">Chi tiết sản phẩm</h3>
               <button type="button" onClick={addItem} className="text-base text-cyan-600 hover:bg-cyan-50 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition">
                 <Plus size={18}/> Thêm dòng
               </button>
            </div>

            {/* Headers for desktop */}
            <div className="md:grid grid-cols-12 gap-3 mb-3 px-4 text-xs font-semibold text-gray-600 uppercase">
              <div className="col-span-2">Loại</div>
              <div className="col-span-4">Sản phẩm</div>
              <div className="col-span-1 text-center">SL</div>
              <div className="col-span-2 text-right">Đơn giá</div>
              <div className="col-span-2 text-right">Thành tiền</div>
              <div className="col-span-1 text-right">Xoá</div>
            </div>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4 hover:border-gray-300 transition">
                    {/* Desktop layout */}
                    <div className="md:grid grid-cols-12 gap-3 items-center">
                      {/* Type */}
                      <select
                        className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white"
                        value={item.type}
                        onChange={(e) => handleItemChange(item.id, 'type', e.target.value)}
                      >
                        <option value="asset">Tài sản</option>
                        <option value="consumable">Vật tư</option>
                      </select>

                      {/* Product: show only relevant select */}
                      <div className="col-span-4">
                        {item.type === 'asset' && (
                          <select
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white"
                            value={item.model_id}
                            onChange={(e) => handleItemChange(item.id, 'model_id', e.target.value)}
                          >
                            <option value="">-- Chọn Tài sản --</option>
                            {assetModels.map(m => (
                              <option key={m.asset_model_id} value={m.asset_model_id}>{m.model_name}</option>
                            ))}
                          </select>
                        )}
                        {item.type === 'consumable' && (
                          <select
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white"
                            value={item.consumable_model_id}
                            onChange={(e) => handleItemChange(item.id, 'consumable_model_id', e.target.value)}
                          >
                            <option value="">-- Chọn Vật tư --</option>
                            {consumableModels.map(m => (
                              <option key={m.consumable_model_id} value={m.consumable_model_id}>
                                {m.consumable_model_name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                    {/* Quantity */}
                    <input
                      type="number"
                      min="1"
                      className="col-span-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                    />

                    {/* Unit Price */}
                    <input
                      type="number"
                      min="0"
                      className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(item.id, 'unit_price', Number(e.target.value))}
                    />

                    {/* Total */}
                    <div className="col-span-2 flex items-center gap-2">
                      <div className="flex-1 text-right font-semibold text-indigo-600 text-sm">
                        {new Intl.NumberFormat('vi-VN').format(item.total)}
                      </div>
                    </div>

                    <div className="col-span-1 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Mobile layout */}
                  <div className="md:hidden space-y-3">
                    {/* Row 1: Type and Product */}
                    <div className="flex gap-2">
                      <select
                        className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white"
                        value={item.type}
                        onChange={(e) => handleItemChange(item.id, 'type', e.target.value)}
                      >
                        <option value="asset">Tài sản</option>
                        <option value="consumable">Vật tư</option>
                      </select>

                      {item.type === 'asset' ? (
                        <select
                          required
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white"
                          value={item.model_id}
                          onChange={(e) => handleItemChange(item.id, 'model_id', e.target.value)}
                        >
                          <option value="">-- Chọn Tài sản --</option>
                          {assetModels.map(m => (
                            <option key={m.asset_model_id} value={m.asset_model_id}>{m.model_name}</option>
                          ))}
                        </select>
                      ) : (
                        <select
                          required
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white"
                          value={item.consumable_model_id}
                          onChange={(e) => handleItemChange(item.id, 'consumable_model_id', e.target.value)}
                        >
                          <option value="">-- Chọn Vật tư --</option>
                          {consumableModels.map(m => (
                            <option key={m.consumable_model_id} value={m.consumable_model_id}>
                              {m.consumable_model_name}
                            </option>
                          ))}
                        </select>
                      )}

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 p-2 rounded transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Row 2: Quantity, Price, Total */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">SL</label>
                        <input
                          type="number"
                          min="1"
                          className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm text-center focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Đơn giá</label>
                        <input
                          type="number"
                          min="0"
                          className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm text-right focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(item.id, 'unit_price', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Thành tiền</label>
                        <div className="border border-gray-300 rounded-lg px-2 py-2 text-sm font-semibold text-indigo-600 text-right bg-white">
                          {new Intl.NumberFormat('vi-VN').format(item.total)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Total Footer */}
            <div className="mt-8 flex justify-end items-center gap-6 pt-6 border-t border-gray-100">
               <span className="text-gray-600 font-medium text-lg">Tổng cộng:</span>
               <span className="text-3xl font-bold text-indigo-600">{new Intl.NumberFormat('vi-VN').format(totalAmount)} ₫</span>
            </div>
          </div>
          <div className="flex justify-end gap-4">
             <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-100 text-base font-medium">Hủy</button>
             <button type="submit" className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-lg hover:from-indigo-600 hover:to-cyan-600 shadow flex items-center gap-2 text-base font-medium">
                <Save size={20}/> Lưu đơn hàng (Nháp)
             </button>
          </div>
        </div>
      </form>
    </div>
  );
}