import userModel from '../models/userModel.js';

// Add to cart (authenticated users only)
async function addToCart(req, res) {
  try {
    const { itemId, size } = req.body;
    const userId = req.userId; // from userAuth middleware

    if (!itemId || !size) {
      return res.status(400).json({
        success: false,
        message: 'Item ID and Size are required',
      });
    }

    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let cartData = userData.cartData || {};

    // Initialize product in cart if it doesn't exist
    if (!cartData[itemId]) {
      cartData[itemId] = {};
    }

    // Add or increment size quantity
    cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({
      success: true,
      message: 'Added to cart',
      cartData,
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to cart',
    });
  }
}

// Update cart (authenticated users only)
async function updateCart(req, res) {
  try {
    const { itemId, size, quantity } = req.body;
    const userId = req.userId; // from userAuth middleware

    if (!itemId || !size || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let cartData = userData.cartData || {};

    if (quantity === 0) {
      // Remove size from product
      if (cartData[itemId]) {
        delete cartData[itemId][size];

        // If no sizes left, remove product entirely
        if (Object.keys(cartData[itemId]).length === 0) {
          delete cartData[itemId];
        }
      }
    } else {
      // Update quantity
      if (!cartData[itemId]) {
        cartData[itemId] = {};
      }
      cartData[itemId][size] = quantity;
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({
      success: true,
      message: 'Cart updated',
      cartData,
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart',
    });
  }
}

// Get user cart (authenticated users only)
async function getUserCart(req, res) {
  try {
    const userId = req.userId; // from userAuth middleware

    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const cartData = userData.cartData || {};

    res.json({
      success: true,
      cartData,
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart',
    });
  }
}

// Clear cart (authenticated users only)
async function clearCart(req, res) {
  try {
    const userId = req.userId; // from userAuth middleware

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({
      success: true,
      message: 'Cart cleared',
      cartData: {},
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
    });
  }
}

// Sync cart - merge guest cart with user cart on login
async function syncCart(req, res) {
  try {
    const { guestCart } = req.body; // cart from localStorage
    const userId = req.userId; // from userAuth middleware

    if (!guestCart || typeof guestCart !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid guest cart data',
      });
    }

    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let userCart = userData.cartData || {};

    // Merge guest cart into user cart
    for (const itemId in guestCart) {
      if (!userCart[itemId]) {
        userCart[itemId] = {};
      }

      for (const size in guestCart[itemId]) {
        const guestQty = guestCart[itemId][size] || 0;
        const userQty = userCart[itemId][size] || 0;
        userCart[itemId][size] = guestQty + userQty;
      }
    }

    await userModel.findByIdAndUpdate(userId, { cartData: userCart });

    res.json({
      success: true,
      message: 'Cart synced successfully',
      cartData: userCart,
    });
  } catch (error) {
    console.error('Sync cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync cart',
    });
  }
}

export { addToCart, updateCart, getUserCart, clearCart, syncCart };
