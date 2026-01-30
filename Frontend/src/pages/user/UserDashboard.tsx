import { useEffect, useState } from 'react';
import UserLayout from '../../components/layout/UserLayout';
import api from '../../api/axios';

interface Diamond {
  id: string;
  name: string;
  image_url?: string;
  base_price: string;
}

interface ActiveBid {
  id: string;
  diamond_id: string;
  base_bid_price: string;
  start_time: string;
  end_time: string;
  status: string;
  time_remaining_ms?: number;
  statistics?: {
    total_participants: number;
    highest_bid: number;
    lowest_bid: number;
    average_bid: number;
  };
  Diamond?: Diamond;
}

const UserDashboard = () => {
  const [bids, setBids] = useState<ActiveBid[]>([]);
  const [amount, setAmount] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchActiveBids = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/bids/active');
      setBids(res.data.data || []);
    } catch (error: any) {
      console.error('Error fetching active bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const placeBid = async (bidId: string) => {
    if (!amount[bidId] || parseFloat(amount[bidId]) <= 0) {
      alert('Please enter a valid bid amount');
      return;
    }

    try {
      setSubmitting(bidId);
      await api.post('/users/bids', {
        bid_id: bidId,
        amount: amount[bidId],
      });
      alert('Bid placed successfully! 🎉');
      setAmount({ ...amount, [bidId]: '' });
      fetchActiveBids();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to place bid');
    } finally {
      setSubmitting(null);
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }
    return `${hours}h ${minutes}m remaining`;
  };

  useEffect(() => {
    fetchActiveBids();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchActiveBids, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Active Auctions</h1>
            <p className="text-slate-600 mt-1">Browse and place bids on active diamond auctions</p>
          </div>
          <button
            onClick={fetchActiveBids}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {loading && bids.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <div className="text-4xl mb-4">⏳</div>
            <p>Loading active auctions...</p>
          </div>
        ) : bids.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">💎</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No Active Auctions
            </h3>
            <p className="text-slate-600">
              There are no active auctions at the moment. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bids.map((bid) => (
              <div
                key={bid.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Diamond Image */}
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {bid.Diamond?.image_url ? (
                    <img
                      src={bid.Diamond.image_url}
                      alt={bid.Diamond.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl">💎</div>
                  )}
                </div>

                {/* Bid Details */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-2">
                    {bid.Diamond?.name || 'Diamond'}
                  </h2>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Base Price:</span>
                      <span className="font-semibold text-slate-800">
                        ₹{parseFloat(bid.base_bid_price).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Participants:</span>
                      <span className="font-semibold text-blue-600">
                        {bid.statistics?.total_participants || 0}
                      </span>
                    </div>

                    {/* {bid.statistics && bid.statistics.highest_bid > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Highest Bid:</span>
                        <span className="font-semibold text-green-600">
                          ₹{bid.statistics.highest_bid.toLocaleString()}
                        </span>
                      </div>
                    )} */}

                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex items-center text-sm text-orange-600">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{getTimeRemaining(bid.end_time)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bid Input */}
                  <div className="space-y-3">
                    <input
                      type="number"
                      className="w-full border border-slate-300 p-3 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Min: ₹${bid.base_bid_price}`}
                      value={amount[bid.id] || ''}
                      onChange={(e) =>
                        setAmount({ ...amount, [bid.id]: e.target.value })
                      }
                      min={bid.base_bid_price}
                      disabled={submitting === bid.id}
                    />

                    <button
                      onClick={() => placeBid(bid.id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      disabled={submitting === bid.id}
                    >
                      {submitting === bid.id ? 'Placing Bid...' : 'Place Bid 💎'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Banner */}
        {bids.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Bidding Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Your bid must be equal to or greater than the base price</li>
              <li>You can update your bid anytime during the auction</li>
              <li>New bids must be higher than your previous bid</li>
              <li>Auctions automatically close when the end time is reached</li>
            </ul>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default UserDashboard;
