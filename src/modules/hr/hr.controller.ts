import { Controller, Post, Req, Res } from "@nestjs/common";
import { HrService } from "./hr.service";

@Controller("server/hr")
export class HrController {
  constructor(private readonly service: HrService) {}

  @Post('addRecruitmentRequest')
  addRecruitmentRequest(@Req() req: any, @Res() res: any) {
    return this.service.addRecruitmentRequest(req, res);
  }

  @Post('changeRecruitmentRequestStatus')
  changeRecruitmentRequestStatus(@Req() req: any, @Res() res: any) {
    return this.service.changeRecruitmentRequestStatus(req, res);
  }

  @Post('changeEvolutionQA')
  changeEvolutionQA(@Req() req: any, @Res() res: any) {
    return this.service.changeEvolutionQA(req, res);
  }

  @Post('changeTeacherInterviewData')
  changeTeacherInterviewData(@Req() req: any, @Res() res: any) {
    return this.service.changeTeacherInterviewData(req, res);
  }

  @Post('addRecruitmentApplicant')
  addRecruitmentApplicant(@Req() req: any, @Res() res: any) {
    return this.service.addRecruitmentApplicant(req, res);
  }

  @Post('changeRecruitmentApplicantStatus')
  changeRecruitmentApplicantStatus(@Req() req: any, @Res() res: any) {
    return this.service.changeRecruitmentApplicantStatus(req, res);
  }

  @Post('changeRecruitmentApplicantEvolutor')
  changeRecruitmentApplicantEvolutor(@Req() req: any, @Res() res: any) {
    return this.service.changeRecruitmentApplicantEvolutor(req, res);
  }

  @Post('changeRecruitmentApplicantFeedback')
  changeRecruitmentApplicantFeedback(@Req() req: any, @Res() res: any) {
    return this.service.changeRecruitmentApplicantFeedback(req, res);
  }

  @Post('getAllRecruitmentRequest')
  getAllRecruitmentRequest(@Req() req: any, @Res() res: any) {
    return this.service.getAllRecruitmentRequest(req, res);
  }

  @Post('getAllEvolutorData')
  getAllEvolutorData(@Req() req: any, @Res() res: any) {
    return this.service.getAllEvolutorData(req, res);
  }

  @Post('getAllRecruitmentApplicantList')
  getAllRecruitmentApplicantList(@Req() req: any, @Res() res: any) {
    return this.service.getAllRecruitmentApplicantList(req, res);
  }

  @Post('getAllRecruitmentApplicantListByID')
  getAllRecruitmentApplicantListByID(@Req() req: any, @Res() res: any) {
    return this.service.getAllRecruitmentApplicantListByID(req, res);
  }

  @Post('createLeaveRequest')
  createLeaveRequest(@Req() req: any, @Res() res: any) {
    return this.service.createLeaveRequest(req, res);
  }

  @Post('changeLeaveCheckIn')
  changeLeaveCheckIn(@Req() req: any, @Res() res: any) {
    return this.service.changeLeaveCheckIn(req, res);
  }

  @Post('getApprovingAuthority')
  async getApprovingAuthority(@Req() req: any, @Res() res: any) {
    return this.service.getApprovingAuthority(req, res);
  }

  @Post('changeLeaveApplicationStatus')
  changeLeaveApplicationStatus(@Req() req: any, @Res() res: any) {
    return this.service.changeLeaveApplicationStatus(req, res);
  }

  @Post('changeResignationApplicationStatus')
  changeResignationApplicationStatus(@Req() req: any, @Res() res: any) {
    return this.service.changeResignationApplicationStatus(req, res);
  }

  @Post('getAllLeaveRequest')
  getAllLeaveRequest(@Req() req: any, @Res() res: any) {
    return this.service.getAllLeaveRequest(req, res);
  }

  @Post('getAllResignRequest')
  getAllResignRequest(@Req() req: any, @Res() res: any) {
    return this.service.getAllResignRequest(req, res);
  }

  @Post('getLeaveRequestByID')
  getLeaveRequestByID(@Req() req: any, @Res() res: any) {
    return this.service.getLeaveRequestByID(req, res);
  }

  @Post('getRegisnationApprovingAuthority')
  async getRegisnationApprovingAuthority(@Req() req: any, @Res() res: any) {
    return this.service.getRegisnationApprovingAuthority(req, res);
  }

  @Post('createResignation')
  createResignation(@Req() req: any, @Res() res: any) {
    return this.service.createResignation(req, res);
  }

  @Post('getResignationById')
  getResignationById(@Req() req: any, @Res() res: any) {
    return this.service.getResignationById(req, res);
  }

  @Post('deleteResignation')
  deleteResignation(@Req() req: any, @Res() res: any) {
    return this.service.deleteResignation(req, res);
  }

  @Post('createClearanceForm')
  createClearanceForm(@Req() req: any, @Res() res: any) {
    return this.service.createClearanceForm(req, res);
  }

