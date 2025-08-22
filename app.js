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
  await mongoose.connect(dbURL);
}
main()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const store = MongoStore.create({
  mongoUrl: dbURL,
  crypto:{
secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

const sessionOption = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

store.on("error", (err) => {
  console.log("ERROR IN MONGO-SESSION", err);
});

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
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash Messages and Current User Middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  res.locals.currentRoute = req.path;
  next();
});

// Routes
app.use("/listing", listingRoute);
app.use("/listings/:id/reviews", reviewRoute);
app.use("/", UserRoute);

// Error Handler
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("listings/error.ejs", { message });
});

// Start Server
app.listen(8080, () => {
  console.log("🚀 Server is listening on port 8080");
});
