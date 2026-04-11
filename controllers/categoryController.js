const collections = require("../constants/collections");
const { createCollectionReader } = require("./collectionController");

const getAllCategories = createCollectionReader({
  defaultCollection: collections.CATEGORIES
});

module.exports = {
  getAllCategories
};
