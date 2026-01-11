import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Search, Edit2, Plus, X, TrendingDown } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { showToast } from '../utils/toast';

const ConsumableStockList = forwardRef((props, ref) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ quantity: '', min_quantity: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFormData, setNewFormData] = useState({
    consumable_model_id: '',
    location_id: '',
    quantity: '',
    min_quantity: ''
  });
  const [locations, setLocations] = useState([]);
  const [consumableModels, setConsumableModels] = useState([]);

  useImperativeHandle(ref, () => ({
    openAddModal: () => {
      setNewFormData({
        consumable_model_id: '',
        location_id: '',
        quantity: '',
        min_quantity: ''
      });
      setShowAddModal(true);
    }
  }));

  useEffect(() => {
    fetchStocks();
    fetchLocations();
    fetchConsumableModels();
  }, [search, page]);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/consumable-stock', {
        params: { search, page, limit: 10 }
      });
      if (response.data.success) {
        setStocks(response.data.data.stocks);
        setTotalPages(response.data.data.totalPages);
        setTotal(response.data.data.total);
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
      showToast('Không thể tải danh sách tồn kho', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axiosClient.get('/holders');
      if (response.data.success) {
        // Assuming locations can be fetched from a locations endpoint
        // For now, we'll set empty array
        setLocations([
          { location_id: 1, location_name: 'Kho 1' },
          { location_id: 2, location_name: 'Kho 2' },
          { location_id: 3, location_name: 'Kho 3' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
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

  const handleEdit = (stock) => {
    setEditingId(stock.stock_id);
    setFormData({
      quantity: stock.quantity,
      min_quantity: stock.min_quantity
    });
  };

  const handleSave = async () => {
    if (!formData.quantity || formData.quantity < 0) {
      showToast('Số lượng không hợp lệ', 'error');
      return;
    }

    try {
      const response = await axiosClient.put(`/consumable-stock/${editingId}`, {
        quantity: parseInt(formData.quantity),
        min_quantity: parseInt(formData.min_quantity || 0)
      });
      if (response.data.success) {
        showToast('Cập nhật tồn kho thành công', 'success');
        setEditingId(null);
        fetchStocks();
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      showToast('Không thể cập nhật tồn kho', 'error');
    }
  };

  const handleAddStock = async () => {
    if (!newFormData.consumable_model_id || !newFormData.location_id || !newFormData.quantity) {
      showToast('Vui lòng nhập đầy đủ thông tin', 'error');
      return;
    }

    try {
      const response = await axiosClient.post('/consumable-stock', {
        consumable_model_id: parseInt(newFormData.consumable_model_id),
        location_id: parseInt(newFormData.location_id),
        quantity: parseInt(newFormData.quantity),
        min_quantity: parseInt(newFormData.min_quantity || 0)
      });
      if (response.data.success) {
        showToast('Thêm tồn kho thành công', 'success');
        setShowAddModal(false);
        setNewFormData({
          consumable_model_id: '',
          location_id: '',
          quantity: '',
          min_quantity: ''
        });
        fetchStocks();
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      showToast('Không thể thêm tồn kho', 'error');
    }
  };

  const isLowStock = (stock) => stock.quantity <= stock.min_quantity;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1 relative mr-4">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm tồn kho..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg px-4 py-2 font-semibold text-cyan-700">
          Tổng số: {total}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : stocks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Không có dữ liệu tồn kho</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Loại vật tư</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vị trí</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Số lượng</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Min</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Trạng thái</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr
                  key={stock.stock_id}
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    isLowStock(stock) ? 'bg-red-50' : ''
                  }`}
                >
                  {editingId === stock.stock_id ? (
                    <>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {stock.consumableModel?.consumable_model_name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {stock.location?.location_name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="number"
                          value={formData.quantity}
                          onChange={(e) =>
                            setFormData({ ...formData, quantity: e.target.value })
                          }
                          min="0"
                          className="w-20 mx-auto px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="number"
                          value={formData.min_quantity}
                          onChange={(e) =>
                            setFormData({ ...formData, min_quantity: e.target.value })
                          }
                          min="0"
                          className="w-20 mx-auto px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-center"></td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <button
                          onClick={handleSave}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded transition"
                        >
                          Hủy
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {stock.consumableModel?.consumable_model_name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {stock.location?.location_name}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold">{stock.quantity}</td>
                      <td className="px-6 py-4 text-center text-gray-600">{stock.min_quantity}</td>
                      <td className="px-6 py-4 text-center">
                        {isLowStock(stock) ? (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                            <TrendingDown size={14} /> Cảnh báo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                            ✓ Bình thường
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleEdit(stock)}
                          className="text-blue-600 hover:text-blue-800 transition inline-flex items-center gap-1"
                        >
                          <Edit2 size={16} /> Sửa
                        </button>
                      </td>
                    </>
                  )}
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

      {/* Modal Thêm Mới */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Thêm tồn kho</h2>
              <button
                onClick={() => setShowAddModal(false)}
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
                  value={newFormData.consumable_model_id}
                  onChange={(e) =>
                    setNewFormData({ ...newFormData, consumable_model_id: e.target.value })
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
                  Vị trí <span className="text-red-500">*</span>
                </label>
                <select
                  value={newFormData.location_id}
                  onChange={(e) =>
                    setNewFormData({ ...newFormData, location_id: e.target.value })
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
                  Số lượng <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newFormData.quantity}
                  onChange={(e) =>
                    setNewFormData({ ...newFormData, quantity: e.target.value })
                  }
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Nhập số lượng"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số lượng tối thiểu (cảnh báo)
                </label>
                <input
                  type="number"
                  value={newFormData.min_quantity}
                  onChange={(e) =>
                    setNewFormData({ ...newFormData, min_quantity: e.target.value })
                  }
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Nhập số lượng tối thiểu"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-semibold transition"
              >
                Hủy
              </button>
              <button
                onClick={handleAddStock}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-lg font-semibold transition"
              >
                Thêm mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ConsumableStockList.displayName = 'ConsumableStockList';
export default ConsumableStockList;
