import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import axios from '../api/axiosClient';

export default function ConsumableModelList() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    consumable_model_name: '',
    manufacturer: '',
    model_no: '',
    specifications: ''
  });

  // Fetch data
  const fetchModels = () => {
    setLoading(true);
    setError(null);
    axios.get('/consumable-models', {
      params: {
        search: debouncedSearch || undefined,
        page,
        limit: 10
      }
    })
      .then(res => {
        setModels(res.data.data.consumableModels || []);
        setTotalPages(res.data.data.totalPages || 1);
        setTotal(res.data.data.total || 0);
      })
      .catch(err => setError(err.response?.data?.error || 'Không thể tải dữ liệu'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchModels();
    // eslint-disable-next-line
  }, [debouncedSearch, page]);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      consumable_model_name: '',
      manufacturer: '',
      model_no: '',
      specifications: ''
    });
    setShowForm(true);
  };

  const handleEdit = (model) => {
    setEditingId(model.consumable_model_id);
    setFormData({
      consumable_model_name: model.consumable_model_name,
      manufacturer: model.manufacturer || '',
      model_no: model.model_no || '',
      specifications: model.specifications ? JSON.stringify(model.specifications) : ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        consumable_model_name: formData.consumable_model_name,
        manufacturer: formData.manufacturer,
        model_no: formData.model_no,
        specifications: formData.specifications ? JSON.parse(formData.specifications) : null
      };

      if (editingId) {
        await axios.put(`/consumable-models/${editingId}`, data);
      } else {
        await axios.post('/consumable-models', data);
      }
      setShowForm(false);
      fetchModels();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi lưu dữ liệu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xác nhận xóa mô hình vật tư này?')) {
      try {
        await axios.delete(`/consumable-models/${id}`);
        fetchModels();
      } catch (err) {
        alert(err.response?.data?.error || 'Lỗi khi xóa dữ liệu');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-700 tracking-tight mb-1 drop-shadow-sm">Mô hình Vật tư Tiêu hao</h1>
          <p className="text-gray-500 text-base md:text-lg">Quản lý danh sách các mô hình vật tư tiêu hao</p>
        </div>
      </div>

      {/* Table View */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo tên, hãng sản xuất hoặc mã model..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(1);
                  fetchModels();
                }
              }}
            />
          </div>
          <button
            onClick={handleAddNew}
            className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:from-indigo-600 hover:to-cyan-600 shadow transition-all font-semibold flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} /> Thêm mô hình
          </button>
        </div>

        {/* Table */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-indigo-50 text-indigo-700 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Tên Mô hình</th>
              <th className="px-6 py-4 font-semibold">Hãng sản xuất</th>
              <th className="px-6 py-4 font-semibold">Mã Model</th>
              <th className="px-6 py-4 font-semibold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-8">Đang tải dữ liệu...</td></tr>
            ) : error ? (
              <tr><td colSpan="4" className="text-center text-red-500 py-8">{error}</td></tr>
            ) : models.length === 0 ? (
              <tr><td colSpan="4" className="text-center text-gray-500 py-8">Không có mô hình nào</td></tr>
            ) : (
              models.map((model) => (
                <tr key={model.consumable_model_id} className="hover:bg-indigo-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 text-base">{model.consumable_model_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{model.manufacturer || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 font-mono">{model.model_no || '-'}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleEdit(model)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(model.consumable_model_id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-gray-600 text-sm">
            Tổng: <span className="font-semibold">{total}</span> | Trang {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              ← Trước
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Sau →
            </button>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Chỉnh sửa Mô hình Vật tư' : 'Thêm Mô hình Vật tư Mới'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên mô hình <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.consumable_model_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      consumable_model_name: e.target.value
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="VD: Giấy A4, Bút bi, ..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hãng sản xuất</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) =>
                      setFormData({ ...formData, manufacturer: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="VD: Canon, HP, ..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mã model</label>
                  <input
                    type="text"
                    value={formData.model_no}
                    onChange={(e) =>
                      setFormData({ ...formData, model_no: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="VD: CM-001, ..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Thông số kỹ thuật (JSON)</label>
                <textarea
                  value={formData.specifications}
                  onChange={(e) =>
                    setFormData({ ...formData, specifications: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm"
                  placeholder='{"color": "white", "size": "A4"}'
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-lg hover:from-indigo-600 hover:to-cyan-600 font-medium"
                >
                  {editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}