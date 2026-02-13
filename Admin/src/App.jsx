import { useState, useEffect } from 'react';
import './Admin.css';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    desc: '',
    price: '',
    category: '',
    subCategory: '',
    gender: 'men',
    bestseller: false,
    accessories: false,
    sizes: [],
    stock: '',
  });
  const [images, setImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
  });

  // Search & Pagination State
  const [searchQueryProducts, setSearchQueryProducts] = useState('');
  const [currentPageProducts, setCurrentPageProducts] = useState(1);
  const itemsPerPageProducts = 5;

  const [searchQueryOrders, setSearchQueryOrders] = useState('');
  const [currentPageOrders, setCurrentPageOrders] = useState(1);
  const itemsPerPageOrders = 5;

  useEffect(() => {
    if (token) {
      fetchProducts();
      fetchOrders();
    }
  }, [token]);

  // ----------- Login / Logout ----------
  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/user/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        setToken('admin-logged-in');
        localStorage.setItem('adminToken', 'admin-logged-in');
        alert('Login successful!');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Login failed');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('adminToken');
  };

  // ----------- Fetch Data ----------
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/product/list`);
      const data = await response.json();
      if (data.success) setProducts(data.products);
    } catch (error) {
      alert('Failed to fetch products');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/order/list`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) setOrders(data.orders);
    } catch (error) {
      alert('Failed to fetch orders');
    }
  };

  // ----------- Product CRUD ----------
  const handleAddProduct = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(productForm).forEach((key) => {
        if (key === 'sizes')
          formData.append(key, JSON.stringify(productForm[key]));
        else formData.append(key, productForm[key]);
      });
      Object.keys(images).forEach(
        (key) => images[key] && formData.append(key, images[key]),
      );
      const response = await fetch(`${API_URL}/product/add`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        alert('Product added!');
        fetchProducts();
        resetForm();
      } else alert(data.message);
    } catch (error) {
      alert('Failed to add product');
    }
    setLoading(false);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('id', editingProduct._id);
      Object.keys(productForm).forEach((key) => {
        if (key === 'sizes')
          formData.append(key, JSON.stringify(productForm[key]));
        else formData.append(key, productForm[key]);
      });
      Object.keys(images).forEach(
        (key) => images[key] && formData.append(key, images[key]),
      );
      const response = await fetch(`${API_URL}/product/update`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        alert('Product updated successfully!');
        fetchProducts();
        resetForm();
        setEditingProduct(null);
        setActiveTab('products');
      } else alert(data.message);
    } catch (error) {
      alert('Failed to update product');
    }
    setLoading(false);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      desc: product.desc,
      price: product.price,
      category: product.category,
      subCategory: product.subCategory || '',
      gender: product.gender,
      bestseller: product.bestseller,
      accessories: product.accessories,
      sizes: product.sizes,
      stock: product.stock,
    });
    setImages({ image1: null, image2: null, image3: null, image4: null });
    setActiveTab('add-product');
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      const response = await fetch(`${API_URL}/product/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Product deleted');
        fetchProducts();
      }
    } catch (error) {
      alert('Failed to delete');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`${API_URL}/order/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderId, status }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Status updated');
        fetchOrders();
      }
    } catch (error) {
      alert('Failed to update');
    }
  };

  // ----------- Form Helpers ----------
  const toggleSize = (size) => {
    setProductForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      desc: '',
      price: '',
      category: '',
      subCategory: '',
      gender: 'men',
      bestseller: false,
      accessories: false,
      sizes: [],
      stock: '',
    });
    setImages({ image1: null, image2: null, image3: null, image4: null });
    setEditingProduct(null);
  };

  const cancelEdit = () => {
    resetForm();
    setEditingProduct(null);
  };

  // ----------- Filtered & Paginated Products ----------
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQueryProducts.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQueryProducts.toLowerCase()),
  );
  const totalPagesProducts = Math.ceil(
    filteredProducts.length / itemsPerPageProducts,
  );
  const displayedProducts = filteredProducts.slice(
    (currentPageProducts - 1) * itemsPerPageProducts,
    currentPageProducts * itemsPerPageProducts,
  );

  // ----------- Filtered & Paginated Orders ----------
  const filteredOrders = orders.filter(
    (o) =>
      o._id.toLowerCase().includes(searchQueryOrders.toLowerCase()) ||
      (o.userId?.name || 'Guest')
        .toLowerCase()
        .includes(searchQueryOrders.toLowerCase()),
  );
  const totalPagesOrders = Math.ceil(
    filteredOrders.length / itemsPerPageOrders,
  );
  const displayedOrders = filteredOrders.slice(
    (currentPageOrders - 1) * itemsPerPageOrders,
    currentPageOrders * itemsPerPageOrders,
  );

  // ----------- LOGIN PAGE ----------
  if (!token) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">Admin Login</h1>
          <div className="login-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
            <button
              onClick={handleLogin}
              disabled={loading}
              className="login-button"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------- MAIN DASHBOARD ----------
  return (
    <div>
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <h1 className="header-title">Mena's Closet - Admin</h1>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        {['products', 'add-product', 'orders'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="admin-main">
        {/* ------------------ PRODUCTS ------------------ */}
        {activeTab === 'products' && (
          <div className="content-card">
            <h2 className="card-title">Products ({products.length})</h2>

            {/* Search */}
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchQueryProducts}
              onChange={(e) => {
                setSearchQueryProducts(e.target.value);
                setCurrentPageProducts(1);
              }}
              className="search-input"
            />

            {/* Products Table */}
            <div className="table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedProducts.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <img
                          src={product.images[0]}
                          className="product-image"
                        />
                      </td>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>GH₵{product.price}</td>
                      <td>{product.stock}</td>
                      <td>
                        <button onClick={() => handleEditProduct(product)}>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                onClick={() =>
                  setCurrentPageProducts((p) => Math.max(p - 1, 1))
                }
                disabled={currentPageProducts === 1}
              >
                Prev
              </button>
              {[...Array(totalPagesProducts)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPageProducts(idx + 1)}
                  className={
                    currentPageProducts === idx + 1 ? 'active-page' : ''
                  }
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPageProducts((p) =>
                    Math.min(p + 1, totalPagesProducts),
                  )
                }
                disabled={currentPageProducts === totalPagesProducts}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* ------------------ ADD/EDIT PRODUCT ------------------ */}
        {activeTab === 'add-product' && (
          <div className="content-card">
            <h2 className="card-title">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            {editingProduct && (
              <div className="edit-notice">
                <p>
                  Editing: <strong>{editingProduct.name}</strong>
                </p>
                <button onClick={cancelEdit} className="cancel-edit-button">
                  Cancel Edit
                </button>
              </div>
            )}

            {/* Product Form */}
            <div className="form-container">
              {/* Name & Price */}
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  className="form-input"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, price: e.target.value })
                  }
                  className="form-input"
                />
              </div>

              {/* Description */}
              <textarea
                placeholder="Description"
                value={productForm.desc}
                onChange={(e) =>
                  setProductForm({ ...productForm, desc: e.target.value })
                }
                className="form-textarea"
              />

              {/* Category / Subcategory / Stock */}
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Category"
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm({ ...productForm, category: e.target.value })
                  }
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Sub Category"
                  value={productForm.subCategory}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      subCategory: e.target.value,
                    })
                  }
                  className="form-input"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={productForm.stock}
                  onChange={(e) =>
                    setProductForm({ ...productForm, stock: e.target.value })
                  }
                  className="form-input"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="form-label">Gender</label>
                <select
                  value={productForm.gender}
                  onChange={(e) =>
                    setProductForm({ ...productForm, gender: e.target.value })
                  }
                  className="form-select"
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>

              {/* Sizes */}
              <div>
                <label className="form-label">Sizes</label>
                <div className="size-selector">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`size-button ${productForm.sizes.includes(size) ? 'selected' : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={productForm.bestseller}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        bestseller: e.target.checked,
                      })
                    }
                    className="checkbox-input"
                  />
                  Bestseller
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={productForm.accessories}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        accessories: e.target.checked,
                      })
                    }
                    className="checkbox-input"
                  />
                  Accessories
                </label>
              </div>

              {/* Images */}
              <div>
                <label className="form-label">
                  {editingProduct
                    ? 'Images (Upload new images to add/replace - existing images will be kept)'
                    : 'Images (4 max)'}
                </label>
                {editingProduct && editingProduct.images.length > 0 && (
                  <div className="existing-images">
                    <p className="existing-images-title">Current images:</p>
                    <div className="existing-images-grid">
                      {editingProduct.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Product ${idx + 1}`}
                          className="existing-image-preview"
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div className="file-grid">
                  {['image1', 'image2', 'image3', 'image4'].map((key) => (
                    <input
                      key={key}
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setImages({ ...images, [key]: e.target.files[0] })
                      }
                      className="file-input"
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={
                  editingProduct ? handleUpdateProduct : handleAddProduct
                }
                disabled={loading}
                className="submit-button"
              >
                {loading
                  ? editingProduct
                    ? 'Updating...'
                    : 'Adding...'
                  : editingProduct
                    ? 'Update Product'
                    : 'Add Product'}
              </button>
            </div>
          </div>
        )}

        {/* ------------------ ORDERS ------------------ */}
        {activeTab === 'orders' && (
          <div className="content-card">
            <h2 className="card-title">Orders ({orders.length})</h2>

            {/* Search Orders */}
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              value={searchQueryOrders}
              onChange={(e) => {
                setSearchQueryOrders(e.target.value);
                setCurrentPageOrders(1);
              }}
              className="search-input"
            />

            <div className="orders-container">
              {displayedOrders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div>
                      <p className="order-id">Order #{order._id.slice(-6)}</p>
                      <p className="order-customer">
                        {order.userId?.name || 'Guest Customer'} -{' '}
                        {order.userId?.email || order.shippingAddress.email}
                      </p>
                      <p className="order-date">
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="order-total">GH₵{order.totalAmount}</p>
                  </div>

                  <div className="order-items">
                    <p className="items-title">Items:</p>
                    {order.items.map((item, idx) => (
                      <p key={idx} className="order-item">
                        {item.name} x{item.quantity} ({item.size})
                      </p>
                    ))}
                  </div>

                  <div className="order-footer">
                    <select
                      value={order.orderStatus}
                      onChange={(e) =>
                        handleUpdateOrderStatus(order._id, e.target.value)
                      }
                      className="status-select"
                    >
                      <option value="Order Placed">Order Placed</option>
                      <option value="Packing">Packing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for delivery">Out for delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                    <span
                      className={`payment-badge ${order.paymentStatus === 'Paid' ? 'paid' : 'pending'}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination for Orders */}
            <div className="pagination">
              <button
                onClick={() => setCurrentPageOrders((p) => Math.max(p - 1, 1))}
                disabled={currentPageOrders === 1}
              >
                Prev
              </button>
              {[...Array(totalPagesOrders)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPageOrders(idx + 1)}
                  className={currentPageOrders === idx + 1 ? 'active-page' : ''}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPageOrders((p) => Math.min(p + 1, totalPagesOrders))
                }
                disabled={currentPageOrders === totalPagesOrders}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
