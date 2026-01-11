import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Search, Plus, X, CheckCircle } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { showToast } from '../utils/toast';

const ConsumableCheckoutList = forwardRef((props, ref) => {
  const [checkouts, setCheckouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    consumable_model_id: '',
    location_id: '',
    asset_holder_id: '',
    quantity_checked_out: '',
    checkout_date: new Date().toISOString().split('T')[0]
  });
  const [consumableModels, setConsumableModels] = useState([]);
  const [assetHolders, setAssetHolders] = useState([]);
  const [locations, setLocations] = useState([]);
console.log(assetHolders)
  useImperativeHandle(ref, () => ({
    openCheckoutModal: () => {
      setCheckoutData({
        consumable_model_id: '',
        location_id: '',
        asset_holder_id: '',
        quantity_checked_out: '',
        checkout_date: new Date().toISOString().split('T')[0]
      });
      setShowCheckoutModal(true);
    }
  }));

  useEffect(() => {
    fetchCheckouts();
    fetchConsumableModels();
    fetchAssetHolders();
    fetchLocations();
  }, [page]);

  const fetchCheckouts = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/consumable-checkouts', {
        params: { page, limit: 10 }
      });
      if (response.data.success) {
        setCheckouts(response.data.data.checkouts);
        setTotalPages(response.data.data.totalPages);
        setTotal(response.data.data.total);
      }
    } catch (error) {
      console.error('Error fetching checkouts:', error);
      showToast('Không thể tải danh sách xuất kho', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchConsumableModels = async () => {
    try {
      const response = await axiosClient.get('/consumable-models', {
        params: { limit: 100 }
      });
      if (response.data.success) {
        setConsumableModels(response.data.data.consumableModels);
      }
    } catch (error) {
      console.error('Error fetching consumable models:', error);
    }
  };

  const fetchAssetHolders = async () => {
    try {
      const response = await axiosClient.get('/holders', {
        params: { limit: 100 }
      });
      if (response.data.success) {
        setAssetHolders(response.data.data.holders || []);
      }
    } catch (error) {
      console.error('Error fetching asset holders:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axiosClient.get('/locations', {
        params: { limit: 100 }
      });
      if (response.data.success) {
        setLocations(response.data.data.locations);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      showToast('Không thể tải danh sách vị trí', 'error');
    }
  };

  const handleCheckout = async () => {
    if (!checkoutData.consumable_model_id || !checkoutData.location_id || 
        !checkoutData.asset_holder_id || !checkoutData.quantity_checked_out) {
      showToast('Vui lòng nhập đầy đủ thông tin', 'error');
      return;
    }

    try {
      const response = await axiosClient.post('/consumable-checkouts', {
        consumable_model_id: parseInt(checkoutData.consumable_model_id),
        location_id: parseInt(checkoutData.location_id),
        asset_holder_id: parseInt(checkoutData.asset_holder_id),
        quantity_checked_out: parseInt(checkoutData.quantity_checked_out),
        checkout_date: checkoutData.checkout_date
      });

      if (response.data.success) {
        showToast('Xuất kho thành công', 'success');
        setShowCheckoutModal(false);
        setCheckoutData({
          consumable_model_id: '',
          location_id: '',
          asset_holder_id: '',
          quantity_checked_out: '',
          checkout_date: new Date().toISOString().split('T')[0]
        });
        fetchCheckouts();
      }
    } catch (error) {
      console.error('Error checkout:', error);
      const message = error.response?.data?.error || 'Không thể xuất kho';
      showToast(message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1 relative mr-4">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm lịch sử xuất kho..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg px-4 py-2 font-semibold text-cyan-700">
          Tổng số: {total}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : checkouts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Không có lịch sử xuất kho</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Loại vật tư</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Người nhận</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Số lượng</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Ngày xuất</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {checkouts.map((checkout) => (
                <tr key={checkout.checkout_id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {checkout.consumableModel?.consumable_model_name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {checkout.assetHolder?.full_name}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold">
                    {checkout.quantity_checked_out}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    {new Date(checkout.checkout_date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      <CheckCircle size={14} /> Đã xuất
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Trước
          </button>
          <span className="px-4 py-2">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Sau
          </button>
        </div>
      )}

      {/* Modal Xuất kho */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Xuất kho vật tư</h2>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Loại vật tư <span className="text-red-500">*</span>
                </label>
                <select
                  value={checkoutData.consumable_model_id}
                  onChange={(e) =>
                    setCheckoutData({ ...checkoutData, consumable_model_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">-- Chọn loại vật tư --</option>
                  {consumableModels.map((model) => (
                    <option key={model.consumable_model_id} value={model.consumable_model_id}>
                      {model.consumable_model_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vị trí kho <span className="text-red-500">*</span>
                </label>
                <select
                  value={checkoutData.location_id}
                  onChange={(e) =>
                    setCheckoutData({ ...checkoutData, location_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">-- Chọn vị trí --</option>
                  {locations.map((loc) => (
                    <option key={loc.location_id} value={loc.location_id}>
                      {loc.location_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Người nhận <span className="text-red-500">*</span>
                </label>
                <select
                  value={checkoutData.asset_holder_id}
                  onChange={(e) =>
                    setCheckoutData({ ...checkoutData, asset_holder_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">-- Chọn người nhận --</option>
                  {assetHolders.map((holder) => (
                    <option key={holder.asset_holder_id} value={holder.asset_holder_id}>
                      {holder.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số lượng xuất <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={checkoutData.quantity_checked_out}
                  onChange={(e) =>
                    setCheckoutData({ ...checkoutData, quantity_checked_out: e.target.value })
                  }
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Nhập số lượng"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ngày xuất
                </label>
                <input
                  type="date"
                  value={checkoutData.checkout_date}
                  onChange={(e) =>
                    setCheckoutData({ ...checkoutData, checkout_date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-semibold transition"
              >
                Hủy
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-lg font-semibold transition"
              >
                Xuất kho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ConsumableCheckoutList.displayName = 'ConsumableCheckoutList';
export default ConsumableCheckoutList;
