import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Search, Edit2, Trash2, X } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { showToast } from '../utils/toast';
import ConfirmDialog from './ConfirmDialog';

const CategoryConsumableModelList = forwardRef((props, ref) => {
  const [consumableModels, setConsumableModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    consumable_model_name: '',
    manufacturer: '',
    model_no: ''
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFormData, setNewFormData] = useState({
    consumable_model_name: '',
    manufacturer: '',
    model_no: ''
  });

  useImperativeHandle(ref, () => ({
    openAddModal: () => {
      setNewFormData({ consumable_model_name: '', manufacturer: '', model_no: '' });
      setShowAddModal(true);
    }
  }));

  useEffect(() => {
    fetchConsumableModels();
  }, [search, page]);

  const fetchConsumableModels = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/consumable-models', {
        params: { search, page, limit: 10 }
      });
      if (response.data.success) {
        setConsumableModels(response.data.data.consumableModels);
        setTotalPages(response.data.data.totalPages);
        setTotal(response.data.data.total);
      }
    } catch (error) {
      console.error('Error fetching consumable models:', error);
      showToast('Không thể tải danh sách loại vật tư', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (model) => {
    setEditingId(model.consumable_model_id);
    setFormData({
      consumable_model_name: model.consumable_model_name,
      manufacturer: model.manufacturer || '',
      model_no: model.model_no || ''
    });
  };

  const handleSave = async () => {
    if (!formData.consumable_model_name.trim()) {
      showToast('Vui lòng nhập tên loại vật tư', 'error');
      return;
    }

    try {
      const response = await axiosClient.put(`/consumable-models/${editingId}`, formData);
      if (response.data.success) {
        showToast('Cập nhật loại vật tư thành công', 'success');
        setEditingId(null);
        fetchConsumableModels();
      }
    } catch (error) {
      console.error('Error updating consumable model:', error);
      showToast('Không thể cập nhật loại vật tư', 'error');
    }
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await axiosClient.delete(`/consumable-models/${deleteId}`);
      if (response.data.success) {
        showToast('Xóa loại vật tư thành công', 'success');
        setShowConfirm(false);
        fetchConsumableModels();
      }
    } catch (error) {
      console.error('Error deleting consumable model:', error);
      showToast('Không thể xóa loại vật tư', 'error');
      setShowConfirm(false);
    }
  };

  const handleAddConsumableModel = async () => {
    if (!newFormData.consumable_model_name.trim()) {
      showToast('Vui lòng nhập tên loại vật tư', 'error');
      return;
    }

    try {
      const response = await axiosClient.post('/consumable-models', newFormData);
      if (response.data.success) {
        showToast('Thêm loại vật tư thành công', 'success');
        setShowAddModal(false);
        setNewFormData({ consumable_model_name: '', manufacturer: '', model_no: '' });
        fetchConsumableModels();
      }
    } catch (error) {
      console.error('Error adding consumable model:', error);
      showToast('Không thể thêm loại vật tư', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1 relative mr-4">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm loại vật tư..."
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
      ) : consumableModels.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Không có loại vật tư nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tên loại vật tư</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nhà sản xuất</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mã loại</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {consumableModels.map((model) => (
                <tr key={model.consumable_model_id} className="border-b border-gray-200 hover:bg-gray-50">
                  {editingId === model.consumable_model_id ? (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={formData.consumable_model_name}
                          onChange={(e) =>
                            setFormData({ ...formData, consumable_model_name: e.target.value })
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={formData.manufacturer}
                          onChange={(e) =>
                            setFormData({ ...formData, manufacturer: e.target.value })
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={formData.model_no}
                          onChange={(e) =>
                            setFormData({ ...formData, model_no: e.target.value })
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                        />
                      </td>
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
                      <td className="px-6 py-4 font-medium text-gray-900">{model.consumable_model_name}</td>
                      <td className="px-6 py-4 text-gray-600">{model.manufacturer || '-'}</td>
                      <td className="px-6 py-4 text-gray-600">{model.model_no || '-'}</td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(model)}
                          className="text-blue-600 hover:text-blue-800 transition inline-flex items-center gap-1"
                        >
                          <Edit2 size={16} /> Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(model.consumable_model_id)}
                          className="text-red-600 hover:text-red-800 transition inline-flex items-center gap-1"
                        >
                          <Trash2 size={16} /> Xóa
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

      {showConfirm && (
        <ConfirmDialog
          open={showConfirm}
          message="Bạn có chắc chắn muốn xóa loại vật tư này?"
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* Modal Thêm Mới */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Thêm loại vật tư mới</h2>
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
                  Tên loại vật tư <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newFormData.consumable_model_name}
                  onChange={(e) =>
                    setNewFormData({ ...newFormData, consumable_model_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Nhập tên loại vật tư"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nhà sản xuất
                </label>
                <input
                  type="text"
                  value={newFormData.manufacturer}
                  onChange={(e) =>
                    setNewFormData({ ...newFormData, manufacturer: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Nhập tên nhà sản xuất"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mã loại
                </label>
                <input
                  type="text"
                  value={newFormData.model_no}
                  onChange={(e) =>
                    setNewFormData({ ...newFormData, model_no: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Nhập mã loại"
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
                onClick={handleAddConsumableModel}
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

CategoryConsumableModelList.displayName = 'CategoryConsumableModelList';
export default CategoryConsumableModelList;
