import { useEffect, useState, useMemo } from 'react';
import Productitem from './Productitem';
import './ProductGrid.css';

function ProductGrid({ products }) {
  if (!Array.isArray(products)) {
    throw new Error('products must be an array');
  }
  const ITEMS_PER_LOAD = 30;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_LOAD);
  }, [products]);

  const visibleProducts = useMemo(() => {
    return products.slice(0, visibleCount);
  }, [products, visibleCount]);

  function loadMore() {
    setVisibleCount((prevCount) => prevCount + ITEMS_PER_LOAD);
  }

  if (!products || products.length === 0) {
    return <div>No Products Found</div>;
  }

  return (
    <section className="product-grid">
      <div className="container">
        {visibleProducts.map((product) => (
          <Productitem
            key={product.id}
            id={product.id}
            images={product.images}
            name={product.name}
            price={product.price}
            alt={product.name}
          />
        ))}
      </div>
      {visibleCount < products.length && (
        <div className="load-more-container">
          <button type="button" className="load-more-btn" onClick={loadMore}>
            Load More
          </button>
        </div>
      )}
    </section>
  );
}

export default ProductGrid;
