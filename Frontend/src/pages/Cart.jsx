import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../components/ShopContext';
import './Cart.css';

function Cart() {
  const {
    cartItems,
    products,
    currency,
    updateCart,
    getCartTotalPrice,
    getTotalCartNumber,
    isLoadingCart,
  } = useContext(ShopContext);

  const navigate = useNavigate();

  // Derive cart data from cartItems
  const cartData = [];
  for (const itemId in cartItems) {
    for (const size in cartItems[itemId]) {
      const product = products.find((p) => p.id === itemId);
      if (!product) continue;

      cartData.push({
        ...product,
        productId: itemId,
        size,
        quantity: cartItems[itemId][size],
      });
    }
  }

  // Show loading state
  if (isLoadingCart) {
    return (
      <main className="cart-page">
        <div className="container">
          <p style={{ textAlign: 'center', padding: '40px' }}>
            Loading cart...
          </p>
        </div>
      </main>
    );
  }

  // Show empty cart
  if (cartData.length === 0) {
    return (
      <main className="cart-page">
        <div className="container">
          <div style={emptyCartStyles.container}>
            <div style={emptyCartStyles.icon}>🛒</div>
            <h2>Your Cart is Empty</h2>
            <p>Add some items to get started!</p>
            <button
              onClick={() => navigate('/')}
              style={emptyCartStyles.button}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
    );
  }

  const subtotal = getCartTotalPrice();
  const deliveryFee = 30; // Your original delivery fee
  const total = subtotal + deliveryFee;
  const totalItems = getTotalCartNumber();

  return (
    <main className="cart-page">
      <div className="container">
        {cartData.map((item, index) => (
          <div
            className="cart-item"
            key={`${item.productId}-${item.size}-${index}`}
          >
            <div className="cart-item-img-holder">
              <img
                src={item.images?.[0]}
                alt={item.alt}
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="cart-item-info-wrapper">
              <p className="cart-item-title">{item.name}</p>
              <p className="cart-item-category">{`Category: ${item.category}`}</p>
              <p className="cart-item-size flex gap">
                Size: <span>{item.size}</span>
              </p>

              <div className="qty-controller flex gap1">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() =>
                    updateCart(item.size, item.productId, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                >
                  −
                </button>

                <span className="qty-value">{item.quantity}</span>

                <button
                  type="button"
                  className="qty-btn"
                  onClick={() =>
                    updateCart(item.size, item.productId, item.quantity + 1)
                  }
                >
                  +
                </button>
              </div>
            </div>

            <div className="cart-price-remove">
              <p className="cart-item-price">
                {currency} {(item.quantity * item.price).toFixed(2)}
              </p>
              <button
                type="button"
                onClick={() => updateCart(item.size, item.productId, 0)}
                className="flex"
              >
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                    <path
                      d="M16 0a16 16 0 1 0 16 16A16 16 0 0 0 16 0zM2 16A14 14 0 0 1 25.15 5.43L5.43 25.15A13.93 13.93 0 0 1 2 16zm14 14a13.93 13.93 0 0 1-9.15-3.43L26.57 6.85A14 14 0 0 1 16 30z"
                      data-name="95-Remove"
                    />
                  </svg>
                </span>
                Delete Item
              </button>
            </div>
          </div>
        ))}

        <div className="order-map-section">
          <div className="order-summary">
            <p className="order-title">Order Summary</p>
            <p className="order-subtotal">
              SubTotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
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
              {total.toFixed(2)}
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                  <path
                    d="M12 1.976 1.924 4.215 2 5.09c.107 1.175 1.139 11.54 4.441 13.742a52.689 52.689 0 0 0 5.112 3.068l.447.223.447-.223a52.833 52.833 0 0 0 5.108-3.063C20.857 16.63 21.889 6.265 22 5.09l.079-.875zm4.445 15.192c-2.1 1.4-3.7 2.3-4.445 2.7-.741-.4-2.35-1.3-4.445-2.7C5.791 15.992 4.547 9.9 4.085 5.783L12 4.024l7.915 1.759c-.462 4.117-1.706 10.209-3.47 11.385z"
                    style={{ fill: '#ffa17cff' }}
                  />
                  <path
                    d="m9.707 10.293-1.414 1.414 3.862 3.863 4.677-7.015-1.664-1.11-3.323 4.985-2.138-2.137z"
                    style={{ fill: '#ffa17cff' }}
                  />
                </svg>
              </span>
            </p>
            <button
              type="button"
              className="proceed-btn"
              onClick={() => navigate('/placeorders')}
            >
              PROCEED TO CHECKOUT
            </button>
            <p className="order-bottom">
              SECURE CHECKOUT POWERED BY MENA'S CLOSET
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

const emptyCartStyles = {
  container: {
    minHeight: '60vh', // gives vertical space (not too tall on mobile)
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center', // vertical center
    alignItems: 'center', // horizontal center
    textAlign: 'center',
    padding: 'clamp(40px, 8vw, 80px) 20px',
    maxWidth: '900px',
    margin: '0 auto',
  },

  icon: {
    fontSize: 'clamp(50px, 10vw, 90px)',
    marginBottom: 'clamp(16px, 3vw, 28px)',
  },

  button: {
    marginTop: 'clamp(16px, 3vw, 28px)',
    padding: 'clamp(10px, 2vw, 14px) clamp(24px, 5vw, 36px)',
    backgroundColor: '#ffa17c',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: 'clamp(14px, 2vw, 17px)',
    fontWeight: '500',
    cursor: 'pointer',
    minWidth: '160px',
  },
};

export default Cart;
