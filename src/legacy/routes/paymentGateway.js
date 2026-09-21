const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/paymentGatewayController");

router.post("/initiatePayment", ctrl.initiatePayment);
router.post("/callback", ctrl.callback);
router.get("/", ctrl.get);

module.exports = router;
