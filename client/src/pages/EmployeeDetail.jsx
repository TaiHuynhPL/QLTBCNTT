import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Briefcase, User, ShieldCheck, 
  Monitor, Key, Save, X 
} from 'lucide-react';
import axios from '../api/axiosClient';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [employee, setEmployee] = useState(null);
  const [assetsHeld, setAssetsHeld] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      axios.get(`/holders/${id}`),
      axios.get(`/assets/holder/${id}`)
    ])
      .then(([empRes, assetsRes]) => {
        setEmployee(empRes.data.data);
        setAssetsHeld(assetsRes.data.data);
      })
      .catch(() => setError('Không tìm thấy nhân viên'))
      .finally(() => setLoading(false));
  }, [id]);
  
  // State cho Modal tạo System User
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    role: 'Staff'
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-cyan-50 to-white animate-pulse">
      <span className="text-lg text-gray-500 font-medium">Đang tải dữ liệu...</span>
    </div>
  );
  if (error || !employee) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-cyan-50 to-white">
      <span className="text-lg text-red-500 font-medium">{error || 'Không tìm thấy nhân viên'}</span>
    </div>
  );

  // Xử lý tạo tài khoản System User
  const handleCreateSystemUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/system-users', {
        asset_holder_id: id,
        username: userForm.username,
        password: userForm.password,
        role: userForm.role
      });
      // Nếu API trả về user mới, cập nhật luôn, tránh GET lại
      if (res.data.data) {
        setEmployee(prev => ({ ...prev, system_user: res.data.data }));
      } else {
        // fallback: refresh employee info
        const getRes = await axios.get(`/holders/${id}`);
        setEmployee(getRes.data.data);
      }
      setShowUserModal(false);
      alert(`Đã cấp tài khoản thành công cho ${employee.full_name}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi cấp tài khoản!');
      alert(err.response?.data?.error || 'Lỗi khi cấp tài khoản!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-8 font-sans">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-indigo-600 mb-8 transition-colors font-medium">
        <ArrowLeft size={20} className="mr-2" /> Quay lại
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Employee Info */}

        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="bg-indigo-500 h-24"></div>
            <div className="flex flex-col items-center px-8 pb-8 relative">
              <div className="-mt-14 mb-2 w-28 h-28 rounded-full border-4 border-white bg-white flex items-center justify-center text-4xl font-bold text-indigo-600 shadow-lg">
                {employee.full_name.charAt(0)}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 text-center mt-2">{employee.full_name}</h1>
              <p className="text-gray-500 text-base text-center">{employee.job_title}</p>
              <div className="mt-6 space-y-4 w-full">
                <div className="flex items-center gap-3 text-base text-gray-600 border-b border-gray-100 pb-2">
                  <Briefcase size={18} className="text-gray-400"/>
                  <span>{employee.department}</span>
                </div>
                <div className="flex items-center gap-3 text-base text-gray-600 border-b border-gray-100 pb-2">
                  <User size={18} className="text-gray-400"/>
                  <span className="font-mono">{employee.employee_code}</span>
                </div>
                <div className="flex items-center gap-3 text-base text-gray-600">
                  <Mail size={18} className="text-gray-400"/>
                  <a href={`mailto:${employee.email}`} className="text-indigo-600 hover:underline">{employee.email}</a>
                </div>
              </div>
            </div>
          </div>

          {/* System Account Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
            <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2 text-lg">
              <ShieldCheck size={22} className="text-indigo-500"/> Tài khoản hệ thống
            </h3>
            {employee.system_user ? (
              <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Đã kích hoạt</span>
                  <button className="text-xs text-indigo-600 hover:underline">Reset Pass</button>
                </div>
                <div className="space-y-1">
                  <p className="text-base text-gray-600">Username: <span className="font-medium text-gray-900">{employee.system_user.username}</span></p>
                  <p className="text-base text-gray-600">Role: <span className="font-medium text-gray-900">{employee.system_user.user_role}</span></p>
                  <p className="text-xs text-gray-400 mt-2">Last login: {employee.system_user.last_login || 'Chưa đăng nhập'}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                <p className="text-base text-gray-500 mb-4">Nhân viên này chưa có tài khoản đăng nhập.</p>
                <button 
                  onClick={() => {
                    setUserForm({ ...userForm, username: employee.email.split('@')[0] });
                    setShowUserModal(true);
                  }}
                  className="bg-indigo-500 text-white px-6 py-2 rounded-lg text-base font-medium hover:bg-indigo-600 transition flex items-center gap-2 mx-auto shadow"
                >
                  <Key size={18} /> Cấp quyền truy cập
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Assets Held */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Monitor size={22} className="text-cyan-500"/> Tài sản đang giữ ({assetsHeld.length})
            </h3>
            {assetsHeld.length > 0 ? (
              <div className="overflow-hidden border border-gray-100 rounded-xl">
                <table className="w-full text-left text-base">
                  <thead className="bg-gradient-to-r from-indigo-50 to-cyan-50">
                    <tr>
                      <th className="px-5 py-3 font-semibold text-gray-500">Mã tài sản</th>
                      <th className="px-5 py-3 font-semibold text-gray-500">Tên thiết bị</th>
                      <th className="px-5 py-3 font-semibold text-gray-500 text-right">Ngày nhận</th>
                      <th className="px-5 py-3 font-semibold text-gray-500 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {assetsHeld.map((asset) => (
                      <tr key={asset.asset_id} className="hover:bg-cyan-50">
                        <td className="px-5 py-3 font-mono text-indigo-600">{asset.tag}</td>
                        <td className="px-5 py-3 font-medium text-gray-900">{asset.asset_name}</td>
                        <td className="px-5 py-3 text-right text-gray-500">{asset.date_assigned}</td>
                        <td className="px-5 py-3 text-center">
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 px-8 py-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-lg">Tạo tài khoản hệ thống</h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600"><X size={22}/></button>
            </div>
            <form onSubmit={handleCreateSystemUser} className="p-8 space-y-5">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Username</label>
                <input 
                  type="text" 
                  required
                  className="w-full border-gray-200 rounded-lg shadow-sm p-3 border focus:ring-2 focus:ring-indigo-400 focus:outline-none text-base"
                  value={userForm.username}
                  onChange={e => setUserForm({...userForm, username: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full border-gray-200 rounded-lg shadow-sm p-3 border focus:ring-2 focus:ring-indigo-400 focus:outline-none text-base"
                  placeholder="Nhập mật khẩu khởi tạo"
                  value={userForm.password}
                  onChange={e => setUserForm({...userForm, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Role (Vai trò)</label>
                <select 
                  className="w-full border-gray-200 rounded-lg shadow-sm p-3 border focus:ring-2 focus:ring-indigo-400 focus:outline-none text-base"
                  value={userForm.role}
                  onChange={e => setUserForm({...userForm, role: e.target.value})}
                >
                  <option value="Staff">Staff (Chỉ xem tài sản cá nhân)</option>
                  <option value="Manager">Manager (Quản lý & Duyệt)</option>
                  <option value="Admin">Admin (Toàn quyền)</option>
                </select>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-yellow-800">
                Lưu ý: Tài khoản này sẽ được liên kết trực tiếp với nhân viên <b>{employee.full_name}</b>.
              </div>
              <div className="pt-2 flex justify-end gap-4">
                <button type="button" onClick={() => setShowUserModal(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-base">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-lg hover:from-indigo-600 hover:to-cyan-600 font-medium flex items-center gap-2 shadow text-base">
                  <Save size={18}/> Lưu tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}