import { Controller, Get, Post, Put, Delete, Patch, Req, Res } from "@nestjs/common";
import { AcademicService } from "./academic.service";

@Controller("server")
export class AcademicController {
  constructor(private readonly service: AcademicService) {}

  @Post('send-test-notification')
  async send_test_notification(@Req() req: any, @Res() res: any) {
    return this.service.send_test_notification(req, res);
  }

  @Post('addExamSchedule')
  async addExamSchedule(@Req() req: any, @Res() res: any) {
    return this.service.addExamSchedule(req, res);
  }

  @Post('getExamSchedule')
  getExamSchedule(@Req() req: any, @Res() res: any) {
    return this.service.getExamSchedule(req, res);
  }

  @Post('deleteExamSchedule')
  deleteExamSchedule(@Req() req: any, @Res() res: any) {
    return this.service.deleteExamSchedule(req, res);
  }

  @Post('addPeriods')
  addPeriods(@Req() req: any, @Res() res: any) {
    return this.service.addPeriods(req, res);
  }

  @Post('getPeriodsList')
  getPeriodsList(@Req() req: any, @Res() res: any) {
    return this.service.getPeriodsList(req, res);
  }

  @Post('getPeriods')
  getPeriods(@Req() req: any, @Res() res: any) {
    return this.service.getPeriods(req, res);
  }

  @Post('updatePeriods')
  updatePeriods(@Req() req: any, @Res() res: any) {
    return this.service.updatePeriods(req, res);
  }

  @Post('deletePeriods')
  deletePeriods(@Req() req: any, @Res() res: any) {
    return this.service.deletePeriods(req, res);
  }

  @Post('bulkUpsertRoutine')
  async bulkUpsertRoutine(@Req() req: any, @Res() res: any) {
    return this.service.bulkUpsertRoutine(req, res);
  }

  @Post('getRoutinesForTeacher')
  async getRoutinesForTeacher(@Req() req: any, @Res() res: any) {
    return this.service.getRoutinesForTeacher(req, res);
  }

  @Post('getRoutinesForView')
  getRoutinesForView(@Req() req: any, @Res() res: any) {
    return this.service.getRoutinesForView(req, res);
  }

  @Post('getRoutines')
  getRoutines(@Req() req: any, @Res() res: any) {
    return this.service.getRoutines(req, res);
  }

  @Post('addGroup')
  addGroup(@Req() req: any, @Res() res: any) {
    return this.service.addGroup(req, res);
  }

  @Post('getGroups')
  getGroups(@Req() req: any, @Res() res: any) {
    return this.service.getGroups(req, res);
  }

  @Post('getgroupByClassSection')
  getgroupByClassSection(@Req() req: any, @Res() res: any) {
    return this.service.getgroupByClassSection(req, res);
  }

  @Post('addGroupAssignStudents')
  addGroupAssignStudents(@Req() req: any, @Res() res: any) {
    return this.service.addGroupAssignStudents(req, res);
  }

  @Post('getGroupAssignStudents')
  getGroupAssignStudents(@Req() req: any, @Res() res: any) {
    return this.service.getGroupAssignStudents(req, res);
  }

  @Post('updateGroupAssignStudents')
  updateGroupAssignStudents(@Req() req: any, @Res() res: any) {
    return this.service.updateGroupAssignStudents(req, res);
  }

  @Post('deleteGroupAssignStudents')
  deleteGroupAssignStudents(@Req() req: any, @Res() res: any) {
    return this.service.deleteGroupAssignStudents(req, res);
  }

  @Post('addGroupComments')
  addGroupComments(@Req() req: any, @Res() res: any) {
    return this.service.addGroupComments(req, res);
  }

  @Post('getGroupComments')
  getGroupComments(@Req() req: any, @Res() res: any) {
    return this.service.getGroupComments(req, res);
  }

  @Post('addSection')
  addSection(@Req() req: any, @Res() res: any) {
    return this.service.addSection(req, res);
  }

  @Post('updateSection')
  updateSection(@Req() req: any, @Res() res: any) {
    return this.service.updateSection(req, res);
  }

  @Post('deleteSubstituteTeacher')
  deleteSubstituteTeacher(@Req() req: any, @Res() res: any) {
    return this.service.deleteSubstituteTeacher(req, res);
  }

