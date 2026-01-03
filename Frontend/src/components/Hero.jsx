import { assests } from '../assets/assets';
import './Hero.css';

function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-img-container">
          <img
            className="hero-img"
            src={assests.hero}
            alt="female black model posing in-front of camera"
            loading="eager"
            fetchPriority="high"
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
            <button type="button" className="hero-main-btn flex gap">
              Shop New Arrivals
              <img
                src={assests.right_arrow}
                alt="right_arrow"
                loading="eager"
                fetchPriority="high"
              />
            </button>
            <button type="button" className="hero-sec-btn flex gap">
              How it Works
              <img
                src={assests.clock_icon}
                alt="clock_icon"
                loading="eager"
                fetchPriority="high"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
