/**
 * Application Configuration
 *
 * This module centralizes environment-specific configuration values
 * such as API endpoints. Keeping these values in one place ensures
 * easier maintenance and improves flexibility when switching between
 * development, staging, and production environments.
 */

const CONFIG = {
  /** Dev Backend API Url */
  // BACKEND_API_URL: "http://localhost:8000/api",

  /** Prod Backend API Url */
  BACKEND_API_URL: "https://ni-drip-backend.vercel.app/api",
};

export default CONFIG;
