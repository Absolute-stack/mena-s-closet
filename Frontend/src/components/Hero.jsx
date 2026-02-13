import { Link } from 'react-router-dom';
import { assests } from '../assets/assets';
import './Hero.css';

function Hero() {
  const preloadWomen = () => import('../pages/Women.jsx');
  const preloadMen = () => import('../pages/Men.jsx');

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-img-container">
          <img
            className="hero-img"
            src="/hero.avif"
            alt="female black model posing in front of camera"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            width="1920"
            height="1080"
          />

          {/* ABSOLUTE CONTENT (UNCHANGED BEHAVIOR) */}
          <div className="hero-content">
            <div className="hero-tag">
              <p>Premium Collection</p>
            </div>

            <h2 className="hero-title">
              Quality Fashion Delivered to Your Doorstep in Ghana
            </h2>

            <p className="hero-subtitle">
              Shop with Confidence - Easy Returns, Secure Payment, Fast Delivery
            </p>

            <div className="btn-container">
              <Link
                to="/women"
                onMouseEnter={preloadWomen}
                className="hero-main-btn flex gap"
              >
                <p>Shop</p>
                <p>Women</p>
                <img src={assests.right_arrow} alt="" />
              </Link>

              <Link
                to="/men"
                onMouseEnter={preloadMen}
                className="hero-sec-btn flex gap"
              >
                <p>Shop</p>
                <p>Men</p>
                <img src={assests.right_arrow} alt="" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