  @Post('UpdateStatusSubstituteTeacher')
  UpdateStatusSubstituteTeacher(@Req() req: any, @Res() res: any) {
    return this.service.UpdateStatusSubstituteTeacher(req, res);
  }

  @Post('addSubstituteTeacher')
  addSubstituteTeacher(@Req() req: any, @Res() res: any) {
    return this.service.addSubstituteTeacher(req, res);
  }

  @Post('getSubstituteTeacherData')
  getSubstituteTeacherData(@Req() req: any, @Res() res: any) {
    return this.service.getSubstituteTeacherData(req, res);
  }

  @Post('addSubject')
  addSubject(@Req() req: any, @Res() res: any) {
    return this.service.addSubject(req, res);
  }

  @Post('updateSubject')
  updateSubject(@Req() req: any, @Res() res: any) {
    return this.service.updateSubject(req, res);
  }

  @Post('updateReportStatus')
  updateReportStatus(@Req() req: any, @Res() res: any) {
    return this.service.updateReportStatus(req, res);
  }

  @Post('getSection')
  getSection(@Req() req: any, @Res() res: any) {
    return this.service.getSection(req, res);
  }

  @Post('deleteSection')
  deleteSection(@Req() req: any, @Res() res: any) {
    return this.service.deleteSection(req, res);
  }

  @Post('getSubject')
  getSubject(@Req() req: any, @Res() res: any) {
    return this.service.getSubject(req, res);
  }

  @Post('deleteSubject')
  deleteSubject(@Req() req: any, @Res() res: any) {
    return this.service.deleteSubject(req, res);
  }

  @Post('getSectionApprovel')
  getSectionApprovel(@Req() req: any, @Res() res: any) {
    return this.service.getSectionApprovel(req, res);
  }

  @Post('getSubjectApprovel')
  getSubjectApprovel(@Req() req: any, @Res() res: any) {
    return this.service.getSubjectApprovel(req, res);
  }

  @Post('UpdateSectionApprovel')
  UpdateSectionApprovel(@Req() req: any, @Res() res: any) {
    return this.service.UpdateSectionApprovel(req, res);
  }

  @Post('UpdateSubjectApprovel')
  UpdateSubjectApprovel(@Req() req: any, @Res() res: any) {
    return this.service.UpdateSubjectApprovel(req, res);
  }

  @Post('addClass')
  addClass(@Req() req: any, @Res() res: any) {
    return this.service.addClass(req, res);
  }

  @Post('getClass')
  getClass(@Req() req: any, @Res() res: any) {
    return this.service.getClass(req, res);
  }

  @Post('getStudentByID')
  getStudentByID(@Req() req: any, @Res() res: any) {
    return this.service.getStudentByID(req, res);
  }

  @Post('getStudentByClassSectionWithCampus')
  getStudentByClassSectionWithCampus(@Req() req: any, @Res() res: any) {
    return this.service.getStudentByClassSectionWithCampus(req, res);
  }

  @Post('getStudentByClassSection')
  getStudentByClassSection(@Req() req: any, @Res() res: any) {
    return this.service.getStudentByClassSection(req, res);
  }

  @Post('getClassApprovel')
  getClassApprovel(@Req() req: any, @Res() res: any) {
    return this.service.getClassApprovel(req, res);
  }

  @Post('UpdateClassApprovel')
  UpdateClassApprovel(@Req() req: any, @Res() res: any) {
    return this.service.UpdateClassApprovel(req, res);
  }

  @Post('addSession')
  addSession(@Req() req: any, @Res() res: any) {
    return this.service.addSession(req, res);
  }

  @Post('getSession')
  getSession(@Req() req: any, @Res() res: any) {
    return this.service.getSession(req, res);
  }

  @Post('getSessionActive')
  getSessionActive(@Req() req: any, @Res() res: any) {
    return this.service.getSessionActive(req, res);
  }

  @Post('getAttendanceForClass')
  getAttendanceForClass(@Req() req: any, @Res() res: any) {
    return this.service.getAttendanceForClass(req, res);
  }

  @Post('getAttendanceForClassbyMonth')
  getAttendanceForClassbyMonth(@Req() req: any, @Res() res: any) {
    return this.service.getAttendanceForClassbyMonth(req, res);
  }

  @Post('getTotalAttendanceForClassSection')
  getTotalAttendanceForClassSection(@Req() req: any, @Res() res: any) {
    return this.service.getTotalAttendanceForClassSection(req, res);
  }

