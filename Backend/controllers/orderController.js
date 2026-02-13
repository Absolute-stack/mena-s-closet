import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';
import twilio from 'twilio';

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

// Owner/Admin phone number (add this to your .env)
const OWNER_PHONE_NUMBER = process.env.OWNER_PHONE_NUMBER; // Owner's phone number
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER; // Your Twilio number

// Helper function to send SMS to owner
async function sendOwnerSMS(message) {
  try {
    if (!TWILIO_PHONE_NUMBER || !OWNER_PHONE_NUMBER) {
      console.log('Twilio not configured. Message would be:', message);
      return;
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: OWNER_PHONE_NUMBER,
    });

    console.log('SMS sent to owner successfully:', result.sid);
    return result;
  } catch (error) {
    console.error('SMS error:', error.message);
    // Don't fail the order if SMS fails
    return null;
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

    // 📱 Send SHORT SMS notification to OWNER about new order
    const orderIdShort = newOrder._id.toString().slice(-8).toUpperCase();

    const ownerMessage = `NEW ORDER #${orderIdShort}
${address.firstName} ${address.lastName}
${address.phone}
GH₵${totalAmount.toFixed(2)}
${orderItems.length} item(s)
${address.city}`;

    await sendOwnerSMS(ownerMessage);

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

    // 📱 Send SHORT SMS to OWNER confirming payment
    const orderIdShort = order._id.toString().slice(-8).toUpperCase();

    const ownerMessage = `PAID #${orderIdShort}
${order.shippingAddress.firstName} ${order.shippingAddress.lastName}
GH₵${order.totalAmount.toFixed(2)}
${order.shippingAddress.phone}`;

    await sendOwnerSMS(ownerMessage);

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

    // 📱 Send SHORT SMS to OWNER when delivered
    const orderIdShort = order._id.toString().slice(-8).toUpperCase();

    if (status === 'Delivered') {
      const ownerMessage = `DELIVERED #${orderIdShort}
  ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}
  GH₵${order.totalAmount.toFixed(2)}`;

      await sendOwnerSMS(ownerMessage);
    }

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
