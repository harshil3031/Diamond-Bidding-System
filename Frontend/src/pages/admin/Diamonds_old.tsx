import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../api/axios';

interface Diamond {
  id: string;
  name: string;
  image_url: string | null;
  base_price: string;
  created_at?: string;
}

const Diamonds = () => {
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchDiamonds = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/diamonds');
      setDiamonds(res.data.data || []);
    } catch (error: any) {
      console.error('Error fetching diamonds:', error);
      alert(error.response?.data?.message || 'Failed to fetch diamonds');
    } finally {
      setLoading(false);
    }
  };

  const createDiamond = async () => {
    if (!name || !basePrice) {
      alert('Name and Base Price are required');
      return;
    }

    if (parseFloat(basePrice) <= 0) {
      alert('Base price must be greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/admin/diamonds', {
        name,
        image_url: imageUrl || null,
        base_price: basePrice,
      });

      alert('Diamond created successfully! 💎');
      setName('');
      setImageUrl('');
      setBasePrice('');
      fetchDiamonds();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create diamond');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchDiamonds();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Diamond Management</h1>
            <p className="text-slate-600 mt-1">Create and manage diamond inventory</p>
          </div>
          <button
            onClick={fetchDiamonds}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Create Diamond Form */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Create New Diamond</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Diamond Name *
              </label>
              <input
                className="w-full border border-slate-300 p-2 rounded text-black focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Blue Diamond"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Image URL (Optional)
              </label>
              <input
                className="w-full border border-slate-300 p-2 rounded text-black focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Base Price (₹) *
              </label>
              <input
                type="number"
                className="w-full border border-slate-300 p-2 rounded text-black focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter price"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                disabled={submitting}
                min="0"
              />
            </div>
          </div>

          <button
            onClick={createDiamond}
            className="mt-6 px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? 'Creating...' : '💎 Create Diamond'}
          </button>
        </div>

        {/* Diamond List */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">All Diamonds</h2>
            <p className="text-sm text-slate-500 mt-1">
              Total: {diamonds.length} diamonds
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading diamonds...</div>
          ) : diamonds.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No diamonds created yet. Create your first diamond above!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-700">#</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Image</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Name</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Base Price</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {diamonds.map((diamond, index) => (
                    <tr key={diamond.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-600">{index + 1}</td>
                      <td className="p-4">
                        {diamond.image_url ? (
                          <img
                            src={diamond.image_url}
                            alt={diamond.name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = '';
                              e.currentTarget.alt = '💎';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-purple-100 rounded flex items-center justify-center text-2xl">
                            💎
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{diamond.name}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-green-600 text-lg">
                          ₹{parseFloat(diamond.base_price).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Available
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Diamonds;
