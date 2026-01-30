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
  base_bid_price: string;
  diamond: Diamond | null;
}

interface Winner {
  name: string;
}

interface ResultData {
  bid_id: string;
  status: 'WIN' | 'LOSE';
  winning_amount: string;
  bid: BidInfo | null;
  winner?: Winner | null;
}

const Results = () => {
  const [results, setResults] = useState<ResultData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = async () => {
    try {
      setLoading(true);
      console.log('Fetching results from: /users/my-results');
      const res = await api.get('/users/my-results');
      console.log('Results response:', res.data);
      console.log('Results data:', res.data.data);
      setResults(res.data.data || []);
    } catch (error: any) {
      console.error('Error fetching results:', error);
      console.error('Error response:', error.response);
      alert(error.response?.data?.message || 'Failed to fetch results');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Auction Results</h1>
            <p className="text-slate-600 mt-1">View results of completed auctions</p>
          </div>
          <button
            onClick={fetchResults}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">
            <div className="text-4xl mb-4">⏳</div>
            <p>Loading results...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No Results Available
            </h3>
            <p className="text-slate-600">
              Results will appear here once auctions are completed and winners are declared.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`rounded-lg shadow-md overflow-hidden border-2 ${
                  result.status === 'WIN'
                    ? 'border-green-500 bg-gradient-to-r from-green-50 to-green-100'
                    : 'border-slate-300 bg-white'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        {result.bid?.diamond?.image_url ? (
                          <img
                            src={result.bid.diamond.image_url}
                            alt={result.bid.diamond.name}
                            className="w-20 h-20 rounded-lg object-cover shadow-md"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-slate-200 flex items-center justify-center text-3xl">
                            💎
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">
                            {result.bid?.diamond?.name || 'Unknown Diamond'}
                          </h3>
                          <p className="text-sm text-slate-500 font-mono mt-1">
                            Bid ID: {result.bid_id.substring(0, 12)}...
                          </p>
                        </div>
                        {result.status === 'WIN' && (
                          <div className="text-5xl">🏆</div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="text-slate-600">Base Price:</span>
                          <span className="text-lg font-semibold text-slate-700">
                            ₹{result.bid?.base_bid_price ? parseFloat(result.bid.base_bid_price).toLocaleString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Winning Amount:</span>
                          <span className="text-2xl font-bold text-green-600">
                            ₹{parseFloat(result.winning_amount).toLocaleString()}
                          </span>
                        </div>
                        {result.status === 'LOSE' && result.winner && (
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                            <span className="text-slate-600">Winner:</span>
                            <span className="font-semibold text-slate-700">
                              {result.winner.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className={`px-6 py-3 rounded-full font-bold text-lg whitespace-nowrap ${
                        result.status === 'WIN'
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {result.status === 'WIN' ? '🎉 YOU WON!' : 'Not Won'}
                    </div>
                  </div>

                  {result.status === 'WIN' && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Congratulations!</strong> 🎊 You won this auction!
                        Please contact the admin to claim your diamond.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
              <p className="text-slate-600 text-sm">Total Results</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{results.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
              <p className="text-slate-600 text-sm">Wins</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {results.filter((r) => r.status === 'WIN').length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
              <p className="text-slate-600 text-sm">Win Rate</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {Math.round((results.filter((r) => r.status === 'WIN').length / results.length) * 100)}%
              </p>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default Results;
