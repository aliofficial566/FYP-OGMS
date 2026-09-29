# Online Grocery Management System (OGMS) - FYP Setup Guide

This guide explains how to set up and run the OGMS project locally on any computer. 

## Prerequisites
Before you begin, ensure the following software is installed on the computer:
1. **Node.js**: Download and install from [nodejs.org](https://nodejs.org/). (This includes `npm`).
2. **XAMPP** (or any MySQL server): Download from [apachefriends.org](https://www.apachefriends.org/). This is required to host the local MySQL database.

---

## Step 1: Database Setup
The project relies on a MySQL database. You need to create the database and import the tables/data.

1. Open **XAMPP Control Panel** and start the **Apache** and **MySQL** modules.
2. Open your browser and go to `http://localhost/phpmyadmin/`.
3. Click on **New** in the left sidebar to create a new database.
4. Name the database **`ogms_db`** and click **Create**.
5. Select the newly created `ogms_db` from the left sidebar.
6. Click the **Import** tab at the top.
7. Click **Choose File** and select the `.sql` database backup file (You should export your current database to an `.sql` file and place it in this folder before submitting!).
8. Scroll down and click **Import** to load all the tables and dummy data.

---

## Step 2: Backend (Server) Setup
1. Open a terminal or command prompt.
2. Navigate to the `server` directory:
   ```bash
   cd server
   ```
3. Install the required Node packages:
   ```bash
   npm install
   ```
4. Check the `.env` file inside the `server` folder. It should look like this:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=ogms_db
   JWT_SECRET=your_secret_key
   ```
   *(Note: XAMPP's default MySQL user is `root` with a blank password).*
5. Start the backend server:
   ```bash
   npm run dev
   ```
   *You should see a message saying "Server is running on port 5000" and "Connected to the database." Keep this terminal open.*

---

## Step 3: Frontend (Client) Setup
1. Open a **new** terminal or command prompt window (leave the server running in the first one).
2. Navigate to the `client` directory:
   ```bash
   cd client
   ```
3. Install the required Node packages:
   ```bash
   npm install
   ```
4. Start the React frontend application:
   ```bash
   npm run dev
   ```
5. The terminal will show a local link (usually `http://localhost:5173`). Ctrl+Click the link to open the application in your web browser.

---

## Troubleshooting
* **Database Connection Error**: Ensure XAMPP MySQL is running and your `.env` credentials match your MySQL setup.
* **Images not showing**: Ensure the `server/uploads` folder exists. If moving to a new computer, the images saved in `uploads` will only appear if you copy the `uploads` folder over.
* **Port in Use**: If port 5000 (backend) or 5173 (frontend) is already in use, you can kill the process using that port or change the port in the `.env` / Vite configuration.
