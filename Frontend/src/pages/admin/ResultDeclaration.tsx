import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../api/axios';

interface Diamond {
  id: string;
  name: string;
  image_url?: string;
}

interface Bid {
  id: string;
  diamond_id: string;
  base_bid_price: string;
  start_time: string;
  end_time: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  diamond?: Diamond;
  statistics?: {
    total_participants: number;
    highest_bid: number;
  };
  result_declared?: boolean;
}

const ResultDeclaration = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);
  const [declaring, setDeclaring] = useState<string | null>(null);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/bids');
      setBids(res.data.data || []);
    } catch (error: any) {
      console.error('Error fetching bids:', error);
      alert(error.response?.data?.message || 'Failed to fetch bids');
    } finally {
      setLoading(false);
    }
  };

  const declareResult = async (bidId: string) => {
    if (!window.confirm('Are you sure you want to declare the result for this bid? This action cannot be undone.')) {
      return;
    }

    try {
      setDeclaring(bidId);
      await api.post(`/admin/bids/${bidId}/declare-result`);
      alert('Result declared successfully! 🏆 Winner has been determined.');
      fetchBids();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error declaring result');
    } finally {
      setDeclaring(null);
    }
  };

  const canDeclareResult = (bid: Bid): boolean => {
    const now = new Date();
    const endTime = new Date(bid.end_time);
    return (
      endTime <= now &&
      !bid.result_declared &&
      (bid.statistics?.total_participants || 0) > 0
    );
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

  useEffect(() => {
    fetchBids();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchBids, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter bids that can have results declared (ended bids)
  const eligibleBids = bids.filter((bid) => {
    const now = new Date();
    const endTime = new Date(bid.end_time);
    return endTime <= now;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Result Declaration</h1>
            <p className="text-slate-600 mt-1">Declare winners for completed auctions</p>
          </div>
          <button
            onClick={fetchBids}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {loading && bids.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <div className="text-4xl mb-4">⏳</div>
            <p>Loading bids...</p>
          </div>
        ) : eligibleBids.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No Auctions Ready for Result Declaration
            </h3>
            <p className="text-slate-600">
              Results can only be declared for auctions that have ended and have participants.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-700">Diamond</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Base Price</th>
                    <th className="text-left p-4 font-semibold text-slate-700">End Time</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Participants</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Highest Bid</th>
                    <th className="text-center p-4 font-semibold text-slate-700">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {eligibleBids.map((bid) => {
                    const hasParticipants = (bid.statistics?.total_participants || 0) > 0;

                    return (
                      <tr key={bid.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">
                            {bid.diamond?.name || 'Unknown Diamond'}
                          </div>
                        </td>
                        <td className="p-4 text-slate-700">
                          <span className="font-semibold">₹{parseFloat(bid.base_bid_price).toLocaleString()}</span>
                        </td>
                        <td className="p-4 text-slate-600 text-sm">
                          {formatDateTime(bid.end_time)}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(bid.status)}`}>
                            {bid.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-blue-600">
                            {bid.statistics?.total_participants || 0}
                          </span>
                        </td>
                        <td className="p-4">
                          {bid.statistics?.highest_bid ? (
                            <span className="font-bold text-green-600">
                              ₹{bid.statistics.highest_bid.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {bid.result_declared ? (
                            <span className="text-green-600 font-medium">✓ Declared</span>
                          ) : !hasParticipants ? (
                            <span className="text-slate-400 text-sm">No participants</span>
                          ) : canDeclareResult(bid) ? (
                            <button
                              onClick={() => declareResult(bid.id)}
                              disabled={declaring === bid.id}
                              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {declaring === bid.id ? 'Declaring...' : '🏆 Declare Result'}
                            </button>
                          ) : (
                            <span className="text-slate-400 text-sm">Not ready</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important Information</h3>
          <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
            <li>Results can only be declared after the auction end time has passed</li>
            <li>At least one participant must have placed a bid</li>
            <li>The user with the highest bid will be declared the winner</li>
            <li>Once declared, results cannot be modified</li>
            <li>The bid status will automatically change to CLOSED after result declaration</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ResultDeclaration;
