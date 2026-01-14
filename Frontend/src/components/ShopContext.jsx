import { createContext, useEffect, useMemo, useState } from 'react';
import { allProducts } from '../assets/assets.js';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export const ShopContext = createContext();

function ShopContextProvider({ children }) {
  const [sort, setSort] = useState('default');
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  let [cartItems, setCartItems] = useState({});
  const [buyNowProduct, setBuyNowProduct] = useState();
  const [buyNowSize, setBuyNowSize] = useState();
  const navigate = useNavigate();

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

  const relatedProducts = useMemo(() => {
    return allProducts.filter;
  }, []);

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
    let filtered = [...menProducts]; // copy first

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

  function addToCart(size, itemId) {
    const cartData = structuredClone(cartItems);
    if (!size) return toast.error('A Size must be selected');

    if (!cartData[itemId]) {
      cartData[itemId] = {};
    }
    cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
    setCartItems(cartData);
    console.log('Successfully added to cart');
  }

  function updateCart(size, itemId, quantity) {
    const cartData = structuredClone(cartItems);

    if (!cartData[itemId] || quantity < 0) return;

    if (quantity === 0) {
      // Remove this size
      delete cartData[itemId][size];

      // If no sizes left, remove the product
      if (Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }
    } else {
      cartData[itemId][size] = quantity; // ✅ update quantity
    }

    setCartItems(cartData);
  }

  function clearCart() {
    setCartItems({});
  }

  function buyNow(itemId, size) {
    if (!size) {
      toast.error('Please select a Size');
      return null;
    }

    const product = products.find((p) => p.id === itemId);
    if (!product) {
      toast.error('Product Not Found');
      return null;
    }
    setBuyNowProduct(product);
    setBuyNowSize(size);
    navigate('/placeorders');
  }

  function getTotalCartNumber() {
    let cartTotal = 0;

    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        if (cartItems[itemId][size] > 0) {
          cartTotal += cartItems[itemId][size];
        }
      }
    }
    return cartTotal;
  }

  function getCartTotalPrice() {
    let totalPrice = 0;
    for (const itemId in cartItems) {
      const itemInfo = products.find((item) => item.id === itemId);
      if (!itemInfo) continue;

      for (const size in cartItems[itemId]) {
        const quantity = cartItems[itemId][size];
        if (quantity > 0) {
          totalPrice += itemInfo.price * quantity;
        }
      }
    }
    return totalPrice;
  }

  const value = {
    sort,
    setSort,
    categories,
    setCategories,
    sizes,
    setSizes,
    cartItems,
    setCartItems,
    womenProductsFull: womenProducts, // full unfiltered
    womenProducts: sortedWomenProducts, // filtered for display
    menProductsFull: menProducts,
    menProducts: sortedMenProducts,
    accessoryProductsFull: accessoryProducts,
    accessoryProducts: sortedAccessories,
    products,
    addToCart,
    updateCart,
    clearCart,
    buyNow,
    buyNowProduct,
    buyNowSize,
    getTotalCartNumber,
    getCartTotalPrice,
    currency: 'GH₵',
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export default ShopContextProvider;
