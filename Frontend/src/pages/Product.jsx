import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageNav from '../components/PageNav';
import { ShopContext } from '../components/ShopContext';
import { useNavigate } from 'react-router-dom';
function Product() {
  const { products } = useContext(ShopContext);
  const [nav, setNav] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  function handleClick() {
    return;
  }

  const product = products.filter((p) => p.id === id)[0];

  if (!products)
    return <div>Something Went Wrong Fetching Data For Product.</div>;
  if (!product) return <div>Product not Found</div>;

  const isAccessory =
    product.accessories === true ? 'Accessories' : `${product.gender}`;

  useEffect(() => {
    console.log(product.accessories);
  }, [product]);

  return (
    <main className="product-wrapper">
      <div className="container">
        <PageNav page={isAccessory} />
      </div>
    </main>
  );
}
export default Product;
