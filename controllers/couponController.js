const collections = require("../constants/collections");
const { createCollectionReader } = require("./collectionController");

const getAllCoupons = createCollectionReader({
  defaultCollection: collections.COUPONS
});

module.exports = {
  getAllCoupons
};
