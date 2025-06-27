if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// console.log(process.env.CLOUD_SECRET); 

const express = require("express");
const router = express.Router();
const { listingSchema, reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/expressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const{isloggedin,isOwner} = require("../middleware.js");
const User = require("../models/user.js");
const { Cursor } = require("mongoose");
const listingControllers = require("../controllers/listing.js");

const multer = require("multer");
const {storage} = require("../cloudinaryConfig.js");
const upload = multer({storage});



const validateListing = (req, res, next)=> {
    let{error} = listingSchema.validate(req.body);
    if(error){
      let errMsg = error.details.map((el) => el.message).join(",");
      console.log(errMsg);
      throw new ExpressError(400, errMsg);
    }else{
      next();
    }
  }
 router.get("/search",
  listingControllers.listingSearch
 );


   router.get("/filter/:category",
      validateListing,
    listingControllers.addHader
  );

  
  //INDEX ROUTE
router.get("/", wrapAsync(listingControllers.index));
  
  // CREATE ROUTE
  router.get("/new", isloggedin,listingControllers.renderNewForm);
  
 router.post("/add",  
  isloggedin,
 upload.single('listing[image]'),
    validateListing,
   
     listingControllers.addListing
  
  );
  

  // DISTROY ROUTE
  router.delete("/:id",
    isloggedin,
    isOwner,
    listingControllers.deleteListing
 );
  
 
  //EDIT ROUTE
  router.get("/:id/edit", 
    isloggedin,
    isOwner,
    listingControllers.editListing
   );
  
  // Update route 
  router.put("/:id",
    isOwner,  
     upload.single('listing[image]'),
    validateListing,
    listingControllers.upateListing
 );
  
  //SHOW ROUTE
  router.get("/:id", 
    listingControllers.showListing
  );
  
  
 
  
  // router.get("/", wrapAsync(async (req, res) => {
  //   res.send(" I am root");
  // }));
  
router.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
  });

  module.exports = router;
  