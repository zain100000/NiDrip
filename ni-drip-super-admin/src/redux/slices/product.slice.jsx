/**
 * @file product.slice.js
 * @module Redux/Slices/Product
 * @description
 * Redux Toolkit slice managing the global state for product inventory.
 * * **Core Features:**
 * - **Full CRUD Support:** Handles creation, retrieval (all/single), partial updates, and deletion.
 * - **Binary Data Support:** Optimized for `multipart/form-data` to handle product image uploads.
 * - **Secure Requests:** Automatically retrieves and attaches Bearer tokens from `localStorage`.
 * - **Optimistic UI Updates:** Synchronizes the `products` list immediately upon successful deletion or modification.
 * * @requires @reduxjs/toolkit
 * @requires axios
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config.config";

const { BACKEND_API_URL } = CONFIG;

const getToken = () => localStorage.getItem("authToken");

/**
 * @function addProduct
 * @async
 * @description Dispatches a POST request to create a new product.
 * @param {FormData} formData - Product details including image files.
 * @returns {Object} The newly created product object.
 */

export const addProduct = createAsyncThunk(
  "product/addProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const token = getToken();

      const response = await axios.post(
        `${BACKEND_API_URL}/product/add-product`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const { product, message, success } = response.data;

      if (!success) {
        throw new Error(message);
      }

      return {
        product: product || response.data,
        message: message,
        success: true,
      };
    } catch (error) {
      const backendError = error.response?.data;

      if (backendError) {
        return rejectWithValue({
          message: backendError.message,
          success: backendError.success || false,
          status: error.response?.status,
        });
      }

      return rejectWithValue({
        message: error.message,
        success: false,
        status: 0,
      });
    }
  },
);

/**
 * @function getAllProducts
 * @async
 * @description Fetches the complete list of products from the database.
 * @returns {Array<Object>} Array of all product records.
 */
export const getAllProducts = createAsyncThunk(
  "product/getAllProducts",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/product/get-all-products`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { allProducts, products, message, success } = response.data;

      if (!success) {
        throw new Error(message);
      }

      return {
        products: allProducts || products || response.data,
        message: message,
        success: true,
      };
    } catch (error) {
      console.error("Error fetching products:", error.response?.data);

      const backendError = error.response?.data;

      if (backendError) {
        return rejectWithValue({
          message: backendError.message,
          success: backendError.success || false,
          status: error.response?.status,
        });
      }

      return rejectWithValue({
        message: error.message,
        success: false,
        status: 0,
      });
    }
  },
);

/**
 * @function getProductById
 * @async
 * @description Fetches a specific product by its ID.
 * @param {string} productId - The unique MongoDB ID of the product.
 * @returns {Object} The product object.
 */
export const getProductById = createAsyncThunk(
  "product/getProductById",
  async (productId, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/product/get-product-by-id/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { product, message, success } = response.data;

      if (!success) {
        throw new Error(message);
      }

      return {
        product: product || response.data,
        message: message,
        success: true,
      };
    } catch (error) {
      const backendError = error.response?.data;

      if (backendError) {
        return rejectWithValue({
          message: backendError.message,
          success: backendError.success || false,
          status: error.response?.status,
        });
      }

      return rejectWithValue({
        message: error.message,
        success: false,
        status: 0,
      });
    }
  },
);

/**
 * @function updateProduct
 * @async
 * @description Sends a PATCH request to modify an existing product's data or image.
 * @param {Object} params - The payload containing `productId` and `formData`.
 */
export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async ({ productId, formData }, { rejectWithValue }) => {
    try {
      const token = getToken();

      const response = await axios.patch(
        `${BACKEND_API_URL}/product/update-product/${productId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const { updatedProduct, product, message, success } = response.data;

      if (!success) {
        throw new Error(message);
      }

      return {
        product: updatedProduct || product || response.data,
        message: message,
        success: true,
      };
    } catch (error) {
      const backendError = error.response?.data;

      if (backendError) {
        return rejectWithValue({
          message: backendError.message,
          success: backendError.success || false,
          status: error.response?.status,
        });
      }

      return rejectWithValue({
        message: error.message,
        success: false,
        status: 0,
      });
    }
  },
);

/**
 * @function deleteProduct
 * @async
 * @description Removes a product record and filters the local state to reflect changes.
 * @param {string} productId - The unique MongoDB ID of the product.
 */
export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (productId, { getState, rejectWithValue }) => {
    const token = getToken();
    if (!token)
      return rejectWithValue({
        message: "Admin is not authenticated.",
        success: false,
      });

    try {
      const response = await axios.delete(
        `${BACKEND_API_URL}/product/delete-product/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const { message, success } = response.data;

      if (!success) throw new Error(message);

      const { products } = getState().products;
      const filteredProducts = products.filter((p) => p._id !== productId);

      // Return both the new list AND the success message from backend
      return {
        products: filteredProducts,
        deletedProductId: productId,
        message: message, // This is what the toast needs
        success: true,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message, success: false },
      );
    }
  },
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    selectedProduct: null,
    loading: false,
    error: null,
    message: null,
    success: null,
  },
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    clearMessage: (state) => {
      state.message = null;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
        state.success = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.success = action.payload.success;
        state.products.push(action.payload.product);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || action.payload;
        state.message = action.payload.message;
        state.success = action.payload.success || false;
      })
      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
        state.success = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.selectedProduct = null;
        state.message = action.payload.message;
        state.success = action.payload.success;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || action.payload;
        state.message = action.payload.message || "Failed to fetch products";
        state.success = action.payload.success || false;
      })
      .addCase(getProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
        state.success = null;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload.product;
        state.message = action.payload.message;
        state.success = action.payload.success;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || action.payload;
        state.selectedProduct = null;
        state.message = action.payload.message;
        state.success = action.payload.success || false;
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
        state.success = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.success = action.payload.success;
        const updatedProduct = action.payload.product;
        state.products = state.products.map((product) =>
          product._id === updatedProduct._id ? updatedProduct : product,
        );
        if (state.selectedProduct?._id === updatedProduct._id) {
          state.selectedProduct = updatedProduct;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || action.payload;
        state.message = action.payload.message;
        state.success = action.payload.success || false;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
        state.success = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.message = action.payload.message;
        state.success = action.payload.success;

        if (
          state.selectedProduct &&
          state.selectedProduct._id === action.payload.deletedProductId
        ) {
          state.selectedProduct = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || action.payload;
        state.message = action.payload.message;
        state.success = action.payload.success || false;
      });
  },
});

export const { setProducts, clearSelectedProduct, clearMessage } =
  productSlice.actions;

export default productSlice.reducer;
