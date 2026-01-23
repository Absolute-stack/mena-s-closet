import { useContext } from 'react';
import PageNav from '../components/PageNav';
import HeroImage from '../components/HeroImage';
import FilterWomen from '../components/FilterWomen';
import ProductGrid from '../components/ProductGrid';
import { ShopContext } from '../components/ShopContext';

function Women() {
  const { womenProducts } = useContext(ShopContext);
  return (
    <main className="women-page">
      <div className="container">
        <PageNav page={'Women'} />
        <HeroImage
          src="/women_hero.avif"
          alt="Women's-hero-img"
          title="Discover Your Style: Women's Fashion"
          subtitle="Elevate your wardrobe with our curated collection of dresses,tops and more. Quanlity and elegance for every ghanaian woman."
        />
        <FilterWomen />
        <ProductGrid products={womenProducts} />
      </div>
    </main>
  );
}
export default Women;
