import { LayoutDashboard, Box, ShoppingCart, Users, User, Settings, Zap, Shield, FolderOpen, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminOnly } from './RoleGate';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [username, setUsername] = useState('');

  useEffect(() => {
    setUsername(user?.assetHolder?.full_name || user?.username || 'Người dùng');
  }, [user]);

  const handleLogout = () => {
    import('../api/axiosClient').then(m => m.default.post('/auth/logout'));
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="w-72 min-h-screen bg-slate-900 border-r border-slate-800 shadow-lg flex flex-col px-6 py-8 font-sans">
      <h1 className="text-2xl font-extrabold mb-10 text-cyan-400 text-center tracking-tight drop-shadow">ADMIN APP</h1>

      {/* User info with role badge */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full p-2 shadow">
          <User size={32} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm truncate text-white">{username}</div>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-200 hover:bg-slate-800 hover:text-cyan-400 transition group">
          <LayoutDashboard size={22} className="group-hover:text-cyan-400 transition" /> Dashboard
        </Link>

        <Link to="/purchase-orders" className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-200 hover:bg-slate-800 hover:text-cyan-400 transition group">
          <ShoppingCart size={22} className="group-hover:text-cyan-400 transition" /> Đơn đặt hàng
        </Link>

        <Link to="/assets" className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-200 hover:bg-slate-800 hover:text-cyan-400 transition group">
          <Box size={22} className="group-hover:text-cyan-400 transition" /> Quản lý Tài sản
        </Link>

        <Link to="/consumable-inventory" className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-200 hover:bg-slate-800 hover:text-cyan-400 transition group">
          <Package size={22} className="group-hover:text-cyan-400 transition" /> Vật tư Tiêu hao
        </Link>

        <Link to="/categories" className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-200 hover:bg-slate-800 hover:text-cyan-400 transition group">
          <FolderOpen size={22} className="group-hover:text-cyan-400 transition" /> Danh mục
        </Link>

        <Link to="/holders" className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-200 hover:bg-slate-800 hover:text-cyan-400 transition group">
          <Users size={22} className="group-hover:text-cyan-400 transition" /> Nhân viên
        </Link>

        {/* System Settings - Only for Admin */}
        <AdminOnly>
          <div className="pt-4 mt-6 border-t border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase px-4 mb-3">Quản lý hệ thống</p>
            <Link to="/system-users" className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-200 hover:bg-slate-800 hover:text-cyan-400 transition group">
              <Shield size={22} className="group-hover:text-cyan-400 transition" /> Tài khoản người dùng
            </Link>
          </div>
        </AdminOnly>
      </nav>

      <button
        onClick={handleLogout}
        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl font-semibold shadow transition mt-4 text-base"
      >
        Đăng xuất
      </button>
    </div>
  );
};
export default Sidebar;