  @Post('deleteStudentAttendence')
  deleteStudentAttendence(@Req() req: any, @Res() res: any) {
    return this.service.deleteStudentAttendence(req, res);
  }

  @Post('getstudentattendence')
  getstudentattendence(@Req() req: any, @Res() res: any) {
    return this.service.getstudentattendence(req, res);
  }

  @Post('getTermReport')
  getTermReport(@Req() req: any, @Res() res: any) {
    return this.service.getTermReport(req, res);
  }

  @Post('addStudentClassPerformance')
  addStudentClassPerformance(@Req() req: any, @Res() res: any) {
    return this.service.addStudentClassPerformance(req, res);
  }

  @Post('getStudentClassPerformance')
  getStudentClassPerformance(@Req() req: any, @Res() res: any) {
    return this.service.getStudentClassPerformance(req, res);
  }

  @Post('deleteStudentAttendance')
  deleteStudentAttendance(@Req() req: any, @Res() res: any) {
    return this.service.deleteStudentAttendance(req, res);
  }

  @Post('addStudentAttendance')
  addStudentAttendance(@Req() req: any, @Res() res: any) {
    return this.service.addStudentAttendance(req, res);
  }

  @Post('addStudentHomeworkRecords')
  addStudentHomeworkRecords(@Req() req: any, @Res() res: any) {
    return this.service.addStudentHomeworkRecords(req, res);
  }

  @Post('addStudentClassworkRecords')
  addStudentClassworkRecords(@Req() req: any, @Res() res: any) {
    return this.service.addStudentClassworkRecords(req, res);
  }

  @Post('addStudentPerformance')
  addStudentPerformance(@Req() req: any, @Res() res: any) {
    return this.service.addStudentPerformance(req, res);
  }

  @Post('getStudentPerformance')
  getStudentPerformance(@Req() req: any, @Res() res: any) {
    return this.service.getStudentPerformance(req, res);
  }

  @Post('addStudentClassTestRecords')
  addStudentClassTestRecords(@Req() req: any, @Res() res: any) {
    return this.service.addStudentClassTestRecords(req, res);
  }

  @Post('getStudentClassTestRecords')
  getStudentClassTestRecords(@Req() req: any, @Res() res: any) {
    return this.service.getStudentClassTestRecords(req, res);
  }

  @Post('getStudentClassWorkRecords')
  getStudentClassWorkRecords(@Req() req: any, @Res() res: any) {
    return this.service.getStudentClassWorkRecords(req, res);
  }

  @Post('getStudentHomeWorkRecords')
  getStudentHomeWorkRecords(@Req() req: any, @Res() res: any) {
    return this.service.getStudentHomeWorkRecords(req, res);
  }

  @Post('DeleteAllWorks')
  async DeleteAllWorks(@Req() req: any, @Res() res: any) {
    return this.service.DeleteAllWorks(req, res);
  }

  @Post('addTermReportParameter')
  addTermReportParameter(@Req() req: any, @Res() res: any) {
    return this.service.addTermReportParameter(req, res);
  }

  @Post('getTermReportParameter')
  getTermReportParameter(@Req() req: any, @Res() res: any) {
    return this.service.getTermReportParameter(req, res);
  }

  @Post('getTermReportParameterBySubject')
  getTermReportParameterBySubject(@Req() req: any, @Res() res: any) {
    return this.service.getTermReportParameterBySubject(req, res);
  }

  @Post('addStudentTermProjectRecords')
  addStudentTermProjectRecords(@Req() req: any, @Res() res: any) {
    return this.service.addStudentTermProjectRecords(req, res);
  }

  @Post('addStudentTermRecords')
  addStudentTermRecords(@Req() req: any, @Res() res: any) {
    return this.service.addStudentTermRecords(req, res);
  }

  @Post('getStudentTermReport')
  getStudentTermReport(@Req() req: any, @Res() res: any) {
    return this.service.getStudentTermReport(req, res);
  }

  @Post('addJrStudentTermRecords')
  addJrStudentTermRecords(@Req() req: any, @Res() res: any) {
    return this.service.addJrStudentTermRecords(req, res);
  }

  @Post('addStudentHomeWork')
  addStudentHomeWork(@Req() req: any, @Res() res: any) {
    return this.service.addStudentHomeWork(req, res);
  }

