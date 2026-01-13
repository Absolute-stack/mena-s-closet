import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { assests } from '../assets/assets';
import { ShopContext } from '../components/ShopContext';
import './PlaceOrders.css';

function PlaceOrders() {
  const { buyNowProduct, buyNowSize, currency } = useContext(ShopContext);

  const pGender = buyNowProduct.gender;
  const pId = buyNowProduct.id;
  const price = buyNowProduct.price;
  return (
    <main className="placeOrders-section">
      <div className="container">
        <div className="place-order-page-nav flex gap">
          <Link to="/" className="link">
            Home
          </Link>
          <span>&gt;</span>
          <Link to={`/${pGender}`} className="link">
            {pGender}
          </Link>
          <span>&gt;</span>
          <Link to={`/product/${pId}`} className="link">
            {pId}
          </Link>
          <span>&gt;</span>
          <a href="#" className="link">
            PlaceOrders
          </a>
        </div>
        <div className="wrapper">
          <div className="address-form">
            <form action="#">
              <div className="personal-wrapper">
                <div className="form-item-title flex gap1">
                  <img
                    src={assests.user_icon}
                    alt="human-figure"
                    loading="lazy"
                    decoding="async"
                  />
                  <p>1.Personal Details</p>
                </div>
                <div className="personal-detail-input-wrapper flex gap2">
                  <div className="item">
                    <p>Full Name</p>
                    <input type="text" placeholder="John Mensah" required />
                  </div>
                  <div className="item">
                    <p>Phone Number</p>
                    <input type="number" placeholder="0551449038" required />
                  </div>
                </div>
              </div>
              <div className="delivery-wrapper">
                <div className="form-item-title flex gap1">
                  <img
                    src={assests.user_icon}
                    alt="human-figure"
                    loading="lazy"
                    decoding="async"
                  />
                  <p>2.Delivery Address</p>
                </div>
                <div className="personal-detail-input-wrapper flex gap2">
                  <div className="item">
                    <label htmlFor="select" className="label">
                      Region
                    </label>
                    <select className="select" name="select required">
                      <option value="">Accra</option>
                      <option value="" selected>
                        Kumasi
                      </option>
                      <option value="">Bono</option>
                      <option value="">Northern</option>
                      <option value="">Eastern</option>
                    </select>
                  </div>
                  <div className="item">
                    <p>Digital Address</p>
                    <input type="text" placeholder="AK-GH-11-00" required />
                  </div>
                </div>
                <div className="sub-main">
                  <p className="landmark-title flex gap">
                    Nearest Landmark<span>*</span>
                  </p>
                  <input
                    type="text"
                    placeholder="e.g Near Shell Station, opposite the Big Neem Tree (Optional)"
                  />
                </div>
                <div className="tertiary-section">
                  <p className="">Additional Directions</p>
                  <textarea placeholder="Describe Your Gate House Color Or Specifi Entry Instructions..."></textarea>
                </div>
              </div>
            </form>
          </div>
          <div className="order-map-section">
            <div className="order-summary">
              <p className="order-title">Order Summary</p>
              <p className="order-subtotal">
                SubTotal(1 item){' '}
                <span>
                  {currency}
                  {price}
                </span>
              </p>
              <p className="order-delivery">
                Delivery Fee
                <span>{currency} 30</span>
              </p>
              <p className="total-amount">Total Amount</p>
              <p className=" total-number flex-sb">
                {currency}
                {(price + 30).toFixed(2)}{' '}
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                  >
                    <path
                      d="M12 1.976 1.924 4.215 2 5.09c.107 1.175 1.139 11.54 4.441 13.742a52.689 52.689 0 0 0 5.112 3.068l.447.223.447-.223a52.833 52.833 0 0 0 5.108-3.063C20.857 16.63 21.889 6.265 22 5.09l.079-.875zm4.445 15.192c-2.1 1.4-3.7 2.3-4.445 2.7-.741-.4-2.35-1.3-4.445-2.7C5.791 15.992 4.547 9.9 4.085 5.783L12 4.024l7.915 1.759c-.462 4.117-1.706 10.209-3.47 11.385z"
                      style={{ fill: '#ffa17cff' }}
                    />
                    <path
                      d="m9.707 10.293-1.414 1.414 3.862 3.863 4.677-7.015-1.664-1.11-3.323 4.985-2.138-2.137z"
                      style={{ fill: '#ffa17cff' }}
                    />
                  </svg>
                </span>
              </p>
              <button type="button" className="proceed-btn">
                PROCEED TO PAYMENT
              </button>
              <p className="order-bottom">
                SECURE CHECKOUT POWERED BY MENA'S CLOSET
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default PlaceOrders;
