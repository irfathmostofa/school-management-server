const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/managementController");

router.get("/", ctrl.get);

module.exports = router;
