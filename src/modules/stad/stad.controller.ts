import { Controller, Get, Post, Put, Delete, Patch, Req, Res } from "@nestjs/common";
import { StadService } from "./stad.service";

@Controller("server")
export class StadController {
  constructor(private readonly service: StadService) {}

  @Post('postHifzDailyProgress')
  postHifzDailyProgress(@Req() req: any, @Res() res: any) {
    return this.service.postHifzDailyProgress(req, res);
  }

  @Post('updateHifzDailyProgress')
  updateHifzDailyProgress(@Req() req: any, @Res() res: any) {
    return this.service.updateHifzDailyProgress(req, res);
  }

  @Post('getHifzDailyProgressByStudentId')
  getHifzDailyProgressByStudentId(@Req() req: any, @Res() res: any) {
    return this.service.getHifzDailyProgressByStudentId(req, res);
  }

  @Post('getHifzDailyProgressByStudentIdMonth')
  getHifzDailyProgressByStudentIdMonth(@Req() req: any, @Res() res: any) {
    return this.service.getHifzDailyProgressByStudentIdMonth(req, res);
  }

  @Post('getHifzDailyProgress')
  getHifzDailyProgress(@Req() req: any, @Res() res: any) {
    return this.service.getHifzDailyProgress(req, res);
  }

  @Post('getHifzDailyProgressInDate')
  getHifzDailyProgressInDate(@Req() req: any, @Res() res: any) {
    return this.service.getHifzDailyProgressInDate(req, res);
  }

  @Post('deleteHifzDailyProgress')
  deleteHifzDailyProgress(@Req() req: any, @Res() res: any) {
    return this.service.deleteHifzDailyProgress(req, res);
  }

  @Post('postHifzTermTargetSetup')
  postHifzTermTargetSetup(@Req() req: any, @Res() res: any) {
    return this.service.postHifzTermTargetSetup(req, res);
  }

  @Post('updateHifzTermTargetSetup')
  updateHifzTermTargetSetup(@Req() req: any, @Res() res: any) {
    return this.service.updateHifzTermTargetSetup(req, res);
  }

  @Post('getHifzTermTargetSetup')
  getHifzTermTargetSetup(@Req() req: any, @Res() res: any) {
    return this.service.getHifzTermTargetSetup(req, res);
  }

  @Post('getHifzTermTargetSetupMonth')
  getHifzTermTargetSetupMonth(@Req() req: any, @Res() res: any) {
    return this.service.getHifzTermTargetSetupMonth(req, res);
  }

  @Post('getHifzSprhalaka')
  getHifzSprhalaka(@Req() req: any, @Res() res: any) {
    return this.service.getHifzSprhalaka(req, res);
  }

  @Post('deleteHifzTermTargetSetup')
  deleteHifzTermTargetSetup(@Req() req: any, @Res() res: any) {
    return this.service.deleteHifzTermTargetSetup(req, res);
  }

  @Post('getHifzSprTargetByStudentId')
  getHifzSprTargetByStudentId(@Req() req: any, @Res() res: any) {
    return this.service.getHifzSprTargetByStudentId(req, res);
  }

  @Post('postIncidentReport')
  async postIncidentReport(@Req() req: any, @Res() res: any) {
    return this.service.postIncidentReport(req, res);
  }

  @Post('updateIncidentReport')
  async updateIncidentReport(@Req() req: any, @Res() res: any) {
    return this.service.updateIncidentReport(req, res);
  }

  @Post('getIncidentReport')
  getIncidentReport(@Req() req: any, @Res() res: any) {
    return this.service.getIncidentReport(req, res);
  }

  @Post('deleteIncidentReport')
  deleteIncidentReport(@Req() req: any, @Res() res: any) {
    return this.service.deleteIncidentReport(req, res);
  }

  @Post('postSoldForm')
  postSoldForm(@Req() req: any, @Res() res: any) {
    return this.service.postSoldForm(req, res);
  }

  @Post('getHifzSprHalakahStudents')
  getHifzSprHalakahStudents(@Req() req: any, @Res() res: any) {
    return this.service.getHifzSprHalakahStudents(req, res);
  }

