import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Navbar from './components/Navbar.jsx';
import './App.css';

const Footer = lazy(() => import('./components/Footer.jsx'));
const Women = lazy(() => import('./pages/Women.jsx'));
const Men = lazy(() => import('./pages/Men.jsx'));
const Accessories = lazy(() => import('./pages/Accessories.jsx'));
const Product = lazy(() => import('./pages/Product.jsx'));
function App() {
  return (
    <>
      <main className="main">
        <Navbar />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/women" element={<Women />} />
            <Route path="/men" element={<Men />} />
            <Route path="/accessories" element={<Accessories />} />
            <Route path="/product/:id" element={<Product />} />
          </Routes>
          <Footer />
        </Suspense>
      </main>
    </>
  );
}
export default App;
