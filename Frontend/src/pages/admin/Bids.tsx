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
    lowest_bid: number;
    average_bid: number;
  };
}

const Bids = () => {
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);

  const [diamondId, setDiamondId] = useState('');
  const [baseBidPrice, setBaseBidPrice] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const diamondsRes = await api.get('/admin/diamonds');
      const bidsRes = await api.get('/admin/bids');

      setDiamonds(diamondsRes.data.data || []);
      setBids(bidsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBid = async () => {
    if (!diamondId || !baseBidPrice || !startTime || !endTime) {
      alert('All fields are required');
      return;
    }

    try {
      await api.post('/admin/bids', {
        diamond_id: diamondId,
        base_bid_price: baseBidPrice,
        start_time: startTime,
        end_time: endTime,
      });

      setDiamondId('');
      setBaseBidPrice('');
      setStartTime('');
      setEndTime('');
      alert('Bid created successfully!');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create bid');
    }
  };

  const activateBid = async (bidId: string) => {
    if (!confirm('Are you sure you want to activate this bid?')) {
      return;
    }

    try {
      await api.post(`/admin/bids/${bidId}/activate`);
      alert('Bid activated successfully!');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to activate bid');
    }
  };

  const closeBid = async (bidId: string) => {
    if (!confirm('Are you sure you want to close this bid?')) {
      return;
    }

    try {
      await api.post(`/admin/bids/${bidId}/close`);
      alert('Bid closed successfully!');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to close bid');
    }
  };

  const canActivateBid = (bid: Bid): boolean => {
    if (bid.status !== 'DRAFT') return false;
    
    const now = new Date();
    const startTime = new Date(bid.start_time);
    const endTime = new Date(bid.end_time);
    
    // Can activate only if start time has reached and end time hasn't passed
    return startTime <= now && endTime > now;
  };

  const isExpired = (bid: Bid): boolean => {
    const now = new Date();
    const endTime = new Date(bid.end_time);
    return endTime <= now;
  };

  const getStatusBadge = (bid: Bid) => {
    let bgColor = '';
    let textColor = '';
    let status = bid.status;

    // Auto-check if bid should be closed
    if (isExpired(bid) && bid.status !== 'CLOSED') {
      status = 'CLOSED';
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
    } else if (bid.status === 'ACTIVE') {
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
    } else if (bid.status === 'CLOSED') {
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
    } else {
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bgColor} ${textColor}`}>
        {status}
      </span>
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

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds to sync statuses
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-800">Bid Management</h1>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Create Bid Form */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Create New Auction</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Diamond
              </label>
              <select
                className="w-full border border-slate-300 p-2 rounded text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={diamondId}
                onChange={(e) => setDiamondId(e.target.value)}
              >
                <option value="">Choose a diamond...</option>
                {diamonds.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Base Bid Price (₹)
              </label>
              <input
                type="number"
                className="w-full border border-slate-300 p-2 rounded text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter base price"
                value={baseBidPrice}
                onChange={(e) => setBaseBidPrice(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Time
              </label>
              <input
                type="datetime-local"
                className="w-full border border-slate-300 p-2 rounded text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                End Time
              </label>
              <input
                type="datetime-local"
                className="w-full border border-slate-300 p-2 rounded text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={createBid}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
          >
            Create Bid
          </button>
        </div>

        {/* Bid List */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">All Bids</h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage and monitor all auction bids
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading bids...</div>
          ) : bids.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No bids created yet. Create your first bid above!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-700">Diamond</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Base Price</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Start Time</th>
                    <th className="text-left p-4 font-semibold text-slate-700">End Time</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Participants</th>
                    <th className="text-center p-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((bid) => (
                    <tr key={bid.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-slate-800">
                          {bid.diamond?.name || 'Unknown Diamond'}
                        </div>
                      </td>
                      <td className="p-4 text-slate-700">
                        <span className="font-semibold">₹{parseFloat(bid.base_bid_price).toLocaleString()}</span>
                      </td>
                      <td className="p-4 text-slate-600 text-sm">
                        {formatDateTime(bid.start_time)}
                      </td>
                      <td className="p-4 text-slate-600 text-sm">
                        {formatDateTime(bid.end_time)}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(bid)}
                      </td>
                      <td className="p-4 text-slate-700">
                        {bid.statistics?.total_participants || 0}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Activate button - only for DRAFT bids when start time has reached */}
                          {bid.status === 'DRAFT' && canActivateBid(bid) && (
                            <button
                              onClick={() => activateBid(bid.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors font-medium"
                              title="Activate this bid"
                            >
                              Activate
                            </button>
                          )}

                          {/* Show message if DRAFT but can't activate yet */}
                          {bid.status === 'DRAFT' && !canActivateBid(bid) && !isExpired(bid) && (
                            <span className="text-xs text-slate-500 italic">
                              Waiting for start time
                            </span>
                          )}

                          {/* Close button - for ACTIVE bids */}
                          {bid.status === 'ACTIVE' && (
                            <button
                              onClick={() => closeBid(bid.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors font-medium"
                              title="Close this bid"
                            >
                              Close
                            </button>
                          )}

                          {/* Auto-close if expired */}
                          {isExpired(bid) && bid.status !== 'CLOSED' && (
                            <span className="text-xs text-red-600 font-medium">
                              Auto-closing...
                            </span>
                          )}

                          {/* View details button for all */}
                          <button
                            onClick={() => alert(`Bid ID: ${bid.id}\nParticipants: ${bid.statistics?.total_participants || 0}\nHighest Bid: ₹${bid.statistics?.highest_bid || 0}`)}
                            className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm hover:bg-slate-300 transition-colors"
                            title="View details"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Bid Status Information</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li><strong>DRAFT:</strong> Bid is created but not yet started. Will auto-activate when start time is reached.</li>
            <li><strong>ACTIVE:</strong> Bid is currently running and accepting user bids.</li>
            <li><strong>CLOSED:</strong> Bid has ended. Results can be declared.</li>
            <li><strong>EXPIRED:</strong> Bid end time has passed but status not yet synced. Will auto-close on next refresh.</li>
          </ul>
          <p className="text-xs text-blue-700 mt-3">
            💡 The system automatically syncs bid statuses based on start and end times. Page auto-refreshes every 30 seconds.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};


export default Bids;
