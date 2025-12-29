import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    try {
      const res = await import('../api/axiosClient').then(m => m.default.post('/auth/login', { username, password }));
      // Không cần lưu token, token đã ở httpOnly cookie
      localStorage.setItem('username', username);
      navigate('/');
    } catch (err) {
      setError('Sai tên đăng nhập hoặc mật khẩu!');
    }
  };

  return (
       <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-6 border border-gray-100">
        <h2 className="text-3xl font-bold text-indigo-700 mb-2 text-center drop-shadow">Đăng nhập hệ thống</h2>
        {error && <div className="text-red-500 text-base mb-2 text-center bg-red-50 border border-red-200 rounded-lg py-2 px-3">{error}</div>}
        <input
          type="text"
          placeholder="Tên đăng nhập"
          className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-base"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
          <button type="submit" className="bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 transition text-lg font-semibold shadow">Đăng nhập</button>
      </form>
    </div>
  );
};

export default Login;
