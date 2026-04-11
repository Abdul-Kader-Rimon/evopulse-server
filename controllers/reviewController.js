const collections = require("../constants/collections");
const { createCollectionReader } = require("./collectionController");

const getAllReviews = createCollectionReader({
  defaultCollection: collections.REVIEWS
});

module.exports = {
  getAllReviews
};
