/**
 * @file Inventory.jsx
 * @module Screens/Inventory/Management
 * @description
 * A specialized administrative interface for real-time stock level adjustments and auditing.
 * * **Core Functionality:**
 * - **Inline Adjustments:** Direct increment/decrement buttons to modify product quantities without leaving the view.
 * - **Heuristic Status Calculation:** Dynamically assigns stock health labels (In Stock, Low Stock, Out of Stock) based on numerical thresholds.
 * - **Defensive Logic:** Prevents stock levels from dropping below zero using `Math.max(0, ...)`.
 * - **Sync Strategy:** Reuses the `updateProduct` thunk to ensure the backend remains the source of truth for inventory counts.
 * * @requires react-redux
 * @requires react-hot-toast
 */

import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllProducts,
  updateProduct,
} from "../../redux/slices/product.slice";
import Loader from "../../utilities/loader/Loader.utility";
import InputField from "../../utilities/input-field/InputField.utility";
import { toast } from "react-hot-toast";
import "./Inventory.css";

const Inventory = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { products = [], loading } = useSelector((state) => state.products);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllProducts());
    }
  }, [dispatch, user?.id]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.title?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [products, search]);

  const handleStockUpdate = async (product, amount) => {
    const currentStock = parseInt(product.stock) || 0;
    const newStock = Math.max(0, currentStock + amount);

    const result = await dispatch(
      updateProduct({
        productId: product._id,
        formData: { ...product, stock: newStock },
      }),
    );

    if (updateProduct.fulfilled.match(result)) {
      toast.success(`${product.title} stock updated to ${newStock}`);
    } else {
      toast.error(result.payload?.message || "Update failed");
    }
  };

  return (
    <section id="inventory">
      <div className="inventory-container">
        <div className="inventory-breadcrumb">
          <div className="inventory-header">
            <h1 className="inventory-title">Inventory</h1>
            <p className="inventory-subtitle">
              Manage all your inventory from here
            </p>
          </div>

          <div className="search-wrapper">
            <InputField
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              width={450}
              icon={<i className="fas fa-search"></i>}
            />
          </div>
        </div>

        <div className="table-card">
          <div className="table-responsive">
            {loading ? (
              <div className="loader-container">
                <Loader />
              </div>
            ) : (
              <table className="table custom-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Status</th>
                    <th>Inventory</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const isLowStock = product.stock > 0 && product.stock <= 5;
                    const isOutOfStock = product.stock <= 0;

                    return (
                      <tr
                        key={product._id}
                        className={isOutOfStock ? "row-out" : ""}
                      >
                        <td>
                          <div className="product-cell">
                            <div className="img-container">
                              <img
                                src={
                                  product.productImages?.[0] ||
                                  "/placeholder.png"
                                }
                                alt={product.title}
                              />
                            </div>
                            <div className="info">
                              <span className="title">{product.title}</span>
                              <span className="sku">
                                ID: #{product._id.slice(-6).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${isOutOfStock ? "badge-error" : isLowStock ? "badge-warning" : "badge-success"}`}
                          >
                            {isOutOfStock
                              ? "Out of Stock"
                              : isLowStock
                                ? "Low Stock"
                                : "In Stock"}
                          </span>
                        </td>
                        <td>
                          <div className="stock-display">
                            <span className="stock-number">
                              {product.stock}
                            </span>
                            <span className="stock-label">units</span>
                          </div>
                        </td>
                        <td>
                          <div className="action-group">
                            <button
                              className="btn-stock btn-minus"
                              onClick={() => handleStockUpdate(product, -1)}
                              disabled={isOutOfStock}
                              title="Decrease Stock"
                            >
                              <i className="fas fa-minus"></i>
                            </button>
                            <button
                              className="btn-stock btn-plus"
                              onClick={() => handleStockUpdate(product, 1)}
                              title="Increase Stock"
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {!loading && filteredProducts.length === 0 && (
              <div className="no-products-state">
                <i className="fas fa-box-open no-products-icon"></i>
                <h3>Not Found In Inventory</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Inventory;
