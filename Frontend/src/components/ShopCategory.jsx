import { assests } from '../assets/assets';

function ShopCategory() {
  return (
    <section className="shop-category">
      <div className="container">
        <div className="titles-containers">
          <div className="title-container">
            <h2 className="shop-title">Shop by Category</h2>
            <p className="shop-subtitle">Explore our latest collections</p>
          </div>
          <div className="flex gap">
            <p className="view flex gap">
              View All <span>&#8594;</span>
            </p>
          </div>
        </div>
        <div className="category-grid">
          <div className="card">
            <img src={assests.dress_img} alt="women's-fashion" loading="lazy" />
            <div className="card-content">
              <p>Women's Fashion</p>
            </div>
          </div>
          <div className="card">
            <img src={assests.mens_img} alt="men's-fashion" loading="lazy" />
            <div className="card-content">
              <p>Men's Fashion</p>
            </div>
          </div>
          <div className="card">
            <img src={assests.accessories} alt="accessories" loading="lazy" />
            <div className="card-content">
              <p>Accessories</p>
            </div>
          </div>
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
