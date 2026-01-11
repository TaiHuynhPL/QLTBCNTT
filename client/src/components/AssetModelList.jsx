import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Search, Edit2, Trash2, X } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { showToast } from '../utils/toast';
import ConfirmDialog from './ConfirmDialog';

const AssetModelList = forwardRef((props, ref) => {
  const [assetModels, setAssetModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ model_name: '', manufacturer: '' });
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFormData, setNewFormData] = useState({ model_name: '', manufacturer: '' });

  useImperativeHandle(ref, () => ({
    openAddModal: () => {
      setNewFormData({ model_name: '', manufacturer: '' });
      setShowAddModal(true);
    }
  }));

  useEffect(() => {
    fetchAssetModels();
  }, [search, page]);

  const fetchAssetModels = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/asset-models', {
        params: { search, page, limit: 10 }
      });
      if (response.data.success) {
        setAssetModels(response.data.data.assetModels);
        setTotalPages(response.data.data.totalPages);
        setTotal(response.data.data.total);
      }
    } catch (error) {
      console.error('Error fetching asset models:', error);
      showToast('Không thể tải danh sách loại tài sản', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (model) => {
    setEditingId(model.asset_model_id);
    setFormData({
      model_name: model.model_name,
      manufacturer: model.manufacturer || ''
    });
  };

  const handleSave = async () => {
    if (!formData.model_name.trim()) {
      showToast('Vui lòng nhập tên loại tài sản', 'error');
      return;
    }

    try {
      const response = await axiosClient.put(`/asset-models/${editingId}`, formData);
      if (response.data.success) {
        showToast('Cập nhật loại tài sản thành công', 'success');
        setEditingId(null);
        fetchAssetModels();
      }
    } catch (error) {
      console.error('Error updating asset model:', error);
      showToast('Không thể cập nhật loại tài sản', 'error');
    }
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await axiosClient.delete(`/asset-models/${deleteId}`);
      if (response.data.success) {
        showToast('Xóa loại tài sản thành công', 'success');
        setShowConfirm(false);
        fetchAssetModels();
      }
    } catch (error) {
      console.error('Error deleting asset model:', error);
      showToast('Không thể xóa loại tài sản', 'error');
      setShowConfirm(false);
    }
  };

  const handleAddAssetModel = async () => {
    if (!newFormData.model_name.trim()) {
      showToast('Vui lòng nhập tên loại tài sản', 'error');
      return;
    }

    try {
      const response = await axiosClient.post('/asset-models', newFormData);
      if (response.data.success) {
        showToast('Thêm loại tài sản thành công', 'success');
        setShowAddModal(false);
        setNewFormData({ model_name: '', manufacturer: '' });
        fetchAssetModels();
      }
    } catch (error) {
      console.error('Error adding asset model:', error);
      showToast('Không thể thêm loại tài sản', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1 relative mr-4">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm loại tài sản..."
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
      ) : assetModels.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Không có loại tài sản nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tên loại tài sản</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nhà sản xuất</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {assetModels.map((model) => (
                <tr key={model.asset_model_id} className="border-b border-gray-200 hover:bg-gray-50">
                  {editingId === model.asset_model_id ? (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={formData.model_name}
                          onChange={(e) =>
                            setFormData({ ...formData, model_name: e.target.value })
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
                      <td className="px-6 py-4 font-medium text-gray-900">{model.model_name}</td>
                      <td className="px-6 py-4 text-gray-600">{model.manufacturer || '-'}</td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(model)}
                          className="text-blue-600 hover:text-blue-800 transition inline-flex items-center gap-1"
                        >
                          <Edit2 size={16} /> Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(model.asset_model_id)}
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
          message="Bạn có chắc chắn muốn xóa loại tài sản này?"
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* Modal Thêm Mới */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Thêm loại tài sản mới</h2>
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
                  Tên loại tài sản <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newFormData.model_name}
                  onChange={(e) =>
                    setNewFormData({ ...newFormData, model_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Nhập tên loại tài sản"
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
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-semibold transition"
              >
                Hủy
              </button>
              <button
                onClick={handleAddAssetModel}
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

AssetModelList.displayName = 'AssetModelList';
export default AssetModelList;
