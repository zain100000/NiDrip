# 💧 Ni-Drip Backend

**Ni-Drip Backend** serves as the core engine for an e-commerce application. It is built using the **MVC (Model-View-Controller)** architecture to ensure separation of concerns and maintainability. This API handles user authentication, product management, shopping cart operations, order processing, and administrative controls. It integrates with **Cloudinary** for media management and utilizes **Cron Jobs** for automated maintenance tasks.

## ✨ Key Features

### 👤 User & Authentication

- **Secure Auth:** JWT-based authentication and authorization.
- **Account Management:** Profile updates and password management.
- **Password Recovery:** Dedicated password reset flows via email.

### 🛒 E-Commerce Core

- **Product Catalog:** Comprehensive product listing and management.
- **Shopping Cart:** Persistent cart management for users.
- **Favorites:** Wishlist functionality for saving items for later.
- **Order System:** Full order lifecycle management.

### ⚙️ System & Utilities

- **Automated Cleanup:** Cron jobs to handle order cleanup and maintenance.
- **Media Storage:** Integrated `cloudinary-utility` for handling product images and uploads.
- **Social Proof:** Rating and Review systems for products.
- **Support:** Ticketing system for customer inquiries.
- **Security:** Implemented security middleware to protect routes.

---

## 🛠️ Tech Stack

| Component      | Technology   | Description                                   |
| -------------- | ------------ | --------------------------------------------- |
| **Runtime**    | Node.js      | Server-side JavaScript runtime                |
| **Framework**  | Express.js   | Web framework for Node.js                     |
| **Database**   | MongoDB      | NoSQL database (inferred via Mongoose models) |
| **Auth**       | JWT & Bcrypt | Stateless authentication & password hashing   |
| **Storage**    | Cloudinary   | Cloud-based image and video management        |
| **Scheduling** | Node-Cron    | Task scheduling for maintenance               |

## 📂 Project Structure

The project follows a modular directory structure for scalability:

📦NiDrip
┣ 📂ni-drip-backend
┃ ┣ 📂controllers
┃ ┃ ┣ 📂cart-controller
┃ ┃ ┃ ┗ 📜cart.controller.js
┃ ┃ ┣ 📂favorite-controller
┃ ┃ ┃ ┗ 📜favorite.controller.js
┃ ┃ ┣ 📂order-controller
┃ ┃ ┃ ┗ 📜order.controller.js
┃ ┃ ┣ 📂product-controller
┃ ┃ ┃ ┗ 📜product.controller.js
┃ ┃ ┣ 📂rating-controller
┃ ┃ ┃ ┗ 📜rating.controller.js
┃ ┃ ┣ 📂review-controller
┃ ┃ ┃ ┗ 📜review.controller.js
┃ ┃ ┣ 📂shared-controller
┃ ┃ ┃ ┗ 📜shared-password.reset.controller.js
┃ ┃ ┣ 📂super-admin-controller
┃ ┃ ┃ ┗ 📜super-admin.controller.js
┃ ┃ ┣ 📂support-controller
┃ ┃ ┃ ┗ 📜support.controller.js
┃ ┃ ┗ 📂user-controller
┃ ┃ ┃ ┗ 📜user.controller.js
┃ ┣ 📂helpers
┃ ┃ ┣ 📂cron-jobs
┃ ┃ ┃ ┗ 📜order-cleanup.cron.js
┃ ┃ ┣ 📂email-helper
┃ ┃ ┃ ┗ 📜email.helper.js
┃ ┃ ┣ 📂password-helper
┃ ┃ ┃ ┗ 📜password.helper.js
┃ ┃ ┗ 📂token-helper
┃ ┃ ┃ ┗ 📜token.helper.js
┃ ┣ 📂middlewares
┃ ┃ ┣ 📂auth-middleware
┃ ┃ ┃ ┗ 📜auth.middleware.js
┃ ┃ ┗ 📂security-middleware
┃ ┃ ┃ ┗ 📜security.middleware.js
┃ ┣ 📂models
┃ ┃ ┣ 📂cart-model
┃ ┃ ┃ ┗ 📜cart.model.js
┃ ┃ ┣ 📂favorite-model
┃ ┃ ┃ ┗ 📜favorite.model.js
┃ ┃ ┣ 📂order-model
┃ ┃ ┃ ┗ 📜order.model.js
┃ ┃ ┣ 📂product-model
┃ ┃ ┃ ┗ 📜product.model.js
┃ ┃ ┣ 📂rating-model
┃ ┃ ┃ ┗ 📜rating.model.js
┃ ┃ ┣ 📂review-model
┃ ┃ ┃ ┗ 📜review.model.js
┃ ┃ ┣ 📂super-admin-model
┃ ┃ ┃ ┗ 📜super-admin.model.js
┃ ┃ ┣ 📂support-model
┃ ┃ ┃ ┗ 📜support.model.js
┃ ┃ ┗ 📂user-model
┃ ┃ ┃ ┗ 📜user.model.js
┃ ┣ 📂routes
┃ ┃ ┣ 📂cart-route
┃ ┃ ┃ ┗ 📜cart.route.js
┃ ┃ ┣ 📂favorite-route
┃ ┃ ┃ ┗ 📜favorite.route.js
┃ ┃ ┣ 📂order-route
┃ ┃ ┃ ┗ 📜order.route.js
┃ ┃ ┣ 📂product-route
┃ ┃ ┃ ┗ 📜product.route.js
┃ ┃ ┣ 📂rating-route
┃ ┃ ┃ ┗ 📜rating.route.js
┃ ┃ ┣ 📂review-route
┃ ┃ ┃ ┗ 📜review.route.js
┃ ┃ ┣ 📂shared-route
┃ ┃ ┃ ┗ 📜shared-password.reset.route.js
┃ ┃ ┣ 📂super-admin-route
┃ ┃ ┃ ┗ 📜super-admin.route.js
┃ ┃ ┣ 📂support-route
┃ ┃ ┃ ┗ 📜support.route.js
┃ ┃ ┗ 📂user-route
┃ ┃ ┃ ┗ 📜user.route.js
┃ ┣ 📂services
┃ ┃ ┗ 📂password-service
┃ ┃ ┃ ┗ 📜password.service.js
┃ ┣ 📂utilities
┃ ┃ ┗ 📂cloudinary-utilitity
┃ ┃ ┃ ┗ 📜cloudinary.utility.js
┃ ┣ 📜.env
┃ ┣ 📜.gitignore
┃ ┣ 📜app.js
┃ ┣ 📜package-lock.json
┃ ┣ 📜package.json
┃ ┗ 📜Readme.md

```

```
