/**
 * @file Dashboard.layout.jsx
 */
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Dashboard.layout.css";
import Sidebar from "../../utilities/Sidebar/Sidebar.utility";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="dashboard-layout">
      {/* Sidebar - Controlled by sidebarOpen state */}
      <aside
        className={`sidebar-container ${
          isMobile && sidebarOpen ? "sidebar-open" : ""
        } ${isMobile ? "sidebar-mobile" : ""}`}
      >
        <Sidebar />
      </aside>

      {/* Overlay for mobile - Closes sidebar on click */}
      {isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="content">
        {/* ADDED: Hamburger Menu Button (Visible only on mobile) */}
        {isMobile && (
          <button
            className="menu-toggle-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <i className="fas fa-bars"></i>
          </button>
        )}

        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
