import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Search, Edit2, Trash2, Phone, Mail, X } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { showToast } from '../utils/toast';
import ConfirmDialog from './ConfirmDialog';

const SupplierList = forwardRef((props, ref) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ supplier_name: '', contact_info: '' });
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFormData, setNewFormData] = useState({ supplier_name: '', contact_info: '' });

  useImperativeHandle(ref, () => ({
    openAddModal: () => {
      setNewFormData({ supplier_name: '', contact_info: '' });
      setShowAddModal(true);
    }
  }));

  useEffect(() => {
    fetchSuppliers();
  }, [search, page]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/suppliers', {
        params: { search, page, limit: 10 }
      });
      if (response.data.success) {
        setSuppliers(response.data.data.suppliers);
        setTotalPages(response.data.data.totalPages);
        setTotal(response.data.data.total);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      showToast('Không thể tải danh sách nhà cung cấp', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supplier) => {
    setEditingId(supplier.supplier_id);
    setFormData({
      supplier_name: supplier.supplier_name,
      contact_info: supplier.contact_info
    });
  };

  const handleSave = async () => {
    if (!formData.supplier_name.trim()) {
      showToast('Vui lòng nhập tên nhà cung cấp', 'error');
      return;
    }

    try {
      const response = await axiosClient.put(`/suppliers/${editingId}`, formData);
      if (response.data.success) {
        showToast('Cập nhật nhà cung cấp thành công', 'success');
        setEditingId(null);
        fetchSuppliers();
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      showToast('Không thể cập nhật nhà cung cấp', 'error');
    }
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await axiosClient.delete(`/suppliers/${deleteId}`);
      if (response.data.success) {
        showToast('Xóa nhà cung cấp thành công', 'success');
        setShowConfirm(false);
        fetchSuppliers();
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      showToast('Không thể xóa nhà cung cấp', 'error');
      setShowConfirm(false);
    }
  };

  const handleAddSupplier = async () => {
    if (!newFormData.supplier_name.trim()) {
      showToast('Vui lòng nhập tên nhà cung cấp', 'error');
      return;
    }

    try {
      const response = await axiosClient.post('/suppliers', newFormData);
      if (response.data.success) {
        showToast('Thêm nhà cung cấp thành công', 'success');
        setShowAddModal(false);
        setNewFormData({ supplier_name: '', contact_info: '' });
        fetchSuppliers();
      }
    } catch (error) {
      console.error('Error adding supplier:', error);
      showToast('Không thể thêm nhà cung cấp', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1 relative mr-4">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm nhà cung cấp..."
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
      ) : suppliers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Không có nhà cung cấp nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tên nhà cung cấp</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Thông tin liên hệ</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.supplier_id} className="border-b border-gray-200 hover:bg-gray-50">
                  {editingId === supplier.supplier_id ? (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={formData.supplier_name}
                          onChange={(e) =>
                            setFormData({ ...formData, supplier_name: e.target.value })
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={formData.contact_info}
                          onChange={(e) =>
                            setFormData({ ...formData, contact_info: e.target.value })
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
                      <td className="px-6 py-4 font-medium text-gray-900">{supplier.supplier_name}</td>
                      <td className="px-6 py-4 text-gray-600">{supplier.contact_info}</td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="text-blue-600 hover:text-blue-800 transition inline-flex items-center gap-1"
                        >
                          <Edit2 size={16} /> Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.supplier_id)}
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
          message="Bạn có chắc chắn muốn xóa nhà cung cấp này?"
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* Modal Thêm Mới */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Thêm nhà cung cấp mới</h2>
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
                  Tên nhà cung cấp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newFormData.supplier_name}
                  onChange={(e) =>
                    setNewFormData({ ...newFormData, supplier_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Nhập tên nhà cung cấp"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Thông tin liên hệ
                </label>
                <input
                  type="text"
                  value={newFormData.contact_info}
                  onChange={(e) =>
                    setNewFormData({ ...newFormData, contact_info: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Nhập thông tin liên hệ (email, phone, địa chỉ, etc)"
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
                onClick={handleAddSupplier}
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

SupplierList.displayName = 'SupplierList';
export default SupplierList;