  @Post('getSoldForm')
  getSoldForm(@Req() req: any, @Res() res: any) {
    return this.service.getSoldForm(req, res);
  }

  @Post('getSoldFormForDashboard')
  getSoldFormForDashboard(@Req() req: any, @Res() res: any) {
    return this.service.getSoldFormForDashboard(req, res);
  }

  @Post('getAdmissionForDashboard')
  getAdmissionForDashboard(@Req() req: any, @Res() res: any) {
    return this.service.getAdmissionForDashboard(req, res);
  }

  @Post('deleteSoldForm')
  deleteSoldForm(@Req() req: any, @Res() res: any) {
    return this.service.deleteSoldForm(req, res);
  }

  @Post('admission')
  admission(@Req() req: any, @Res() res: any) {
    return this.service.admission(req, res);
  }

  @Post('getadmissioninfo')
  getadmissioninfo(@Req() req: any, @Res() res: any) {
    return this.service.getadmissioninfo(req, res);
  }

  @Post('getAllSiblingData')
  getAllSiblingData(@Req() req: any, @Res() res: any) {
    return this.service.getAllSiblingData(req, res);
  }

  getSiblingData(@Req() req: any, @Res() res: any) {
    return this.service.getSiblingData(req, res);
  }

  @Post('fetchApplicants')
  fetchApplicants(@Req() req: any, @Res() res: any) {
    return this.service.fetchApplicants(req, res);
  }

  @Post('fetchApplicantsAlldata')
  fetchApplicantsAlldata(@Req() req: any, @Res() res: any) {
    return this.service.fetchApplicantsAlldata(req, res);
  }

  @Post('fetchApplicantsAdmissionTest')
  fetchApplicantsAdmissionTest(@Req() req: any, @Res() res: any) {
    return this.service.fetchApplicantsAdmissionTest(req, res);
  }

  @Post('fetchApplicantsAdmitCard')
  fetchApplicantsAdmitCard(@Req() req: any, @Res() res: any) {
    return this.service.fetchApplicantsAdmitCard(req, res);
  }

  @Post('generateAdmissionAdmitCard')
  generateAdmissionAdmitCard(@Req() req: any, @Res() res: any) {
    return this.service.generateAdmissionAdmitCard(req, res);
  }

  @Post('fetchApplicantsbyID')
  fetchApplicantsbyID(@Req() req: any, @Res() res: any) {
    return this.service.fetchApplicantsbyID(req, res);
  }

  @Post('deleteApplicantById')
  deleteApplicantById(@Req() req: any, @Res() res: any) {
    return this.service.deleteApplicantById(req, res);
  }

  @Post('fetchApplicantsbyFormNo')
  fetchApplicantsbyFormNo(@Req() req: any, @Res() res: any) {
    return this.service.fetchApplicantsbyFormNo(req, res);
  }

  @Post('fetchAllAdmittedStudents')
  fetchAllAdmittedStudents(@Req() req: any, @Res() res: any) {
    return this.service.fetchAllAdmittedStudents(req, res);
  }

  @Post('fetchAdmittedStudentsForFeesForward')
  fetchAdmittedStudentsForFeesForward(@Req() req: any, @Res() res: any) {
    return this.service.fetchAdmittedStudentsForFeesForward(req, res);
  }

  @Post('fetchAdmittedStudents')
  fetchAdmittedStudents(@Req() req: any, @Res() res: any) {
    return this.service.fetchAdmittedStudents(req, res);
  }

  @Post('fetchNotEnrolledStudents')
  fetchNotEnrolledStudents(@Req() req: any, @Res() res: any) {
    return this.service.fetchNotEnrolledStudents(req, res);
  }

  @Post('fetchEligibleStudents')
  fetchEligibleStudents(@Req() req: any, @Res() res: any) {
    return this.service.fetchEligibleStudents(req, res);
  }

  @Post('getAdmittedlaststudent')
  getAdmittedlaststudent(@Req() req: any, @Res() res: any) {
    return this.service.getAdmittedlaststudent(req, res);
  }

  @Post('getSiblingData')
  post_getSiblingData(@Req() req: any, @Res() res: any) {
    return this.service.post_getSiblingData(req, res);
  }

