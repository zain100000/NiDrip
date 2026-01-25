/**
 * @file AddProduct.jsx
 * @module Screens/Products/AddProduct
 * @description
 * The interface for Super Admins to add new products to the catalog.
 * * **Key Capabilities:**
 * - **Form Handling:** Input fields for product details including title, description, price, stock, category, and specifications.
 * - **Validation:** Client-side validation for all input fields to ensure data integrity before submission.
 * - **Image Uploads:** Support for uploading multiple product images with previews.
 * - **Submission Workflow:** Integration with Redux actions to handle product creation and provide user feedback.
 * * @requires react-redux
 * @requires react-router-dom
 * @requires react-hot-toast
 */

import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import productPlaceholder from "../../../assets/placeHolder/product-placeholder.jpg";
import {
  validateCategory,
  validateDescription,
  validateFields,
  validatePrice,
  validateStock,
  validateTitle,
} from "../../../utilities/validations/Validation.utility";
import "./AddProduct.css";
import InputField from "../../../utilities/input-field/InputField.utility";
import Button from "../../../utilities/button/Button.utility";
import { addProduct } from "../../../redux/slices/product.slice";
import { toast } from "react-hot-toast";

const AddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [productImages, setProductImages] = useState([]);
  const [productImagePreviews, setProductImagePreviews] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);

  // Replacement for raw JSON string: Array of Objects
  const [specSections, setSpecSections] = useState([
    { section: "", items: [{ name: "", value: "" }] },
  ]);

  const addSection = () => {
    setSpecSections([
      ...specSections,
      { section: "", items: [{ name: "", value: "" }] },
    ]);
  };

  const removeSection = (sIndex) => {
    setSpecSections(specSections.filter((_, i) => i !== sIndex));
  };

  const addItem = (sIndex) => {
    const updated = [...specSections];
    updated[sIndex].items.push({ name: "", value: "" });
    setSpecSections(updated);
  };

  const removeItem = (sIndex, iIndex) => {
    const updated = [...specSections];
    updated[sIndex].items = updated[sIndex].items.filter(
      (_, i) => i !== iIndex,
    );
    setSpecSections(updated);
  };

  const handleSpecChange = (sIndex, iIndex, field, value) => {
    const updated = [...specSections];
    if (field === "section") {
      updated[sIndex].section = value;
    } else {
      updated[sIndex].items[iIndex][field] = value;
    }
    setSpecSections(updated);
  };

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    if (productImages.length + files.length > 5) {
      toast.error("You can only upload up to 5 images.");
      return;
    }
    setProductImages([...productImages, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setProductImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setProductImages(productImages.filter((_, i) => i !== index));
    setProductImagePreviews(productImagePreviews.filter((_, i) => i !== index));
  };

  const handleUploadProduct = async (event) => {
    event.preventDefault();

    const categoryArray = category
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c !== "");
    const fields = {
      title,
      description,
      price,
      category: categoryArray,
      stock,
    };

    const errors = validateFields(fields);
    if (Object.keys(errors).length > 0) {
      toast.error(errors[Object.keys(errors)[0]]);
      return;
    }

    if (productImages.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("category", JSON.stringify(categoryArray));

      // Clean up empty specifications before sending
      const filteredSpecs = specSections.filter((s) => s.section.trim() !== "");
      formData.append("specifications", JSON.stringify(filteredSpecs));

      productImages.forEach((file) => formData.append("productImage", file));

      const resultAction = await dispatch(addProduct(formData));

      if (addProduct.fulfilled.match(resultAction)) {
        toast.success("Product added successfully");
        navigate("/super-admin/products/manage-products");
      } else {
        toast.error(resultAction.payload?.message || "Failed to add product");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="upload-product">
      <div className="upload-product-container">
        <div className="upload-product-header">
          <h1 className="upload-product-title">Add Product</h1>
          <p className="upload-product-subtitle">
            Create a new product catalog entry
          </p>
        </div>

        <section className="upload-product-form-section">
          <div className="container">
            <div className="row">
              <div className="col-md-6 mb-3">
                <InputField
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  icon={<i className="fas fa-signature"></i>}
                />
              </div>
              <div className="col-md-6 mb-3">
                <InputField
                  label="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  icon={<i className="fas fa-money-bill"></i>}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <InputField
                  label="Category (Comma separated)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  icon={<i className="fas fa-tags"></i>}
                />
              </div>
              <div className="col-md-6 mb-3">
                <InputField
                  label="Stock"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  icon={<i className="fas fa-truck"></i>}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-12 mb-3">
                <InputField
                  label="Description"
                  value={description}
                  multiline
                  rows={3}
                  onChange={(e) => setDescription(e.target.value)}
                  icon={<i className="fas fa-clipboard"></i>}
                />
              </div>
            </div>

            {/* Specification Builder UI */}
            <div className="specifications-builder mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="m-0">Product Specifications</h5>
                <button
                  type="button"
                  className="add-section-btn"
                  onClick={addSection}
                >
                  <i className="fas fa-plus-circle"></i> Add Section
                </button>
              </div>

              {specSections.map((s, sIndex) => (
                <div key={sIndex} className="spec-section-card">
                  <div className="spec-section-header">
                    <input
                      type="text"
                      placeholder="Section Name (e.g., General, Battery)"
                      value={s.section}
                      onChange={(e) =>
                        handleSpecChange(
                          sIndex,
                          null,
                          "section",
                          e.target.value,
                        )
                      }
                      className="section-title-input"
                    />
                    <button
                      type="button"
                      className="remove-section-btn"
                      onClick={() => removeSection(sIndex)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>

                  <div className="spec-items-list">
                    {s.items.map((item, iIndex) => (
                      <div key={iIndex} className="spec-item-row">
                        <input
                          type="text"
                          placeholder="Feature (e.g., Color)"
                          value={item.name}
                          onChange={(e) =>
                            handleSpecChange(
                              sIndex,
                              iIndex,
                              "name",
                              e.target.value,
                            )
                          }
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g., Blue)"
                          value={item.value}
                          onChange={(e) =>
                            handleSpecChange(
                              sIndex,
                              iIndex,
                              "value",
                              e.target.value,
                            )
                          }
                        />
                        <button
                          type="button"
                          className="remove-item-btn"
                          onClick={() => removeItem(sIndex, iIndex)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="add-item-btn"
                      onClick={() => addItem(sIndex)}
                    >
                      + Add Item
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="images-upload-grid mb-4">
              {productImagePreviews.map((src, index) => (
                <div className="img-preview-wrapper" key={index}>
                  <img
                    src={src}
                    alt="preview"
                    className="product-img-preview"
                  />
                  <button
                    type="button"
                    className="remove-img-btn"
                    onClick={() => removeImage(index)}
                  >
                    <i className="fas fa-times-circle"></i>
                  </button>
                </div>
              ))}
              {productImagePreviews.length < 5 && (
                <div
                  className="upload-placeholder-card"
                  onClick={() => fileInputRef.current.click()}
                >
                  <img src={productPlaceholder} alt="placeholder" />
                  <span>Click to upload</span>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleImageSelect}
              />
            </div>

            <div className="text-center">
              <Button
                title="Upload Product"
                width={200}
                loading={loading}
                onPress={handleUploadProduct}
                icon={<i className="fas fa-cloud-upload-alt"></i>}
              />
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default AddProduct;
