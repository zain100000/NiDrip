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

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Card from "../../utilities/card/Card.utility";
import { getAllProducts } from "../../redux/slices/product.slice";
import { getAllTickets } from "../../redux/slices/support.slice";

const Main = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const products = useSelector((state) => state.products.products || []);
  const support = useSelector((state) => state.support.allTickets || []);

  console.log("Support", support);

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllProducts());
      dispatch(getAllTickets());
    }
  }, [dispatch, user?.id]);

  const productStats = useMemo(() => {
    return {
      totalTypes: products.length,
      totalStockUnits: products.reduce(
        (acc, curr) => acc + (Number(curr.stock) || 0),
        0,
      ),
    };
  }, [products]);

  const supportTicketStats = useMemo(() => {
    return {
      totalSupportTickets: support.length,
    };
  }, [support]);

  const handleNavigateProducts = () =>
    navigate("/super-admin/products/manage-products");

  const handleNavigateInventory = () =>
    navigate("/super-admin/inventory/manage-inventory");

  const handleNavigateSupport = () =>
    navigate("/super-admin/support/manage-support-tickets");

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
          <div className="col-6 col-md-4 col-lg-4">
            <Card
              title="Total Products Available"
              icon={<i className="fas fa-box-open" />}
              mainValue={productStats.totalTypes}
              accentColor="#f72585"
              onClick={handleNavigateProducts}
              hoverEffect={true}
              size="small"
            />
          </div>

          <div className="col-6 col-md-4 col-lg-4">
            <Card
              title="Total Inventory Units"
              icon={<i className="fas fa-warehouse" />}
              mainValue={productStats.totalStockUnits}
              accentColor="#4361ee"
              onClick={handleNavigateInventory}
              hoverEffect={true}
              size="small"
            />
          </div>

          <div className="col-6 col-md-4 col-lg-4">
            <Card
              title="Total Support Tickets"
              icon={<i className="fas fa-ticket-alt" />}
              mainValue={supportTicketStats.totalSupportTickets}
              accentColor="#c9ee43"
              onClick={handleNavigateSupport}
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