  @Post('updateStudentWork')
  async updateStudentWork(@Req() req: any, @Res() res: any) {
    return this.service.updateStudentWork(req, res);
  }

  @Post('addStudentClassWork')
  async addStudentClassWork(@Req() req: any, @Res() res: any) {
    return this.service.addStudentClassWork(req, res);
  }

  @Post('getStudentHomeWork')
  getStudentHomeWork(@Req() req: any, @Res() res: any) {
    return this.service.getStudentHomeWork(req, res);
  }

  @Post('getAllStudentTermProjectRecords')
  getAllStudentTermProjectRecords(@Req() req: any, @Res() res: any) {
    return this.service.getAllStudentTermProjectRecords(req, res);
  }

  @Post('getStudentClassWork')
  getStudentClassWork(@Req() req: any, @Res() res: any) {
    return this.service.getStudentClassWork(req, res);
  }

  @Post('ClassTestPublish')
  ClassTestPublish(@Req() req: any, @Res() res: any) {
    return this.service.ClassTestPublish(req, res);
  }

  @Post('getStudentClassTest')
  getStudentClassTest(@Req() req: any, @Res() res: any) {
    return this.service.getStudentClassTest(req, res);
  }

  @Post('getStudentClassTestUpdate')
  getStudentClassTestUpdate(@Req() req: any, @Res() res: any) {
    return this.service.getStudentClassTestUpdate(req, res);
  }

  @Post('getSingleStudentMonthlyReport')
  getSingleStudentMonthlyReport(@Req() req: any, @Res() res: any) {
    return this.service.getSingleStudentMonthlyReport(req, res);
  }

  @Post('getSingleStudentJrMonthlyReport')
  getSingleStudentJrMonthlyReport(@Req() req: any, @Res() res: any) {
    return this.service.getSingleStudentJrMonthlyReport(req, res);
  }

  @Post('getSingleStudentTermReport')
  getSingleStudentTermReport(@Req() req: any, @Res() res: any) {
    return this.service.getSingleStudentTermReport(req, res);
  }

  @Post('getSingleJrStudentTermReport')
  getSingleJrStudentTermReport(@Req() req: any, @Res() res: any) {
    return this.service.getSingleJrStudentTermReport(req, res);
  }

  @Post('getStudentTermMarks')
  getStudentTermMarks(@Req() req: any, @Res() res: any) {
    return this.service.getStudentTermMarks(req, res);
  }

  @Post('getJrStudentTermMarks')
  getJrStudentTermMarks(@Req() req: any, @Res() res: any) {
    return this.service.getJrStudentTermMarks(req, res);
  }

  @Post('addStudentClassTest')
  async addStudentClassTest(@Req() req: any, @Res() res: any) {
    return this.service.addStudentClassTest(req, res);
  }

  @Post('getAllClassTeacherAndCoOrdinator')
  getAllClassTeacherAndCoOrdinator(@Req() req: any, @Res() res: any) {
    return this.service.getAllClassTeacherAndCoOrdinator(req, res);
  }

  @Post('getClassTeacherAndCoOrdinator')
  getClassTeacherAndCoOrdinator(@Req() req: any, @Res() res: any) {
    return this.service.getClassTeacherAndCoOrdinator(req, res);
  }

  @Post('addClassTeacher')
  addClassTeacher(@Req() req: any, @Res() res: any) {
    return this.service.addClassTeacher(req, res);
  }

  @Post('addClassCoOrd')
  addClassCoOrd(@Req() req: any, @Res() res: any) {
    return this.service.addClassCoOrd(req, res);
  }

  @Post('getAllGradeMarks')
  getAllGradeMarks(@Req() req: any, @Res() res: any) {
    return this.service.getAllGradeMarks(req, res);
  }

  @Post('addGradeMarks')
  addGradeMarks(@Req() req: any, @Res() res: any) {
    return this.service.addGradeMarks(req, res);
  }

  @Post('getGradeMarksByClass')
  getGradeMarksByClass(@Req() req: any, @Res() res: any) {
    return this.service.getGradeMarksByClass(req, res);
  }

  @Post('DeleteGradeMarksById')
  DeleteGradeMarksById(@Req() req: any, @Res() res: any) {
    return this.service.DeleteGradeMarksById(req, res);
  }

