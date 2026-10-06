import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || !password) {
      setError('Please provide your MoES ID/email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await login(username, password);
      if (res.role === 'admin') {
        navigate('/admin');
      } else if (res.role === 'manager') {
        navigate('/manager');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError(err.message || 'Incorrect username or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-white border border-[#EDEBE6] rounded-2xl p-8 w-80 shadow-sm">
        <h1 className="text-lg font-bold text-[#14140F] mb-1">CAPACITY CONNECT</h1>
        <p className="text-xs text-[#5B5850] mb-6">MoES Administration Portal</p>

        <label className="block text-sm text-[#6B6B6F] mb-1">Email or Official ID</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-[#E7E5E2] rounded-lg px-3 py-2 mb-4 text-sm text-[#1C1C1E] focus:outline-none focus:border-[#14140F] transition-colors"
          placeholder="admin@imd.gov.in"
          disabled={loading}
        />

        <label className="block text-sm text-[#6B6B6F] mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-[#E7E5E2] rounded-lg px-3 py-2 mb-4 text-sm text-[#1C1C1E] focus:outline-none focus:border-[#1F3A5F] transition-colors"
          placeholder="••••••••"
          disabled={loading}
        />

        {error && <p className="text-[#C1443A] text-sm mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#14140F] text-white text-sm font-semibold py-3 rounded-full hover:bg-[#2B2A24] transition-colors disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Log in'}
        </button>

        <div className="text-xs text-[#9B9B9E] mt-4 space-y-1">
          <p>Admin: admin@imd.gov.in / admin123</p>
          <p>Trainer: roy@imd.gov.in / password123</p>
        </div>
      </form>
    </div>
  );
}

export default Login;