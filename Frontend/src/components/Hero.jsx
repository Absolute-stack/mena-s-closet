import { Link } from 'react-router-dom';
import { assests } from '../assets/assets';
import './Hero.css';

function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-img-container">
          <img
            className="hero-img"
            src={'/hero.avif'}
            alt="female black model posing in-front of camera"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </div>
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
            <Link to="/women">
              <button type="button" className="hero-main-btn flex gap">
                Shop Women
                <img src={assests.right_arrow} alt="right_arrow" />
              </button>
            </Link>
            <Link to="/men">
              <button type="button" className="hero-sec-btn flex gap">
                Shop Men
                <img src={assests.right_arrow} alt="right_arrow" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