  @Post('getClearanceFormList')
  getClearanceFormList(@Req() req: any, @Res() res: any) {
    return this.service.getClearanceFormList(req, res);
  }

  @Post('updateClearanceForm')
  updateClearanceForm(@Req() req: any, @Res() res: any) {
    return this.service.updateClearanceForm(req, res);
  }

  @Post('uploadClearanceScanCopy')
  uploadClearanceScanCopy(@Req() req: any, @Res() res: any) {
    return this.service.uploadClearanceScanCopy(req, res);
  }

  @Post('getClearanceEmployee')
  getClearanceEmployee(@Req() req: any, @Res() res: any) {
    return this.service.getClearanceEmployee(req, res);
  }

  @Post('addCompensationBenefits')
  addCompensationBenefits(@Req() req: any, @Res() res: any) {
    return this.service.addCompensationBenefits(req, res);
  }

  @Post('getCompensationBenefitsList')
  getCompensationBenefitsList(@Req() req: any, @Res() res: any) {
    return this.service.getCompensationBenefitsList(req, res);
  }

  @Post('addOtherLeave')
  addOtherLeave(@Req() req: any, @Res() res: any) {
    return this.service.addOtherLeave(req, res);
  }

  @Post('getOtherLeave')
  getOtherLeave(@Req() req: any, @Res() res: any) {
    return this.service.getOtherLeave(req, res);
  }

  @Post('getOtherLeaveById')
  getOtherLeaveById(@Req() req: any, @Res() res: any) {
    return this.service.getOtherLeaveById(req, res);
  }

  @Post('EditOtherLeaveById')
  EditOtherLeaveById(@Req() req: any, @Res() res: any) {
    return this.service.EditOtherLeaveById(req, res);
  }

  @Post('DeleteOtherLeaveById')
  DeleteOtherLeaveById(@Req() req: any, @Res() res: any) {
    return this.service.DeleteOtherLeaveById(req, res);
  }

  @Post('UpdateOtherLeaveById')
  UpdateOtherLeaveById(@Req() req: any, @Res() res: any) {
    return this.service.UpdateOtherLeaveById(req, res);
  }

  @Post('ApprovelOtherLeaveById')
  ApprovelOtherLeaveById(@Req() req: any, @Res() res: any) {
    return this.service.ApprovelOtherLeaveById(req, res);
  }

  @Post('updateEmployee')
  updateEmployee(@Req() req: any, @Res() res: any) {
    return this.service.updateEmployee(req, res);
  }

  @Post('updateEmployeeAttendancePeriod')
  updateEmployeeAttendancePeriod(@Req() req: any, @Res() res: any) {
    return this.service.updateEmployeeAttendancePeriod(req, res);
  }

  @Post('editdepartment')
  editdepartment(@Req() req: any, @Res() res: any) {
    return this.service.editdepartment(req, res);
  }

  @Post('deleteDept')
  deleteDept(@Req() req: any, @Res() res: any) {
    return this.service.deleteDept(req, res);
  }

  @Post('editdesignation')
  editdesignation(@Req() req: any, @Res() res: any) {
    return this.service.editdesignation(req, res);
  }

  @Post('deleteDesg')
  deleteDesg(@Req() req: any, @Res() res: any) {
    return this.service.deleteDesg(req, res);
  }

  @Post('editEmployeeAttendancePeriod')
  editEmployeeAttendancePeriod(@Req() req: any, @Res() res: any) {
    return this.service.editEmployeeAttendancePeriod(req, res);
  }

  @Post('deleteEmployee')
  deleteEmployee(@Req() req: any, @Res() res: any) {
    return this.service.deleteEmployee(req, res);
  }

  @Post('addExitApplicationForm')
  addExitApplicationForm(@Req() req: any, @Res() res: any) {
    return this.service.addExitApplicationForm(req, res);
  }

  @Post('getExitApplicationForm')
  getExitApplicationForm(@Req() req: any, @Res() res: any) {
    return this.service.getExitApplicationForm(req, res);
  }

  @Post('getExitApplicationFormById')
  getExitApplicationFormById(@Req() req: any, @Res() res: any) {
    return this.service.getExitApplicationFormById(req, res);
  }

  @Post('getStudentViewByStId')
  getStudentViewByStId(@Req() req: any, @Res() res: any) {
    return this.service.getStudentViewByStId(req, res);
  }

  @Post('updateAmissionStudentImagesById')
  updateAmissionStudentImagesById(@Req() req: any, @Res() res: any) {
    return this.service.updateAmissionStudentImagesById(req, res);
  }

  @Post('updateStudentImagesById')
  updateStudentImagesById(@Req() req: any, @Res() res: any) {
    return this.service.updateStudentImagesById(req, res);
  }

  @Post('updateStudent')
  async updateStudent(@Req() req: any, @Res() res: any) {
    return this.service.updateStudent(req, res);
  }

  @Post('postAttendence')
  postAttendence(@Req() req: any, @Res() res: any) {
    return this.service.postAttendence(req, res);
  }
}
