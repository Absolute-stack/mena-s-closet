import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true, // ⚡ fast search
    },

    desc: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    images: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one image is required',
      },
    },

    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    subCategory: {
      type: String,
      trim: true,
      lowercase: true,
    },

    gender: {
      type: String,
      enum: ['men', 'women', 'unisex'],
      required: true,
      lowercase: true,
    },

    accessories: {
      type: Boolean,
      default: false,
    },

    bestseller: {
      type: Boolean,
      default: false,
      index: true,
    },

    sizes: {
      type: [String],
      required: true,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ========================================
// ⚡ SMART INDEXES
// ========================================

productSchema.index({ category: 1, price: 1 });
productSchema.index({ gender: 1, category: 1 });
productSchema.index({ bestseller: 1, createdAt: -1 });

// Full text search
productSchema.index({ name: 'text', desc: 'text' });

// ========================================
// ⚡ VIRTUAL (frontend compatibility)
// ========================================
// Frontend expects `image` array

productSchema.virtual('image').get(function () {
  return this.images;
});

// ========================================
// ⚡ QUERY HELPERS
// ========================================

// Product listing (home, category pages)
productSchema.statics.findForListing = function (filters = {}) {
  const query = {};

  if (filters.category) query.category = filters.category.toLowerCase();
  if (filters.subCategory)
    query.subCategory = filters.subCategory.toLowerCase();
  if (filters.gender) query.gender = filters.gender.toLowerCase();
  if (filters.bestseller !== undefined) query.bestseller = filters.bestseller;

  if (filters.minPrice)
    query.price = { ...query.price, $gte: filters.minPrice };
  if (filters.maxPrice)
    query.price = { ...query.price, $lte: filters.maxPrice };

  return this.find(query)
    .select('name price images bestseller stock')
    .limit(filters.limit || 20)
    .skip(filters.skip || 0)
    .sort(filters.sort || { createdAt: -1 })
    .lean({ virtuals: true });
};

// Product details page
productSchema.statics.findByIdForDetail = function (id) {
  return this.findById(id).lean({ virtuals: true });
};

// Bestsellers
productSchema.statics.getBestsellers = function (limit = 10) {
  return this.find({ bestseller: true })
    .select('name price images')
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean({ virtuals: true });
};

// Search
productSchema.statics.searchProducts = function (term, limit = 20) {
  return this.find({ $text: { $search: term } })
    .select('name price images category')
    .limit(limit)
    .lean({ virtuals: true });
};

// ========================================
// ⚡ PRE SAVE CLEANUP
// ========================================

productSchema.pre('save', function () {
  if (this.category) this.category = this.category.toLowerCase().trim();
  if (this.subCategory)
    this.subCategory = this.subCategory.toLowerCase().trim();
  if (this.gender) this.gender = this.gender.toLowerCase().trim();
});

const productModel =
  mongoose.models.product || mongoose.model('product', productSchema);

export default productModel;
