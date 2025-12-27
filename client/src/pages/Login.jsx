import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Fake login: accept any username/password for demo
    if (username && password) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', username);
      navigate('/');
    } else {
      setError('Vui lòng nhập đầy đủ thông tin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">Đăng nhập</h2>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <input
          type="text"
          placeholder="Tên đăng nhập"
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit" className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition">Đăng nhập</button>
      </form>
    </div>
  );
};

export default Login;
