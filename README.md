# 🏡 Airbnb Clone

A full-stack Airbnb-like web application built with **Node.js, Express, MongoDB, Mongoose, EJS, Passport.js**, and **Cloudinary** for image hosting.  
It allows users to **list properties, upload images, authenticate securely, and manage bookings**.

---

## 🚀 Features
- 🔐 User authentication with **Passport.js (Local strategy)**  
- 🏠 Create, edit, and delete property listings  
- ☁️ Image uploads with **Multer + Cloudinary**  
- 📦 Persistent sessions with **MongoDB Store**  
- ⚡ RESTful API routes  
- 🎨 Server-side rendering with **EJS templates**  
- 📱 Responsive UI with **Bootstrap/Custom CSS**  

---

## 📂 Project Structure

├── controllers/ # Route controllers (business logic)
├── init/ # Scripts for database initialization, testing, seeding
├── models/ # Mongoose schemas & models
├── public/ # Static files (CSS, JS, images)
├── route/ # Express routes
├── utils/ # Helper functions
├── views/ # EJS templates (frontend)
├── .gitignore # Ignored files (node_modules, .env, etc.)
├── app.js # Main Express application
├── cloudinaryConfig.js # Cloudinary setup
├── middleware.js # Custom middlewares
├── package.json # Project dependencies & scripts
├── schema.js # Joi validation schemas
└── README.md # Project documentation

yaml
Copy
Edit

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/airbnb-clone.git
cd airbnb-clone
2️⃣ Install dependencies
bash
Copy
Edit
npm install
3️⃣ Create a .env file
Inside the project root, add the following:


4️⃣ Run the project locally
bash
Copy
Edit
npm run dev
Now open: http://localhost:3000

📦 Available NPM Scripts
npm start → Start server (production mode)

npm run dev → Start server with nodemon (development)

npm run import-data → Import seed data into MongoDB

npm run init-db → Initialize database

npm run verify-setup → Verify DB and config setup

npm run test-data → Test dummy data insertion

⚡ Tech Stack
Backend: Node.js, Express.js

Database: MongoDB, Mongoose

Authentication: Passport.js + Sessions

Image Hosting: Cloudinary + Multer

Templating Engine: EJS

Styling: Bootstrap / Custom CSS

📸 Screenshots
(Add screenshots of homepage, login, property listing once deployed)

🌍 Deployment
Easily deployable on:

Render

Vercel (frontend-only)

Heroku (legacy)

👨‍💻 Author
Developed by Shivank Pundir ✨


⚡ This will render perfectly on **GitHub** with sections, emojis, and code blocks.  

👉 Do you also want me to add a **step-by-step Render deployment guide** (with `.env` setup) inside this README so others can easily deploy your project?








