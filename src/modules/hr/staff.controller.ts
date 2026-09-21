import { Controller, Get, Post, Req, Res } from "@nestjs/common";
import { StaffService } from "./staff.service";

@Controller("server")
export class StaffController {
  constructor(private readonly service: StaffService) {}

  @Post('addHRISLetter')
  addHRISLetter(@Req() req: any, @Res() res: any) {
    return this.service.addHRISLetter(req, res);
  }

  @Post('getHRISLetter')
  getHRISLetter(@Req() req: any, @Res() res: any) {
    return this.service.getHRISLetter(req, res);
  }

  @Post('updateHRISLetter')
  updateHRISLetter(@Req() req: any, @Res() res: any) {
    return this.service.updateHRISLetter(req, res);
  }

  @Post('deleteHRISLetter')
  deleteHRISLetter(@Req() req: any, @Res() res: any) {
    return this.service.deleteHRISLetter(req, res);
  }

  @Post('addAppointmentletter')
  addAppointmentletter(@Req() req: any, @Res() res: any) {
    return this.service.addAppointmentletter(req, res);
  }

  @Post('addExperienceCertificate')
  addExperienceCertificate(@Req() req: any, @Res() res: any) {
    return this.service.addExperienceCertificate(req, res);
  }

  @Post('addNOCletter')
  addNOCletter(@Req() req: any, @Res() res: any) {
    return this.service.addNOCletter(req, res);
  }

  @Post('UpdateAppointmentletter')
  UpdateAppointmentletter(@Req() req: any, @Res() res: any) {
    return this.service.UpdateAppointmentletter(req, res);
  }

  @Post('UpdateExperienceCertificate')
  UpdateExperienceCertificate(@Req() req: any, @Res() res: any) {
    return this.service.UpdateExperienceCertificate(req, res);
  }

  @Post('UpdateNOCletter')
  UpdateNOCletter(@Req() req: any, @Res() res: any) {
    return this.service.UpdateNOCletter(req, res);
  }

  @Post('UpdateConfirmationletter')
  UpdateConfirmationletter(@Req() req: any, @Res() res: any) {
    return this.service.UpdateConfirmationletter(req, res);
  }

  @Post('DeleteAppointmentletter')
  DeleteAppointmentletter(@Req() req: any, @Res() res: any) {
    return this.service.DeleteAppointmentletter(req, res);
  }

  @Post('DeleteConfirmationletter')
  DeleteConfirmationletter(@Req() req: any, @Res() res: any) {
    return this.service.DeleteConfirmationletter(req, res);
  }

  @Post('DeleteNOCletter')
  DeleteNOCletter(@Req() req: any, @Res() res: any) {
    return this.service.DeleteNOCletter(req, res);
  }

  @Post('addConfirmationletter')
  addConfirmationletter(@Req() req: any, @Res() res: any) {
    return this.service.addConfirmationletter(req, res);
  }

  @Post('adddepartment')
  adddepartment(@Req() req: any, @Res() res: any) {
    return this.service.adddepartment(req, res);
  }

  @Post('getdepartment')
  getdepartment(@Req() req: any, @Res() res: any) {
    return this.service.getdepartment(req, res);
  }

  @Post('getappointmentLetter')
  getappointmentLetter(@Req() req: any, @Res() res: any) {
    return this.service.getappointmentLetter(req, res);
  }

  @Post('getConfirmationLetter')
  getConfirmationLetter(@Req() req: any, @Res() res: any) {
    return this.service.getConfirmationLetter(req, res);
  }

  @Post('getNOC')
  getNOC(@Req() req: any, @Res() res: any) {
    return this.service.getNOC(req, res);
  }

  @Post('getExperienceCertificate')
  getExperienceCertificate(@Req() req: any, @Res() res: any) {
    return this.service.getExperienceCertificate(req, res);
  }

  @Post('getExperienceCertificateById')
  getExperienceCertificateById(@Req() req: any, @Res() res: any) {
    return this.service.getExperienceCertificateById(req, res);
  }

  @Post('getappointmentLetterById')
  getappointmentLetterById(@Req() req: any, @Res() res: any) {
    return this.service.getappointmentLetterById(req, res);
  }

  @Post('getNOCById')
  getNOCById(@Req() req: any, @Res() res: any) {
    return this.service.getNOCById(req, res);
  }

  @Post('getConfirmationLetterById')
  getConfirmationLetterById(@Req() req: any, @Res() res: any) {
    return this.service.getConfirmationLetterById(req, res);
  }

