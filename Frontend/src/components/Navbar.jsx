import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assests } from '../assets/assets.js';
import { ShopContext } from './ShopContext';
import './Navbar.css';

function Navbar() {
  const { products, currency, getTotalCartNumber } = useContext(ShopContext);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const filtered = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 6); // limit suggestions

    setResults(filtered);
  }, [query, products]);

  function handleSelect(id) {
    setQuery('');
    setResults([]);
    navigate(`/product/${id}`);
  }

  return (
    <nav className="nav">
      <div className="container flex-sb">
        <Link to="/" className="logo-container flex gap">
          <img src={assests.logo} alt="logo" />
          <p>Mena's Closet</p>
        </Link>

        {/* SEARCH */}
        <div className="searchbar-container">
          <input
            type="text"
            className="searchbar"
            placeholder="Search for dresses, shoes, accessories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <img src={assests.search_icon} alt="search-icon" />

          {/* DROPDOWN */}
          {results.length > 0 && (
            <div className="search-dropdown">
              {results.map((item) => (
                <div
                  key={item.id}
                  className="search-item"
                  onClick={() => handleSelect(item.id)}
                >
                  <img src={item.images[0]} alt={item.name} />
                  <div>
                    <p className="search-name">{item.name}</p>
                    <p className="search-price">
                      {currency}
                      {item.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="nav-icons-container flex gap1">
          <div className="cart-icon-container">
            <img src={assests.cart_icon} alt="cart-bag" />
            <span className="cart-number">{getTotalCartNumber}</span>
          </div>
          <img src={assests.user_icon} alt="user_icon" />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
