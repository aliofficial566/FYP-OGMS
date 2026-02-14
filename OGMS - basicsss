# Online Grocery Management System (OGMS) - Project Baseline

## 1. Project Architecture

The OGMS uses a **Client-Server Architecture** strictly following the **MVC (Model-View-Controller)** pattern on the backend.

*   **Frontend (Client):** Built with **React** (Single Page Application). It handles the implementation of the user interface and user experience. It consumes APIs provided by the backend.
*   **Backend (Server):** Built with **Node.js** and **Express.js**. It serves as the REST API layer that processes requests, handles business logic, and interacts with the database.
*   **Database:** **MySQL** (Relational Database). Stores all structured data (users, products, orders, etc.).

**Interaction Flow:**
1.  User performs an action in the React Client (e.g., "Add to Cart").
2.  React sends an HTTP Request (GET, POST, PUT, DELETE) to the Express Server endpoint.
3.  Express Router directs the request to the appropriate Controller.
4.  Controller processes the logic and queries the MySQL Database (Model).
5.  Database returns data to the Controller.
6.  Controller sends a JSON response back to the React Client.
7.  React updates the UI based on the response.

---

## 2. Recommended Folder Structure

### Root Directory
```text
/FYP - Project
  ├── /client          # React Frontend Application
  ├── /server          # Node.js Backend Application
  ├── PROJECT_BASELINE.md
  └── README.md
```

### Backend Structure (/server)
```text
/server
  ├── /config          # Database configuration and connection setup
  ├── /controllers     # Business logic for each route
  ├── /models          # Database schema/queries (if using an ORM like Sequelize) or raw SQL wrappers
  ├── /routes          # API route definitions
  ├── /middleware      # Auth checks, error handling, etc.
  ├── /utils           # Helper functions
  ├── .env             # Environment variables (DB credentials, API keys)
  ├── server.js        # Entry point of the application
  └── package.json     # Backend dependencies
```

### Frontend Structure (/client)
```text
/client/src
  ├── /assets          # Images, fonts, static files
  ├── /components      # Reusable UI components (Buttons, Navbar, Cards)
  ├── /pages           # Full page components (Home, Login, Dashboard)
  ├── /services        # API service functions (Axios calls)
  ├── /context         # Global state management (AuthContext, CartContext)
  ├── /styles          # CSS files or Styled Components
  ├── App.js           # Main component handling routing
  └── index.js         # Entry point rendering the React app
```

---

## 3. Database Baseline (MySQL)

### Key Tables
1.  **users**: Stores customer information.
2.  **admin**: Stores administrator credentials.
3.  **categories**: Product categories (Fruits, Vegetables, Dairy).
4.  **products**: Inventory details.
5.  **cart**: Temporary storage for user items before checkout.
6.  **orders**: Finalized transaction details.
7.  **payments**: Payment transaction logs.
8.  **reports**: (Optional) Aggregated data for admin views.

### Basic SQL Schema Outline

```sql
-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    image_url VARCHAR(255)
);

-- Products Table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    image_url VARCHAR(255),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Orders Table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order Items (Linking Products to Orders)
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## 4. API Communication Flow

The React frontend communicates with the Node.js backend using **REST APIs**.
**Data Format:** JSON.

**Example Flow (Get All Products):**

1.  **React (Frontend):**
    *   `services/productService.js` calls `axios.get('/api/products')`.
2.  **Express (Backend):**
    *   Route `/api/products` hits `productController.getAllProducts`.
3.  **Controller:**
    *   Executes SQL: `SELECT * FROM products;`
4.  **Response:**
    *   Returns JSON: `[ { "id": 1, "name": "Apple", "price": 100 }, ... ]`
5.  **React (Frontend):**
    *   Receives data and maps it to `ProductCard` components.

---

## 5. Authentication Baseline

**Flow:**
1.  **Registration:**
    *   User submits form.
    *   Backend hashes password (using `bcrypt`).
    *   Saves user to DB.
2.  **Login:**
    *   User submits email/password.
    *   Backend verifies hash.
    *   Backend generates a **Token** (JWT - JSON Web Token) or starts a **Session**.
    *   Token is sent to Client.
3.  **Protected Routes:**
    *   Client stores token (localStorage/cookie).
    *   Client sends token in Header (`Authorization: Bearer <token>`) for subsequent requests (e.g., "Place Order").
    *   Backend verifies token before processing request.

---

## 6. Best Practices

1.  **Separation of Concerns:** Keep logic (Controllers), data (Models), and routing (Routes) in separate files.
2.  **Security:**
    *   Never store plain-text passwords. Use hashing (`bcrypt`).
    *   Use **Environment Variables** (`.env`) for database passwords and API keys. Do not commit `.env` to GitHub.
    *   Sanitize inputs to prevent SQL Injection.
3.  **Error Handling:**
    *   Use `try-catch` blocks in async controller functions.
    *   Return consistent error messages (e.g., `{ "success": false, "message": "User not found" }`).
