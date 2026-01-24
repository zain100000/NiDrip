/**
 * @file Main.dashboard.jsx
 * @module Screens/Dashboard/Main
 * @description
 * The primary entry point for the Admin Dashboard.
 * * **Data Aggregation:**
 * - Connects to the `auth` slice to verify identity.
 * - Connects to the `products` slice to compute inventory metrics.
 * * **Workflow:**
 * - **Auto-Sync:** Triggers a global product fetch on mount if an authenticated user is detected.
 * - **Metric Calculation:** Derives `totalProducts` from the store for real-time display.
 * - **Navigation:** Provides quick-action routing to detailed management modules.
 * * @requires react-redux
 * @requires react-router-dom
 */

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Card from "../../utilities/card/Card.utility";
import { getAllProducts } from "../../redux/slices/product.slice";

const Main = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const products = useSelector((state) => state.products.products || []);

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllProducts());
    }
  }, [dispatch, user?.id]);

  const totalProducts = products.length;

  const handleNavigateProducts = () =>
    navigate("/super-admin/products/manage-products");

  return (
    <section id="dashboard">
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-6 col-lg-6">
            <h1
              className="header"
              style={{ marginTop: 25, fontWeight: "bold" }}
            >
              Admin Dashboard
            </h1>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-12 col-md-6 col-lg-6">
            <Card
              title="Products"
              icon={<i className="fas fa-box-open" />}
              mainValue={totalProducts}
              accentColor="#f72585"
              onClick={handleNavigateProducts}
              hoverEffect={true}
              size="small"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Main;
