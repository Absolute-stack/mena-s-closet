import { Link } from 'react-router-dom';
import { assests } from '../assets/assets';
import './Footer.css';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <Link to={'/'} className="flex gap">
            <img src={assests.logo} alt="mena's-closet-logo" loading="lazy" />
            <p className="footer-title">Mena's Closet</p>
          </Link>
          <h2 className="footer-title">Shop</h2>
          <h2 className="footer-title">Help</h2>
          <h2 className="footer-title">Payment Methods</h2>
        </div>
        <div className="footer-mid">
          <div className="footer-description">
            <p>
              Premium fashion for the modern Ghanaian Quality, elegance, and
              convienence delivered to you.
            </p>
            <span className="flex gap1">
              <img
                src="/thumbs_icon.svg"
                alt="globe-icon"
                className="footer-icons"
                loading="lazy"
              />
              <img
                src="/globe_icon.svg"
                alt="thumbs-up-icon"
                className="footer-icons"
                loading="lazy"
              />
            </span>
          </div>
          <div className="shop-links">
            <Link to="/women">Women</Link>
            <Link to="/men">Men</Link>
            <Link to="/accessories">Accessories</Link>
          </div>
          <div className="help-links">
            <Link to="/orders">Track Order</Link>
            <Link to="/return">Return & Exchange</Link>
            <Link to="shipping">Shipping Info</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
          <div className="momo-images-container">
            <img src="/mtn-momo.webp" alt="MTN-logo" loading="lazy" />
            <img src="/telecel-momo.webp" alt="Telecel-logo" loading="lazy" />
            <img src="/visa.webp" alt="Visa-logo" loading="lazy" />
          </div>
        </div>
        <div className="footer-bottom flex gap">
          &copy; {year} Mena's Closet Ghana.All Rights Reserved. Made By{' '}
          <a href="">Absolute-Stack</a> With Care.
        </div>
      </div>
    </footer>
  );
}
export default Footer;
