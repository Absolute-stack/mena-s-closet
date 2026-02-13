import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../components/ShopContext';
import './PlaceOrders.css';

function PlaceOrders() {
  const {
    cartItems,
    getCartTotalPrice,
    products,
    user,
    currency,
    backend,
    buyNowProduct,
    buyNowSize,
    setBuyNowProduct,
    setBuyNowSize,
  } = useContext(ShopContext);

  const navigate = useNavigate();
  const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_KEY;

  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullname: '',
    phone: '',
    email: user?.email || '',
    region: '',
    city: '',
    street: '',
    landmark: '',
    directions: '',
  });

  // Determine if this is Buy Now or Cart checkout
  const isBuyNow = buyNowProduct && buyNowSize;

  // Update email when user logs in
  useEffect(() => {
    if (user?.email) {
      setAddress((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  // Build cart data - EITHER from buyNow OR from cartItems
  const cartData = [];

  if (isBuyNow) {
    // Buy Now: Single product
    cartData.push({
      productId: buyNowProduct.id,
      name: buyNowProduct.name,
      size: buyNowSize,
      price: buyNowProduct.price,
      quantity: 1,
      image: buyNowProduct.images?.[0],
    });
  } else {
    // Cart checkout: Multiple products
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        const product = products.find((p) => p.id === itemId);
        if (!product) continue;
        cartData.push({
          productId: itemId,
          name: product.name,
          size,
          price: product.price,
          quantity: cartItems[itemId][size],
          image: product.images?.[0],
        });
      }
    }
  }

  // Check if cart is empty
  useEffect(() => {
    if (cartData.length === 0) {
      toast.info('Your cart is empty');
      navigate('/');
    }
  }, [cartData.length, navigate]);

  // Handle form input
  function handleChange(e) {
    setAddress({ ...address, [e.target.name]: e.target.value });
  }

  // Validate form
  function validateForm() {
    const required = ['fullname', 'phone', 'email', 'region', 'city', 'street'];

    for (const field of required) {
      if (!address[field] || address[field].trim() === '') {
        toast.error(`Please fill in ${field.replace('_', ' ')}`);
        return false;
      }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(address.email)) {
      toast.error('Please enter a valid email');
      return false;
    }

    // Validate phone
    if (address.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }

    return true;
  }

  // Calculate totals
  const subtotal = isBuyNow ? buyNowProduct.price : getCartTotalPrice();
  const deliveryFee = 0;
  const totalAmount = subtotal + deliveryFee;

  // Handle checkout
  async function handleCheckout(e) {
    e.preventDefault();

    if (!validateForm()) return;
    if (cartData.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
      toast.error('Invalid cart total');
      return;
    }

    setLoading(true);

    try {
      // Check if Paystack script is loaded
      if (typeof PaystackPop === 'undefined') {
        toast.error('Payment system not loaded. Please refresh the page.');
        setLoading(false);
        return;
      }

      // 1. CREATE ORDER FIRST (with Pending payment status)
      const orderResponse = await fetch(`${backend}/api/order/place`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items: cartData,
          address: {
            firstName: address.fullname.split(' ')[0] || address.fullname,
            lastName: address.fullname.split(' ').slice(1).join(' ') || '',
            email: address.email,
            street: `${address.street}${
              address.landmark ? ', ' + address.landmark : ''
            }`,
            city: address.city,
            state: address.region,
            zipcode: '00000',
            country: 'Ghana',
            phone: address.phone,
          },
          paymentInfo: {
            method: 'Paystack',
            status: 'Pending',
          },
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        toast.error(orderData.message || 'Failed to create order');
        setLoading(false);
        return;
      }

      const orderId = orderData.order._id;

      // 2. NOW OPEN PAYSTACK
      const handler = PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: address.email,
        amount: totalAmount * 100, // Convert to pesewas
        currency: 'GHS',
        metadata: {
          custom_fields: [
            {
              display_name: 'Customer Name',
              variable_name: 'customer_name',
              value: address.fullname,
            },
            {
              display_name: 'Phone Number',
              variable_name: 'phone',
              value: address.phone,
            },
            {
              display_name: 'Order ID',
              variable_name: 'order_id',
              value: orderId,
            },
          ],
        },
        callback: function (response) {
          // Payment successful - verify it
          verifyPayment(response.reference, orderId);
        },
        onClose: function () {
          toast.info('Payment cancelled');
          setLoading(false);
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to initialize payment');
      setLoading(false);
    }
  }

  // Verify payment (simplified - just verify, don't create order)
  async function verifyPayment(reference, orderId) {
    try {
      const verifyResponse = await fetch(`${backend}/api/order/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          reference: reference,
          orderId: orderId,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        // Clear buyNow state if this was a Buy Now order
        if (isBuyNow) {
          setBuyNowProduct(null);
          setBuyNowSize(null);
        }

        toast.success('Order placed successfully!');
        navigate(`/verify?reference=${reference}&success=true`);
      } else {
        toast.error(verifyData.message || 'Payment verification failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Failed to verify payment');
      setLoading(false);
    }
  }

  useEffect(() => {
    console.log(PAYSTACK_KEY);
  }, []);

  return (
    <main className="placeOrders-section">
      <div className="container">
        <div className="wrapper">
          <div className="address-form">
            <form onSubmit={handleCheckout}>
              {/* Personal Details */}
              <div className="personal-wrapper">
                <div className="form-item-title flex gap1">
                  <p>1. Personal Details</p>
                </div>
                <div className="personal-detail-input-wrapper flex gap2">
                  <div className="item">
                    <p>Full Name *</p>
                    <input
                      type="text"
                      name="fullname"
                      placeholder="John Mensah"
                      value={address.fullname}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="item">
                    <p>Phone Number *</p>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="0551449038"
                      value={address.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="personal-detail-input-wrapper">
                  <div className="item">
                    <p>Email Address *</p>
                    <input
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      value={address.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="delivery-wrapper">
                <div className="form-item-title flex gap1">
                  <p>2. Delivery Address</p>
                </div>
                <div className="personal-detail-input-wrapper flex gap2">
                  <div className="item">
                    <label htmlFor="region" className="label">
                      Region *
                    </label>
                    <select
                      className="select"
                      name="region"
                      value={address.region}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Region</option>
                      <option value="Greater Accra">Greater Accra</option>
                      <option value="Ashanti">Ashanti</option>
                      <option value="Bono">Bono</option>
                      <option value="Northern">Northern</option>
                      <option value="Eastern">Eastern</option>
                      <option value="Western">Western</option>
                      <option value="Central">Central</option>
                      <option value="Volta">Volta</option>
                    </select>
                  </div>
                  <div className="item">
                    <p>City *</p>
                    <input
                      type="text"
                      name="city"
                      placeholder="Accra"
                      value={address.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="sub-main">
                  <p className="landmark-title flex gap">
                    Street Address <span>*</span>
                  </p>
                  <input
                    type="text"
                    name="street"
                    placeholder="123 Main Street"
                    value={address.street}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="sub-main">
                  <p className="landmark-title">Nearest Landmark (Optional)</p>
                  <input
                    type="text"
                    name="landmark"
                    placeholder="e.g Near Shell Station, opposite the Big Neem Tree"
                    value={address.landmark}
                    onChange={handleChange}
                  />
                </div>

                <div className="tertiary-section">
                  <p>Additional Directions (Optional)</p>
                  <textarea
                    name="directions"
                    placeholder="Describe your gate house color or specific entry instructions..."
                    value={address.directions}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="proceed-btn"
                disabled={loading}
                style={{
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'PROCESSING...' : 'PROCEED TO PAYMENT'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="order-map-section">
            <div className="order-summary">
              <p className="order-title">Order Summary</p>

              {/* Cart Items */}
              <div className="order-items" style={{ marginBottom: '16px' }}>
                {cartData.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          marginBottom: '4px',
                        }}
                      >
                        {item.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#666' }}>
                        Size: {item.size} | Qty: {item.quantity}
                      </p>
                    </div>
                    <p style={{ fontWeight: '600', color: '#fff' }}>
                      {currency}
                      {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <p className="order-subtotal">
                SubTotal (
                {cartData.reduce((sum, item) => sum + item.quantity, 0)} item
                {cartData.reduce((sum, item) => sum + item.quantity, 0) !== 1
                  ? 's'
                  : ''}
                )
                <span>
                  {currency}
                  {subtotal.toFixed(2)}
                </span>
              </p>
              <p className="order-delivery flex-sb">
                Delivery Fee
                <span>
                  {currency} {deliveryFee}
                </span>
              </p>
              <p className="total-amount">Total Amount</p>
              <p className="total-number flex-sb">
                {currency}
                {totalAmount.toFixed(2)}
              </p>
              <p className="order-bottom">
                SECURE CHECKOUT POWERED BY PAYSTACK
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default PlaceOrders;
