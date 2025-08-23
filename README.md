# Store Rating Management Platform

A full-stack web application built as part of the **FullStack Intern Coding Challenge**.  
The platform allows users to submit and manage store ratings, with role-based access control for **Admin**, **Store Owner**, and **Normal User**.

---

## 🚀 Tech Stack

**Frontend**
- [React.js](https://react.dev/) – Component-based UI  
- [React Router DOM](https://reactrouter.com/) – Routing  
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first styling  
- [Framer Motion](https://www.framer.com/motion/) – Animations  
- [Lucide React](https://lucide.dev/) – Icons  

**Backend**
- [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/) – REST API  
- [PostgreSQL](https://www.postgresql.org/) – Relational database (via [NeonDB](https://neon.tech/))  
- [Drizzle ORM](https://orm.drizzle.team/) – Database queries & migrations  
- [Docker](https://www.docker.com/) – Containerized PostgreSQL database
- [JWT (jsonwebtoken)](https://github.com/auth0/node-jsonwebtoken) – Authentication  
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) – Password hashing  
- [Helmet](https://helmetjs.github.io/) – Security headers  
- [Express Rate Limit](https://www.npmjs.com/package/express-rate-limit) – API rate limiting  

**Dev Tools**
- [Vite](https://vitejs.dev/) – Frontend bundler  
- [ESLint](https://eslint.org/) – Linting  
- [Nodemon](https://nodemon.io/) – Auto-reload backend  
- [Jest](https://jestjs.io/) – Testing  

---

## 🔑 Features

### 👤 Roles & Functionalities
- **System Administrator**
  - Add/manage stores and users (Admin/Owner/User)  
  - Dashboard: total users, stores, ratings  
  - View and filter store & user lists  

- **Normal User**
  - Sign up, log in, update password  
  - Browse/search stores  
  - Submit/update ratings (1–5)  
  - View own submitted ratings  

- **Store Owner**
  - Log in, update password  
  - Dashboard: see average store rating & list of users who rated  

---

## ✅ Form Validations
- **Name**: 10–60 characters  
- **Address**: Max 400 characters  
- **Password**: 8–16 characters, at least one uppercase letter & one special character  
- **Email**: Must follow standard email format  

---

## 🔐 Authentication
- **JWT-based authentication** for all users.  
- Role-based access control ensures different dashboards and permissions.  

---

## 📂 Database Schema
- **Users Table** → Name, Email, Password, Address, Role  
- **Stores Table** → Name, Address, Owner, Average Rating  
- **Ratings Table** → UserId, StoreId, Rating  

---

## 🛠 Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd <repo-folder>
```

### 2. Install dependencies
Frontend:
```bash
cd apps/web
npm install
```
Backend:
```bash
cd apps/api
npm install
```

### 3. Configure environment variables
Create a `.env` file inside `/api`:

```env
# Server Configuration
NODE_ENV=development
PORT=5001

# Database Configuration
DATABASE_URL='postgres://postgres:admin@localhost:5432/store_rating'

# JWT Configuration
JWT_SECRET=cf68a83622ba19f16cf4af455b508cd55f5f258aff522507c35133cca0175410c9a05fdf06e13f144861a91226bda8389b48208c7389b9e3d66c14818e4d93ec
JWT_EXPIRES_IN=24h

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dn
CLOUDINARY_API_KEY=9
CLOUDINARY_API_SECRET=oWfe0RKBZSz

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=1000

# Logging
LOG_LEVEL=info
```

### 4. Run the project
Backend:
```bash
npm run dev
```
Frontend:
```bash
npm run dev
```

---

## 🔑 Test Login Credentials
| Role        | Email             | Password  |
|-------------|-------------------|-----------|
| Admin       | admin@example.com | Pass123!  |
| Store Owner | owner@example.com | Pass123!  |
| Normal User | user@example.com  | Pass123!  |

---

## 📊 Additional Notes
- Sorting and filtering supported on all tables (Name, Email, Address, Role).  
- Built with best practices for scalability, modularity, and security.  
- Fully responsive frontend with modern UI/UX.  

