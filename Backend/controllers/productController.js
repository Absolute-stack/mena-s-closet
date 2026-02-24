import { v2 as cloudinary } from 'cloudinary';
import productModel from '../models/productModel.js';

// Add Product (Admin)
async function addProduct(req, res) {
  try {
    console.log('🔥 ADD PRODUCT CALLED');

    // Check if Cloudinary is configured
    if (!cloudinary.config().cloud_name) {
      console.error('❌ Cloudinary not configured!');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
      });
    }

    const {
      name,
      desc,
      price,
      category,
      subCategory,
      gender,
      sizes,
      bestseller,
      accessories,
      stock,
    } = req.body;

    console.log('📦 Received data:', { name, price, category });

    // Validate required fields
    if (!name || !desc || !price || !category || !gender || !sizes) {
      console.log('❌ Validation failed');
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
      });
    }

    // Handle image uploads
    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];
    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined,
    );

    console.log('📸 Images received:', images.length);

    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product image is required',
      });
    }

    // Upload images to Cloudinary with detailed error handling
    console.log('☁️ Starting Cloudinary upload...');
    const imageUrls = await Promise.all(
      images.map(async (item, index) => {
        try {
          console.log(`Uploading image ${index + 1}: ${item.path}`);
          const result = await cloudinary.uploader.upload(item.path, {
            resource_type: 'image',
            folder: 'products',
          });
          console.log(`✅ Image ${index + 1} uploaded: ${result.secure_url}`);
          return result.secure_url;
        } catch (uploadError) {
          console.error(`❌ Failed to upload image ${index + 1}:`, uploadError);
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }
      }),
    );

    console.log('✅ All images uploaded');

    // Parse sizes if it's a JSON string
    let parsedSizes;
    try {
      parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    } catch (parseError) {
      console.error('❌ Failed to parse sizes:', parseError);
      return res.status(400).json({
        success: false,
        message: 'Invalid sizes format',
      });
    }

    // Create product
    const productData = {
      name,
      desc,
      price: Number(price),
      images: imageUrls,
      category,
      subCategory,
      gender,
      sizes: parsedSizes,
      bestseller: bestseller === 'true',
      accessories: accessories === 'true',
      stock: Number(stock) || 0,
    };

    console.log('💾 Saving product to database...');
    const product = new productModel(productData);
    await product.save();
    console.log('✅ Product saved successfully');

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product,
    });
  } catch (error) {
    console.error('❌❌❌ ADD PRODUCT ERROR ❌❌❌');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    res.status(500).json({
      success: false,
      message: 'Failed to add product',
      error: error.message,
    });
  }
}

// List all products
async function listProducts(req, res) {
  try {
    const products = await productModel
      .find({})
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });
    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error('List products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
}

// Remove product (Admin)
async function removeProduct(req, res) {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map(async (imageUrl) => {
          const publicId = imageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`products/${publicId}`);
        }),
      );
    }

    await productModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Product removed successfully',
    });
  } catch (error) {
    console.error('Remove product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product',
    });
  }
}

// Get single product info
async function singleProduct(req, res) {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    const product = await productModel.findByIdForDetail(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Single product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
    });
  }
}

// Update product (Admin)
async function updateProduct(req, res) {
  try {
    const {
      id,
      name,
      desc,
      price,
      category,
      subCategory,
      gender,
      sizes,
      bestseller,
      accessories,
      stock,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Handle new image uploads
    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];
    const newImages = [image1, image2, image3, image4].filter(
      (item) => item !== undefined,
    );

    let imageUrls = [...product.images];

    // Upload new images to Cloudinary if provided
    if (newImages.length > 0) {
      const uploadedUrls = await Promise.all(
        newImages.map(async (item) => {
          const result = await cloudinary.uploader.upload(item.path, {
            resource_type: 'image',
            folder: 'products',
          });
          return result.secure_url;
        }),
      );
      imageUrls = [...imageUrls, ...uploadedUrls];
    }

    // Parse sizes if it's a JSON string
    const parsedSizes = sizes
      ? typeof sizes === 'string'
        ? JSON.parse(sizes)
        : sizes
      : product.sizes;

    // Update fields - only update if value is provided
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (desc !== undefined) updateData.desc = desc;
    if (price !== undefined) updateData.price = Number(price);
    if (category !== undefined) updateData.category = category;
    if (subCategory !== undefined) updateData.subCategory = subCategory;
    if (gender !== undefined) updateData.gender = gender;
    if (sizes !== undefined) updateData.sizes = parsedSizes;
    if (bestseller !== undefined)
      updateData.bestseller = bestseller === 'true' || bestseller === true;
    if (accessories !== undefined)
      updateData.accessories = accessories === 'true' || accessories === true;
    if (stock !== undefined) updateData.stock = Number(stock);
    if (imageUrls.length > 0) updateData.images = imageUrls;

    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message,
    });
  }
}

export {
  addProduct,
  listProducts,
  removeProduct,
  singleProduct,
  updateProduct,
};
