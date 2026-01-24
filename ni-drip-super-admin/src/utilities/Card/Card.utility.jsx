/**
 * Dashboard Stat Card Component
 *
 * A reusable card component designed to match the provided screenshot style:
 * - Colored icon badge on the left
 * - Small gray title/subtitle at the top
 * - Large primary value in the center
 * - Optional trend indicator (arrow + highlighted percentage + comparison text) at the bottom
 * - Clean white background with subtle shadow and hover lift
 * - Fully accessible and responsive
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string} props.title - Subtitle text (e.g., "Total Orders").
 * @param {React.ReactNode} props.icon - Icon element (recommended: font icon or SVG, white color not needed as it's forced).
 * @param {string|number} props.mainValue - The large primary statistic (e.g., "2,450" or 2450).
 * @param {string} [props.accentColor="#f72585"] - Background color for the icon badge (default vibrant pink to match screenshot).
 * @param {function} [props.onClick] - Optional click handler for the entire card.
 * @param {string} [props.customClassName] - Optional custom class name for overrides.
 * @param {boolean} [props.hoverEffect=true] - Enable hover lift effect.
 * @param {string} [props.size='medium'] - Card size ('small', 'medium', 'large').
 *
 * @example
 * <Card
 *   title="Total Orders"
 *   icon={<i className="fas fa-credit-card"></i>}
 *   accentColor="#f72585"
 * />
 */

import { useState, useEffect } from "react";
import "../../styles/global.styles.css";
import "./Card.utility.css";

const Card = ({
  title,
  icon,
  mainValue = "0",
  accentColor,
  onClick,
  customClassName = "",
  hoverEffect = true,
  size = "medium",
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && onClick) {
      onClick();
    }
  };

  return (
    <section id="card">
      <article
        className={`card-container ${customClassName} ${size} ${
          hoverEffect ? "with-hover" : ""
        }`}
        onClick={onClick}
        onKeyPress={handleKeyPress}
        tabIndex={onClick ? 0 : -1}
        role={onClick ? "button" : "article"}
        aria-label={onClick ? `Click to interact with ${title} card` : title}
      >
        <div className={`custom-card ${isMounted ? "mounted" : ""}`}>
          <div className="card-inner">
            {icon && (
              <div
                className="icon-wrapper"
                style={{ backgroundColor: accentColor }}
              >
                <div className="card-icon">{icon}</div>
              </div>
            )}

            <div className="content-wrapper">
              <p className="card-subtitle">{title}</p>
              <h2 className="main-value">{mainValue}</h2>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};

export default Card;
