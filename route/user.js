const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const userController = require("../controllers/user");

router.get("/signup", userController.senderSignForm);

router.post(
  "/signup",
  wrapAsync(userController.signupUser));

router.get("/login", userController.renderLoginForm);

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.loginUser
);

router.get("/logout", userController.logoutUser);
module.exports = router;
