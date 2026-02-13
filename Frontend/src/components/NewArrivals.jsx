import { useContext } from 'react';
import { ShopContext } from './ShopContext';
import Productitem from './Productitem';
import './NewArrivals.css';

function NewArrivals() {
  const { products } = useContext(ShopContext);

  if (!products) {
    return <div>Loading....</div>;
  }

  const newArrivals = products?.slice(0, 3);

  return (
    <section className="newarrivals">
      <div className="container">
        <div className="newarrivals-grid">
          <div className="intro-content">
            <p className="info-title">New Arrivals. This Week</p>
            <p className="info-subtitle">
              Be the first to wear the latest trends in Ghana.
            </p>
          </div>
          <div className="card-grid-container">
            {newArrivals.map((product) => {
              return (
                <Productitem
                  id={product.id}
                  key={product.id}
                  name={product.name}
                  images={product.images}
                  price={product.price}
                  alt={product.alt}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
export default NewArrivals;
