import { Link } from 'react-router-dom';
import { assests } from '../assets/assets.js';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="nav">
      <div className="container flex-sb">
        <Link to="/" className="logo-container flex gap">
          <img src={assests.logo} alt="logo" />
          <p>Mena's Closet</p>
        </Link>
        <div className="searchbar-container">
          <input
            type="text"
            className="searchbar"
            placeholder="Search for dresses,shoes,accessories..."
          />
          <img src={assests.search_icon} alt="search-icon" />
        </div>
        <div className="nav-icons-container flex gap1">
          <div className="cart-icon-container">
            <img src={assests.cart_icon} alt="cart-bag" />
            <p className="cart-number">0</p>
          </div>
          <img src={assests.user_icon} alt="user_icon" />
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
