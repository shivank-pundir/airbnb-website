const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");

module.exports.index = async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index", { allListing });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

module.exports.addListing = wrapAsync(async (req, res, next) => {
  // let{title, description, image, price, location, country} = req.body;
  let url = req.file.path;
  let filename = req.file.filename;
  console.log(url, "..", filename);
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  await newListing.save();
  req.flash("success", "New Listing Created");
  res.redirect("/listing");
});

module.exports.listingSearch = wrapAsync(async (req, res) => {
  const { q } = req.query;
  const listings = await Listing.find({
    title: { $regex: q.trim(), $options: "i" }
  });

  if (listings.length === 1) {

    const listing = listings[0];
    res.render("listings/show", { listing });
  } else if (listings.length > 1) {
   
    res.redirect(`/listing/${listings[0]._id}`);
  } else {
    // No listings found
    req.flash("error", "No listings found matching your search");
    res.redirect("/listing");
  }
});

module.exports.addHader = wrapAsync(async (req, res) => {
  try {
   
    const { category } = req.params;


  const listings = await Listing.find({ place: category });
    res.render("listings/haderIcon/tranding", {  listings, category  });
  } catch (e) {
    console.error(e);
    res.status(500).send("Server Error");
  }
});


module.exports.deleteListing = wrapAsync(async (req, res) => {
  let { id } = req.params;
  const deleListing = await Listing.findByIdAndDelete(id);
  console.log(deleListing);
  req.flash("success", "Listing  Deleted");

  res.redirect("/listing");
});

module.exports.editListing = wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
if(!listing){
  req.flash("error","Listing you requested for does't exist!");
}
let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300/w_250")
  res.render("listings/edit", { listing, originalImageUrl });
});

module.exports.upateListing = wrapAsync(async (req, res) => {
  let { id } = req.params;
  let updatedData = { ...req.body.listing };

  // if (req.body.listing.image) {
  //   updatedData.image = {
  //     url: req.body.listing.image,
  //   };
  // }

  let listing = await Listing.findByIdAndUpdate(id, updatedData);
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated");
  res.redirect(`/listing/${id}`);
});

module.exports.showListing = wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author", // fixed the space here
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listing");
  }

  console.log(listing);

  res.render("listings/show.ejs", { listing });
});
