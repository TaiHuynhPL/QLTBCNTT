import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, User, Shield, UserX, UserCheck, Eye 
} from 'lucide-react';
import axios from '../api/axiosClient';

export default function EmployeeList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const debounceRef = useRef();

  const fetchEmployees = () => {
    setLoading(true);
    setError(null);
    axios.get('/holders', {
      params: {
        search: debouncedSearch || undefined,
        page,
        limit: 10
      }
    })
      .then(res => {
        setData(res.data.data.holders);
        setTotalPages(res.data.data.totalPages);
        setTotal(res.data.data.total);
      })
      .catch(err => setError(err.response?.data?.error || 'Không thể tải danh sách nhân viên'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line
  }, [debouncedSearch, page]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-700 tracking-tight mb-1 drop-shadow-sm">Danh sách Nhân viên</h1>
          <p className="text-gray-500 text-base md:text-lg">Quản lý nhân sự và phân quyền hệ thống</p>
        </div>
        <button onClick={() => navigate('/holders/new')} className="flex items-center gap-2 bg-indigo-500 text-white px-5 py-2 rounded-xl hover:bg-indigo-600 shadow-md transition-all font-semibold">
          <Plus size={18} /> Thêm nhân viên mới
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm tên, mã nhân viên..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-base"
              value={search}
              onChange={e => {
                setPage(1);
                setSearch(e.target.value);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setPage(1);
                  setDebouncedSearch(search);
                }
              }}
            />
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-indigo-50 text-indigo-700 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Nhân viên</th>
              <th className="px-6 py-4 font-semibold">Phòng ban / Chức vụ</th>
              <th className="px-6 py-4 font-semibold">Tài khoản hệ thống</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8">Đang tải dữ liệu...</td></tr>
            ) : error ? (
              <tr><td colSpan="5" className="text-center text-red-500 py-8">{error}</td></tr>
            ) : data.map((emp) => (
              <tr key={emp.asset_holder_id} className="hover:bg-indigo-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3">
                      {emp.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{emp.full_name}</div>
                      <div className="text-xs text-gray-500">{emp.employee_code} | {emp.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{emp.job_title}</div>
                  <div className="text-xs text-gray-500">{emp.department}</div>
                </td>
                <td className="px-6 py-4">
                  {emp.system_user ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                      ${emp.system_user.user_role === 'Admin' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}
                    `}>
                      {emp.system_user.user_role === 'Admin' ? <Shield size={12} className="mr-1"/> : <User size={12} className="mr-1"/>}
                      {emp.system_user.username} ({emp.system_user.user_role})
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                      <UserX size={12} className="mr-1"/> Chưa có TK
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {emp.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => navigate(`/employees/${emp.asset_holder_id}`)}
                    className="text-gray-400 hover:text-white hover:bg-indigo-500 p-1 rounded transition-colors"
                  >
                    <Eye size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 bg-indigo-50">
        <div className="text-sm text-gray-600">Tổng số: {total}</div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded border text-indigo-700 bg-white hover:bg-indigo-100 hover:text-indigo-900 disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Trước
          </button>
          <span className="px-2 py-1">Trang {page} / {totalPages}</span>
          <button
            className="px-3 py-1 rounded border text-indigo-700 bg-white hover:bg-indigo-100 hover:text-indigo-900 disabled:opacity-50"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}