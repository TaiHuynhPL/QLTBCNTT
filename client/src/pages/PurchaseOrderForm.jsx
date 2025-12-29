import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Calculator } from 'lucide-react';
import axios from '../api/axiosClient';

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
  // State lấy danh sách NCC và Model từ API
  const [suppliers, setSuppliers] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      axios.get('/suppliers'),
      axios.get('/asset-models')
    ])
      .then(([supRes, modelRes]) => {
        setSuppliers(supRes.data.data);
        setModels(modelRes.data.data);
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
        // Nếu thay đổi model, tự động điền giá gợi ý
        if (field === 'model_id') {
          const selectedModel = models.find(m => String(m.id) === String(value));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post('/purchase-orders', {
        ...poInfo,
        total_amount: totalAmount,
        details: items.map(item => ({
          model_id: item.model_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total
        }))
      });
      navigate('/purchase-orders');
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi tạo đơn hàng!');
      alert(err.response?.data?.error || 'Lỗi khi tạo đơn hàng!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-8 font-sans">
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
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-4 items-end bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                   <div className="flex-1 w-full">
                     <label className="block text-sm font-medium text-gray-600 mb-1">Sản phẩm/Model</label>
                     <select 
                        required
                        className="w-full border-gray-200 rounded-lg text-base p-3 border focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                        value={item.model_id}
                        onChange={(e) => handleItemChange(item.id, 'model_id', e.target.value)}
                     >
                       <option value="">-- Chọn Model --</option>
                       {models.map(m => (
                         <option key={m.id} value={m.id}>{m.name} ({m.type})</option>
                       ))}
                     </select>
                   </div>
                   <div className="w-28">
                     <label className="block text-sm font-medium text-gray-600 mb-1">Số lượng</label>
                     <input 
                        type="number" min="1"
                        className="w-full border-gray-200 rounded-lg text-base p-3 border text-center focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                     />
                   </div>
                   <div className="w-36">
                     <label className="block text-sm font-medium text-gray-600 mb-1">Đơn giá</label>
                     <input 
                        type="number" min="0"
                        className="w-full border-gray-200 rounded-lg text-base p-3 border text-right focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(item.id, 'unit_price', Number(e.target.value))}
                     />
                   </div>
                   <div className="w-36 text-right pb-2">
                      <div className="text-xs text-gray-500">Thành tiền</div>
                      <div className="font-semibold text-gray-900 text-lg">{new Intl.NumberFormat('vi-VN').format(item.total)}</div>
                   </div>
                   <button 
                      type="button" 
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 pb-2"
                   >
                     <Trash2 size={20} />
                   </button>
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