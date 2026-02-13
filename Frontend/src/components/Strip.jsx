import { assests } from '../assets/assets';
import './Strip.css';

function Strip() {
  return (
    <div className="strip">
      <div className="container flex">
        <div className="strip-item flex gap2">
          <div className="img-holder">
            <img src="/phone.svg" alt="phone-icon" loading="lazy" />
          </div>
          <div className="info-holder">
            <p className="info-title">Mobile Money Payments</p>
            <p className="info-subtitle">Secure via Mobile Money</p>
          </div>
        </div>
        <div className="strip-item flex gap2">
          <div className="img-holder">
            <img src="/return.svg" alt="back-item" loading="lazy" />
          </div>
          <div className="info-holder">
            <p className="info-title">Easy Returns</p>
            <p className="info-subtitle">Hassle-free returns within 7 days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Strip;
