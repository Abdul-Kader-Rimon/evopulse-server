const collections = require("../constants/collections");
const { createCollectionReader } = require("./collectionController");

const getAllOrders = createCollectionReader({
  defaultCollection: collections.ORDERS
});

module.exports = {
  getAllOrders
};
