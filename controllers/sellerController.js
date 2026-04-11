const collections = require("../constants/collections");
const { createCollectionReader } = require("./collectionController");

const getAllSellers = createCollectionReader({
  defaultCollection: collections.SELLERS
});

module.exports = {
  getAllSellers
};
