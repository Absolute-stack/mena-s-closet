import './CartEmpty.css';

function CartEmpty() {
  return (
    <main className="cart-empty-page">
      <div className="cart-empty-container">
        <div className="cart-empty-icon">🛒</div>
        <h1>Your Cart is Empty</h1>
        <p>
          Looks like you haven’t added anything to your cart yet. Start shopping
          and fill it up!
        </p>
        <a href="/" className="shop-now-btn">
          Shop Now
        </a>
      </div>
    </main>
  );
}

export default CartEmpty;
