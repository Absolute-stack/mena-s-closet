import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../components/ShopContext';
import { toast } from 'react-toastify';

function Orders() {
  const { user, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div style={styles.container}>
        <h1>Loading orders...</h1>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => navigate('/')} style={styles.shopButton}>
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Orders</h1>

      <div style={styles.ordersList}>
        {orders.map((order) => (
          <div key={order._id} style={styles.orderCard}>
            {/* Order Header */}
            <div style={styles.orderHeader}>
              <div>
                <p style={styles.orderId}>Order #{order._id.slice(-8)}</p>
                <p style={styles.orderDate}>
                  {new Date(order.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div style={styles.orderTotal}>
                <p style={styles.totalLabel}>Total</p>
                <p style={styles.totalAmount}>
                  {currency}
                  {order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div style={styles.itemsList}>
              {order.items.map((item, index) => (
                <div key={index} style={styles.orderItem}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={styles.itemImage}
                  />
                  <div style={styles.itemDetails}>
                    <p style={styles.itemName}>{item.name}</p>
                    <p style={styles.itemInfo}>
                      Size: {item.size} | Qty: {item.quantity}
                    </p>
                    <p style={styles.itemPrice}>
                      {currency}
                      {item.price.toFixed(2)} each
                    </p>
                  </div>
                  <div style={styles.itemTotal}>
                    {currency}
                    {(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Footer */}
            <div style={styles.orderFooter}>
              <div style={styles.statusBadge}>
                <span
                  style={{
                    ...styles.statusDot,
                    backgroundColor: getStatusColor(order.orderStatus),
                  }}
                ></span>
                <span style={styles.statusText}>{order.orderStatus}</span>
              </div>

              <div style={styles.paymentBadge}>
                <span
                  style={{
                    ...styles.paymentDot,
                    backgroundColor:
                      order.paymentStatus === 'Paid' ? '#22c55e' : '#f59e0b',
                  }}
                ></span>
                <span style={styles.paymentText}>{order.paymentStatus}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div style={styles.shippingInfo}>
              <p style={styles.shippingTitle}>Shipping Address:</p>
              <p style={styles.shippingText}>
                {order.shippingAddress.firstName}{' '}
                {order.shippingAddress.lastName}
              </p>
              <p style={styles.shippingText}>{order.shippingAddress.street}</p>
              <p style={styles.shippingText}>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zipcode}
              </p>
              <p style={styles.shippingText}>{order.shippingAddress.phone}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: '#1f2937',
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb',
  },
  orderId: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4px',
  },
  orderDate: {
    fontSize: '14px',
    color: '#6b7280',
  },
  orderTotal: {
    textAlign: 'right',
  },
  totalLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '4px',
  },
  totalAmount: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '20px',
  },
  orderItem: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  itemImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: '4px',
  },
  itemInfo: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '4px',
  },
  itemPrice: {
    fontSize: '14px',
    color: '#6b7280',
  },
  itemTotal: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
  },
  orderFooter: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    borderRadius: '20px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  statusText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  paymentBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    borderRadius: '20px',
  },
  paymentDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  paymentText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  shippingInfo: {
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '8px',
  },
  shippingTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px',
  },
  shippingText: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '4px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  shopButton: {
    marginTop: '20px',
    padding: '12px 32px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

export default Orders;
