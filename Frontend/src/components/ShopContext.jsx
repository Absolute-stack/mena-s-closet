import {
  createContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const ShopContext = createContext();

const CART_STORAGE_KEY = 'menasClosetCart';

function ShopContextProvider({ children }) {
  const backend = import.meta.env.VITE_BACKEND_URL;
  const [sort, setSort] = useState('default');
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [buyNowProduct, setBuyNowProduct] = useState();
  const [buyNowSize, setBuyNowSize] = useState();
  const [user, setUser] = useState(null);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [allProducts, setAllProducts] = useState([]); // Products from backend
  const navigate = useNavigate();

  // -------------------------
  // LOCAL STORAGE HELPERS
  // -------------------------
  const saveCartToLocalStorage = useCallback((cart) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, []);

  const loadCartFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      return {};
    }
  }, []);

  // -------------------------
  // FETCH PRODUCTS FROM BACKEND
  // -------------------------
  const fetchProducts = useCallback(
    async function fetchProducts() {
      try {
        const res = await axios.get(`${backend}/api/product/list`);
        const fetchedProducts = res.data?.products || [];

        // Map backend products to have 'id' field (for compatibility)
        const mappedProducts = fetchedProducts.map((p) => ({
          ...p,
          id: p._id, // Add id field that equals _id
        }));

        setAllProducts(mappedProducts);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        toast.error('Failed to load products');
      }
    },
    [backend],
  );

  // base filtered data (using fetched products)
  const products = useMemo(() => {
    return allProducts.slice();
  }, [allProducts]);

  const womenProducts = useMemo(() => {
    return allProducts.filter(
      (product) => product.gender === 'women' && !product.accessories,
    );
  }, [allProducts]);

  const menProducts = useMemo(() => {
    return allProducts.filter(
      (product) => product.gender === 'men' && !product.accessories,
    );
  }, [allProducts]);

  const accessoryProducts = useMemo(() => {
    return allProducts.filter((product) => product.accessories);
  }, [allProducts]);

  const relatedProducts = useMemo(() => {
    return allProducts.filter;
  }, [allProducts]);

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
        p.sizes?.some((s) => sizes.includes(s)),
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
        p.sizes?.some((s) => sizes.includes(s)),
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

  // -------------------------
  // FETCH USER DATA
  // -------------------------
  const fetchUser = useCallback(
    async function fetchUser() {
      try {
        const res = await axios.get(`${backend}/api/user/getdata`, {
          withCredentials: true,
        });

        if (res.data.success) {
          setUser(res.data.user);
          return res.data.user;
        } else {
          setUser(null);
          return null;
        }
      } catch (error) {
        setUser(null);
        return null;
      }
    },
    [backend],
  );

  // -------------------------
  // FETCH CART (AUTHENTICATED USERS)
  // -------------------------
  const fetchCart = useCallback(
    async function fetchCart() {
      try {
        const res = await axios.post(
          `${backend}/api/cart/get`,
          {},
          { withCredentials: true },
        );

        if (res.data.success) {
          setCartItems(res.data.cartData || {});
          saveCartToLocalStorage(res.data.cartData || {});
        }
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      }
    },
    [backend, saveCartToLocalStorage],
  );

  // -------------------------
  // SYNC CART ON LOGIN
  // -------------------------
  const syncCart = useCallback(
    async function syncCart(guestCart) {
      try {
        const res = await axios.post(
          `${backend}/api/cart/sync`,
          { guestCart },
          { withCredentials: true },
        );

        if (res.data.success) {
          setCartItems(res.data.cartData);
          saveCartToLocalStorage(res.data.cartData);
        }
      } catch (error) {
        console.error('Failed to sync cart:', error);
      }
    },
    [backend, saveCartToLocalStorage],
  );

  // -------------------------
  // ADD TO CART (KEEPING YOUR SIGNATURE: size first, itemId second)
  // -------------------------
  function addToCart(size, itemId) {
    if (!size) {
      toast.error('A Size must be selected');
      return;
    }

    // Guest user - update localStorage
    if (!user) {
      const cartData = structuredClone(cartItems);

      if (!cartData[itemId]) {
        cartData[itemId] = {};
      }
      cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;

      setCartItems(cartData);
      saveCartToLocalStorage(cartData);
      console.log('Successfully added to cart');
      toast.success('Item added to cart');
      return;
    }

    // Authenticated user - update backend
    axios
      .post(
        `${backend}/api/cart/add`,
        { itemId, size },
        { withCredentials: true },
      )
      .then((res) => {
        if (res.data.success) {
          setCartItems(res.data.cartData);
          saveCartToLocalStorage(res.data.cartData);
          console.log('Successfully added to cart');
          toast.success('Item added to cart');
        }
      })
      .catch((error) => {
        console.error('Failed to add to cart:', error);
        toast.error('Failed to add item');
      });
  }

  // -------------------------
  // UPDATE CART (KEEPING YOUR SIGNATURE: size, itemId, quantity)
  // -------------------------
  function updateCart(size, itemId, quantity) {
    // Guest user - update localStorage
    if (!user) {
      const cartData = structuredClone(cartItems);

      if (!cartData[itemId] || quantity < 0) return;

      if (quantity === 0) {
        delete cartData[itemId][size];
        if (Object.keys(cartData[itemId]).length === 0) {
          delete cartData[itemId];
        }
      } else {
        cartData[itemId][size] = quantity;
      }

      setCartItems(cartData);
      saveCartToLocalStorage(cartData);
      return;
    }

    // Authenticated user - update backend
    axios
      .post(
        `${backend}/api/cart/update`,
        { itemId, size, quantity },
        { withCredentials: true },
      )
      .then((res) => {
        if (res.data.success) {
          setCartItems(res.data.cartData);
          saveCartToLocalStorage(res.data.cartData);
        }
      })
      .catch((error) => {
        console.error('Failed to update cart:', error);
        toast.error('Failed to update cart');
      });
  }

  // -------------------------
  // CLEAR CART
  // -------------------------
  function clearCart() {
    // Guest user - clear localStorage
    if (!user) {
      setCartItems({});
      localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }

    // Authenticated user - clear backend
    axios
      .post(`${backend}/api/cart/clear`, {}, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          setCartItems({});
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      })
      .catch((error) => {
        console.error('Error clearing cart:', error);
        setCartItems({});
        localStorage.removeItem(CART_STORAGE_KEY);
      });
  }

  // -------------------------
  // BUY NOW
  // -------------------------
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

  // -------------------------
  // GET TOTAL CART NUMBER
  // -------------------------
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

  // -------------------------
  // GET CART TOTAL PRICE
  // -------------------------
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

  // -------------------------
  // INITIAL LOAD
  // -------------------------
  useEffect(() => {
    async function initializeApp() {
      // Fetch products first
      await fetchProducts();

      // Try to fetch user
      const userData = await fetchUser();

      if (userData) {
        // User is logged in - fetch cart from backend
        await fetchCart();

        // Check if there's a guest cart to sync
        const guestCart = loadCartFromLocalStorage();
        if (Object.keys(guestCart).length > 0) {
          await syncCart(guestCart);
        }
      } else {
        // Guest user - load cart from localStorage
        const localCart = loadCartFromLocalStorage();
        setCartItems(localCart);
      }

      setIsLoadingCart(false);
    }

    initializeApp();
  }, [fetchProducts, fetchUser, fetchCart, syncCart, loadCartFromLocalStorage]);

  // -------------------------
  // HANDLE USER LOGIN (call this after login)
  // -------------------------
  const handleUserLogin = useCallback(
    async function handleUserLogin() {
      const userData = await fetchUser();

      if (userData) {
        // Get guest cart before syncing
        const guestCart = loadCartFromLocalStorage();

        if (Object.keys(guestCart).length > 0) {
          // Sync guest cart with user cart
          await syncCart(guestCart);
        } else {
          // Just fetch user's existing cart
          await fetchCart();
        }
      }
    },
    [fetchUser, fetchCart, syncCart, loadCartFromLocalStorage],
  );

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
    setBuyNowProduct, // NEW - for PlaceOrders
    setBuyNowSize, // NEW - for PlaceOrders
    getTotalCartNumber,
    getCartTotalPrice,
    currency: 'GH₵',
    user, // NEW - for checking if logged in
    setUser, // NEW - for setting user on login
    handleUserLogin, // NEW - call after successful login
    backend, // NEW - backend URL
    isLoadingCart, // NEW - loading state
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export default ShopContextProvider;
