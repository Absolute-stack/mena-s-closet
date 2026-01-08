import { useContext } from 'react';
import PageNav from '../components/PageNav';
import HeroImage from '../components/HeroImage';
import FilterWomen from '../components/FilterWomen';
import ProductGrid from '../components/ProductGrid';
import { ShopContext } from '../components/ShopContext';

function Women() {
  const { menProducts } = useContext(ShopContext);

  return (
    <main className="men-page">
      <div className="container">
        <PageNav page="Men" />
        <HeroImage
          src="/mens_hero.avif"
          alt="Men's-hero-img"
          title="Discover Your Style: Men's Fashion"
          subtitle="Elevate your wardrobe with our curated collection."
        />
        <FilterWomen />
        <ProductGrid products={menProducts} />
      </div>
    </main>
  );
}

export default Women;
