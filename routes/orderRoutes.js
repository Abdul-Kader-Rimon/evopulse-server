const express = require("express");
const { getAllOrders } = require("../controllers/orderController");

const router = express.Router();

router.get("/", getAllOrders);

module.exports = router;
