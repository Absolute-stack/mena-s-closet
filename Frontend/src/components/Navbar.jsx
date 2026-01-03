import { assests } from '../assets/assets.js';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="nav">
      <div className="container flex-sb">
        <div className="logo-container flex gap">
          <img
            src={assests.logo}
            alt="logo"
            loading="eager"
            fetchPriority="high"
          />
          <p>Mena's Closet</p>
        </div>
        <div className="searchbar-container">
          <input
            type="text"
            className="searchbar"
            placeholder="Search for dresses,shoes,accessories..."
          />
          <img
            src={assests.search_icon}
            alt="search-icon"
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <div className="nav-icons-container flex gap1">
          <div className="cart-icon-container">
            <img
              src={assests.cart_icon}
              alt="cart-bag"
              loading="eager"
              fetchPriority="high"
            />
            <p className="cart-number">0</p>
          </div>
          <img
            src={assests.user_icon}
            alt="user_icon"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
