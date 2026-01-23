/**
 * @fileoverview Product controller – manages catalog CRUD
 * @module controllers/productController
 * @description Handles creation, listing, details, updates, and deletion
 *              with Cloudinary image support.
 */

const Product = require("../../models/product-model/product.model");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../../utilities/cloudinary-utilitity/cloudinary.utility");

/**
 * Create new product (with images)
 * @body {string} title
 * @body {string} description
 * @body {number} price
 * @body {string|string[]} category
 * @body {number} stock
 * @body {string} [status="ACTIVE"]
 * @files {productImage[]} – up to 5 images
 * @access Private (SuperAdmin)
 */
exports.addProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock, status } = req.body;

    if (!req.files?.productImage?.length) {
      return res.status(400).json({
        success: false,
        message: "At least one product image required",
      });
    }

    const uploadedImages = await Promise.all(
      req.files.productImage.map((file) =>
        uploadToCloudinary(file, "productImage"),
      ),
    );

    const imageUrls = uploadedImages.map((img) => img.url);

    const product = new Product({
      title,
      description,
      price: Number(price),
      category: Array.isArray(category) ? category : [category],
      stock: Number(stock),
      status: status || "ACTIVE",
      productImages: imageUrls,
      addedBy: req.user.id,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      newProduct: product,
    });
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Get all products
 * @access Public
 */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("addedBy", "userName email")
      .sort({ createdAt: -1 });

    if (!products.length) {
      return res.status(404).json({
        success: false,
        message: "No products found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      count: products.length,
      allProducts: products,
    });
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Get single product details
 * @param {string} productId
 * @access Public
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate(
      "addedBy",
      "userName",
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Update product (metadata, images, stock, status)
 * @param {string} productId
 * @body {string} [title]
 * @body {string} [description]
 * @body {number} [price]
 * @body {string|string[]} [category]
 * @body {number} [stock]
 * @body {string} [status]
 * @files {productImage[]} – replace all images if provided
 * @access Private (SuperAdmin)
 */
exports.updateProduct = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "SuperAdmin access required",
      });
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updates = { ...req.body };

    if (updates.category && !Array.isArray(updates.category)) {
      updates.category = [updates.category];
    }

    if (req.files?.productImage?.length) {
      // Delete old images
      if (product.productImages?.length) {
        await Promise.all(
          product.productImages.map((url) => deleteFromCloudinary(url)),
        );
      }

      const uploaded = await Promise.all(
        req.files.productImage.map((file) =>
          uploadToCloudinary(file, "productImage"),
        ),
      );

      updates.productImages = uploaded.map((img) => img.url);
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.productId,
      updates,
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      updatedProduct: updated,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Delete product and clean up images
 * @param {string} productId
 * @access Private (SuperAdmin)
 */
exports.deleteProduct = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "SuperAdmin access required",
      });
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.productImages?.length) {
      await Promise.all(
        product.productImages.map((url) =>
          deleteFromCloudinary(url).catch((err) =>
            console.error("Image delete failed:", err),
          ),
        ),
      );
    }

    await Product.findByIdAndDelete(req.params.productId);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
