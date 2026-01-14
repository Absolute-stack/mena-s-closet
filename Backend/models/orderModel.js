import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true, // ⚡ fast user order lookup
    },

    items: [
      {
        productId: { type: String, required: true },
        name: String,
        price: Number,
        size: String,
        qty: { type: Number, default: 1 },
        image: String,
      },
    ],

    amount: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },

    address: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      region: { type: String, required: true },
      digitalAddress: { type: String, required: true },
      landmark: String,
      directions: String,
    },

    status: {
      type: String,
      enum: ['Processing', 'Paid', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing',
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ['paystack', 'cod'],
      required: true,
      lowercase: true,
    },

    payment: {
      type: Boolean,
      default: false,
      index: true,
    },

    transactionRef: {
      type: String, // Paystack reference
      index: true,
    },
  },
  {
    timestamps: true, // createdAt = order date
    versionKey: false,
  }
);

// ========================================
// ⚡ SMART INDEXES
// ========================================

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ payment: 1, createdAt: -1 });

// ========================================
// ⚡ QUERY HELPERS
// ========================================

// User orders
orderSchema.statics.getUserOrders = function (userId) {
  return this.find({ userId }).sort({ createdAt: -1 }).lean();
};

// Admin - all orders
orderSchema.statics.getAllOrders = function (filters = {}) {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.payment !== undefined) query.payment = filters.payment;

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(filters.limit || 20)
    .skip(filters.skip || 0)
    .lean();
};

// Mark paid
orderSchema.statics.markAsPaid = function (ref) {
  return this.findOneAndUpdate(
    { transactionRef: ref },
    { payment: true, status: 'Paid' },
    { new: true }
  );
};

const orderModel =
  mongoose.models.order || mongoose.model('order', orderSchema);

export default orderModel;
