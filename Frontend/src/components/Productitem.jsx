import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from './ShopContext';
import './Productitem.css';

function Productitem({ id, name, images, price, alt }) {
  const { currency } = useContext(ShopContext);
  const preloadProduct = () => import('../pages/Product.jsx');

  return (
    <Link
      to={`/product/${id}`}
      onMouseEnter={preloadProduct}
      onTouchStart={preloadProduct}
      className="product-item"
    >
      <div className="product-img-container">
        <img
          src={images?.[0]}
          alt={alt}
          loading="lazy"
          decoding="async"
          fetchPriority="high"
        />
      </div>
      <div className="product-info-container">
        <p className="product-name">{name}</p>
        <p className="product-price flex gap">
          {currency}
          {price}
        </p>
      </div>
    </Link>
  );
}
export default Productitem;
