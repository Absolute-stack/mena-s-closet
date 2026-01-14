import { useContext } from 'react';
import { ShopContext } from '../components/ShopContext';
import './Cart.css';
import CartEmpty from '../components/CartEmpty';

function Cart() {
  const {
    cartItems,
    products,
    currency,
    updateCart,
    getCartTotalPrice,
    getTotalCartNumber,
  } = useContext(ShopContext);

  const cartData = [];

  for (const itemId in cartItems) {
    for (const size in cartItems[itemId]) {
      const product = products.find((p) => String(p.id) === String(itemId));
      if (!product) continue;

      cartData.push({
        ...product,
        productId: itemId,
        size,
        quantity: cartItems[itemId][size],
      });
    }
  }

  if (!cartData.length) return <CartEmpty />;

  return (
    <main className="cart-page">
      <div className="container">
        {cartData.map((item, index) => (
          <div className="cart-item" key={index}>
            <img src={item.images?.[0]} alt={item.name} />

            <p>{item.name}</p>
            <p>Size: {item.size}</p>

            <button
              onClick={() =>
                updateCart(item.size, item.productId, item.quantity - 1)
              }
              disabled={item.quantity <= 1}
            >
              -
            </button>

            <span>{item.quantity}</span>

            <button
              onClick={() =>
                updateCart(item.size, item.productId, item.quantity + 1)
              }
            >
              +
            </button>

            <p>
              {currency}
              {(item.price * item.quantity).toFixed(2)}
            </p>

            <button onClick={() => updateCart(item.size, item.productId, 0)}>
              Remove
            </button>
          </div>
        ))}

        <h3>
          Total ({getTotalCartNumber()} items): {currency}
          {getCartTotalPrice().toFixed(2)}
        </h3>
      </div>
    </main>
  );
}

export default Cart;
