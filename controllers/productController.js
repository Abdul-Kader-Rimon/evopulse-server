const collections = require("../constants/collections");
const { createCollectionReader } = require("./collectionController");

const getAllProducts = createCollectionReader({
  defaultCollection: collections.PRODUCTS
});

module.exports = {
  getAllProducts
};
