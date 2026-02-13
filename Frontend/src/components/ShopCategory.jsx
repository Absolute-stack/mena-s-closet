import { Link } from 'react-router-dom';

const PRELOAD_WOMEN = () => import('../pages/Women.jsx');
const PRELOAD_MEN = () => import('../pages/Men.jsx');
const PRELOAD_ACCESSORIES = () => import('../pages/Accessories.jsx');
function ShopCategory() {
  return (
    <section className="shop-category">
      <div className="container">
        <div className="titles-containers">
          <div className="title-container">
            <h2 className="shop-title">Shop by Category</h2>
            <p className="shop-subtitle">Explore our latest collections</p>
          </div>
        </div>
        <div className="category-grid">
          <Link
            to="/women"
            onMouseEnter={PRELOAD_WOMEN}
            onTouchStart={PRELOAD_WOMEN}
            className="card"
          >
            <img src="/dress_image.avif" alt="women's-fashion" loading="lazy" />
            <div className="card-content">
              <p>Women's Fashion</p>
            </div>
          </Link>
          <Link
            to="/men"
            onMouseEnter={PRELOAD_MEN}
            onTouchStart={PRELOAD_MEN}
            className="card"
          >
            <img src="/mens_image.avif" alt="men's-fashion" loading="lazy" />
            <div className="card-content">
              <p>Men's Fashion</p>
            </div>
          </Link>
          <Link
            to="/accessories"
            onMouseEnter={PRELOAD_ACCESSORIES}
            onTouchStart={PRELOAD_ACCESSORIES}
            className="card"
          >
            <img src="accessories.avif" alt="accessories" loading="lazy" />
            <div className="card-content">
              <p>Accessories</p>
            </div>
          </Link>
        </div>
        <div className="limited-sale-offer">
          <div className="content">
            <p className="limited-tag">Limited Offer</p>
            <p className="sale-title">End of Season Sale</p>
            <p>Up to 50% Off on Selected items</p>
            <button type="button" className="shop-details">
              Shop Deals
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
export default ShopCategory;
