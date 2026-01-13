import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // ✅ Don't forget this!
import Home from './pages/Home.jsx';
import Navbar from './components/Navbar.jsx';
import './App.css';

const Women = lazy(() => import('./pages/Women.jsx'));
const Men = lazy(() => import('./pages/Men.jsx'));
const Accessories = lazy(() => import('./pages/Accessories.jsx'));
const Product = lazy(() => import('./pages/Product.jsx'));
const PlaceOrders = lazy(() => import('./pages/PlaceOrders.jsx'));
const Footer = lazy(() => import('./components/Footer.jsx'));

function App() {
  return (
    <main className="main">
      <Navbar />

      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/women" element={<Women />} />
          <Route path="/men" element={<Men />} />
          <Route path="/accessories" element={<Accessories />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/placeorders" element={<PlaceOrders />} />
        </Routes>
        <Footer />
      </Suspense>

      {/* ✅ ToastContainer sits here, separate from routes */}
      <ToastContainer />
    </main>
  );
}

export default App;