  @Post('getdepartmentByID')
  getdepartmentByID(@Req() req: any, @Res() res: any) {
    return this.service.getdepartmentByID(req, res);
  }

  @Post('addDesignation')
  addDesignation(@Req() req: any, @Res() res: any) {
    return this.service.addDesignation(req, res);
  }

  @Post('getAllDesignation')
  getAllDesignation(@Req() req: any, @Res() res: any) {
    return this.service.getAllDesignation(req, res);
  }

  @Post('getAllTitle')
  getAllTitle(@Req() req: any, @Res() res: any) {
    return this.service.getAllTitle(req, res);
  }

  @Post('addTitle')
  addTitle(@Req() req: any, @Res() res: any) {
    return this.service.addTitle(req, res);
  }

  @Post('editTitle')
  editTitle(@Req() req: any, @Res() res: any) {
    return this.service.editTitle(req, res);
  }

  @Post('deleteTitle')
  deleteTitle(@Req() req: any, @Res() res: any) {
    return this.service.deleteTitle(req, res);
  }

  @Post('getdesignationByID')
  getdesignationByID(@Req() req: any, @Res() res: any) {
    return this.service.getdesignationByID(req, res);
  }

  @Post('addEmployeeAttendancePeriod')
  addEmployeeAttendancePeriod(@Req() req: any, @Res() res: any) {
    return this.service.addEmployeeAttendancePeriod(req, res);
  }

  @Post('addEmployee')
  addEmployee(@Req() req: any, @Res() res: any) {
    return this.service.addEmployee(req, res);
  }

  @Post('addBulkEmployee')
  async addBulkEmployee(@Req() req: any, @Res() res: any) {
    return this.service.addBulkEmployee(req, res);
  }

  @Post('addBulkSalary')
  addBulkSalary(@Req() req: any, @Res() res: any) {
    return this.service.addBulkSalary(req, res);
  }

  @Post('addBulkAttendance')
  addBulkAttendance(@Req() req: any, @Res() res: any) {
    return this.service.addBulkAttendance(req, res);
  }

  @Post('getAttendanceForEmployee')
  getAttendanceForEmployee(@Req() req: any, @Res() res: any) {
    return this.service.getAttendanceForEmployee(req, res);
  }

  @Post('getAttendanceSummaryForAllEmployee')
  getAttendanceSummaryForAllEmployee(@Req() req: any, @Res() res: any) {
    return this.service.getAttendanceSummaryForAllEmployee(req, res);
  }

  @Post('getlateEmployeeList')
  getlateEmployeeList(@Req() req: any, @Res() res: any) {
    return this.service.getlateEmployeeList(req, res);
  }

  @Post('getEmployee')
  getEmployee(@Req() req: any, @Res() res: any) {
    return this.service.getEmployee(req, res);
  }

  @Post('getAllEmployees')
  getAllEmployees(@Req() req: any, @Res() res: any) {
    return this.service.getAllEmployees(req, res);
  }

  @Post('updateovertimeeligibility')
  updateovertimeeligibility(@Req() req: any, @Res() res: any) {
    return this.service.updateovertimeeligibility(req, res);
  }

  @Post('updateEmployeeStatus')
  updateEmployeeStatus(@Req() req: any, @Res() res: any) {
    return this.service.updateEmployeeStatus(req, res);
  }

  @Post('getAllAttendanceInOutTimeWithSalary')
  getAllAttendanceInOutTimeWithSalary(@Req() req: any, @Res() res: any) {
    return this.service.getAllAttendanceInOutTimeWithSalary(req, res);
  }

  @Post('getAllAttendance')
  getAllAttendance(@Req() req: any, @Res() res: any) {
    return this.service.getAllAttendance(req, res);
  }

  @Post('getDailyAttendance')
  getDailyAttendance(@Req() req: any, @Res() res: any) {
    return this.service.getDailyAttendance(req, res);
  }

  @Post('getAllAttendanceByID')
  getAllAttendanceByID(@Req() req: any, @Res() res: any) {
    return this.service.getAllAttendanceByID(req, res);
  }

  @Post('getAllAttendanceDeviceByID')
  getAllAttendanceDeviceByID(@Req() req: any, @Res() res: any) {
    return this.service.getAllAttendanceDeviceByID(req, res);
  }

  @Post('getPrincipleData')
  getPrincipleData(@Req() req: any, @Res() res: any) {
    return this.service.getPrincipleData(req, res);
  }

  @Post('getTeacherAllData')
  getTeacherAllData(@Req() req: any, @Res() res: any) {
    return this.service.getTeacherAllData(req, res);
  }

