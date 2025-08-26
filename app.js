// ------------------ Imports ------------------
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
require("dotenv").config();

// Models
const User = require("./models/user.js");

// Routes
const listingRoute = require("./route/listing.js");
const reviewRoute = require("./route/review.js");
const UserRoute = require("./route/user.js");
const { saveRedirectUrl } = require("./middleware.js");

// ------------------ App Setup ------------------
const app = express();
const port = process.env.PORT || 8080;
const dbURL = process.env.ATLASDB_URL;

// ------------------ Database ------------------
async function connectDB() {
  if (!dbURL) {
    console.error("❌ No MongoDB connection string provided. Set ATLASDB_URL in environment variables.");
    return;
  }

  try {
    await mongoose.connect(dbURL);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
  }
}
connectDB();

// ------------------ Session Store ------------------
const store = MongoStore.create({
  mongoUrl: dbURL,
  crypto: {
    secret: process.env.SECRET || "fallback-secret",
  },
  touchAfter: 24 * 3600, // reduce write frequency
});

store.on("error", (err) => {
  console.error("❌ SESSION STORE ERROR:", err);
});

const sessionOptions = {
  store,
  name: "session",
  secret: process.env.SECRET || "fallback-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

// ------------------ Middleware ------------------
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(session(sessionOptions));
app.use(flash());

// ------------------ Passport ------------------
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Incorrect email." });
        }

        const isMatch = await user.authenticate(password);
        return isMatch
          ? done(null, user)
          : done(null, false, { message: "Incorrect password." });
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ------------------ Global Locals ------------------
app.use(saveRedirectUrl);

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null;
  res.locals.currentRoute = req.path || "/";
  next();
});

// Ignore favicon & well-known requests
app.use((req, res, next) => {
  if (req.path === "/favicon.ico" || req.path.startsWith("/.well-known")) {
    return res.status(204).end();
  }
  next();
});

// ------------------ Routes ------------------
app.use("/listing", listingRoute);
app.use("/listings/:id/reviews", reviewRoute);
app.use("/user", UserRoute);

// Root redirect
app.get("/", (req, res) => {
  res.redirect("/listing");
});

// Debug route
app.get("/test", (req, res) => {
  res.json({
    message: "Middleware test",
    currUser: res.locals.currUser ? "defined" : "null",
    currentRoute: res.locals.currentRoute,
    success: res.locals.success,
    error: res.locals.error,
  });
});

// ------------------ Error Handler ------------------
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("listings/error.ejs", { message });
});

// ------------------ Server ------------------
app.listen(port, () => {
  console.log(`🚀 Server is listening on port ${port}`);
});