  @Post('DeleteTermReportParameter')
  DeleteTermReportParameter(@Req() req: any, @Res() res: any) {
    return this.service.DeleteTermReportParameter(req, res);
  }

  @Post('getPreTermReportForm')
  getPreTermReportForm(@Req() req: any, @Res() res: any) {
    return this.service.getPreTermReportForm(req, res);
  }

  @Post('getSingleStudentPreTermReport')
  getSingleStudentPreTermReport(@Req() req: any, @Res() res: any) {
    return this.service.getSingleStudentPreTermReport(req, res);
  }

  @Post('addPreTermReportForm')
  addPreTermReportForm(@Req() req: any, @Res() res: any) {
    return this.service.addPreTermReportForm(req, res);
  }

  @Post('addPreTermReportResponse')
  addPreTermReportResponse(@Req() req: any, @Res() res: any) {
    return this.service.addPreTermReportResponse(req, res);
  }

  @Post('addJrSegmentForm')
  addJrSegmentForm(@Req() req: any, @Res() res: any) {
    return this.service.addJrSegmentForm(req, res);
  }

  @Post('getJrSegmentForm')
  getJrSegmentForm(@Req() req: any, @Res() res: any) {
    return this.service.getJrSegmentForm(req, res);
  }

  @Post('addJrResultResponse')
  addJrResultResponse(@Req() req: any, @Res() res: any) {
    return this.service.addJrResultResponse(req, res);
  }

  @Post('getPreviousJrResultResponse')
  getPreviousJrResultResponse(@Req() req: any, @Res() res: any) {
    return this.service.getPreviousJrResultResponse(req, res);
  }

  @Post('addClasssRoutine')
  addClasssRoutine(@Req() req: any, @Res() res: any) {
    return this.service.addClasssRoutine(req, res);
  }

  @Post('getClassRoutineByClassNSection')
  getClassRoutineByClassNSection(@Req() req: any, @Res() res: any) {
    return this.service.getClassRoutineByClassNSection(req, res);
  }

  @Post('getClasssRoutineByID')
  getClasssRoutineByID(@Req() req: any, @Res() res: any) {
    return this.service.getClasssRoutineByID(req, res);
  }

  @Post('addLessionPlan')
  addLessionPlan(@Req() req: any, @Res() res: any) {
    return this.service.addLessionPlan(req, res);
  }

  @Post('updateLessonApproval')
  updateLessonApproval(@Req() req: any, @Res() res: any) {
    return this.service.updateLessonApproval(req, res);
  }

  @Post('getLessionPlan')
  getLessionPlan(@Req() req: any, @Res() res: any) {
    return this.service.getLessionPlan(req, res);
  }

  @Post('deleteLessonPlanById')
  deleteLessonPlanById(@Req() req: any, @Res() res: any) {
    return this.service.deleteLessonPlanById(req, res);
  }

  @Post('adddepartmentmeetingPlan')
  adddepartmentmeetingPlan(@Req() req: any, @Res() res: any) {
    return this.service.adddepartmentmeetingPlan(req, res);
  }

  @Post('getdepartmentmeetingPlan')
  getdepartmentmeetingPlan(@Req() req: any, @Res() res: any) {
    return this.service.getdepartmentmeetingPlan(req, res);
  }

  @Post('updatedepartmentmeetingPlan')
  updatedepartmentmeetingPlan(@Req() req: any, @Res() res: any) {
    return this.service.updatedepartmentmeetingPlan(req, res);
  }

  @Post('promoteStudents')
  promoteStudents(@Req() req: any, @Res() res: any) {
    return this.service.promoteStudents(req, res);
  }

  @Post('getPromotedStudents')
  getPromotedStudents(@Req() req: any, @Res() res: any) {
    return this.service.getPromotedStudents(req, res);
  }

  @Post('addDiary')
  async addDiary(@Req() req: any, @Res() res: any) {
    return this.service.addDiary(req, res);
  }

  @Post('approveDiary')
  async approveDiary(@Req() req: any, @Res() res: any) {
    return this.service.approveDiary(req, res);
  }

  @Post('getDiary')
  getDiary(@Req() req: any, @Res() res: any) {
    return this.service.getDiary(req, res);
  }

  @Post('DeleteDiaryById')
  DeleteDiaryById(@Req() req: any, @Res() res: any) {
    return this.service.DeleteDiaryById(req, res);
  }