  @Post('getTeacherAllDataByDepartment')
  getTeacherAllDataByDepartment(@Req() req: any, @Res() res: any) {
    return this.service.getTeacherAllDataByDepartment(req, res);
  }

  @Post('getAHODAllDataByDepartment')
  getAHODAllDataByDepartment(@Req() req: any, @Res() res: any) {
    return this.service.getAHODAllDataByDepartment(req, res);
  }

  @Post('getACCODAllDataBySchool')
  getACCODAllDataBySchool(@Req() req: any, @Res() res: any) {
    return this.service.getACCODAllDataBySchool(req, res);
  }

  @Post('getTeacherAllDataBySchool')
  getTeacherAllDataBySchool(@Req() req: any, @Res() res: any) {
    return this.service.getTeacherAllDataBySchool(req, res);
  }

  @Post('getAdminAllData')
  getAdminAllData(@Req() req: any, @Res() res: any) {
    return this.service.getAdminAllData(req, res);
  }

  @Post('getEmployeeByID')
  getEmployeeByID(@Req() req: any, @Res() res: any) {
    return this.service.getEmployeeByID(req, res);
  }

  @Post('getEmployeeCount')
  getEmployeeCount(@Req() req: any, @Res() res: any) {
    return this.service.getEmployeeCount(req, res);
  }

  @Post('getEmployeeByidd')
  getEmployeeByidd(@Req() req: any, @Res() res: any) {
    return this.service.getEmployeeByidd(req, res);
  }

  @Post('addRecruitmentApplicant')
  addRecruitmentApplicant(@Req() req: any, @Res() res: any) {
    return this.service.addRecruitmentApplicant(req, res);
  }

  @Post('EmployeeAttendancePeriod')
  EmployeeAttendancePeriod(@Req() req: any, @Res() res: any) {
    return this.service.EmployeeAttendancePeriod(req, res);
  }

  @Post('getEmployeeAttendancePeriod')
  getEmployeeAttendancePeriod(@Req() req: any, @Res() res: any) {
    return this.service.getEmployeeAttendancePeriod(req, res);
  }

  @Post('getEmployeeAttendanceDevice')
  getEmployeeAttendanceDevice(@Req() req: any, @Res() res: any) {
    return this.service.getEmployeeAttendanceDevice(req, res);
  }

  @Post('DeleteEmployeeAttendancePeriod')
  DeleteEmployeeAttendancePeriod(@Req() req: any, @Res() res: any) {
    return this.service.DeleteEmployeeAttendancePeriod(req, res);
  }

  @Post('addTeacherEvaluation')
  addTeacherEvaluation(@Req() req: any, @Res() res: any) {
    return this.service.addTeacherEvaluation(req, res);
  }

  @Post('getTeacherEvaluation')
  getTeacherEvaluation(@Req() req: any, @Res() res: any) {
    return this.service.getTeacherEvaluation(req, res);
  }

  @Post('getAdminEvaluationFormList')
  getAdminEvaluationFormList(@Req() req: any, @Res() res: any) {
    return this.service.getAdminEvaluationFormList(req, res);
  }

  @Post('getEvaluator')
  getEvaluator(@Req() req: any, @Res() res: any) {
    return this.service.getEvaluator(req, res);
  }

  @Post('getCompletedEvolutionFor')
  getCompletedEvolutionFor(@Req() req: any, @Res() res: any) {
    return this.service.getCompletedEvolutionFor(req, res);
  }

  @Post('evaluationQuestionsForm')
  evaluationQuestionsForm(@Req() req: any, @Res() res: any) {
    return this.service.evaluationQuestionsForm(req, res);
  }

  @Post('updateEvaluationQuestionsForm')
  updateEvaluationQuestionsForm(@Req() req: any, @Res() res: any) {
    return this.service.updateEvaluationQuestionsForm(req, res);
  }

  @Post('evaluationFormStatus')
  evaluationFormStatus(@Req() req: any, @Res() res: any) {
    return this.service.evaluationFormStatus(req, res);
  }

  @Post('getEvaluationAnswerListByID')
  getEvaluationAnswerListByID(@Req() req: any, @Res() res: any) {
    return this.service.getEvaluationAnswerListByID(req, res);
  }

  @Post('evaluationAnsweForm')
  evaluationAnsweForm(@Req() req: any, @Res() res: any) {
    return this.service.evaluationAnsweForm(req, res);
  }

  @Post('addadminevaluationForm')
  addadminevaluationForm(@Req() req: any, @Res() res: any) {
    return this.service.addadminevaluationForm(req, res);
  }

