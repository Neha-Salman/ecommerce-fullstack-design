import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const Login = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      onNavigate('home'); // Redirect to homepage on successful login
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[420px] mx-auto my-10 p-6 bg-white border border-[#DEE2E7] rounded-lg card-shadow">
      <h2 className="text-2xl font-bold text-[#1C1C1C] text-center mb-6">Sign In</h2>

      {error && (
        <div className="bg-[#FFF0DF] border border-[#FF9017] text-[#D8000C] text-sm rounded-md p-3 mb-4 flex items-start gap-2">
          <span className="font-bold flex-shrink-0">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#505050] mb-1">Email Address</label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-[#DEE2E7] rounded-md outline-none text-sm text-[#1C1C1C] focus:border-brand-blue"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#505050] mb-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-[#DEE2E7] rounded-md outline-none text-sm text-[#1C1C1C] focus:border-brand-blue"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white font-semibold text-sm py-2.5 rounded-md transition-colors shadow-sm disabled:opacity-75 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Signing In...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-[#EFF2F4] text-center text-xs text-[#8B96A5]">
        <span>Don't have an account? </span>
        <button onClick={() => onNavigate('register')} className="text-[#0D6EFD] font-semibold hover:underline">
          Register Here
        </button>
      </div>
    </div>
  );
};

export default Login;
