/**
 * @file ProductDetails.jsx
 * @module Screens/Products/Details
 * @description
 * An immersive detail view for a specific inventory asset.
 * * **Visual Architecture:**
 * - **Gallery Engine:** Manages a multi-image viewer with active-state synchronization between thumbnails and the hero card.
 * - **Sticky Layout:** Uses `position: sticky` on the visual column (Desktop) to keep the product image visible while scrolling through long specifications.
 * - **Bento-style Specs:** Groups core metrics (Price, SKU, Stock) into a color-coded grid for rapid data scanning.
 * * **Technical Logic:**
 * - **State Hydration:** Prioritizes data from `location.state` to eliminate extra API calls during navigation.
 * - **Simulated Latency:** Includes a 800ms `setTimeout` to ensure a smooth transition and consistent UX with the global loader.
 * * @requires react-router-dom
 */

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../../../utilities/loader/Loader.utility";
import "./ProductDetails.css";

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const data = location.state?.product || null;
      setProduct(data);
      if (data?.productImages?.length > 0)
        setActiveImage(data.productImages[0]);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [location.state]);

  if (loading)
    return (
      <div className="pd-loader-wrapper">
        <Loader />
      </div>
    );

  if (!product)
    return (
      <div id="product-details-screen" className="pd-not-found">
        <h3>Asset Not Found</h3>
        <button onClick={() => navigate(-1)}>Return to Inventory</button>
      </div>
    );

  return (
    <section id="product-details-screen">
      <div className="pd-header-banner">
        <button className="back-nav" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i> Back to Inventory
        </button>
        <div className="header-content">
          <div className="category-stack">
            {product.category?.map((cat, i) => (
              <span key={i} className="category-tag">
                {cat}
              </span>
            ))}
          </div>
          <h1 className="product-main-title">{product.title}</h1>
        </div>
      </div>

      <div className="pd-main-grid">
        <div className="pd-visuals">
          <div className="pd-main-card">
            <img src={activeImage} alt="Main Product" className="pd-hero-img" />
            <span className={`pd-status-pill ${product.status.toLowerCase()}`}>
              {product.status}
            </span>
          </div>
          <div className="pd-thumbnails">
            {product.productImages?.map((img, idx) => (
              <div
                key={idx}
                className={`pd-thumb ${activeImage === img ? "active" : ""}`}
                onClick={() => setActiveImage(img)}
              >
                <img src={img} alt="thumbnail" />
              </div>
            ))}
          </div>
        </div>

        <div className="pd-content">
          <div className="pd-section">
            <h2 className="section-title">Core Intelligence</h2>
            <div className="specs-grid">
              <div className="spec-item color1">
                <label>Inventory SKU</label>
                <span>#{product._id?.slice(-6).toUpperCase()}</span>
              </div>
              <div className="spec-item color2">
                <label>Unit Price</label>
                <span className="price-text">${product.price}</span>
              </div>
              <div className="spec-item color3">
                <label>Stock Level</label>
                <span>{product.stock} Units</span>
              </div>
              <div className="spec-item color4">
                <label>Rating</label>
                <span>⭐ {product.averageRating || "0.0"}</span>
              </div>
            </div>
          </div>

          <div className="pd-section description-box">
            <h2 className="section-title">Product Synopsis</h2>
            <p className="synopsis-text">{product.description}</p>
          </div>

          {product.specifications?.map((section, idx) => (
            <div className="pd-section" key={idx}>
              <h2 className="section-title">{section.section}</h2>
              <div className="dynamic-specs-container">
                {section.items.map((item, i) => (
                  <div className="spec-row-item" key={item._id}>
                    <small>{item.name}</small>
                    <p>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
