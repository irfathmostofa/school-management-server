const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/studentController");

router.post("/getstudentParenttoken", ctrl.getstudentParenttoken);
router.post("/studentParentLogin", ctrl.studentParentLogin);
router.post("/updatePassword", ctrl.updatePassword);
router.post("/getParentsChild", ctrl.getParentsChild);
router.post("/getStudentDashboardbyID", ctrl.getStudentDashboardbyID);
router.post("/getStudentPreviousSession", ctrl.getStudentPreviousSession);
router.post("/getHomeWorkList", ctrl.getHomeWorkList);
router.post("/getClassWorkList", ctrl.getClassWorkList);
router.post("/getClassTestList", ctrl.getClassTestList);
router.post("/getStudentAttendanceByID", ctrl.getStudentAttendanceByID);
router.post("/getSubjectList", ctrl.getSubjectList);
router.post("/getSchoolName", ctrl.getSchoolName);
router.post("/getStudentClasssRoutine", ctrl.getStudentClasssRoutine);
router.post("/getStudentDiary", ctrl.getStudentDiary);
router.post("/getStudentExtraClass", ctrl.getStudentExtraClass);
router.post("/getStudentLibraryItem", ctrl.getStudentLibraryItem);
router.post("/getStudentEventNews", ctrl.getStudentEventNews);
router.post("/getStudentAcademicCalendarNew", ctrl.getStudentAcademicCalendarNew);
router.post("/getStudentAcademicCalendar", ctrl.getStudentAcademicCalendar);
router.post("/getStudentIncomeById", ctrl.getStudentIncomeById);
router.post("/updateDeviceToken", ctrl.updateDeviceToken);
router.post("/getStudentAttendanceDevice", ctrl.getStudentAttendanceDevice);
router.get("/", ctrl.get);

module.exports = router;
