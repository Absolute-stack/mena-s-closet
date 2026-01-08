import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import ShopContextProvider from './components/ShopContext.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ShopContextProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ShopContextProvider>
  </StrictMode>
);
