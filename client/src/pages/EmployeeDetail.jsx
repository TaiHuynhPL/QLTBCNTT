import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Briefcase, User, ShieldCheck, 
  Monitor, Key, Save, X 
} from 'lucide-react';
import { EMPLOYEES_MOCK, ASSETS_HELD_MOCK } from './data/mockEmployeeData';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State giả lập lấy data
  const [employee, setEmployee] = useState(EMPLOYEES_MOCK.find(e => String(e.asset_holder_id) === String(id)));
  
  // State cho Modal tạo System User
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    role: 'Staff'
  });

  if (!employee) return <div>Không tìm thấy nhân viên</div>;

  // Xử lý tạo tài khoản System User
  const handleCreateSystemUser = (e) => {
    e.preventDefault();
    // Logic Call API: POST /api/system-users { asset_holder_id: id, ... }
    
    // Giả lập update state local
    const newSystemUser = {
      system_user_id: Date.now(),
      username: userForm.username,
      user_role: userForm.role,
      last_login: null
    };
    
    setEmployee({ ...employee, system_user: newSystemUser });
    setShowUserModal(false);
    alert(`Đã cấp tài khoản thành công cho ${employee.full_name}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors font-medium">
        <ArrowLeft size={20} className="mr-2" /> Quay lại
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Employee Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="bg-indigo-600 h-24"></div>
            <div className="px-6 pb-6 relative">
              <div className="absolute -top-12 left-6 w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center text-3xl font-bold text-indigo-600 shadow-md">
                 {employee.full_name.charAt(0)}
              </div>
              <div className="mt-14">
                <h1 className="text-xl font-bold text-gray-900">{employee.full_name}</h1>
                <p className="text-gray-500 text-sm">{employee.job_title}</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600 border-b border-gray-100 pb-2">
                    <Briefcase size={16} className="text-gray-400"/>
                    <span>{employee.department}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 border-b border-gray-100 pb-2">
                    <User size={16} className="text-gray-400"/>
                    <span className="font-mono">{employee.employee_code}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail size={16} className="text-gray-400"/>
                    <a href={`mailto:${employee.email}`} className="text-indigo-600 hover:underline">{employee.email}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Account Card */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-indigo-500"/> Tài khoản hệ thống
            </h3>
            
            {employee.system_user ? (
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Đã kích hoạt</span>
                  <button className="text-xs text-indigo-600 hover:underline">Reset Pass</button>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Username: <span className="font-medium text-gray-900">{employee.system_user.username}</span></p>
                  <p className="text-sm text-gray-600">Role: <span className="font-medium text-gray-900">{employee.system_user.user_role}</span></p>
                  <p className="text-xs text-gray-400 mt-2">Last login: {employee.system_user.last_login || 'Chưa đăng nhập'}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
                <p className="text-sm text-gray-500 mb-3">Nhân viên này chưa có tài khoản đăng nhập.</p>
                <button 
                  onClick={() => {
                    setUserForm({ ...userForm, username: employee.email.split('@')[0] }); // Auto suggest username
                    setShowUserModal(true);
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2 mx-auto"
                >
                  <Key size={16} /> Cấp quyền truy cập
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Assets Held */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Monitor size={20} className="text-gray-500"/> Tài sản đang giữ ({ASSETS_HELD_MOCK.length})
            </h3>
            
            {ASSETS_HELD_MOCK.length > 0 ? (
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-500">Mã tài sản</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Tên thiết bị</th>
                      <th className="px-4 py-3 font-medium text-gray-500 text-right">Ngày nhận</th>
                      <th className="px-4 py-3 font-medium text-gray-500 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ASSETS_HELD_MOCK.map((asset) => (
                      <tr key={asset.asset_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-indigo-600">{asset.tag}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{asset.asset_name}</td>
                        <td className="px-4 py-3 text-right text-gray-500">{asset.date_assigned}</td>
                        <td className="px-4 py-3 text-center">
                          <button className="text-xs text-red-600 hover:text-red-800 hover:underline">Thu hồi</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">Hiện không giữ tài sản nào.</p>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL TẠO SYSTEM USER --- */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Tạo tài khoản hệ thống</h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleCreateSystemUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input 
                  type="text" 
                  required
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500"
                  value={userForm.username}
                  onChange={e => setUserForm({...userForm, username: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500"
                  placeholder="Nhập mật khẩu khởi tạo"
                  value={userForm.password}
                  onChange={e => setUserForm({...userForm, password: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role (Vai trò)</label>
                <select 
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500"
                  value={userForm.role}
                  onChange={e => setUserForm({...userForm, role: e.target.value})}
                >
                  <option value="Staff">Staff (Chỉ xem tài sản cá nhân)</option>
                  <option value="Manager">Manager (Quản lý & Duyệt)</option>
                  <option value="Admin">Admin (Toàn quyền)</option>
                </select>
              </div>

              <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-xs text-yellow-800">
                Lưu ý: Tài khoản này sẽ được liên kết trực tiếp với nhân viên <b>{employee.full_name}</b>.
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium flex items-center gap-2">
                  <Save size={16}/> Lưu tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}