  @Post('addstudent')
  addstudent(@Req() req: any, @Res() res: any) {
    return this.service.addstudent(req, res);
  }

  @Post('addBulkStudent')
  async addBulkStudent(@Req() req: any, @Res() res: any) {
    return this.service.addBulkStudent(req, res);
  }

  @Post('UpdateStudentAid')
  UpdateStudentAid(@Req() req: any, @Res() res: any) {
    return this.service.UpdateStudentAid(req, res);
  }

  @Post('admissionformsubmit')
  async admissionformsubmit(@Req() req: any, @Res() res: any) {
    return this.service.admissionformsubmit(req, res);
  }

  @Post('admissionformUpdate')
  admissionformUpdate(@Req() req: any, @Res() res: any) {
    return this.service.admissionformUpdate(req, res);
  }

  @Post('updateAdmissionPrincipalApprove')
  updateAdmissionPrincipalApprove(@Req() req: any, @Res() res: any) {
    return this.service.updateAdmissionPrincipalApprove(req, res);
  }

  @Post('updateadmissionform')
  updateadmissionform(@Req() req: any, @Res() res: any) {
    return this.service.updateadmissionform(req, res);
  }

  @Post('admissiontestresult')
  admissiontestresult(@Req() req: any, @Res() res: any) {
    return this.service.admissiontestresult(req, res);
  }

  @Post('getAdmissionTestResult')
  getAdmissionTestResult(@Req() req: any, @Res() res: any) {
    return this.service.getAdmissionTestResult(req, res);
  }

  @Post('getAdmissionTestResultEligible')
  getAdmissionTestResultEligible(@Req() req: any, @Res() res: any) {
    return this.service.getAdmissionTestResultEligible(req, res);
  }

  @Post('getAdmissionTestResultByid')
  getAdmissionTestResultByid(@Req() req: any, @Res() res: any) {
    return this.service.getAdmissionTestResultByid(req, res);
  }

  @Post('deleteAdmissionTestResultByid')
  deleteAdmissionTestResultByid(@Req() req: any, @Res() res: any) {
    return this.service.deleteAdmissionTestResultByid(req, res);
  }

  @Post('getApplientViewByid')
  getApplientViewByid(@Req() req: any, @Res() res: any) {
    return this.service.getApplientViewByid(req, res);
  }

  @Post('addHouse')
  addHouse(@Req() req: any, @Res() res: any) {
    return this.service.addHouse(req, res);
  }

  @Post('getHouse')
  getHouse(@Req() req: any, @Res() res: any) {
    return this.service.getHouse(req, res);
  }

  @Post('getApprovedHouse')
  getApprovedHouse(@Req() req: any, @Res() res: any) {
    return this.service.getApprovedHouse(req, res);
  }

  @Post('getHouseforapprovel')
  getHouseforapprovel(@Req() req: any, @Res() res: any) {
    return this.service.getHouseforapprovel(req, res);
  }

  @Post('getHouseById')
  getHouseById(@Req() req: any, @Res() res: any) {
    return this.service.getHouseById(req, res);
  }

  @Post('UpdateHouseById')
  UpdateHouseById(@Req() req: any, @Res() res: any) {
    return this.service.UpdateHouseById(req, res);
  }

  @Post('approveHouseById')
  approveHouseById(@Req() req: any, @Res() res: any) {
    return this.service.approveHouseById(req, res);
  }

  @Post('addCategory')
  addCategory(@Req() req: any, @Res() res: any) {
    return this.service.addCategory(req, res);
  }

  @Post('getCategory')
  getCategory(@Req() req: any, @Res() res: any) {
    return this.service.getCategory(req, res);
  }

  @Post('getCategoryforprincipal')
  getCategoryforprincipal(@Req() req: any, @Res() res: any) {
    return this.service.getCategoryforprincipal(req, res);
  }

  @Post('getCategoryById')
  getCategoryById(@Req() req: any, @Res() res: any) {
    return this.service.getCategoryById(req, res);
  }

  @Post('UpdateCategoryById')
  UpdateCategoryById(@Req() req: any, @Res() res: any) {
    return this.service.UpdateCategoryById(req, res);
  }

