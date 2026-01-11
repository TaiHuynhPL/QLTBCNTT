import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Shield, UserPlus, Search, Edit2, Trash2, 
  Eye, EyeOff, CheckCircle, AlertCircle, Loader
} from 'lucide-react';
import axios from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { successToast, errorToast } from '../utils/toast';

export default function SystemUsers() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const debounceRef = useRef();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!hasRole('Admin')) {
      setError('Bạn không có quyền truy cập trang này!');
      setLoading(false);
      return;
    }
    fetchUsers();
  }, [hasRole, debouncedSearch, page, statusFilter]);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/system-users', {
        params: {
          search: debouncedSearch || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          page,
          limit: 10
        }
      });
      setUsers(res.data.data.users || res.data.data);
      setTotal(res.data.data.total || res.data.data.length);
      setTotalPages(res.data.data.totalPages || 1);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi tải danh sách người dùng');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (deleteConfirm?.id !== userId) {
      setDeleteConfirm({ id: userId, username });
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`/system-users/${userId}`);
      // Refetch để cập nhật danh sách
      await fetchUsers();
      setDeleteConfirm(null);
      successToast(`Đã xóa người dùng: ${username}`);
    } catch (err) {
      errorToast(err.response?.data?.error || 'Lỗi khi xóa người dùng!');
      console.error('Delete user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    setLoading(true);
    try {
      await axios.put(`/system-users/${userId}`, {
        is_active: !currentStatus
      });
      // Refetch để cập nhật danh sách
      await fetchUsers();
    } catch (err) {
      errorToast(err.response?.data?.error || 'Lỗi khi cập nhật trạng thái!');
      console.error('Update status error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!hasRole('Admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-cyan-50 to-white">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h1>
          <p className="text-gray-600 mb-6">Chỉ Admin mới có thể quản lý tài khoản người dùng</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-cyan-50 to-white">
        <div className="text-center">
          <Loader size={48} className="mx-auto text-indigo-600 mb-4 animate-spin" />
          <p className="text-lg text-gray-600">Đang tải danh sách người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-700 tracking-tight mb-1 drop-shadow-sm">
              Quản lý Tài khoản Người dùng
            </h1>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo username hoặc tên nhân viên..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="md:col-span-1">
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Vô hiệu hóa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gradient-to-r from-indigo-50 to-cyan-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-700">Username</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Nhân viên</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Vai trò</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Trạng thái</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Lần đăng nhập cuối</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.system_user_id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-mono text-indigo-600 font-medium">{user.username}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.assetHolder?.full_name || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {user.assetHolder?.employee_code || '-'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                          user.user_role === 'Admin' 
                            ? 'bg-red-100 text-red-700' 
                            : user.user_role === 'Manager' 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.user_role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(user.system_user_id, user.is_active)}
                          className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1 transition ${
                            user.is_active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {user.is_active ? (
                            <>
                              <CheckCircle size={16} /> Hoạt động
                            </>
                          ) : (
                            <>
                              <EyeOff size={16} /> Vô hiệu
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.last_login ? new Date(user.last_login).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/employees/${user.asset_holder_id}`)}
                            disabled={!user.asset_holder_id}
                            title="Xem chi tiết nhân viên"
                            className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.system_user_id, user.username)}
                            title="Xóa tài khoản"
                            className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <Loader size={48} className="mx-auto text-indigo-600 mb-4 animate-spin" />
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                {debouncedSearch ? 'Không tìm thấy tài khoản phù hợp' : 'Chưa có tài khoản nào'}
              </p>
            </div>
          )}
          
          {/* Pagination */}
          {users.length > 0 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-indigo-50">
              <div className="text-sm text-gray-600">Tổng số: {total}</div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded border text-indigo-700 bg-white hover:bg-indigo-100 hover:text-indigo-900 disabled:opacity-50 font-medium text-sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Trước
                </button>
                <span className="px-2 py-1 text-sm font-medium">Trang {page} / {totalPages}</span>
                <button
                  className="px-3 py-1 rounded border text-indigo-700 bg-white hover:bg-indigo-100 hover:text-indigo-900 disabled:opacity-50 font-medium text-sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-red-50 px-8 py-6 border-b border-red-100">
              <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
                <AlertCircle size={24} /> Xác nhận xóa tài khoản
              </h3>
            </div>
            <div className="p-8 space-y-4">
              <p className="text-gray-700">
                Bạn có chắc chắn muốn xóa tài khoản <span className="font-bold text-red-600">{deleteConfirm.username}</span>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                <p className="font-medium mb-1">⚠️ Lưu ý:</p>
                <p>Hành động này không thể hoàn tác. Người dùng sẽ không thể đăng nhập lại.</p>
              </div>
            </div>
            <div className="px-8 py-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirm.id, deleteConfirm.username)}
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition disabled:opacity-60 flex items-center gap-2"
              >
                <Trash2 size={18} /> Xóa tài khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
