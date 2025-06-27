const User = require("../models/user");

module.exports.senderSignForm = (req, res) => {
     res.render("user/signup.ejs", { currentRoute: "/signup", currUser: req.user });
  };

  module.exports.signupUser =async (req, res) => {
      try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registerdUser = await User.register(newUser, password);
        console.log(registerdUser);
        req.login(registerdUser, (err) => {
          if (err) {
            return next(err);
          }
          req.flash("success", "Welcome to WonderLust");
          res.redirect("/listing");
        });
      
      } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
      }
    };

    module.exports.renderLoginForm = async(req, res) => {
        res.render("user/login.ejs", { currentRoute: "/login", currUser: req.user });
      };

    module.exports.loginUser = async (req, res) => {
        req.flash("success", "Welcome back to WonderLust!");
        let redirectURL = res.locals.redirectUrl || "/listing";
        res.redirect(redirectURL);
      };

      module.exports.logoutUser = (req, res, next) => {
        req.logout((err) => {
          if (err) {
            return next(err);
          }
          req.flash("you are logout successfully");
          res.redirect("/listing");
        });
      }
    