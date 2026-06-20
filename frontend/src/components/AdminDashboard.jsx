import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaSignOutAlt, FaChartPie, FaBoxes, FaTimes } from 'react-icons/fa';

export const AdminDashboard = ({ products, categories, onRefreshProducts, onNavigate, isMobile }) => {
  const { token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'products'
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedProductId, setSelectedProductId] = useState(null);
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0] || 'Electronics');
  const [formStock, setFormStock] = useState('10');
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedProductId(null);
    setFormName('');
    setFormPrice('');
    setFormImage('/deal_phone.png'); // Default sample path
    setFormDescription('');
    setFormCategory(categories[0] || 'Electronics');
    setFormStock('10');
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setModalMode('edit');
    setSelectedProductId(product.id);
    setFormName(product.title || product.name || '');
    // Strip dollar sign if present in price string
    const numericPrice = typeof product.price === 'number' 
      ? product.price 
      : parseFloat(String(product.price).replace('$', '').split('-')[0].trim());
    setFormPrice(isNaN(numericPrice) ? '' : String(numericPrice));
    setFormImage(product.image || '');
    setFormDescription(product.description || '');
    setFormCategory(product.category || categories[0] || 'Electronics');
    setFormStock(String(product.stock !== undefined ? product.stock : 10));
    setError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formPrice || !formImage || !formDescription || !formStock) {
      setError('Please fill in all required fields');
      return;
    }

    const priceNum = parseFloat(formPrice);
    const stockNum = parseInt(formStock, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price must be a valid positive number');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      setError('Stock must be a valid non-negative integer');
      return;
    }

    const productPayload = {
      name: formName,
      title: formName, // duplicate to maintain frontend compatibility
      price: priceNum,
      image: formImage,
      description: formDescription,
      category: formCategory,
      stock: stockNum
    };

    try {
      setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (modalMode === 'add') {
        await axios.post(`${apiUrl}/api/products`, productPayload, config);
      } else {
        await axios.put(`${apiUrl}/api/products/${selectedProductId}`, productPayload, config);
      }

      setIsModalOpen(false);
      onRefreshProducts(); // Refresh products in parent App state
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      await axios.delete(`${apiUrl}/api/products/${id}`, config);
      onRefreshProducts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  return (
    <div className={`flex flex-col ${isMobile ? '' : 'md:flex-row'} min-h-[500px] border border-[#DEE2E7] rounded-lg bg-white overflow-hidden card-shadow`}>
      {/* Sidebar Navigation */}
      <div className={`bg-[#EFF2F4] border-r border-[#DEE2E7] flex-shrink-0 ${isMobile ? 'w-full flex flex-row justify-around border-b py-2' : 'w-64 flex flex-col p-4 space-y-2'}`}>
        {!isMobile && (
          <div className="font-bold text-base text-[#1C1C1C] px-3 py-2 border-b border-[#DEE2E7] mb-4">
            Store Admin Panel
          </div>
        )}
        
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-colors ${
            activeTab === 'dashboard'
              ? 'bg-[#0D6EFD] text-white'
              : 'text-[#505050] hover:bg-white hover:text-brand-blue'
          }`}
        >
          <FaChartPie className="text-base" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-colors ${
            activeTab === 'products'
              ? 'bg-[#0D6EFD] text-white'
              : 'text-[#505050] hover:bg-white hover:text-brand-blue'
          }`}
        >
          <FaBoxes className="text-base" />
          <span>Products</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold text-[#FA3434] hover:bg-white hover:text-red-600 transition-colors"
        >
          <FaSignOutAlt className="text-base" />
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow p-6 bg-white overflow-hidden">
        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1C1C1C]">Dashboard Metrics</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Stat Card */}
              <div className="border border-[#DEE2E7] bg-[#F7F8F9] rounded-lg p-5 flex items-center gap-4 card-shadow">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-[#0D6EFD] flex items-center justify-center text-xl flex-shrink-0">
                  <FaBoxes />
                </div>
                <div>
                  <span className="text-xs text-[#8B96A5] block font-medium uppercase tracking-wider">Total Products</span>
                  <span className="text-2xl font-bold text-[#1C1C1C]">{products.length} items</span>
                </div>
              </div>

              {/* Categories Stat Card */}
              <div className="border border-[#DEE2E7] bg-[#F7F8F9] rounded-lg p-5 flex items-center gap-4 card-shadow">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl flex-shrink-0">
                  <FaChartPie />
                </div>
                <div>
                  <span className="text-xs text-[#8B96A5] block font-medium uppercase tracking-wider">Total Categories</span>
                  <span className="text-2xl font-bold text-[#1C1C1C]">{categories.length} categories</span>
                </div>
              </div>
            </div>
            
            <div className="border border-[#DEE2E7] rounded-lg p-5 bg-[#EFF2F4] text-sm text-[#505050] font-normal leading-relaxed">
              <h4 className="font-bold text-[#1C1C1C] mb-1">Welcome to the Administrator Management Panel!</h4>
              Use the sidebar links to navigate. Click on "Products" to view, create, edit, or delete listings directly from the database.
            </div>
          </div>
        ) : (
          // Products Management Tab
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-bold text-[#1C1C1C]">Products Catalog</h2>
              <button
                onClick={handleOpenAddModal}
                className="bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white font-semibold text-xs py-2 px-4 rounded-md transition-colors shadow-sm flex items-center justify-center gap-1.5 self-start"
              >
                <FaPlus />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Horizontal Scroll wrapper for responsive mobile table compatibility */}
            <div className="w-full overflow-x-auto border border-[#DEE2E7] rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-[#DEE2E7] text-left text-sm text-[#1C1C1C]">
                <thead className="bg-[#EFF2F4] text-xs font-semibold text-[#8B96A5] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Image</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#EFF2F4] font-normal">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-gray-400">No products available.</td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const titleVal = product.title || product.name || 'Product';
                      return (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="w-10 h-10 border border-[#DEE2E7] rounded bg-white p-0.5 flex items-center justify-center overflow-hidden flex-shrink-0">
                              <img src={product.image} alt={titleVal} className="max-h-full max-w-full object-contain" />
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold min-w-[150px]">{titleVal}</td>
                          <td className="px-4 py-3 text-[#505050]">{product.category || 'N/A'}</td>
                          <td className="px-4 py-3 font-bold text-[#1C1C1C]">
                            {typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : product.price}
                          </td>
                          <td className="px-4 py-3 text-[#505050] font-semibold">
                            {product.stock !== undefined ? product.stock : 10}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleOpenEditModal(product)}
                                className="border border-[#DEE2E7] text-[#0D6EFD] hover:bg-blue-50 px-2.5 py-1.5 rounded transition-colors text-xs font-semibold flex items-center gap-1"
                                title="Edit Product"
                              >
                                <FaEdit />
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id, titleVal)}
                                className="border border-[#DEE2E7] text-[#FA3434] hover:bg-red-50 px-2.5 py-1.5 rounded transition-colors text-xs font-semibold flex items-center gap-1"
                                title="Delete Product"
                              >
                                <FaTrash />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Product Form Modal (Add / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg border border-[#DEE2E7] w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#EFF2F4] px-5 py-4 border-b border-[#DEE2E7] flex justify-between items-center flex-shrink-0">
              <h3 className="text-base font-bold text-[#1C1C1C]">
                {modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleFormSubmit} className="p-5 overflow-y-auto space-y-4 flex-grow">
              {error && (
                <div className="bg-[#FFF0DF] border border-[#FF9017] text-[#D8000C] text-sm rounded-md p-3 flex items-start gap-2">
                  <span className="font-bold flex-shrink-0">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#505050] uppercase tracking-wider mb-1">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. GoPro HERO 9 Action Camera"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DEE2E7] rounded-md outline-none text-sm text-[#1C1C1C] focus:border-brand-blue"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#505050] uppercase tracking-wider mb-1">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 299.00"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DEE2E7] rounded-md outline-none text-sm text-[#1C1C1C] focus:border-brand-blue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#505050] uppercase tracking-wider mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    placeholder="e.g. 25"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DEE2E7] rounded-md outline-none text-sm text-[#1C1C1C] focus:border-brand-blue"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#505050] uppercase tracking-wider mb-1">Image URL</label>
                <input
                  type="text"
                  placeholder="e.g. /deal_camera.png"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DEE2E7] rounded-md outline-none text-sm text-[#1C1C1C] focus:border-brand-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#505050] uppercase tracking-wider mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DEE2E7] rounded-md outline-none text-sm text-[#1C1C1C] focus:border-brand-blue bg-white"
                >
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#505050] uppercase tracking-wider mb-1">Product Description</label>
                <textarea
                  placeholder="Describe the product details and specifications..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-[#DEE2E7] rounded-md outline-none text-sm text-[#1C1C1C] focus:border-brand-blue"
                  required
                ></textarea>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex gap-3 border-t border-[#EFF2F4] flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-[#DEE2E7] hover:bg-gray-50 text-[#505050] font-semibold text-sm py-2 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white font-semibold text-sm py-2 rounded-md transition-colors disabled:opacity-75 flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
