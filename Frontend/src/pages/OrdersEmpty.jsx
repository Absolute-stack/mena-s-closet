import './OrdersEmpty.css';

function OrdersEmpty() {
  return (
    <main className="orders-empty-page">
      <div className="orders-empty-container">
        <div className="orders-empty-icon">📦</div>
        <h1>No Orders Yet</h1>
        <p>
          You haven’t placed any orders so far. Browse our products and make
          your first purchase!
        </p>
        <a href="/" className="shop-now-btn">
          Shop Products
        </a>
      </div>
    </main>
  );
}

export default OrdersEmpty;
