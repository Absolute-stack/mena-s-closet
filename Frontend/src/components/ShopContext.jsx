import { createContext, useMemo, useState } from 'react';
import { allProducts } from '../assets/assets.js';

export const ShopContext = createContext();

function ShopContextProvider({ children }) {
  const [sort, setSort] = useState('default');
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);

  // base filtered data (never mutated)
  const products = useMemo(() => {
    return allProducts.slice();
  }, []);

  const womenProducts = useMemo(() => {
    return allProducts.filter(
      (product) => product.gender === 'women' && !product.accessories
    );
  }, []);

  const menProducts = useMemo(() => {
    return allProducts.filter(
      (product) => product.gender === 'men' && !product.accessories
    );
  }, []);

  const accessoryProducts = useMemo(() => {
    return allProducts.filter((product) => product.accessories);
  }, []);

  const relatedProducts = useMemo(() => {}, []);

  // sorted version (derived safely)
  const sortedWomenProducts = useMemo(() => {
    let filtered = [...womenProducts];

    // CATEGORY FILTER
    if (categories.length > 0) {
      filtered = filtered.filter((p) => categories.includes(p.category));
    }

    // SIZE FILTER
    if (sizes.length > 0) {
      filtered = filtered.filter((p) =>
        p.sizes?.some((s) => sizes.includes(s))
      );
    }

    // SORT
    switch (sort) {
      case 'Low-High':
        filtered.sort((a, b) => a.price - b.price);
        break;

      case 'High-Low':
        filtered.sort((a, b) => b.price - a.price);
        break;

      default:
        break;
    }

    return filtered;
  }, [sort, womenProducts, categories, sizes]);

  const sortedMenProducts = useMemo(() => {
    const filtered = [...menProducts]; // copy first

    if (categories.length > 0) {
      filtered = filtered.filter((p) => categories.includes(p.category));
    }

    if (sizes.length > 0) {
      filtered = filtered.filter((p) =>
        p.sizes?.some((s) => sizes.includes(s))
      );
    }

    switch (sort) {
      case 'Low-High':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'High-Low':
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        filtered;
        break;
    }

    return filtered;
  }, [sort, menProducts, categories, sizes]);

  const sortedAccessories = useMemo(() => {
    const products = [...accessoryProducts];

    switch (sort) {
      case 'Low-High':
        return products.sort((a, b) => a.price - b.price);
      case 'High-Low':
        return products.sort((a, b) => b.price - a.price);
      default:
        return products;
    }
  }, [sort, accessoryProducts]);

  const value = {
    sort,
    setSort,
    categories,
    setCategories,
    sizes,
    setSizes,
    womenProductsFull: womenProducts, // full unfiltered
    womenProducts: sortedWomenProducts, // filtered for display
    menProductsFull: menProducts,
    menProducts: sortedMenProducts,
    accessoryProductsFull: accessoryProducts,
    accessoryProducts: sortedAccessories,
    products,
    currency: 'GH₵',
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export default ShopContextProvider;
