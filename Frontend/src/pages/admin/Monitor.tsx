import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../api/axios';

interface MonitorData {
  bid_id: string;
  status: string;
  start_time: string;
  end_time: string;
  diamond: any;
  highest_bid: {
    amount: string;
    user: any;
  } | null;
  all_bids: Array<{
    id: string;
    amount: string;
    user: any;
    created_at: string;
  }>;
  total_participants: number;
}

const Monitor = () => {
  const [data, setData] = useState<MonitorData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'CLOSED'>('ALL');
  const [expandedBid, setExpandedBid] = useState<string | null>(null);

  const fetchMonitorData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/monitor/bids');
      setData(res.data.data || []);
    } catch (error: any) {
      console.error('Error fetching monitor data:', error);
      alert(error.response?.data?.message || 'Failed to fetch monitor data');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter((bid) => {
    if (filter === 'ALL') return true;
    return bid.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    fetchMonitorData();
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchMonitorData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Bid Monitor</h1>
            <p className="text-slate-600 mt-1">Real-time monitoring of all bid activities</p>
          </div>
          <button
            onClick={fetchMonitorData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {['ALL', 'ACTIVE', 'CLOSED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Monitor Cards */}
        {loading && data.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <div className="text-4xl mb-4">⏳</div>
            <p>Loading monitor data...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No Bids to Monitor
            </h3>
            <p className="text-slate-600">
              {filter === 'ALL' ? 'No bids have been created yet.' : `No ${filter.toLowerCase()} bids found.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredData.map((bid) => (
              <div
                key={bid.bid_id}
                className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">
                        {bid.diamond?.name || 'Unknown Diamond'}
                      </h2>
                      <p className="text-sm text-slate-500 font-mono mt-1">
                        ID: {bid.bid_id.substring(0, 12)}...
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(bid.status)}`}
                    >
                      {bid.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Start Time:</span>
                      <span className="font-medium text-slate-800">
                        {formatDateTime(bid.start_time)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">End Time:</span>
                      <span className="font-medium text-slate-800">
                        {formatDateTime(bid.end_time)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total Bids:</span>
                      <span className="font-bold text-blue-600">
                        {bid.all_bids?.length || 0}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    {bid.highest_bid ? (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700 mb-1">Highest Bid</p>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{parseFloat(bid.highest_bid.amount).toLocaleString()}
                        </p>
                        <p className="text-sm text-green-700 mt-2">
                          by {bid.highest_bid.user?.name || 'Unknown'}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                        <p className="text-slate-500">No bids placed yet</p>
                      </div>
                    )}

                    {/* Live Bid Tracking */}
                    {bid.all_bids && bid.all_bids.length > 0 && (
                      <div className="mt-4">
                        <button
                          onClick={() => setExpandedBid(expandedBid === bid.bid_id ? null : bid.bid_id)}
                          className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-between font-medium text-slate-700"
                        >
                          <span>📊 View All Bids ({bid.all_bids.length})</span>
                          <span className="text-xl">{expandedBid === bid.bid_id ? '▼' : '▶'}</span>
                        </button>
                        
                        {expandedBid === bid.bid_id && (
                          <div className="mt-3 border border-slate-200 rounded-lg overflow-hidden">
                            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                              <h4 className="font-semibold text-slate-700">Live Bid Tracking</h4>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                              <table className="w-full">
                                <thead className="bg-slate-100 sticky top-0">
                                  <tr>
                                    <th className="text-left px-4 py-2 text-sm font-semibold text-slate-700">#</th>
                                    <th className="text-left px-4 py-2 text-sm font-semibold text-slate-700">User</th>
                                    <th className="text-left px-4 py-2 text-sm font-semibold text-slate-700">Email</th>
                                    <th className="text-right px-4 py-2 text-sm font-semibold text-slate-700">Amount</th>
                                    <th className="text-right px-4 py-2 text-sm font-semibold text-slate-700">Time</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {bid.all_bids
                                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                    .map((userBid, index) => {
                                      const isHighest = bid.highest_bid && userBid.amount === bid.highest_bid.amount;
                                      return (
                                        <tr
                                          key={userBid.id}
                                          className={`border-b border-slate-100 hover:bg-slate-50 ${
                                            isHighest ? 'bg-green-50' : ''
                                          }`}
                                        >
                                          <td className="px-4 py-3 text-sm text-slate-600">{index + 1}</td>
                                          <td className="px-4 py-3 text-sm font-medium text-slate-800">
                                            {userBid.user?.name || 'Unknown'}
                                            {isHighest && <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded">🏆 Highest</span>}
                                          </td>
                                          <td className="px-4 py-3 text-sm text-slate-600">{userBid.user?.email || 'N/A'}</td>
                                          <td className="px-4 py-3 text-right">
                                            <span className={`text-sm font-bold ${isHighest ? 'text-green-600' : 'text-slate-800'}`}>
                                              ₹{parseFloat(userBid.amount).toLocaleString()}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 text-right text-sm text-slate-600">
                                            {new Date(userBid.created_at).toLocaleString('en-US', {
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                              second: '2-digit'
                                            })}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
              <p className="text-slate-600 text-sm">Total Bids</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{data.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
              <p className="text-slate-600 text-sm">Active</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {data.filter((b) => b.status === 'ACTIVE').length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
              <p className="text-slate-600 text-sm">Closed</p>
              <p className="text-3xl font-bold text-gray-600 mt-2">
                {data.filter((b) => b.status === 'CLOSED').length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
              <p className="text-slate-600 text-sm">Total Participants</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {data.reduce((sum, b) => sum + (b.all_bids?.length || 0), 0)}
              </p>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Auto-refresh:</strong> This page automatically updates every 15 seconds to show real-time bid data.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Monitor;
