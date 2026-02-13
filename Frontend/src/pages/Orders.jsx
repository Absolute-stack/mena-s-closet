import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../components/ShopContext';
import { toast } from 'react-toastify';
import './Orders.css';

function Orders() {
  const { user, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast.info('Please login to view your orders');
      navigate('/login');
      return;
    }

    fetchOrders();
  }, [user, navigate]);

  async function fetchOrders() {
    try {
      const backend = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backend}/api/order/userorders`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status) {
    const colors = {
      'Order Placed': '#3b82f6',
      Packing: '#f59e0b',
      Shipped: '#8b5cf6',
      'Out for delivery': '#ec4899',
      Delivered: '#22c55e',
    };
    return colors[status] || '#6b7280';
  }

  function getStatusProgress(status) {
    const progress = {
      'Order Placed': 20,
      Packing: 40,
      Shipped: 60,
      'Out for delivery': 80,
      Delivered: 100,
    };
    return progress[status] || 0;
  }

  function toggleOrderDetails(orderId) {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  }

  // Filter orders based on status
  const filteredOrders = orders.filter((order) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active')
      return (
        order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled'
      );
    if (filterStatus === 'delivered') return order.orderStatus === 'Delivered';
    return true;
  });

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <h2>Loading your orders...</h2>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h2>No Orders Yet</h2>
          <p>
            You haven't placed any orders yet. Start shopping to see your orders
            here!
          </p>
          <button onClick={() => navigate('/')} className="shop-button">
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      {/* Header */}
      <div className="orders-header">
        <div>
          <h1 className="orders-title">My Orders</h1>
          <p className="orders-subtitle">Track and manage your orders</p>
        </div>
        <div className="orders-stats">
          <div className="stat-item">
            <span className="stat-number">{orders.length}</span>
            <span className="stat-label">Total Orders</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {orders.filter((o) => o.orderStatus === 'Delivered').length}
            </span>
            <span className="stat-label">Delivered</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All Orders ({orders.length})
        </button>
        <button
          className={`filter-tab ${filterStatus === 'active' ? 'active' : ''}`}
          onClick={() => setFilterStatus('active')}
        >
          Active ({orders.filter((o) => o.orderStatus !== 'Delivered').length})
        </button>
        <button
          className={`filter-tab ${filterStatus === 'delivered' ? 'active' : ''}`}
          onClick={() => setFilterStatus('delivered')}
        >
          Delivered (
          {orders.filter((o) => o.orderStatus === 'Delivered').length})
        </button>
      </div>

      {/* Orders List */}
      <div className="orders-list">
        {filteredOrders.map((order) => (
          <div key={order._id} className="order-card">
            {/* Order Header */}
            <div className="order-card-header">
              <div className="order-header-left">
                <div className="order-id-section">
                  <span className="order-label">Order ID</span>
                  <span className="order-id">
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className="order-date-section">
                  <span className="order-label">Placed on</span>
                  <span className="order-date">
                    {new Date(order.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
              <div className="order-header-right">
                <div className="order-total-section">
                  <span className="order-label">Total Amount</span>
                  <span className="order-total">
                    {currency}
                    {order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Progress Bar */}
            <div className="status-progress-container">
              <div className="status-progress-bar">
                <div
                  className="status-progress-fill"
                  style={{
                    width: `${getStatusProgress(order.orderStatus)}%`,
                    backgroundColor: getStatusColor(order.orderStatus),
                  }}
                ></div>
              </div>
              <div className="status-badges">
                <div
                  className="status-badge"
                  style={{
                    backgroundColor: getStatusColor(order.orderStatus),
                  }}
                >
                  {order.orderStatus}
                </div>
                <div
                  className={`payment-badge ${order.paymentStatus === 'Paid' ? 'paid' : 'pending'}`}
                >
                  {order.paymentStatus}
                </div>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="order-items-preview">
              <div className="items-preview-header">
                <span className="items-count">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </span>
                <button
                  className="toggle-details-btn"
                  onClick={() => toggleOrderDetails(order._id)}
                >
                  {expandedOrder === order._id
                    ? 'Hide Details ▲'
                    : 'View Details ▼'}
                </button>
              </div>

              {/* Quick Preview (first 3 items) */}
              <div className="items-quick-preview">
                {order.items.slice(0, 3).map((item, index) => (
                  <img
                    key={index}
                    src={item.image}
                    alt={item.name}
                    className="preview-image"
                    title={item.name}
                  />
                ))}
                {order.items.length > 3 && (
                  <div className="more-items">+{order.items.length - 3}</div>
                )}
              </div>
            </div>

            {/* Expanded Order Details */}
            {expandedOrder === order._id && (
              <div className="order-details-expanded">
                {/* Detailed Items List */}
                <div className="details-section">
                  <h3 className="section-title">Order Items</h3>
                  <div className="items-list-detailed">
                    {order.items.map((item, index) => (
                      <div key={index} className="item-row-detailed">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="item-image-detailed"
                        />
                        <div className="item-info-detailed">
                          <p className="item-name">{item.name}</p>
                          <p className="item-meta">
                            Size: <strong>{item.size}</strong> • Quantity:{' '}
                            <strong>{item.quantity}</strong>
                          </p>
                          <p className="item-price-detail">
                            {currency}
                            {item.price.toFixed(2)} × {item.quantity} ={' '}
                            <strong>
                              {currency}
                              {(item.price * item.quantity).toFixed(2)}
                            </strong>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="details-section">
                  <h3 className="section-title">Price Breakdown</h3>
                  <div className="price-breakdown">
                    <div className="price-row">
                      <span>Subtotal ({order.items.length} items)</span>
                      <span>
                        {currency}
                        {order.subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="price-row">
                      <span>Delivery Fee</span>
                      <span>
                        {order.deliveryFee === 0
                          ? 'FREE'
                          : `${currency}${order.deliveryFee.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="price-row total-row">
                      <span>Total Amount</span>
                      <span>
                        {currency}
                        {order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="details-section">
                  <h3 className="section-title">Shipping Address</h3>
                  <div className="shipping-address-box">
                    <p className="address-name">
                      {order.shippingAddress.firstName}{' '}
                      {order.shippingAddress.lastName}
                    </p>
                    <p className="address-line">
                      {order.shippingAddress.street}
                    </p>
                    <p className="address-line">
                      {order.shippingAddress.city},{' '}
                      {order.shippingAddress.state}{' '}
                      {order.shippingAddress.zipcode}
                    </p>
                    <p className="address-line">
                      {order.shippingAddress.country}
                    </p>
                    <p className="address-phone">
                      📞 {order.shippingAddress.phone}
                    </p>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="details-section">
                  <h3 className="section-title">Payment Information</h3>
                  <div className="payment-info-box">
                    <div className="payment-info-row">
                      <span className="info-label">Payment Method:</span>
                      <span className="info-value">{order.paymentMethod}</span>
                    </div>
                    <div className="payment-info-row">
                      <span className="info-label">Payment Status:</span>
                      <span
                        className={`info-value ${order.paymentStatus === 'Paid' ? 'success' : 'warning'}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                    {order.paymentInfo?.reference && (
                      <div className="payment-info-row">
                        <span className="info-label">Reference:</span>
                        <span className="info-value reference">
                          {order.paymentInfo.reference}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="details-section">
                  <h3 className="section-title">Order Timeline</h3>
                  <div className="order-timeline">
                    <div className="timeline-item completed">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <p className="timeline-title">Order Placed</p>
                        <p className="timeline-date">
                          {new Date(order.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`timeline-item ${['Packing', 'Shipped', 'Out for delivery', 'Delivered'].includes(order.orderStatus) ? 'completed' : ''}`}
                    >
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <p className="timeline-title">Packing</p>
                        <p className="timeline-date">In progress</p>
                      </div>
                    </div>
                    <div
                      className={`timeline-item ${['Shipped', 'Out for delivery', 'Delivered'].includes(order.orderStatus) ? 'completed' : ''}`}
                    >
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <p className="timeline-title">Shipped</p>
                        <p className="timeline-date">Pending</p>
                      </div>
                    </div>
                    <div
                      className={`timeline-item ${['Out for delivery', 'Delivered'].includes(order.orderStatus) ? 'completed' : ''}`}
                    >
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <p className="timeline-title">Out for Delivery</p>
                        <p className="timeline-date">Pending</p>
                      </div>
                    </div>
                    <div
                      className={`timeline-item ${order.orderStatus === 'Delivered' ? 'completed' : ''}`}
                    >
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <p className="timeline-title">Delivered</p>
                        <p className="timeline-date">Pending</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="order-card-footer">
              <button
                className="action-btn secondary"
                onClick={() => navigate('/')}
              >
                Shop Again
              </button>
              {order.orderStatus !== 'Delivered' && (
                <button
                  className="action-btn primary"
                  onClick={() => toggleOrderDetails(order._id)}
                >
                  Track Order
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="no-results">
          <p>No orders found for the selected filter.</p>
        </div>
      )}
    </div>
  );
}

export default Orders;