  @Post('CategoryApprove')
  CategoryApprove(@Req() req: any, @Res() res: any) {
    return this.service.CategoryApprove(req, res);
  }

  @Post('getEligiblestudent')
  getEligiblestudent(@Req() req: any, @Res() res: any) {
    return this.service.getEligiblestudent(req, res);
  }

  @Post('getPendingStudent')
  getPendingStudent(@Req() req: any, @Res() res: any) {
    return this.service.getPendingStudent(req, res);
  }

  @Post('addHalaqa')
  addHalaqa(@Req() req: any, @Res() res: any) {
    return this.service.addHalaqa(req, res);
  }

  @Post('deleteHifzSpr')
  deleteHifzSpr(@Req() req: any, @Res() res: any) {
    return this.service.deleteHifzSpr(req, res);
  }

  @Post('updateHifzSpr')
  updateHifzSpr(@Req() req: any, @Res() res: any) {
    return this.service.updateHifzSpr(req, res);
  }

  @Post('getHifzSpr')
  getHifzSpr(@Req() req: any, @Res() res: any) {
    return this.service.getHifzSpr(req, res);
  }

  @Post('HifzSprApprove')
  HifzSprApprove(@Req() req: any, @Res() res: any) {
    return this.service.HifzSprApprove(req, res);
  }

  @Post('addHifzSprStudent')
  addHifzSprStudent(@Req() req: any, @Res() res: any) {
    return this.service.addHifzSprStudent(req, res);
  }

  @Post('transferHalakahStudents')
  transferHalakahStudents(@Req() req: any, @Res() res: any) {
    return this.service.transferHalakahStudents(req, res);
  }

  @Post('getHifzSPRStudent')
  getHifzSPRStudent(@Req() req: any, @Res() res: any) {
    return this.service.getHifzSPRStudent(req, res);
  }

  @Post('HifzSprStudentApprove')
  HifzSprStudentApprove(@Req() req: any, @Res() res: any) {
    return this.service.HifzSprStudentApprove(req, res);
  }

  @Post('HifzSprStudentStatus')
  HifzSprStudentStatus(@Req() req: any, @Res() res: any) {
    return this.service.HifzSprStudentStatus(req, res);
  }

  @Post('addHifzStudent')
  addHifzStudent(@Req() req: any, @Res() res: any) {
    return this.service.addHifzStudent(req, res);
  }

  @Post('deleteStudentClub')
  deleteStudentClub(@Req() req: any, @Res() res: any) {
    return this.service.deleteStudentClub(req, res);
  }

  @Post('getStudentHifz')
  getStudentHifz(@Req() req: any, @Res() res: any) {
    return this.service.getStudentHifz(req, res);
  }

  @Post('deleteHifzStudent')
  deleteHifzStudent(@Req() req: any, @Res() res: any) {
    return this.service.deleteHifzStudent(req, res);
  }

  @Post('getStudentHifzApprovel')
  getStudentHifzApprovel(@Req() req: any, @Res() res: any) {
    return this.service.getStudentHifzApprovel(req, res);
  }

  @Post('StudentHifzApprove')
  StudentHifzApprove(@Req() req: any, @Res() res: any) {
    return this.service.StudentHifzApprove(req, res);
  }

  @Post('getStudentViewByid')
  getStudentViewByid(@Req() req: any, @Res() res: any) {
    return this.service.getStudentViewByid(req, res);
  }

  @Post('getStudentViewByidAdmincard')
  getStudentViewByidAdmincard(@Req() req: any, @Res() res: any) {
    return this.service.getStudentViewByidAdmincard(req, res);
  }

  @Post('getStudentForPrincipalAprrovel')
  getStudentForPrincipalAprrovel(@Req() req: any, @Res() res: any) {
    return this.service.getStudentForPrincipalAprrovel(req, res);
  }

  @Post('ApprovePrincipalApproveStudent')
  ApprovePrincipalApproveStudent(@Req() req: any, @Res() res: any) {
    return this.service.ApprovePrincipalApproveStudent(req, res);
  }

  @Post('getStudentIDCardViewByid')
  getStudentIDCardViewByid(@Req() req: any, @Res() res: any) {
    return this.service.getStudentIDCardViewByid(req, res);
  }

