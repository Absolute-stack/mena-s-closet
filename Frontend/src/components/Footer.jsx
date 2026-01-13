import { Link } from 'react-router-dom';
import { assests } from '../assets/assets';
import './Footer.css';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        {/* TOP SECTION */}
        <div className="footer-top">
          {/* LOGO */}
          <div className="footer-logo">
            <Link to={'/'} className="flex">
              <img src={assests.logo} alt="mena's-closet-logo" loading="lazy" />
              <p className="footer-title">Mena's Closet</p>
            </Link>
          </div>

          <div className="footer-section shop">
            <h2 className="footer-title">Shop</h2>
            <div className="footer-links">
              <Link to="/women">Women</Link>
              <Link to="/men">Men</Link>
              <Link to="/accessories">Accessories</Link>
            </div>
          </div>

          <div className="footer-section help">
            <h2 className="footer-title">Help</h2>
            <div className="footer-links">
              <Link to="/orders">Track Order</Link>
              <Link to="/return">Return & Exchange</Link>
              <Link to="shipping">Shipping Info</Link>
              <Link to="/contact">Contact Us</Link>
            </div>
          </div>

          <div className="footer-section payment">
            <h2 className="footer-title">Payment Methods</h2>
            <div className="momo-images-container">
              <img src="/mtn-momo.webp" alt="MTN-logo" />
              <img src="/telecel-momo.webp" alt="Telecel-logo" />
              <img src="/visa.webp" alt="Visa-logo" />
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="footer-bottom ">
          &copy; {year} Mena's Closet Ghana. All Rights Reserved. Made By{' '}
          <a href="">Absolute-Stack</a> With Care.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
