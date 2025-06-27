const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);
    await newReview.save();

    listing.reviews.push(newReview._id);
    await listing.save();

    console.log("Review is saved");
    req.flash("success", "New Review Created");

    res.redirect(`/listing/${listing._id}`);
  
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    
    // remove review reference from listing
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // delete review itself
    await Review.findByIdAndDelete(reviewId);

    console.log("Review is deelted");
    req.flash("success", "Review Deleted");

    res.redirect(`/listing/${id}`);
}