  @Post('getEligibleStudentIDCardViewByid')
  getEligibleStudentIDCardViewByid(@Req() req: any, @Res() res: any) {
    return this.service.getEligibleStudentIDCardViewByid(req, res);
  }

  @Post('getEligibleStudentViewByid')
  getEligibleStudentViewByid(@Req() req: any, @Res() res: any) {
    return this.service.getEligibleStudentViewByid(req, res);
  }

  @Post('getAllEligibleStudent')
  getAllEligibleStudent(@Req() req: any, @Res() res: any) {
    return this.service.getAllEligibleStudent(req, res);
  }

  @Post('addClub')
  addClub(@Req() req: any, @Res() res: any) {
    return this.service.addClub(req, res);
  }

  @Post('getClub')
  getClub(@Req() req: any, @Res() res: any) {
    return this.service.getClub(req, res);
  }

  @Post('getClubApprovel')
  getClubApprovel(@Req() req: any, @Res() res: any) {
    return this.service.getClubApprovel(req, res);
  }

  @Post('approveClubById')
  approveClubById(@Req() req: any, @Res() res: any) {
    return this.service.approveClubById(req, res);
  }

  @Post('addStudentClub')
  addStudentClub(@Req() req: any, @Res() res: any) {
    return this.service.addStudentClub(req, res);
  }

  @Post('getStudentClub')
  getStudentClub(@Req() req: any, @Res() res: any) {
    return this.service.getStudentClub(req, res);
  }

  @Post('fetchStudentByid')
  fetchStudentByid(@Req() req: any, @Res() res: any) {
    return this.service.fetchStudentByid(req, res);
  }

  @Post('fetchStudentBySTid')
  fetchStudentBySTid(@Req() req: any, @Res() res: any) {
    return this.service.fetchStudentBySTid(req, res);
  }

  @Post('deleteAdmitCard')
  deleteAdmitCard(@Req() req: any, @Res() res: any) {
    return this.service.deleteAdmitCard(req, res);
  }

  @Post('addEligibleStudentForExam')
  addEligibleStudentForExam(@Req() req: any, @Res() res: any) {
    return this.service.addEligibleStudentForExam(req, res);
  }

  @Post('addtmpPass')
  addtmpPass(@Req() req: any, @Res() res: any) {
    return this.service.addtmpPass(req, res);
  }

  @Post('gettmpPassdata')
  gettmpPassdata(@Req() req: any, @Res() res: any) {
    return this.service.gettmpPassdata(req, res);
  }

  @Post('gettmpPassdataforApprovel')
  gettmpPassdataforApprovel(@Req() req: any, @Res() res: any) {
    return this.service.gettmpPassdataforApprovel(req, res);
  }

  @Post('UpdatetmpPassdataApprovel')
  UpdatetmpPassdataApprovel(@Req() req: any, @Res() res: any) {
    return this.service.UpdatetmpPassdataApprovel(req, res);
  }

  @Post('gettmpPassByID')
  gettmpPassByID(@Req() req: any, @Res() res: any) {
    return this.service.gettmpPassByID(req, res);
  }

  @Post('AddTC')
  AddTC(@Req() req: any, @Res() res: any) {
    return this.service.AddTC(req, res);
  }

  @Post('getTC')
  getTC(@Req() req: any, @Res() res: any) {
    return this.service.getTC(req, res);
  }

  @Post('getTCById')
  getTCById(@Req() req: any, @Res() res: any) {
    return this.service.getTCById(req, res);
  }

  @Post('TCprincipalApprove')
  TCprincipalApprove(@Req() req: any, @Res() res: any) {
    return this.service.TCprincipalApprove(req, res);
  }

  @Post('TCreturnStudent')
  TCreturnStudent(@Req() req: any, @Res() res: any) {
    return this.service.TCreturnStudent(req, res);
  }

  @Post('getAlumni')
  getAlumni(@Req() req: any, @Res() res: any) {
    return this.service.getAlumni(req, res);
  }

  @Get('stadTest')
  stadTest(@Req() req: any, @Res() res: any) {
    return this.service.stadTest(req, res);
  }
}
