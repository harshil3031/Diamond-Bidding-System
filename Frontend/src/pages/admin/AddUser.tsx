import { useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../api/axios';

const AddUser = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'USER'>('USER');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!name || !email || !password) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);

      await api.post('/users', {
        name,
        email,
        password,
        role,
      });

      setSuccess('User created successfully 🎉');
      setName('');
      setEmail('');
      setPassword('');
      setRole('USER');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to create user'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-black">
          Add New User
        </h1>

        {error && (
          <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-2 text-sm text-green-600 bg-green-50 rounded">
            {success}
          </div>
        )}

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Name
            </label>
            <input
              className="w-full border p-2 rounded focus:ring-2 focus:ring-accent text-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-accent text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@email.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-accent text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Role
            </label>
            <select
              className="w-full border p-2 rounded focus:ring-2 focus:ring-accent text-black"
              value={role}
              onChange={(e) =>
                setRole(e.target.value as 'ADMIN' | 'USER')
              }
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2 bg-accent text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddUser;
