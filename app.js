const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();   


const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const User = require("./models/user.js");
const session = require("express-session");
const Crypto = require("crypto-js");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const listingRoute = require("./route/listing.js");
const reviewRoute = require("./route/review.js");
const UserRoute = require("./route/user.js");

const dbURL = process.env.ATLASDB_URL;

async function main() {
  if (!dbURL) {
    console.log("⚠️  No MongoDB connection string provided. App will run without database.");
    return;
  }
  
  try {
    await mongoose.connect(dbURL);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
  }
}

main();

// Session store setup - only create if we have a database connection
let store;
if (dbURL) {
  store = MongoStore.create({
    mongoUrl: dbURL,
    crypto: {
      secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
  });

  store.on("error", (err) => {
    console.log("ERROR IN MONGO-SESSION", err);
  });
}

const sessionOption = {
  store: store || null,
  secret: process.env.SECRET || 'your-secret-key-here',
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(express.static('public'));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

app.use(session(sessionOption));
app.use(flash());

// Passport Config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return done(null, false, { message: 'Incorrect email.' });
    }
    
    const isMatch = await user.authenticate(password);
    if (isMatch) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Incorrect password.' });
    }
  } catch (err) {
    return done(err);
  }
}));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Save Redirect URL Middleware (BEFORE Global Locals)
const { saveRedirectUrl } = require("./middleware.js");
app.use(saveRedirectUrl);

// Flash Messages and Current User Middleware
app.use((req, res, next) => {
  console.log("🔍 Middleware running - Path:", req.path, "User:", req.user ? req.user.username : 'null');
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null;
  res.locals.currentRoute = req.path || '/';
  console.log("✅ Locals set - currUser:", res.locals.currUser ? 'defined' : 'null', "currentRoute:", res.locals.currentRoute);
  console.log("✅ Flash messages - success:", res.locals.success, "error:", res.locals.error);
  next();
});
app.use((req, res, next) => {
  // Ignore favicon and Chrome devtools requests
  if (req.path === '/favicon.ico' || req.path.startsWith('/.well-known')) {
    return res.status(204).end(); // No Content
  }
  next();
});
// Routes
app.use("/listing", listingRoute);
app.use("/listings/:id/reviews", reviewRoute);
app.use("/user", UserRoute);

// Test route to verify middleware
app.get("/test", (req, res) => {
  console.log("🧪 Test route accessed - Locals:", {
    currUser: res.locals.currUser ? 'defined' : 'null',
    currentRoute: res.locals.currentRoute,
    success: res.locals.success,
    error: res.locals.error
  });
  res.json({
    message: "Middleware test",
    currUser: res.locals.currUser ? 'defined' : 'null',
    currentRoute: res.locals.currentRoute,
    success: res.locals.success,
    error: res.locals.error
  });
});

// Root route
app.get("/", (req, res) => {
  res.redirect("/listing");
});

// Error Handler
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("listings/error.ejs", { message });
});

// Start Server
app.listen(8080, () => {
  console.log("🚀 Server is listening on port 8080");
});
