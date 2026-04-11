const express = require("express");
const { getAllSellers } = require("../controllers/sellerController");

const router = express.Router();

router.get("/", getAllSellers);

module.exports = router;
