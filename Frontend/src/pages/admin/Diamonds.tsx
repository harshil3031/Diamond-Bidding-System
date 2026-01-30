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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('url');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
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

      let finalImageUrl = imageUrl;
      
      if (uploadMethod === 'upload' && imageFile) {
        const base64Image = await convertImageToBase64(imageFile);
        finalImageUrl = base64Image;
      }

      if (editingId) {
        // Update existing diamond
        await api.put(`/admin/diamonds/${editingId}`, {
          name,
          image_url: finalImageUrl || null,
          base_price: basePrice,
        });
        alert('Diamond updated successfully! 💎');
      } else {
        // Create new diamond
        await api.post('/admin/diamonds', {
          name,
          image_url: finalImageUrl || null,
          base_price: basePrice,
        });
        alert('Diamond created successfully! 💎');
      }

      resetForm();
      fetchDiamonds();
    } catch (error: any) {
      alert(error.response?.data?.message || `Failed to ${editingId ? 'update' : 'create'} diamond`);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setImageUrl('');
    setImageFile(null);
    setImagePreview('');
    setBasePrice('');
    setEditingId(null);
    setUploadMethod('url');
  };

  const handleEdit = (diamond: Diamond) => {
    setEditingId(diamond.id);
    setName(diamond.name);
    setBasePrice(diamond.base_price);
    
    if (diamond.image_url) {
      if (diamond.image_url.startsWith('data:')) {
        setUploadMethod('upload');
        setImagePreview(diamond.image_url);
      } else {
        setUploadMethod('url');
        setImageUrl(diamond.image_url);
      }
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

        {/* Create/Edit Diamond Form */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800">
              {editingId ? '✏️ Edit Diamond' : '💎 Create New Diamond'}
            </h2>
            {editingId && (
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors text-sm"
              >
                ✖ Cancel Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Image Upload Section */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Diamond Image (Optional)
            </label>
            
            {/* Upload Method Toggle */}
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => {
                  setUploadMethod('url');
                  setImageFile(null);
                  setImagePreview('');
                }}
                className={`px-4 py-2 rounded transition-colors ${
                  uploadMethod === 'url'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
                disabled={submitting}
              >
                📎 Image URL
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMethod('upload');
                  setImageUrl('');
                }}
                className={`px-4 py-2 rounded transition-colors ${
                  uploadMethod === 'upload'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
                disabled={submitting}
              >
                📤 Upload Image
              </button>
            </div>

            {uploadMethod === 'url' ? (
              <input
                type="url"
                className="w-full border border-slate-300 p-2 rounded text-black focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://example.com/diamond.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={submitting}
              />
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                  id="diamond-image-upload"
                  disabled={submitting}
                />
                <label
                  htmlFor="diamond-image-upload"
                  className="flex items-center justify-center w-full border-2 border-dashed border-slate-300 rounded-lg p-6 cursor-pointer hover:border-purple-500 transition-colors"
                >
                  {imagePreview ? (
                    <div className="text-center">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-40 mx-auto rounded mb-2"
                      />
                      <p className="text-sm text-slate-600">Click to change image</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-2">📸</div>
                      <p className="text-slate-600 font-medium">Click to upload image</p>
                      <p className="text-sm text-slate-500 mt-1">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </div>
                  )}
                </label>
                {imageFile && (
                  <p className="text-sm text-slate-600 mt-2">
                    Selected: {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="mt-6 px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? '✏️ Update Diamond' : '💎 Create Diamond')}
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
                    <th className="text-left p-4 font-semibold text-slate-700">Actions</th>
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
                      <td className="p-4">
                        <button
                          onClick={() => handleEdit(diamond)}
                          className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors text-sm font-medium"
                        >
                          ✏️ Edit
                        </button>
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
