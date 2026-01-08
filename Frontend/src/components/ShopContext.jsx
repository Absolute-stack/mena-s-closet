import { createContext, useMemo, useState } from 'react';
import { allProducts } from '../assets/assets.js';

export const ShopContext = createContext();

function ShopContextProvider({ children }) {
  const [sort, setSort] = useState('default');

  // base filtered data (never mutated)
  const products = useMemo(() => {
    return allProducts.slice();
  }, []);

  const womenProducts = useMemo(() => {
    return allProducts.filter(
      (product) => product.gender === 'female' && !product.accessories
    );
  }, []);

  const menProducts = useMemo(() => {
    return allProducts.filter(
      (product) => product.gender === 'male' && !product.accessories
    );
  }, []);

  const accessoryProducts = useMemo(() => {
    return allProducts.filter((product) => product.accessories);
  });

  // sorted version (derived safely)
  const sortedWomenProducts = useMemo(() => {
    const products = [...womenProducts]; // copy first

    switch (sort) {
      case 'Low-High':
        return products.sort((a, b) => a.price - b.price);

      case 'High-Low':
        return products.sort((a, b) => b.price - a.price);

      default:
        return products;
    }
  }, [sort, womenProducts]);

  const sortedMenProducts = useMemo(() => {
    const products = [...menProducts]; // copy first

    switch (sort) {
      case 'Low-High':
        return products.sort((a, b) => a.price - b.price);

      case 'High-Low':
        return products.sort((a, b) => b.price - a.price);

      default:
        return products;
    }
  }, [sort, menProducts]);

  const sortedAccessories = useMemo(() => {
    const products = [...accessoryProducts];

    switch (sort) {
      case 'Low-High':
        return products.sort((a, b) => a.price - b.price);
        break;
      case 'High-Low':
        return products.sort((a, b) => b.price - a.price);
        break;
      default:
        return products;
    }
  }, [sort, accessoryProducts]);

  const value = {
    sort,
    setSort,
    womenProducts: sortedWomenProducts,
    menProducts: sortedMenProducts,
    accessoryProducts: sortedAccessories,
    products,
    currency: 'GH₵',
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export default ShopContextProvider;
