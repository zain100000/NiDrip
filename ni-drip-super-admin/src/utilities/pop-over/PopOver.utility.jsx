/**
 * @file PopOver.utility.css
 * @module Styles/PopOver
 * @description
 * Styling for floating contextual menus and action sheets.
 * * **Visual Hierarchy:**
 * - **Elevated Surface:** Uses a deep box-shadow (`0 10px 30px`) and primary gradient to stand out from the dashboard background.
 * - **Micro-interactions:** Implements a `fadeIn` keyframe with a slight vertical translation for a tactile "pop" effect.
 * - **Destructive Actions:** `.danger-item` provides a distinct visual warning (red-tinted hover) to differentiate routine actions from critical ones.
 * * **Technical Note:** Uses `position: absolute` with a default `bottom: 70px`, optimized for usage near the user profile or sidebar footer.
 */

import React, { useEffect, useRef } from "react";
import "./PopOver.utility.css";

const PopOver = ({ isOpen, onClose, items, className = "" }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <section id="pop-over">
      <div className={`action-menu-container ${className}`} ref={menuRef}>
        <ul className="action-menu-list">
          {items.map((item, index) => (
            <li
              key={index}
              className={`action-menu-item ${item.type === "danger" ? "danger-item" : ""}`}
              onClick={() => {
                item.action();
                onClose();
              }}
            >
              <div className="icon-wrapper">
                <i className={item.icon}></i>
              </div>
              <span className="label-text">{item.label}</span>
              {item.type === "arrow" && (
                <i className="fas fa-chevron-right arrow-icon"></i>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default PopOver;
