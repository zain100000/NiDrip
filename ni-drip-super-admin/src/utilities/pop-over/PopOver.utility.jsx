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

import React, { useEffect, useRef, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./PopOver.utility.css";

const PopOver = ({
  isOpen,
  onClose,
  items,
  className = "",
  anchorRef,
  position = "bottom",
}) => {
  const menuRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, origin: "top" });

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !anchorRef?.current?.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  useLayoutEffect(() => {
    if (!isOpen || !anchorRef?.current || !menuRef.current) return;

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const menu = menuRef.current;
    const menuRect = menu.getBoundingClientRect();

    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;

    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;

    let top = 0;
    let left = 0;
    let origin = "top";

    left =
      anchorRect.left + anchorRect.width / 2 - menuRect.width / 2 + scrollX;

    const minLeft = 50 + scrollX;
    const maxLeft = scrollX + viewportWidth - menuRect.width - 100;
    left = Math.max(minLeft, Math.min(left, maxLeft));

    const spaceBelow = viewportHeight - anchorRect.bottom;
    const spaceAbove = anchorRect.top;

    if (position === "bottom") {
      if (spaceBelow >= menuRect.height + 8) {
        top = anchorRect.bottom + 8 + scrollY;
        origin = "top";
      } else if (spaceAbove >= menuRect.height + 8) {
        top = anchorRect.top - menuRect.height - 8 + scrollY;
        origin = "bottom";
      } else {
        top = Math.max(
          8 + scrollY,
          Math.min(
            anchorRect.bottom + 8 + scrollY,
            scrollY + viewportHeight - menuRect.height - 8,
          ),
        );
        origin = top > anchorRect.top ? "top" : "bottom";
      }
    } else if (position === "top") {
      top = anchorRect.top - menuRect.height - 8 + scrollY;
      origin = "bottom";
    } else if (position === "left") {
      left = anchorRect.left - menuRect.width - 8 + scrollX;
      top = anchorRect.top + scrollY;
      origin = "right";
    } else if (position === "right") {
      left = anchorRect.right + 8 + scrollX;
      top = anchorRect.top + scrollY;
      origin = "left";
    }

    setCoords({ top, left, origin });
  }, [isOpen, anchorRef, position, items]);

  if (!isOpen) return null;

  const popover = (
    <section id="pop-over" className={className}>
      <div
        className="action-menu-container"
        ref={menuRef}
        style={{
          position: "absolute",
          top: `${coords.top}px`,
          left: `${coords.left}px`,
          transformOrigin: coords.origin,
        }}
      >
        <ul className="action-menu-list">
          {items.map((item, index) => (
            <li
              key={index}
              className={`action-menu-item ${item.type === "danger" ? "danger-item" : ""}`}
              onClick={() => {
                try {
                  item.action();
                } catch (err) {
                  console.error(err);
                }
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

  return createPortal(popover, document.body);
};

export default PopOver;
