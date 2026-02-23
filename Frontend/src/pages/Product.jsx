import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../components/ShopContext';
import PageNav from '../components/PageNav';
import Productitem from '../components/Productitem';
import './Product.css';

function Product() {
  const { products, addToCart, currency, buyNow } = useContext(ShopContext);
  const { id } = useParams();
  const [fabric, setFabric] = useState(false);
  const [delivery, setDelivery] = useState(false);
  const [s, setS] = useState('');
  const [image, setImage] = useState(''); // Initialize as empty string
  const [relatedProducts, setRelatedProducts] = useState([]);
  const isDesktop = !/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  function handleClick(target) {
    target((prevValue) => !prevValue);
  }

  const product = products?.find((p) => String(p.id) === String(id));

  if (!products || products.length === 0) {
    return <div>Loading product...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  function handleImages(src) {
    setImage(src);
  }

  function handleSize(e) {
    const size = e.target.textContent;
    setS(size);
  }

  useEffect(() => {
    setRelatedProducts(
      products
        .filter(
          (p) =>
            p.category === product.category &&
            p.gender === product.gender &&
            p.id !== product.id,
        )
        .slice(0, 4),
    );
  }, [product, products]);

  useEffect(() => {
    if (!product) return;

    window.scrollTo(0, 0);
    setImage(product.images[0]);
    setS('');
  }, [product]);

  useEffect(() => {
    if (isDesktop) {
      const hasRefreshed = sessionStorage.getItem('product_refreshed');

      if (!hasRefreshed) {
        sessionStorage.setItem('product_refreshed', 'true');
        window.location.reload();
      }

      return () => {
        sessionStorage.removeItem('product_refreshed');
      };
    }
  }, []);

  const isAccessory =
    product.accessories === true ? 'Accessories' : `${product.gender}`;

  return (
    <main className="product-wrapper">
      <div className="container">
        <PageNav page={isAccessory} />
        <div className="product-container flex gap2">
          <div className="wrapper">
            <div className="product-img-wrapper">
              <img
                className="product-hero-img"
                src={image}
                alt={product.name}
                loading="eager"
                decoding="async"
              />
            </div>
            <div className="product-strip flex gap2">
              <img
                onClick={() => handleImages(product.images?.[0])}
                src={product.images?.[0]}
                alt={product.alt}
                loading="lazy"
                decoding="async"
              />
              <img
                onClick={() => handleImages(product.images?.[1])}
                src={product.images?.[1]}
                alt={product.alt}
                loading="lazy"
                decoding="async"
              />
              <img
                onClick={() => handleImages(product.images?.[2])}
                src={product.images?.[2]}
                alt={product.alt}
                loading="lazy"
                decoding="async"
              />
              <img
                onClick={() => handleImages(product.images?.[3])}
                src={product.images?.[3]}
                alt={product.alt}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
          <div className="product-information-wrapper">
            <h2>{product.name}</h2>
            <p>
              {currency}
              {product.price}
            </p>
            <span>🔥 Hurry only {product.stock} left in stock</span>
            <div className="product-description">{product.description}</div>
            <div className="product-sizes-container">
              {product.sizes.map((size, index) => {
                return (
                  <button
                    key={index}
                    type="button"
                    className={`product-size-btn ${s === size ? 'active' : ''}`}
                    onClick={handleSize}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => addToCart(s, product.id)}
              className="add-to-cart-btn"
              disabled={s === '' ? true : false}
            >
              Add to Cart
            </button>
            <button
              type="button"
              className="buy-btn"
              disabled={s === '' ? true : false}
              onClick={() => buyNow(product.id, s)}
            >
              Buy Now
            </button>
            <div className="payment-container">
              <div className="payment-container-top flex gap1">
                <div className="payment-item flex gap1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                  >
                    <path
                      d="M12 1.976 1.924 4.215 2 5.09c.107 1.175 1.139 11.54 4.441 13.742a52.689 52.689 0 0 0 5.112 3.068l.447.223.447-.223a52.833 52.833 0 0 0 5.108-3.063C20.857 16.63 21.889 6.265 22 5.09l.079-.875zm4.445 15.192c-2.1 1.4-3.7 2.3-4.445 2.7-.741-.4-2.35-1.3-4.445-2.7C5.791 15.992 4.547 9.9 4.085 5.783L12 4.024l7.915 1.759c-.462 4.117-1.706 10.209-3.47 11.385z"
                      style={{ fill: '#d4744e' }}
                    />
                    <path
                      d="m9.707 10.293-1.414 1.414 3.862 3.863 4.677-7.015-1.664-1.11-3.323 4.985-2.138-2.137z"
                      style={{ fill: '#d4744e' }}
                    />
                  </svg>
                  <div className="payment-item-info">
                    <p>Authentic</p>
                    <p>100% Guaranted</p>
                  </div>
                </div>
                <div className="payment-item flex gap1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    width="25"
                    height="25"
                  >
                    <g data-name="Lock">
                      <path
                        d="M256 269.953a18.928 18.928 0 0 0-9.448 35.34v21.06h18.896v-21.06a18.931 18.931 0 0 0-9.448-35.34zM256.01 178.08a28.913 28.913 0 0 0-28.882 28.882v30.753h57.753v-30.753a28.917 28.917 0 0 0-28.872-28.881z"
                        style={{ fill: '#d4744e' }}
                      />
                      <path
                        d="M256 73.825c-100.617 0-182.18 81.562-182.18 182.17A182.182 182.182 0 0 0 256 438.176c100.608 0 182.18-81.57 182.18-182.18S356.608 73.825 256 73.825zm77.387 254.426a21.409 21.409 0 0 1-21.41 21.41H200.032a21.404 21.404 0 0 1-21.411-21.41v-69.126a21.419 21.419 0 0 1 17.007-20.953v-31.21a60.377 60.377 0 1 1 120.753 0v31.21a21.42 21.42 0 0 1 16.998 20.953v69.126z"
                        style={{ fill: '#d4744e' }}
                      />
                    </g>
                  </svg>
                  <div className="payment-item-info">
                    <p>Secure</p>
                    <p>Mobile Payments</p>
                  </div>
                </div>
              </div>
              <div className="payment-item-bottom">
                <div className="top">
                  <p>We Accept</p>
                </div>
                <div className="main flex gap1">
                  <div className="payment-item-bottom item">
                    <svg
                      data-name="Layer 1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 120 120"
                      height="25px"
                      width="25px"
                    >
                      <path
                        d="M85.81 120H34.19a8.39 8.39 0 0 1-8.38-8.39V8.39A8.39 8.39 0 0 1 34.19 0h51.62a8.39 8.39 0 0 1 8.38 8.39v103.22a8.39 8.39 0 0 1-8.38 8.39zM34.19 3.87a4.52 4.52 0 0 0-4.51 4.52v103.22a4.52 4.52 0 0 0 4.51 4.52h51.62a4.52 4.52 0 0 0 4.51-4.52V8.39a4.52 4.52 0 0 0-4.51-4.52z"
                        style={{ fill: '#d4744e' }}
                      />
                      <path
                        d="M73.7 10.32H46.3L39.28 3.3 42.01.57l5.89 5.88h24.2L77.99.57l2.73 2.73-7.02 7.02zM47.1 103.23h25.81v3.87H47.1z"
                        style={{ fill: '#d4744e' }}
                      />
                    </svg>
                    <p>MTN MoMo</p>
                  </div>
                  <div className="payment-item-bottom item">
                    <svg
                      data-name="Layer 1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 120 120"
                      height="25px"
                      width="25px"
                    >
                      <path
                        d="M85.81 120H34.19a8.39 8.39 0 0 1-8.38-8.39V8.39A8.39 8.39 0 0 1 34.19 0h51.62a8.39 8.39 0 0 1 8.38 8.39v103.22a8.39 8.39 0 0 1-8.38 8.39zM34.19 3.87a4.52 4.52 0 0 0-4.51 4.52v103.22a4.52 4.52 0 0 0 4.51 4.52h51.62a4.52 4.52 0 0 0 4.51-4.52V8.39a4.52 4.52 0 0 0-4.51-4.52z"
                        style={{ fill: '#d4744e' }}
                      />
                      <path
                        d="M73.7 10.32H46.3L39.28 3.3 42.01.57l5.89 5.88h24.2L77.99.57l2.73 2.73-7.02 7.02zM47.1 103.23h25.81v3.87H47.1z"
                        style={{ fill: '#d4744e' }}
                      />
                    </svg>
                    <p>Vodafone Cash</p>
                  </div>
                  <div className="payment-item-bottom item">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 64 64"
                      width="25px"
                      height="25px"
                    >
                      <path
                        d="M54 14a5.006 5.006 0 0 0-5-5H5a5.006 5.006 0 0 0-5 5v1h54zM53 31a8.269 8.269 0 0 1 1 .05V23H0v17a5 5 0 0 0 5 5h35.05a8.269 8.269 0 0 1-.05-1 13.012 13.012 0 0 1 13-13zM14 41H5a1 1 0 0 1 0-2h9a1 1 0 0 1 0 2zm9-4H5a1 1 0 0 1 0-2h18a1 1 0 0 1 0 2zM0 17h54v4H0zM54.5 45H54v3h.5a1.5 1.5 0 0 0 0-3zM50 41.5a1.5 1.5 0 0 0 1.5 1.5h.5v-3h-.5a1.5 1.5 0 0 0-1.5 1.5z"
                        style={{ fill: '#d4744e' }}
                      />
                      <path
                        d="M53 33a11 11 0 1 0 11 11 11.013 11.013 0 0 0-11-11zm1.5 17H54v1a1 1 0 0 1-2 0v-1h-2a1 1 0 0 1 0-2h2v-3h-.5a3.5 3.5 0 0 1 0-7h.5v-1a1 1 0 0 1 2 0v1h2a1 1 0 0 1 0 2h-2v3h.5a3.5 3.5 0 0 1 0 7z"
                        style={{ fill: '#d4744e' }}
                      />
                    </svg>
                    <p>Card</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="fabric-care">
              <div
                className="info-header flex-sb"
                onClick={() => handleClick(setFabric)}
              >
                <p>Fabric & Care</p>
                <span className={fabric === true ? 'active' : ''}>&#8964;</span>
              </div>
              <div className={`info ${fabric == true ? 'active' : ''}`}>
                Mena’s Closet is built on a deep appreciation for fashion and
                thoughtful care. Every piece is selected with attention to
                quality, comfort, and timeless style, ensuring that customers
                don’t just look good but feel confident in what they wear. We
                believe fashion should be expressive yet responsible, which is
                why we focus on durable materials, careful craftsmanship, and
                designs that last beyond trends. At Mena’s Closet, caring for
                fashion also means caring for our customers—offering pieces that
                fit well, wear beautifully, and remain part of your wardrobe for
                years to come.
              </div>
            </div>
            <div className="delivery">
              <div
                className="info-header flex-sb"
                onClick={() => handleClick(setDelivery)}
              >
                <p className>Delivery In Ghana</p>
                <span className={delivery === true ? 'active' : ''}>
                  &#8964;
                </span>
              </div>
              <p className={`info ${delivery === true ? 'active' : ''}`}>
                Mena’s Closet is built on a deep appreciation for fashion and
                thoughtful care. Every piece is selected with attention to
                quality, comfort, and timeless style, ensuring that customers
                don’t just look good but feel confident in what they wear. We
                believe fashion should be expressive yet responsible, which is
                why we focus on durable materials, careful craftsmanship, and
                designs that last beyond trends. At Mena’s Closet, caring for
                fashion also means caring for our customers—offering pieces that
                fit well, wear beautifully, and remain part of your wardrobe for
                years to come.
              </p>
            </div>
          </div>
        </div>
        <h2 className="related-products-title">You May Also Like</h2>
        <div className="related-products">
          {relatedProducts.map((product, index) => {
            return (
              <Productitem
                key={index}
                id={product.id}
                name={product.name}
                images={product.images}
                price={product.price}
                alt={product.alt}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}
export default Product;
