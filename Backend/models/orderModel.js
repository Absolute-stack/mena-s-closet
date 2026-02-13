import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: false, // Allow null for guest orders
      default: null,
      index: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'product',
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        size: { type: String, required: true },
        image: { type: String, required: true },
      },
    ],

    shippingAddress: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      zipcode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
    },

    paymentMethod: {
      type: String,
      default: 'PAYSTACK',
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
      index: true,
    },

    orderStatus: {
      type: String,
      enum: [
        'Order Placed',
        'Packing',
        'Shipped',
        'Out for delivery',
        'Delivered',
      ],
      default: 'Order Placed',
      index: true,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      default: 10,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentInfo: {
      type: Object,
      default: {},
    },

    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes for efficient queries
orderSchema.index({ userId: 1, date: -1 });
orderSchema.index({ orderStatus: 1, date: -1 });
orderSchema.index({ paymentStatus: 1 });

// Calculate total before saving - FIXED VERSION
orderSchema.pre('save', function (next) {
  // Always calculate totalAmount from subtotal + deliveryFee
  this.totalAmount = this.subtotal + this.deliveryFee;
  next();
});

const orderModel =
  mongoose.models.order || mongoose.model('order', orderSchema);

export default orderModel;
