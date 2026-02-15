import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';
import axios from 'axios';

// 📱 SMS Notification Function (Arkesel)
async function sendOrderSMS(order, customerName) {
  try {
    // Skip if no API key configured
    if (!process.env.ARKESEL_API_KEY) {
      console.log('⚠️ Arkesel API key not configured, skipping SMS');
      return;
    }

    const orderId = order._id.toString().slice(-6).toUpperCase();
    const message = `New Order Alert! 🛒
 Order #${orderId}
Customer: ${customerName || 'Guest'}
Amount: GH₵${order.totalAmount.toFixed(2)}
Items: ${order.items.length}
Payment: ${order.paymentStatus}
Check your admin panel.`;

    await axios.post(
      'https://sms.arkesel.com/api/v2/sms/send',
      {
        sender: process.env.ARKESEL_SENDER_ID || 'Arkesel',
        message: message,
        recipients: [process.env.OWNER_PHONE_NUMBER],
      },
      {
        headers: {
          'api-key': process.env.ARKESEL_API_KEY,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('✅ SMS notification sent successfully');
  } catch (error) {
    console.error(
      '❌ SMS notification failed:',
      error.response?.data || error.message,
    );
  }
}

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

    // 📱 Send SMS notification (non-blocking)
    setImmediate(async () => {
      try {
        let customerName = null;

        if (userId) {
          const user = await userModel.findById(userId).select('name');
          customerName = user?.name;
        }

        await sendOrderSMS(newOrder, customerName);
      } catch (smsError) {
        console.error('SMS notification error:', smsError.message);
      }
    });

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

    // 🔐 Verify transaction with Paystack using native fetch
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || paystackData.data.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Payment not successful',
      });
    }

    const paymentData = paystackData.data;

    // 🔎 Find the order
    let order;
    if (orderId) {
      order = await orderModel.findById(orderId);
    } else {
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

    // 🛡 Extra security: Verify amount (Paystack sends amount in pesewas)
    if (paymentData.amount !== order.totalAmount * 100) {
      return res.status(400).json({
        success: false,
        message: 'Amount mismatch',
      });
    }

    // 🛡 Optional: Verify currency
    if (paymentData.currency !== 'GHS') {
      return res.status(400).json({
        success: false,
        message: 'Currency mismatch',
      });
    }

    // ✅ Update order only after successful verification
    order.paymentStatus = 'Paid';
    order.paymentInfo.reference = reference;
    order.paymentInfo.verifiedAt = new Date();
    order.paymentInfo.paystackTransactionId = paymentData.id;

    await order.save();

    return res.json({
      success: true,
      message: 'Payment verified successfully',
      order,
    });
  } catch (error) {
    console.error('Verify payment error:', error.message);

    return res.status(500).json({
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

    // Get the order before updating
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Update order status
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
