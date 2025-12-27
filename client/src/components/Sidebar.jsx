
import { LayoutDashboard, Box, ShoppingCart, Users, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Sidebar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  useEffect(() => {
    setUsername(localStorage.getItem('username') || 'Người dùng');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="w-64 bg-slate-900 text-white p-6 flex flex-col h-screen">
      <h1 className="text-xl font-bold mb-10 text-blue-400 text-center">UIT ASSET MGMT</h1>
      {/* User info */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="bg-blue-500 rounded-full p-2">
          <User size={28} />
        </div>
        <span className="font-semibold text-lg truncate">{username}</span>
      </div>
      <nav className="space-y-4 flex-1">
        <Link to="/" className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded">
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link to="/assets" className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded">
          <Box size={20} /> Quản lý Tài sản
        </Link>
        <Link to="/purchase-orders" className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded">
          <ShoppingCart size={20} /> Đơn đặt hàng
        </Link>
        <Link to="/holders" className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded">
          <Users size={20} /> Nhân viên
        </Link>
      </nav>
      <button
        onClick={handleLogout}
        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition mt-8"
        style={{ marginTop: 'auto' }}
      >
        Đăng xuất
      </button>
    </div>
  );
};
export default Sidebar;