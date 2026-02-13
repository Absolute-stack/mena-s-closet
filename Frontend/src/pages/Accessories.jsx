import { useContext } from 'react';
import PageNav from '../components/PageNav';
import HeroImage from '../components/HeroImage';
import ProductGrid from '../components/ProductGrid';
import FilterAccessories from '../components/FilterAccessories';
import { ShopContext } from '../components/ShopContext';

function Accessories() {
  const { accessoryProducts } = useContext(ShopContext);

  return (
    <main className="acc-page">
      <div className="container">
        <PageNav page="Accessories" />
        <HeroImage
          src="/accessories_hero.avif"
          alt="Accessories-hero-img"
          title="Discover Your Style: Accessories"
          subtitle="Elevate your wardrobe with our curated collection."
        />
        <FilterAccessories />
        <ProductGrid products={accessoryProducts} />
      </div>
    </main>
  );
}

export default Accessories;
