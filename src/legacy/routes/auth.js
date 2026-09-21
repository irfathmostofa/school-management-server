const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/authController");

router.post("/login", ctrl.login);
router.post("/adduser", ctrl.adduser);
router.post("/changePasswordById", ctrl.changePasswordById);
router.post("/deleteUser", ctrl.deleteUser);
router.post("/changePassword", ctrl.changePassword);
router.post("/getusertoken", ctrl.getusertoken);
router.post("/getAlluser", ctrl.getAlluser);
router.post("/getParentLoginInfo", ctrl.getParentLoginInfo);
router.post("/getAllParentLoginInfo", ctrl.getAllParentLoginInfo);
router.post("/updateStudentPass", ctrl.updateStudentPass);
router.post("/updateParentPass", ctrl.updateParentPass);
router.get("/AuthTest", ctrl.AuthTest);

module.exports = router;