  @Post('updateadminevaluationForm')
  updateadminevaluationForm(@Req() req: any, @Res() res: any) {
    return this.service.updateadminevaluationForm(req, res);
  }

  @Post('updatePrincipalApproval')
  updatePrincipalApproval(@Req() req: any, @Res() res: any) {
    return this.service.updatePrincipalApproval(req, res);
  }

  @Post('getEvaluationFormList')
  getEvaluationFormList(@Req() req: any, @Res() res: any) {
    return this.service.getEvaluationFormList(req, res);
  }

  @Post('getSalaryByAccount')
  async getSalaryByAccount(@Req() req: any, @Res() res: any) {
    return this.service.getSalaryByAccount(req, res);
  }

  @Post('getSalaryReportByHR')
  async getSalaryReportByHR(@Req() req: any, @Res() res: any) {
    return this.service.getSalaryReportByHR(req, res);
  }

  @Post('getOverTimeReportByHR')
  async getOverTimeReportByHR(@Req() req: any, @Res() res: any) {
    return this.service.getOverTimeReportByHR(req, res);
  }

  @Post('fetchPreviousSalaryReportByHR')
  async fetchPreviousSalaryReportByHR(@Req() req: any, @Res() res: any) {
    return this.service.fetchPreviousSalaryReportByHR(req, res);
  }

  @Post('addFinalSalarySheet')
  addFinalSalarySheet(@Req() req: any, @Res() res: any) {
    return this.service.addFinalSalarySheet(req, res);
  }

  @Post('addSalaryReportByHR')
  addSalaryReportByHR(@Req() req: any, @Res() res: any) {
    return this.service.addSalaryReportByHR(req, res);
  }

  @Post('addOverTimeReportByHR')
  addOverTimeReportByHR(@Req() req: any, @Res() res: any) {
    return this.service.addOverTimeReportByHR(req, res);
  }

  @Post('fetchPreviousOverTimeReportByHR')
  fetchPreviousOverTimeReportByHR(@Req() req: any, @Res() res: any) {
    return this.service.fetchPreviousOverTimeReportByHR(req, res);
  }

  @Post('addSalaryIncreament')
  addSalaryIncreament(@Req() req: any, @Res() res: any) {
    return this.service.addSalaryIncreament(req, res);
  }

  @Post('getAllSalaryHistory')
  getAllSalaryHistory(@Req() req: any, @Res() res: any) {
    return this.service.getAllSalaryHistory(req, res);
  }

  @Post('updateSalaryIncreament')
  updateSalaryIncreament(@Req() req: any, @Res() res: any) {
    return this.service.updateSalaryIncreament(req, res);
  }

  @Post('addaitparameter')
  addaitparameter(@Req() req: any, @Res() res: any) {
    return this.service.addaitparameter(req, res);
  }

  @Post('getaitparameter')
  getaitparameter(@Req() req: any, @Res() res: any) {
    return this.service.getaitparameter(req, res);
  }

  @Post('addallowance')
  addallowance(@Req() req: any, @Res() res: any) {
    return this.service.addallowance(req, res);
  }

  @Post('getallowance')
  getallowance(@Req() req: any, @Res() res: any) {
    return this.service.getallowance(req, res);
  }

  @Post('deleteallowance')
  deleteallowance(@Req() req: any, @Res() res: any) {
    return this.service.deleteallowance(req, res);
  }

  @Post('getaitreport')
  getaitreport(@Req() req: any, @Res() res: any) {
    return this.service.getaitreport(req, res);
  }

  @Post('addUserIdPrefix')
  addUserIdPrefix(@Req() req: any, @Res() res: any) {
    return this.service.addUserIdPrefix(req, res);
  }

  @Post('getallprefix')
  getallprefix(@Req() req: any, @Res() res: any) {
    return this.service.getallprefix(req, res);
  }

  @Post('generateStudentId')
  generateStudentId(@Req() req: any, @Res() res: any) {
    return this.service.generateStudentId(req, res);
  }

  @Post('generateEmpId')
  generateEmpId(@Req() req: any, @Res() res: any) {
    return this.service.generateEmpId(req, res);
  }

  @Post('deleteUserIdPrefix')
  deleteUserIdPrefix(@Req() req: any, @Res() res: any) {
    return this.service.deleteUserIdPrefix(req, res);
  }

  @Get('newHrTest')
  get(@Req() req: any, @Res() res: any) {
    return this.service.get(req, res);
  }
}
