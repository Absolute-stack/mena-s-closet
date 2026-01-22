import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';

// Place order - works for both guest and authenticated users
async function placeOrder(req, res) {
  try {
    const { items, address, paymentInfo } = req.body;
    const userId = req.userId; // may be undefined for guests

    if (!items || !address) {
      return res.status(400).json({
        success: false,
        message: 'Items and address are required',
      });
    }

    // Validate items and calculate subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await productModel.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        image: product.images[0],
      });

      subtotal += product.price * item.quantity;

      // Update product stock
      await productModel.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    const deliveryFee = 0; // Free delivery or set your fee
    const totalAmount = subtotal + deliveryFee;

    // Create order
    const orderData = {
      userId: userId || null, // null for guest orders
      items: orderItems,
      shippingAddress: address,
      paymentMethod: paymentInfo?.method || 'Paystack',
      paymentStatus: paymentInfo?.status || 'Pending',
      subtotal,
      deliveryFee,
      totalAmount,
      paymentInfo: paymentInfo || {},
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Clear cart for authenticated users
    if (userId) {
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: newOrder,
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place order',
    });
  }
}

// Verify payment and update order
async function verifyPayment(req, res) {
  try {
    const { reference, orderId } = req.body;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Payment reference is required',
      });
    }

    // Here you would verify with Paystack API
    // For now, we'll just update the order status

    let order;
    if (orderId) {
      order = await orderModel.findById(orderId);
    } else {
      // Find order by payment reference
      order = await orderModel.findOne({
        'paymentInfo.reference': reference,
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Update payment status
    order.paymentStatus = 'Paid';
    order.paymentInfo.reference = reference;
    order.paymentInfo.verifiedAt = new Date();
    await order.save();

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
    });
  }
}

// Get all orders (Admin)
async function allOrders(req, res) {
  try {
    const orders = await orderModel
      .find({})
      .populate('userId', 'name email')
      .sort({ date: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('All orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
    });
  }
}

// Get user orders (requires auth)
async function userOrders(req, res) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Please login to view orders',
      });
    }

    const orders = await orderModel.find({ userId }).sort({ date: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('User orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user orders',
    });
  }
}

// Update order status (Admin)
async function updateStatus(req, res) {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and status are required',
      });
    }

    const validStatuses = [
      'Order Placed',
      'Packing',
      'Shipped',
      'Out for delivery',
      'Delivered',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status',
      });
    }

    await orderModel.findByIdAndUpdate(orderId, { orderStatus: status });

    res.json({
      success: true,
      message: 'Order status updated',
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
    });
  }
}

export { placeOrder, verifyPayment, allOrders, userOrders, updateStatus };
