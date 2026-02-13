import './HeroImage.css';
function HeroImage({ src, alt, title, subtitle }) {
  return (
    <section className="hero-img-section">
      <div className="container">
        <figure className="heroimg-container">
          <img
            src={src}
            alt={alt}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </figure>
        <div className="heroimg-section-content">
          <div className="heroimg-tag-container">
            <div className="line"></div>
            <p className="hero-section-tag">Premium Collection</p>
          </div>
          <h2>{title}</h2>
          <p className="heroimg-section-subtitle">{subtitle}</p>
        </div>
      </div>
    </section>
  );
}
export default HeroImage;
