import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';
import Twilio from 'twilio';

const client = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

async function sendOrderSMS(order) {
  try {
    const smsMessage = `
NEW ORDER RECEIVED
Order ID: ${order._id}
Total: GHS ${order.totalAmount}

Customer:
${order.shippingAddress.fullName}
${order.shippingAddress.phone}

Items:
${order.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}
`;

    await client.messages.create({
      body: smsMessage,
      from: '+15704130371', // your Twilio number
      to: '+233551467062', // Ghana shop owner number
    });

    console.log('Order SMS sent successfully');
  } catch (err) {
    console.error('Failed to send order SMS:', err);
  }
}

// =====================
// Place Order
// =====================
async function placeOrder(req, res) {
  try {
    const { items, address, paymentInfo } = req.body;
    const userId = req.userId;

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await productModel.findById(item.productId);

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: 'Product not found' });
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
    }

    const deliveryFee = 0;
    const totalAmount = subtotal + deliveryFee;

    const newOrder = new orderModel({
      userId: userId || null,
      items: orderItems,
      shippingAddress: address,
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod: 'Paystack',
      paymentStatus: 'Pending',
      paymentInfo: {
        reference: paymentInfo.reference,
      },
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      order: newOrder,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Order failed' });
  }
}

// =====================
// Verify Payment
// =====================
async function verifyPayment(req, res) {
  try {
    const { reference, orderData } = req.body;

    if (!reference || !orderData) {
      return res.status(400).json({
        success: false,
        message: 'Reference and order data are required',
      });
    }

    // 🔐 Verify Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        },
      },
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Payment not successful',
      });
    }

    const paymentData = paystackData.data;

    if (paymentData.amount !== orderData.totalAmount * 100) {
      return res.status(400).json({
        success: false,
        message: 'Amount mismatch',
      });
    }

    // ✅ Create order
    const order = await orderModel.create({
      userId: orderData.userId,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      subtotal: orderData.subtotal,
      deliveryFee: orderData.deliveryFee,
      totalAmount: orderData.totalAmount,
      paymentMethod: 'Paystack',
      paymentStatus: 'Paid',
      paymentInfo: {
        reference,
        verifiedAt: new Date(),
        paystackTransactionId: paymentData.id,
      },
    });

    // 📉 Reduce stock
    for (const item of order.items) {
      await productModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // 🧹 Clear user cart
    if (order.userId) {
      await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
    }

    // 📲 Send SMS (call helper)
    sendOrderSMS(order);

    return res.json({
      success: true,
      message: 'Payment verified, order created and SMS sent',
      order,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Payment verification failed',
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
