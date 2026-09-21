const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/settingsController");

router.post("/changeActiveSession", ctrl.changeActiveSession);
router.post("/addBulkUser", ctrl.addBulkUser);
router.post("/updateNotifyStatus", ctrl.updateNotifyStatus);
router.post("/updateCallStatus", ctrl.updateCallStatus);
router.post("/addCampus", ctrl.addCampus);
router.post("/addschool", ctrl.addschool);
router.post("/getschool", ctrl.getschool);
router.post("/updateSchoolById", ctrl.updateSchoolById);
router.post("/DeleteSchoolById", ctrl.DeleteSchoolById);
router.post("/getCampus", ctrl.getCampus);
router.get("/settingTest", ctrl.settingTest);
router.post("/addRole", ctrl.addRole);
router.post("/getRole", ctrl.getRole);
router.post("/getroleByID", ctrl.getroleByID);
router.post("/addprivileges", ctrl.addprivileges);
router.post("/getprivileges", ctrl.getprivileges);
router.post("/getprivilegesByID", ctrl.getprivilegesByID);
router.post("/UpdatePrivilegeByRole", ctrl.UpdatePrivilegeByRole);
router.post("/UpdateCampusById", ctrl.UpdateCampusById);
router.post("/DeleteCampusById", ctrl.DeleteCampusById);
router.post("/getNotificationForStudent", ctrl.getNotificationForStudent);
router.post("/UpdateReadNotification", ctrl.UpdateReadNotification);

module.exports = router;
