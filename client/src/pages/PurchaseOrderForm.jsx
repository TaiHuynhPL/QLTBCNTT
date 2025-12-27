import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Calculator } from 'lucide-react';
import { SUPPLIERS_MOCK, MODELS_TO_BUY_MOCK } from './data/mockPurchaseData';

export default function PurchaseOrderForm() {
  const navigate = useNavigate();
  
  // State Header
  const [poInfo, setPoInfo] = useState({
    supplier_id: '',
    order_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // State Details (Mảng các dòng items)
  const [items, setItems] = useState([
    { id: Date.now(), model_id: '', quantity: 1, unit_price: 0, total: 0 }
  ]);

  // Tính tổng tiền đơn hàng
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  // Xử lý thay đổi dòng chi tiết
  const handleItemChange = (id, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Nếu thay đổi model, tự động điền giá gợi ý
        if (field === 'model_id') {
          const selectedModel = MODELS_TO_BUY_MOCK.find(m => String(m.id) === String(value));
          if (selectedModel) {
            updatedItem.unit_price = selectedModel.price_est;
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
    setItems([...items, { id: Date.now(), model_id: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic gọi API tạo PO
    console.log("Creating PO:", { ...poInfo, totalAmount, details: items });
    navigate('/purchase-orders');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/purchase-orders')} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Quay lại
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Tạo Đơn Đặt Hàng Mới</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Thông tin chung */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">Thông tin chung</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp <span className="text-red-500">*</span></label>
                <select 
                  required
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500"
                  value={poInfo.supplier_id}
                  onChange={e => setPoInfo({...poInfo, supplier_id: e.target.value})}
                >
                  <option value="">-- Chọn NCC --</option>
                  {SUPPLIERS_MOCK.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đặt hàng</label>
                <input 
                  type="date" 
                  required
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500"
                  value={poInfo.order_date}
                  onChange={e => setPoInfo({...poInfo, order_date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea 
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500"
                  rows={3}
                  value={poInfo.notes}
                  onChange={e => setPoInfo({...poInfo, notes: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Chi tiết đơn hàng */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
               <h3 className="font-semibold text-gray-800">Chi tiết sản phẩm</h3>
               <button type="button" onClick={addItem} className="text-sm text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded flex items-center gap-1">
                 <Plus size={16}/> Thêm dòng
               </button>
            </div>
            
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-4 items-end bg-gray-50 p-3 rounded-lg border border-gray-200">
                   <div className="flex-1 w-full">
                     <label className="block text-xs font-medium text-gray-500 mb-1">Sản phẩm/Model</label>
                     <select 
                        required
                        className="w-full border-gray-300 rounded text-sm p-2 border"
                        value={item.model_id}
                        onChange={(e) => handleItemChange(item.id, 'model_id', e.target.value)}
                     >
                       <option value="">-- Chọn Model --</option>
                       {MODELS_TO_BUY_MOCK.map(m => (
                         <option key={m.id} value={m.id}>{m.name} ({m.type})</option>
                       ))}
                     </select>
                   </div>
                   <div className="w-24">
                     <label className="block text-xs font-medium text-gray-500 mb-1">Số lượng</label>
                     <input 
                        type="number" min="1"
                        className="w-full border-gray-300 rounded text-sm p-2 border text-center"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                     />
                   </div>
                   <div className="w-32">
                     <label className="block text-xs font-medium text-gray-500 mb-1">Đơn giá</label>
                     <input 
                        type="number" min="0"
                        className="w-full border-gray-300 rounded text-sm p-2 border text-right"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(item.id, 'unit_price', Number(e.target.value))}
                     />
                   </div>
                   <div className="w-32 text-right pb-2">
                      <div className="text-xs text-gray-500">Thành tiền</div>
                      <div className="font-semibold text-gray-900">{new Intl.NumberFormat('vi-VN').format(item.total)}</div>
                   </div>
                   <button 
                      type="button" 
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 pb-2"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
              ))}
            </div>

            {/* Total Footer */}
            <div className="mt-6 flex justify-end items-center gap-4 pt-4 border-t border-gray-100">
               <span className="text-gray-600 font-medium">Tổng cộng:</span>
               <span className="text-2xl font-bold text-indigo-600">{new Intl.NumberFormat('vi-VN').format(totalAmount)} ₫</span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
             <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50">Hủy</button>
             <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2">
                <Save size={18}/> Lưu đơn hàng (Nháp)
             </button>
          </div>
        </div>
      </form>
    </div>
  );
}