import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../api/axios';

interface DashboardStats {
  totalDiamonds: number;
  activeBids: number;
  completedBids: number;
  totalUsers: number;
  activeUsers: number;
  pendingBids: number;
}

interface RecentBid {
  id: string;
  status: string;
  start_time: string;
  end_time: string;
  created_at: string;
  diamond?: {
    name?: string;
  } | null;
}

interface RecentUser {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalDiamonds: 0,
    activeBids: 0,
    completedBids: 0,
    totalUsers: 0,
    activeUsers: 0,
    pendingBids: 0,
  });
  const [recentBids, setRecentBids] = useState<RecentBid[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [diamondsRes, bidsRes, usersRes] = await Promise.all([
        api.get('/admin/diamonds'),
        api.get('/admin/bids'),
        api.get('/users'),
      ]);

      const diamonds = diamondsRes.data.data || [];
      const bids = bidsRes.data.data || [];
      const users = usersRes.data.data || [];

      // Calculate statistics
      const activeBids = bids.filter((bid: any) => bid.status === 'ACTIVE').length;
      const completedBids = bids.filter((bid: any) => bid.status === 'CLOSED').length;
      const pendingBids = bids.filter((bid: any) => bid.status === 'DRAFT').length;
      const activeUsers = users.filter((user: any) => user.is_active).length;

      setStats({
        totalDiamonds: diamonds.length,
        activeBids,
        completedBids,
        totalUsers: users.length,
        activeUsers,
        pendingBids,
      });

      // Get recent bids (last 5)
      const sortedBids = [...bids].sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRecentBids(sortedBids.slice(0, 5));

      // Get recent users (last 5)
      const sortedUsers = [...users].sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRecentUsers(sortedUsers.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-blue-100 text-blue-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-slate-600">Loading dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <div className="text-sm text-slate-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Diamonds */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Diamonds</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">{stats.totalDiamonds}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/diamonds')}
              className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View all diamonds →
            </button>
          </div>

          {/* Active Bids */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Active Bids</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeBids}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/bids')}
              className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Monitor bids →
            </button>
          </div>

          {/* Completed Bids */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Completed Bids</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.completedBids}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/results')}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View results →
            </button>
          </div>

          {/* Total Users */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">{stats.totalUsers}</p>
                <p className="text-sm text-slate-500 mt-1">
                  {stats.activeUsers} active
                </p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/users')}
              className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Manage users →
            </button>
          </div>

          {/* Pending Bids */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Pending Bids</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingBids}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/bids')}
              className="mt-4 text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            >
              View pending →
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-lg shadow-md text-white hover:shadow-lg transition-shadow">
            <div className="mb-4">
              <p className="text-slate-300 text-sm font-medium">Quick Actions</p>
              <p className="text-white text-lg font-semibold mt-2">Manage System</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/admin/diamonds')}
                className="w-full text-left px-3 py-2 text-white bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
              >
                + Add Diamond
              </button>
              <button
                onClick={() => navigate('/admin/bids')}
                className="w-full text-left px-3 py-2 text-white bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
              >
                + Create Bid
              </button>
              <button
                onClick={() => navigate('/admin/users/add')}
                className="w-full text-left px-3 py-2 text-white bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
              >
                + Add User
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activities Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bids */}
          <div className="bg-white rounded-lg shadow-md border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Recent Bids</h2>
                <button
                  onClick={() => navigate('/admin/bids')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all
                </button>
              </div>
            </div>
            <div className="p-6">
              {recentBids.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No bids available</p>
              ) : (
                <div className="space-y-4">
                  {recentBids.map((bid) => (
                    <div
                      key={bid.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => navigate('/admin/monitor')}
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">
                          {bid.diamond?.name || 'Diamond Auction'}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {formatDate(bid.start_time)} - {formatDate(bid.end_time)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                          bid.status
                        )}`}
                      >
                        {bid.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-md border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Recent Users</h2>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all
                </button>
              </div>
            </div>
            <div className="p-6">
              {recentUsers.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No users available</p>
              ) : (
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{user.name}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            user.is_active ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        ></span>
                        <span className="text-xs text-slate-500">
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
