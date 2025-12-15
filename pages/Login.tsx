import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MockAPI } from '../services/mockDb';
import { Button, Input } from '../components/UI';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await MockAPI.login(username, password);
      if (user) {
        login(user);
        navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
      } else {
        setError('Invalid credentials or account inactive.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-700 tracking-tight">PUZUR<span className="text-slate-900 ml-1">AESTHETIC</span></h1>
          <p className="text-slate-500 mt-2">Professional Distributor Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}
          
          <Input 
            label="Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            placeholder="Enter your username"
            required
            autoFocus
          />
          
          <Input 
            type="password"
            label="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="••••••••"
            required
          />

          <Button type="submit" className="w-full" disabled={loading} size="lg">
            {loading ? 'Authenticating...' : 'Secure Access'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
          <p>Restricted access only. Unauthorized attempts are logged.</p>
          <p className="mt-1">© 2024 Puzur Aesthetic Distribution</p>
        </div>
      </div>
    </div>
  );
};

export default Login;