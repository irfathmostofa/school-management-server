const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/dashboardController");

router.post("/getDashboardMonthlyFeesData", ctrl.getDashboardMonthlyFeesData);
router.post("/getDashboardLeaveRequest", ctrl.getDashboardLeaveRequest);
router.post("/getDashboardExpenseData", ctrl.getDashboardExpenseData);
router.post("/getDashboardUnPaidFeesData", ctrl.getDashboardUnPaidFeesData);
router.post("/getDashboardEventNews", ctrl.getDashboardEventNews);
router.post("/dashboardStat", ctrl.dashboardStat);
router.post("/dashboardStatForEmployee", ctrl.dashboardStatForEmployee);
router.post("/dashboardStatForStudents", ctrl.dashboardStatForStudents);
router.post("/sidebarBadgeCount", ctrl.sidebarBadgeCount);
router.post("/DailyAttendanceInfo", ctrl.DailyAttendanceInfo);
router.post("/DailyAttendanceForClassSection", ctrl.DailyAttendanceForClassSection);
router.post("/DailyLessonPlanForClassSection", ctrl.DailyLessonPlanForClassSection);
router.post("/DailyClassTestForClassSection", ctrl.DailyClassTestForClassSection);
router.post("/DailyHomeworkForClassSection", ctrl.DailyHomeworkForClassSection);
router.get("/dashboardTest", ctrl.dashboardTest);

module.exports = router;
