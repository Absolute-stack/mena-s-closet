import { lazy, Suspense } from 'react';
import Hero from '../components/Hero.jsx';
import Strip from '../components/Strip.jsx';
const ShopCategory = lazy(() => import('../components/ShopCategory.jsx'));
const NewArrivals = lazy(() => import('../components/NewArrivals.jsx'));

function Home() {
  return (
    <main>
      <Hero />
      <Strip />
      <Suspense fallback={null}>
        <ShopCategory />
        <NewArrivals />
      </Suspense>
    </main>
  );
}

export default Home;
