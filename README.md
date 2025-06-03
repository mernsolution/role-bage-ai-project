# Authentication
This is higle secure Authentication in mern Stack 

# 🛡️ User Authentication and Authorization (MERN Stack)

This is a full-stack authentication system built using **MongoDB, Express, React, and Node.js (MERN Stack)**. It allows users to register, log in, maintain sessions via cookies, and handle protected routes securely.

---

## 🚀 Features
```
- 🔐 User Registration & Login
- 🍪 Secure Cookie-based Authentication
- ✅ Session Checking API (`/check-session`)
- 🔒 Protected Routes (frontend & backend)
- 🔓 Logout (clears all cookies)
- 🔁 Persistent Login (using HttpOnly cookies)
- 🧠 Context API for global auth state in React
```

## 🧩 Tech Stack

- **Frontend**: React (Vite), Axios, Context API
- **Backend**: Node.js, Express, Mongoose, CORS, Cookie-Parser, Helmet
- **Database**: MongoDB (Mongoose ODM)

---

## 🛠️ Setup Instructions

### 📁 Clone Repository

git clone https://github.com/mernsolution/Authentication.git
cd Authentication
```
Server Setup (/server)
cd server
npm install
```
Create a .env file inside server/ folder:
```
PORT=5000
MONGO_URI=your_mongodb_connection_uri
JWT_SECRET=your_secret_key
```
💻 Client Setup (/client)

```
cd ../client
npm install
npm run dev
```

📡 API Endpoints
```
POST	/signup	User registration
POST	/sign-in	User login
POST	/logout	Clear auth cookies (logout)
GET	/check-session	Check if user is authenticated
GET	/check-shop-name	Check if shop name is available
GET	/check-username	Check if username is available
GET	/shop-name	Get all registered shop names
```
🔐 Authentication Logic (Backend)
```
User Signup:
Receives username, password, and an array of shop names (minimum 3). Password is hashed with bcrypt and stored securely in the database.

Username and Shop Name Availability Checks:
APIs to verify if a username or shop name already exists to prevent duplicates during registration.

User Login:
Verifies username and password. If valid, generates a JWT token with configurable expiration (30 mins or 7 days if "remember me" is enabled). The token is sent as an HTTP-only cookie.

Session Check:
Validates the JWT token from cookies to confirm if the user session is still active.

Get Shop Names:
Retrieves shop name data for the authenticated user based on the valid JWT token.

Logout:
Clears the authentication cookie to log the user out.
```
📦 Folder Structure
```
Authentication/
├── client/     # React frontend (Vite)
├── server/     # Express backend
```
✍️ Author
```
MD Rubel
💻 Full Stack MERN Developer
📧 hmrubel0143@gmail.com
```
