import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosClient';
import { 
  ArrowLeft, Save, User, Mail, Briefcase, 
  Shield, Key, CheckCircle, AlertCircle, UserPlus 
} from 'lucide-react';

export default function EmployeeForm() {
  const navigate = useNavigate();

  // --- STATE QUẢN LÝ FORM ---
  
  // 1. Thông tin nhân viên (Bảng asset_holders)
  const [empData, setEmpData] = useState({
    employee_code: '',
    full_name: '',
    email: '',
    department: '',
    job_title: ''
  });

  // 2. Tùy chọn tạo System User
  const [createAccount, setCreateAccount] = useState(false);
  
  // 3. Thông tin tài khoản (Bảng system_users)
  const [accountData, setAccountData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'Staff' // Default role
  });

  // State thông báo
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // --- LOGIC ---

  // Tự động điền Username khi nhập Email (User Experience)
  useEffect(() => {
    if (empData.email && !accountData.username) {
      const suggestedUser = empData.email.split('@')[0];
      setAccountData(prev => ({ ...prev, username: suggestedUser }));
    }
  }, [empData.email]);

  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 1. Validate Basic
    if (!empData.employee_code || !empData.full_name) {
      setError('Vui lòng nhập Mã nhân viên và Họ tên.');
      setLoading(false);
      return;
    }

    // 2. Validate System User (Nếu có tick chọn)
    if (createAccount) {
      if (!accountData.username || !accountData.password) {
        setError('Vui lòng nhập Username và Mật khẩu cho tài khoản hệ thống.');
        setLoading(false);
        return;
      }
      if (accountData.password !== accountData.confirmPassword) {
        setError('Mật khẩu xác nhận không khớp.');
        setLoading(false);
        return;
      }
      if (accountData.password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự.');
        setLoading(false);
        return;
      }
    }

    try {
      // 3. Gửi API tạo asset_holder
      const holderRes = await axios.post('/holders', empData);
      // 4. Nếu có tạo tài khoản, gửi tiếp API tạo system_user
      if (createAccount) {
        await axios.post('/system-users', {
          asset_holder_id: holderRes.data.asset_holder_id,
          username: accountData.username,
          password: accountData.password,
          role: accountData.role
        });
      }
      setSuccess(true);
      setTimeout(() => {
        navigate('/employees');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi lưu nhân viên hoặc tài khoản!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans">
      
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> Quay lại danh sách
        </button>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 flex justify-center items-center gap-2">
          <UserPlus size={32} className="text-indigo-600"/> Thêm Nhân viên mới
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Nhập thông tin nhân sự và cấp quyền truy cập (tùy chọn)
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          
          {/* Thông báo lỗi/thành công */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
              <AlertCircle size={20} /> {error}
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center gap-2">
              <CheckCircle size={20} /> Lưu thành công! Đang chuyển hướng...
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            
            {/* SECTION 1: THÔNG TIN NHÂN VIÊN */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2 mb-4">
                1. Thông tin cá nhân
              </h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                
                {/* Mã NV */}
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Mã nhân viên <span className="text-red-500">*</span></label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="VD: EMP-001"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                      value={empData.employee_code}
                      onChange={(e) => setEmpData({...empData, employee_code: e.target.value})}
                    />
                  </div>
                </div>

                {/* Họ tên */}
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                      value={empData.full_name}
                      onChange={(e) => setEmpData({...empData, full_name: e.target.value})}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="sm:col-span-4">
                  <label className="block text-sm font-medium text-gray-700">Email công ty</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      placeholder="user@company.com"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                      value={empData.email}
                      onChange={(e) => setEmpData({...empData, email: e.target.value})}
                    />
                  </div>
                </div>

                {/* Phòng ban & Chức vụ */}
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Phòng ban</label>
                  <select
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={empData.department}
                    onChange={(e) => setEmpData({...empData, department: e.target.value})}
                  >
                    <option value="">-- Chọn phòng --</option>
                    <option value="IT Software">IT Software</option>
                    <option value="IT Infra">IT Infra</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Sales">Sales</option>
                    <option value="Accounting">Accounting</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Chức vụ</label>
                  <input
                    type="text"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                    value={empData.job_title}
                    onChange={(e) => setEmpData({...empData, job_title: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: TÀI KHOẢN HỆ THỐNG */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
                  <Shield size={20} className="text-indigo-600"/> 2. Tài khoản đăng nhập
                </h3>
                
                {/* Toggle Switch */}
                <div className="flex items-center">
                  <span className="mr-3 text-sm font-medium text-gray-900">
                    {createAccount ? 'Cấp tài khoản ngay' : 'Không tạo tài khoản'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCreateAccount(!createAccount)}
                    className={`${createAccount ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                  >
                    <span
                      className={`${createAccount ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>
              </div>

              {/* Conditional Form Fields */}
              {createAccount && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 animate-fade-in-down">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Username <span className="text-red-500">*</span></label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          required
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                          value={accountData.username}
                          onChange={(e) => setAccountData({...accountData, username: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Vai trò (Role) <span className="text-red-500">*</span></label>
                      <select
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={accountData.role}
                        onChange={(e) => setAccountData({...accountData, role: e.target.value})}
                      >
                        <option value="Staff">Staff (Nhân viên thường)</option>
                        <option value="Manager">Manager (Quản lý)</option>
                        <option value="Admin">Admin (Quản trị viên)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Mật khẩu <span className="text-red-500">*</span></label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Key className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          required
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                          value={accountData.password}
                          onChange={(e) => setAccountData({...accountData, password: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Nhập lại mật khẩu <span className="text-red-500">*</span></label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Key className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          required
                          className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border
                            ${accountData.confirmPassword && accountData.password !== accountData.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                          `}
                          value={accountData.confirmPassword}
                          onChange={(e) => setAccountData({...accountData, confirmPassword: e.target.value})}
                        />
                      </div>
                      {accountData.confirmPassword && accountData.password !== accountData.confirmPassword && (
                        <p className="mt-1 text-xs text-red-600">Mật khẩu không khớp!</p>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/employees')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2 disabled:opacity-60"
                disabled={loading}
              >
                <Save size={18} /> {loading ? 'Đang lưu...' : 'Lưu Nhân Viên'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}