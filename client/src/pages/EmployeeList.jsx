import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, User, Shield, UserX, UserCheck, Eye 
} from 'lucide-react';
import { EMPLOYEES_MOCK } from './data/mockEmployeeData';

export default function EmployeeList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter logic
  const filteredData = EMPLOYEES_MOCK.filter(emp => 
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách Nhân viên</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý nhân sự và phân quyền hệ thống</p>
        </div>
        <button onClick={() => navigate('/holders/new')} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition-all">
          <Plus size={18} /> Thêm nhân viên mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm tên, mã nhân viên..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Nhân viên</th>
              <th className="px-6 py-4 font-semibold">Phòng ban / Chức vụ</th>
              <th className="px-6 py-4 font-semibold">Tài khoản hệ thống</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((emp) => (
              <tr key={emp.asset_holder_id} className="hover:bg-gray-50 transition-colors">
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
                    className="text-gray-400 hover:text-indigo-600 p-1 rounded hover:bg-indigo-50 transition-colors"
                  >
                    <Eye size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}