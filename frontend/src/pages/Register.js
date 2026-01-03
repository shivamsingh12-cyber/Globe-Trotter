import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    password: '',
    confirmPassword: '',
    additional_info: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...registrationData } = formData;
    const result = await register(registrationData);

    if (result.success) {
      navigate('/dashboard');
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

      <div className="glass-card w-full max-w-2xl p-8 md:p-10 rounded-2xl shadow-2xl relative z-10 border border-white/10">

        {/* Photo Circle */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center shadow-xl overflow-hidden relative group">
            <img
              src={require('../assets/logo.png')}
              alt="GlobeTrotter"
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-purple-500/10 group-hover:bg-purple-500/0 transition-colors"></div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 justify-center">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="glass-input w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-500"
              placeholder="First Name"
              required
            />
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="glass-input w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-500"
              placeholder="Last Name"
              required
            />
          </div>

          {/* Row 2: Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="glass-input w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-500"
              placeholder="Email Address"
              required
            />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="glass-input w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-500"
              placeholder="Phone Number"
            />
          </div>

          {/* Row 3: Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="glass-input w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-500"
              placeholder="City"
            />
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="glass-input w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-500"
              placeholder="Country"
            />
          </div>

          {/* Row 4: Passwords (Hidden in wireframe but needed) or maybe implied? 
                    I'll add them as a compact row to not break the layout heavily but ensure functionality.
                */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="glass-input w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-500"
              placeholder="Password"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="glass-input w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-500"
              placeholder="Confirm Password"
              required
            />
          </div>

          {/* Additional Info */}
          <div>
            <textarea
              name="additional_info"
              value={formData.additional_info}
              onChange={handleChange}
              className="glass-input w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-500 min-h-[100px]"
              placeholder="Additional Information ..."
            ></textarea>
          </div>

          <div className="flex flex-col items-center mt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2 bg-white text-slate-900 font-bold rounded-lg shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Register Users'}
            </button>

            <p className="mt-4 text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-white transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
