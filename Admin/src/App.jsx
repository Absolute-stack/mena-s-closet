import { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

/* =========================
   AXIOS INSTANCE (INLINE)
========================= */
const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true,
});

/* =========================
   ADMIN DASHBOARD
========================= */
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

  /* =========================
     EFFECTS
  ========================= */
  useEffect(() => {
    if (token) {
      fetchProducts();
      fetchOrders();
    }
  }, [token]);

  /* =========================
     AUTH
  ========================= */
  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/user/admin', { email, password });

      if (data.success) {
        localStorage.setItem('adminToken', 'admin-logged-in');
        setToken('admin-logged-in');
        alert('Login successful!');
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken('');
  };

  /* =========================
     FETCH DATA
  ========================= */
  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/product/list');
      if (data.success) setProducts(data.products);
    } catch {
      alert('Failed to fetch products');
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/order/list');
      if (data.success) setOrders(data.orders);
    } catch {
      alert('Failed to fetch orders');
    }
  };

  /* =========================
     PRODUCTS
  ========================= */
  const handleAddProduct = async () => {
    setLoading(true);
    try {
      const formData = new FormData();

      Object.entries(productForm).forEach(([key, value]) => {
        formData.append(key, key === 'sizes' ? JSON.stringify(value) : value);
      });

      Object.entries(images).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });

      const { data } = await api.post('/product/add', formData);

      if (data.success) {
        alert('Product added!');
        fetchProducts();
        resetForm();
      } else {
        alert(data.message);
      }
    } catch {
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

      Object.entries(productForm).forEach(([key, value]) => {
        formData.append(key, key === 'sizes' ? JSON.stringify(value) : value);
      });

      Object.entries(images).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });

      const { data } = await api.post('/product/update', formData);

      if (data.success) {
        alert('Product updated!');
        fetchProducts();
        resetForm();
        setEditingProduct(null);
        setActiveTab('products');
      } else {
        alert(data.message);
      }
    } catch {
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
      const { data } = await api.post('/product/remove', { id });
      if (data.success) {
        alert('Product deleted');
        fetchProducts();
      }
    } catch {
      alert('Failed to delete');
    }
  };

  /* =========================
     ORDERS
  ========================= */
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const { data } = await api.post('/order/status', { orderId, status });
      if (data.success) {
        alert('Status updated');
        fetchOrders();
      }
    } catch {
      alert('Failed to update');
    }
  };

  /* =========================
     HELPERS
  ========================= */
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

  /* =========================
     LOGIN PAGE
  ========================= */
  if (!token) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>Admin Login</h1>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     DASHBOARD UI
  ========================= */
  return (
    <div>
      <header className="admin-header">
        <h1>Mena's Closet – Admin</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <div className="tabs-container">
        {['products', 'add-product', 'orders'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? 'active' : ''}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* PRODUCTS */}
      {activeTab === 'products' && (
        <div>
          {products.map((p) => (
            <div key={p._id}>
              <img src={p.images[0]} width={50} />
              {p.name} – GH₵{p.price}
              <button onClick={() => handleEditProduct(p)}>Edit</button>
              <button onClick={() => handleDeleteProduct(p._id)}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT PRODUCT */}
      {activeTab === 'add-product' && (
        <button
          onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
          disabled={loading}
        >
          {loading
            ? 'Saving...'
            : editingProduct
              ? 'Update Product'
              : 'Add Product'}
        </button>
      )}

      {/* ORDERS */}
      {activeTab === 'orders' && (
        <div>
          {orders.map((o) => (
            <div key={o._id}>
              Order #{o._id.slice(-6)} – GH₵{o.totalAmount}
              <select
                value={o.orderStatus}
                onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
              >
                <option>Order Placed</option>
                <option>Packing</option>
                <option>Shipped</option>
                <option>Out for delivery</option>
                <option>Delivered</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
