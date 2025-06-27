const express = require("express");
const router = express.Router({ mergeParams: true });
const { listingSchema, reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/expressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isloggedin, isAuthor } = require("../middleware.js");
const controllerReview = require("../controllers/review.js");



const validateReview = (req, res, next)=> {
  let{error} = reviewSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el) => el.message).join(",");
    console.log(errMsg);
    throw new ExpressError(400, errMsg);
  }else{
    next();
  }
}

// POST REVIEW ROUTE
router.post("/",
  isloggedin,
  validateReview,
   wrapAsync(controllerReview.createReview));

// DELETE REVIEW ROUTE
router.delete("/:reviewId",
  isAuthor, 
  wrapAsync(controllerReview.deleteReview));

module.exports = router;