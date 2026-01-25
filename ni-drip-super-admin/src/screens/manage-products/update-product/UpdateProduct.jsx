import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import productPlaceholder from "../../../assets/placeHolder/product-placeholder.jpg";
import { validateFields } from "../../../utilities/validations/Validation.utility";
import "./UpdateProduct.css";
import InputField from "../../../utilities/input-field/InputField.utility";
import Button from "../../../utilities/button/Button.utility";
import {
  getProductById,
  updateProduct,
} from "../../../redux/slices/product.slice";
import { toast } from "react-hot-toast";
import Loader from "../../../utilities/loader/Loader.utility";

const UpdateProduct = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { selectedProduct, loading: sliceLoading } = useSelector(
    (state) => state.products,
  );

  const [productImages, setProductImages] = useState([]);
  const [productImagePreviews, setProductImagePreviews] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [specSections, setSpecSections] = useState([
    { section: "", items: [{ name: "", value: "" }] },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      dispatch(getProductById(productId));
    }
  }, [productId, dispatch]);

  useEffect(() => {
    if (selectedProduct && selectedProduct._id === productId) {
      setTitle(selectedProduct.title || "");
      setDescription(selectedProduct.description || "");
      setPrice(selectedProduct.price?.toString() || "");
      setStock(selectedProduct.stock?.toString() || "");
      setCategory(selectedProduct.category?.join(", ") || "");

      if (
        selectedProduct.specifications &&
        Array.isArray(selectedProduct.specifications)
      ) {
        const cleanedSpecs = selectedProduct.specifications.map((s) => ({
          section: s.section || "",
          items: s.items.map((i) => ({
            name: i.name || "",
            value: i.value || "",
          })),
        }));
        setSpecSections(
          cleanedSpecs.length > 0
            ? cleanedSpecs
            : [{ section: "", items: [{ name: "", value: "" }] }],
        );
      }

      if (selectedProduct.productImages) {
        setProductImagePreviews(selectedProduct.productImages);
      }
    }
  }, [selectedProduct, productId]);

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
    if (productImagePreviews.length + files.length > 5) {
      toast.error("Maximum 5 images allowed.");
      return;
    }
    setProductImages([...productImages, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setProductImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    const previewToRemove = productImagePreviews[index];
    setProductImagePreviews(productImagePreviews.filter((_, i) => i !== index));

    if (
      typeof previewToRemove !== "string" ||
      !previewToRemove.startsWith("http")
    ) {
      const fileIndex = productImages.findIndex(
        (file) => URL.createObjectURL(file) === previewToRemove,
      );
      setProductImages(productImages.filter((_, i) => i !== fileIndex));
    }
  };

  const handleUpdateProduct = async (event) => {
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

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("category", JSON.stringify(categoryArray));

      const filteredSpecs = specSections.filter((s) => s.section.trim() !== "");
      formData.append("specifications", JSON.stringify(filteredSpecs));

      productImages.forEach((file) => {
        formData.append("productImage", file);
      });

      const resultAction = await dispatch(
        updateProduct({ productId, formData }),
      );

      if (updateProduct.fulfilled.match(resultAction)) {
        toast.success("Product updated successfully");
        setTimeout(
          () => navigate("/super-admin/products/manage-products"),
          2000,
        );
      } else {
        toast.error(resultAction.payload?.message || "Update failed");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (sliceLoading && !selectedProduct)
    return <div className="text-center p-5"><Loader /></div>;

  return (
    <section id="update-product">
      <div className="update-product-container">
        <div className="update-product-header">
          <h1 className="update-product-title">Update Product</h1>
          <p className="update-product-subtitle">
            Modify existing product details and catalog information
          </p>
        </div>

        <section className="update-product-form-section">
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
                  rows={4}
                  onChange={(e) => setDescription(e.target.value)}
                  icon={<i className="fas fa-clipboard"></i>}
                />
              </div>
            </div>

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
                      placeholder="Section Name"
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
                          placeholder="Feature"
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
                          placeholder="Value"
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
                  <span>Upload New</span>
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
                title="Update Product"
                width={200}
                loading={loading}
                onPress={handleUpdateProduct}
                icon={<i className="fas fa-pencil-alt"></i>}
              />
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default UpdateProduct;
