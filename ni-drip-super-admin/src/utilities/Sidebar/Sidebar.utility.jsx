/**
 * @file Sidebar.utility.jsx
 * @module Utilities/Sidebar
 * @description
 * The primary vertical navigation component for the Super Admin dashboard.
 * * **Visual Architecture:**
 * - **Vibrant Branding:** Features a signature pink-to-green linear gradient background.
 * - **Glassmorphic Links:** Uses semi-transparent white backgrounds for secondary links and solid white for the active state.
 * - **Icon Squares:** Encloses FontAwesome icons within standardized white rounded containers for a modern, tactile feel.
 * * **Technical Logic:**
 * - **Dynamic Mapping:** Consumes an array of `navItems` to generate scalable navigation.
 * - **Active State Detection:** Leverages `react-router-dom`'s `NavLink` to automatically style the current route.
 */

import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logo/logo.png";
import imgPlaceholder from "../../assets/placeHolder/placeholder.png";
import "../../styles/global.styles.css";
import "./Sidebar.utility.css";
import { useDispatch, useSelector } from "react-redux";
import { getSuperAdmin } from "../../redux/slices/super-admin.slice";
import { logout } from "../../redux/slices/auth.slice";
import PopOver from "../pop-over/PopOver.utility";
import { toast } from "react-hot-toast";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const superAdmin = useSelector((state) => state.superAdmin.superAdmin);
  const profilePicture = superAdmin?.profilePicture || imgPlaceholder;

  useEffect(() => {
    if (user?.id) {
      dispatch(getSuperAdmin(user.id));
    }
  }, [dispatch, user?.id]);

  const navItems = [
    { name: "Dashboard", path: "/super-admin/dashboard", icon: "fas fa-home" },
    {
      name: "Manage Products",
      path: "/super-admin/products/manage-products",
      icon: "fas fa-box-open",
    },
  ];

  const profileMenuItems = [
    {
      label: "Sign Out",
      icon: "fas fa-sign-out-alt",
      type: "danger",
      action: async () => {
        try {
          const resultAction = await dispatch(logout());

          if (logout.fulfilled.match(resultAction)) {
            const message = resultAction.payload?.message;

            if (message) {
              toast.success(message);
            }

            setTimeout(() => {
              navigate("/");
            }, 1500);
            return;
          }

          if (logout.rejected.match(resultAction)) {
            const message = resultAction.payload?.message;

            if (message) {
              toast.error(message);
            }
          }
        } catch (error) {
          console.error("Logout error:", error);
        }
      },
    },
  ];

  return (
    <section id="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="Logo" className="sidebar-logo-img" />
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <div className="sidebar-icon">
              <i className={item.icon}></i>
            </div>
            <span className="link-text">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="side-bar-footer">
        {/* Render the Reusable Menu */}
        <div className="profile-menu-wrapper">
          <PopOver
            isOpen={isProfileMenuOpen}
            onClose={() => setIsProfileMenuOpen(false)}
            items={profileMenuItems}
            className="sidebar-profile-popup"
          />
        </div>

        {/* Profile Image Trigger */}
        <div
          className="profile-container"
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
        >
          <img src={profilePicture} alt="Profile" className="profile-img" />
        </div>
      </div>
    </section>
  );
};

export default Sidebar;
