import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      if (result.user && result.user.is_admin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="glass-card w-full max-w-md p-8 rounded-2xl shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500 border border-white/10">

        {/* Photo/Icon Circle */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center shadow-xl overflow-hidden relative group">
            <img
              src={require('../assets/logo.png')}
              alt="GlobeTrotter"
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/0 transition-colors"></div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl glass-input bg-slate-800/50 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-center placeholder-gray-500"
              placeholder="Username"
              required
            />
          </div>

          <div className="space-y-1">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl glass-input bg-slate-800/50 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-center placeholder-gray-500"
              placeholder="Password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-white text-slate-900 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-70 mt-4 mx-auto block max-w-[120px]"
          >
            {loading ? 'Logging in...' : 'Login Button'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link to="/register" className="text-gray-400 hover:text-white transition-colors">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
