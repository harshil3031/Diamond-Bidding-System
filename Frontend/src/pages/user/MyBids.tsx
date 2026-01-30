import { useEffect, useState } from 'react';
import UserLayout from '../../components/layout/UserLayout';
import api from '../../api/axios';

interface Diamond {
  id: string;
  name: string;
  image_url?: string;
}

interface BidInfo {
  id: string;
  status: string;
  base_bid_price: string;
  start_time: string;
  end_time: string;
  diamond: Diamond | null;
}

interface MyBid {
  id: string;
  user_id: string;
  bid_id: string;
  amount: string;
  created_at: string;
  updated_at: string;
  bid: BidInfo | null;
}

const MyBids = () => {
  const [bids, setBids] = useState<MyBid[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBid, setSelectedBid] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const fetchMyBids = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/my-bids');
      setBids(res.data.data || []);
    } catch (error: any) {
      console.error('Error fetching bids:', error);
      alert(error.response?.data?.message || 'Failed to fetch your bids');
      setBids([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBidHistory = async (userBidId: string) => {
    try {
      const res = await api.get(`/users/bids/${userBidId}/history`);
      setHistory(res.data.data || []);
      setSelectedBid(userBidId);
    } catch (error: any) {
      console.error('Error fetching history:', error);
      alert('Failed to fetch bid history');
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    fetchMyBids();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchMyBids();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">My Bids</h1>
            <p className="text-slate-600 mt-1">Track all your placed bids</p>
          </div>
          <button
            onClick={fetchMyBids}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">
            <div className="text-4xl mb-4">⏳</div>
            <p>Loading your bids...</p>
          </div>
        ) : bids.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No Bids Yet
            </h3>
            <p className="text-slate-600 mb-6">
              You haven't placed any bids yet. Start bidding on active auctions!
            </p>
            <a
              href="/user/dashboard"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Browse Active Auctions
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-700">#</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Diamond</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Your Bid</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Base Price</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Last Updated</th>
                    <th className="text-center p-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((bid, index) => (
                    <tr
                      key={bid.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-4 text-slate-600">{index + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {bid.bid?.diamond?.image_url ? (
                            <img
                              src={bid.bid.diamond.image_url}
                              alt={bid.bid.diamond.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-xl">
                              💎
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-800">
                              {bid.bid?.diamond?.name || 'Unknown Diamond'}
                            </p>
                            <p className="text-xs text-slate-500 font-mono">
                              {bid.bid_id.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            bid.bid?.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700'
                              : bid.bid?.status === 'CLOSED'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {bid.bid?.status || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-green-600 text-lg">
                          ₹{parseFloat(bid.amount).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">
                        ₹{bid.bid?.base_bid_price ? parseFloat(bid.bid.base_bid_price).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-4 text-slate-600 text-sm">
                        {formatDateTime(bid.updated_at)}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => fetchBidHistory(bid.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          View History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bid History Modal */}
        {selectedBid && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-800">Bid History</h2>
                  <button
                    onClick={() => setSelectedBid(null)}
                    className="text-slate-500 hover:text-slate-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-96">
                {history.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">
                    No bid history available
                  </p>
                ) : (
                  <div className="space-y-4">
                    {history.map((h, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 p-4 rounded-lg border border-slate-200"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-slate-600">Updated from</p>
                            <p className="text-lg font-semibold text-red-600">
                              ₹{parseFloat(h.old_amount).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-2xl text-slate-400">→</div>
                          <div className="text-right">
                            <p className="text-sm text-slate-600">Updated to</p>
                            <p className="text-lg font-semibold text-green-600">
                              ₹{parseFloat(h.new_amount).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          {formatDateTime(h.edited_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-slate-200">
                <button
                  onClick={() => setSelectedBid(null)}
                  className="w-full px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {bids.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
              <p className="text-slate-600 text-sm">Total Bids Placed</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{bids.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
              <p className="text-slate-600 text-sm">Total Amount Bid</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ₹{bids.reduce((sum, bid) => sum + parseFloat(bid.amount), 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
              <p className="text-slate-600 text-sm">Highest Bid</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                ₹{Math.max(...bids.map(b => parseFloat(b.amount))).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default MyBids;