  @Post('addExtraClass')
  addExtraClass(@Req() req: any, @Res() res: any) {
    return this.service.addExtraClass(req, res);
  }

  @Post('getExtraClass')
  getExtraClass(@Req() req: any, @Res() res: any) {
    return this.service.getExtraClass(req, res);
  }

  @Post('postWeeklyDates')
  postWeeklyDates(@Req() req: any, @Res() res: any) {
    return this.service.postWeeklyDates(req, res);
  }

  @Post('getWeeklyDates')
  getWeeklyDates(@Req() req: any, @Res() res: any) {
    return this.service.getWeeklyDates(req, res);
  }

  @Post('deleteLessonPlansSubjectData')
  async deleteLessonPlansSubjectData(@Req() req: any, @Res() res: any) {
    return this.service.deleteLessonPlansSubjectData(req, res);
  }

  @Post('DeleteWeeklyDatesById')
  async DeleteWeeklyDatesById(@Req() req: any, @Res() res: any) {
    return this.service.DeleteWeeklyDatesById(req, res);
  }

  @Post('postLessonPlans')
  postLessonPlans(@Req() req: any, @Res() res: any) {
    return this.service.postLessonPlans(req, res);
  }

  @Post('updateLessonPlans')
  async updateLessonPlans(@Req() req: any, @Res() res: any) {
    return this.service.updateLessonPlans(req, res);
  }

  @Post('getWeeklyScheduleDataForUpdateId')
  getWeeklyScheduleDataForUpdateId(@Req() req: any, @Res() res: any) {
    return this.service.getWeeklyScheduleDataForUpdateId(req, res);
  }

  @Post('getWeeklyLessonPlanForCurrentDate')
  getWeeklyLessonPlanForCurrentDate(@Req() req: any, @Res() res: any) {
    return this.service.getWeeklyLessonPlanForCurrentDate(req, res);
  }

  @Post('getWeeklyScheduleById')
  getWeeklyScheduleById(@Req() req: any, @Res() res: any) {
    return this.service.getWeeklyScheduleById(req, res);
  }

  @Post('getWeeklySchedule')
  getWeeklySchedule(@Req() req: any, @Res() res: any) {
    return this.service.getWeeklySchedule(req, res);
  }

  @Post('resultPublish')
  resultPublish(@Req() req: any, @Res() res: any) {
    return this.service.resultPublish(req, res);
  }

  @Post('getResultPublishInfo')
  getResultPublishInfo(@Req() req: any, @Res() res: any) {
    return this.service.getResultPublishInfo(req, res);
  }

  @Post('UpdateResultPublish')
  async UpdateResultPublish(@Req() req: any, @Res() res: any) {
    return this.service.UpdateResultPublish(req, res);
  }

  @Post('UpdateMonthlyReportPublish')
  async UpdateMonthlyReportPublish(@Req() req: any, @Res() res: any) {
    return this.service.UpdateMonthlyReportPublish(req, res);
  }

  @Post('getMonthlyReport')
  getMonthlyReport(@Req() req: any, @Res() res: any) {
    return this.service.getMonthlyReport(req, res);
  }

  @Post('getMonthlyReportAll')
  getMonthlyReportAll(@Req() req: any, @Res() res: any) {
    return this.service.getMonthlyReportAll(req, res);
  }

  @Post('getDataForMonthlyDataSubmit')
  async getDataForMonthlyDataSubmit(@Req() req: any, @Res() res: any) {
    return this.service.getDataForMonthlyDataSubmit(req, res);
  }

  @Post('postMonthlyProgressReport')
  postMonthlyProgressReport(@Req() req: any, @Res() res: any) {
    return this.service.postMonthlyProgressReport(req, res);
  }

  @Post('getMonthlyProgressReport')
  getMonthlyProgressReport(@Req() req: any, @Res() res: any) {
    return this.service.getMonthlyProgressReport(req, res);
  }

  @Post('deleteMonthlyProgressReport')
  deleteMonthlyProgressReport(@Req() req: any, @Res() res: any) {
    return this.service.deleteMonthlyProgressReport(req, res);
  }

  @Get('AcademicTest')
  AcademicTest(@Req() req: any, @Res() res: any) {
    return this.service.AcademicTest(req, res);
  }
}
