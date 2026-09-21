import { Controller, Get, Post, Put, Delete, Patch, Req, Res } from "@nestjs/common";
import { FeesService } from "./fees.service";

@Controller("server")
export class FeesController {
  constructor(private readonly service: FeesService) {}

  @Post('send-due-report-sms')
  async send_due_report_sms(@Req() req: any, @Res() res: any) {
    return this.service.send_due_report_sms(req, res);
  }

  @Post('addFeesCollection')
  addFeesCollection(@Req() req: any, @Res() res: any) {
    return this.service.addFeesCollection(req, res);
  }

  @Post('addFeesCollectionForward')
  async addFeesCollectionForward(@Req() req: any, @Res() res: any) {
    return this.service.addFeesCollectionForward(req, res);
  }

  @Post('addStudentExtraFacility')
  async addStudentExtraFacility(@Req() req: any, @Res() res: any) {
    return this.service.addStudentExtraFacility(req, res);
  }

  @Post('UpdateStudentExtraFacility')
  async UpdateStudentExtraFacility(@Req() req: any, @Res() res: any) {
    return this.service.UpdateStudentExtraFacility(req, res);
  }

  @Post('fetchExtraFeeList')
  fetchExtraFeeList(@Req() req: any, @Res() res: any) {
    return this.service.fetchExtraFeeList(req, res);
  }

  @Post('getStudentExtraFacility')
  getStudentExtraFacility(@Req() req: any, @Res() res: any) {
    return this.service.getStudentExtraFacility(req, res);
  }

  @Post('fetchExtraFeeInfoApprovel')
  fetchExtraFeeInfoApprovel(@Req() req: any, @Res() res: any) {
    return this.service.fetchExtraFeeInfoApprovel(req, res);
  }

  @Post('UpdateExtraFeeInfoApprovel')
  UpdateExtraFeeInfoApprovel(@Req() req: any, @Res() res: any) {
    return this.service.UpdateExtraFeeInfoApprovel(req, res);
  }

  @Post('feesCollectionById')
  feesCollectionById(@Req() req: any, @Res() res: any) {
    return this.service.feesCollectionById(req, res);
  }

  @Post('getAllCollectedfees')
  getAllCollectedfees(@Req() req: any, @Res() res: any) {
    return this.service.getAllCollectedfees(req, res);
  }

  @Post('getAllfeesCollectioninfoWithStudent')
  getAllfeesCollectioninfoWithStudent(@Req() req: any, @Res() res: any) {
    return this.service.getAllfeesCollectioninfoWithStudent(req, res);
  }

  @Post('getFeesbymonth')
  getFeesbymonth(@Req() req: any, @Res() res: any) {
    return this.service.getFeesbymonth(req, res);
  }

  @Post('getAllfeesCollectioninfo')
  getAllfeesCollectioninfo(@Req() req: any, @Res() res: any) {
    return this.service.getAllfeesCollectioninfo(req, res);
  }

  @Post('testCalcFine')
  testCalcFine(@Req() req: any, @Res() res: any) {
    return this.service.testCalcFine(req, res);
  }

  @Post('feesCollectionApproval')
  feesCollectionApproval(@Req() req: any, @Res() res: any) {
    return this.service.feesCollectionApproval(req, res);
  }

  @Post('process-payment')
  async process_payment(@Req() req: any, @Res() res: any) {
    return this.service.process_payment(req, res);
  }

  @Post('feesCollectionDueBalance')
  feesCollectionDueBalance(@Req() req: any, @Res() res: any) {
    return this.service.feesCollectionDueBalance(req, res);
  }

  @Post('getAdvanceFeesStatus')
  getAdvanceFeesStatus(@Req() req: any, @Res() res: any) {
    return this.service.getAdvanceFeesStatus(req, res);
  }

  @Post('updateFeesCollection')
  updateFeesCollection(@Req() req: any, @Res() res: any) {
    return this.service.updateFeesCollection(req, res);
  }

  @Post('updateFeesCollectionNew')
  updateFeesCollectionNew(@Req() req: any, @Res() res: any) {
    return this.service.updateFeesCollectionNew(req, res);
  }

  @Post('updateFeesCollectionSingle')
  updateFeesCollectionSingle(@Req() req: any, @Res() res: any) {
    return this.service.updateFeesCollectionSingle(req, res);
  }

  @Post('approveFeesCollection')
  approveFeesCollection(@Req() req: any, @Res() res: any) {
    return this.service.approveFeesCollection(req, res);
  }

  @Post('deleteFeesCollection')
  deleteFeesCollection(@Req() req: any, @Res() res: any) {
    return this.service.deleteFeesCollection(req, res);
  }

  @Post('deleteCollectedFees')
  deleteCollectedFees(@Req() req: any, @Res() res: any) {
    return this.service.deleteCollectedFees(req, res);
  }

  @Post('approveSingleFeesCollection')
  approveSingleFeesCollection(@Req() req: any, @Res() res: any) {
    return this.service.approveSingleFeesCollection(req, res);
  }

  @Post('addFeeType')
  addFeeType(@Req() req: any, @Res() res: any) {
    return this.service.addFeeType(req, res);
  }

  @Post('UpdateFeeTypeById')
  UpdateFeeTypeById(@Req() req: any, @Res() res: any) {
    return this.service.UpdateFeeTypeById(req, res);
  }

  @Post('ApprovedFeeTypeById')
  ApprovedFeeTypeById(@Req() req: any, @Res() res: any) {
    return this.service.ApprovedFeeTypeById(req, res);
  }

  @Post('paymentRepicts')
  paymentRepicts(@Req() req: any, @Res() res: any) {
    return this.service.paymentRepicts(req, res);
  }

  @Post('v1/getFeeInfo')
  async v1_getFeeInfo(@Req() req: any, @Res() res: any) {
    return this.service.v1_getFeeInfo(req, res);
  }

  @Post('v1/payment')
  async v1_payment(@Req() req: any, @Res() res: any) {
    return this.service.v1_payment(req, res);
  }

  @Post('fetchFeeTypes')
  fetchFeeTypes(@Req() req: any, @Res() res: any) {
    return this.service.fetchFeeTypes(req, res);
  }

  @Post('fetchFeeTypesforApprovel')
  fetchFeeTypesforApprovel(@Req() req: any, @Res() res: any) {
    return this.service.fetchFeeTypesforApprovel(req, res);
  }

  @Post('fetchFeeTypesById')
  fetchFeeTypesById(@Req() req: any, @Res() res: any) {
    return this.service.fetchFeeTypesById(req, res);
  }

  @Post('deleteFeeTypes')
  deleteFeeTypes(@Req() req: any, @Res() res: any) {
    return this.service.deleteFeeTypes(req, res);
  }

  @Post('deleteFeeInfo')
  deleteFeeInfo(@Req() req: any, @Res() res: any) {
    return this.service.deleteFeeInfo(req, res);
  }

  @Post('deleteExtraFeeInfo')
  deleteExtraFeeInfo(@Req() req: any, @Res() res: any) {
    return this.service.deleteExtraFeeInfo(req, res);
  }

  @Post('deleteExtraFeeInfoList')
  deleteExtraFeeInfoList(@Req() req: any, @Res() res: any) {
    return this.service.deleteExtraFeeInfoList(req, res);
  }

  @Post('deleteDiscountType')
  deleteDiscountType(@Req() req: any, @Res() res: any) {
    return this.service.deleteDiscountType(req, res);
  }

  @Post('fetchFeeInfo')
  fetchFeeInfo(@Req() req: any, @Res() res: any) {
    return this.service.fetchFeeInfo(req, res);
  }

  @Post('fetchExtraFeeInfo')
  fetchExtraFeeInfo(@Req() req: any, @Res() res: any) {
    return this.service.fetchExtraFeeInfo(req, res);
  }

  @Post('UpdateExtraFeeInfo')
  UpdateExtraFeeInfo(@Req() req: any, @Res() res: any) {
    return this.service.UpdateExtraFeeInfo(req, res);
  }

  @Post('fetchFeeInfoApprovel')
  fetchFeeInfoApprovel(@Req() req: any, @Res() res: any) {
    return this.service.fetchFeeInfoApprovel(req, res);
  }

  @Post('UpdateFeeInfoApprovel')
  UpdateFeeInfoApprovel(@Req() req: any, @Res() res: any) {
    return this.service.UpdateFeeInfoApprovel(req, res);
  }

  @Post('fetchFeeInfoById')
  fetchFeeInfoById(@Req() req: any, @Res() res: any) {
    return this.service.fetchFeeInfoById(req, res);
  }

  @Post('addFeeInfo')
  addFeeInfo(@Req() req: any, @Res() res: any) {
    return this.service.addFeeInfo(req, res);
  }

  @Post('addExtraFeeInfo')
  addExtraFeeInfo(@Req() req: any, @Res() res: any) {
    return this.service.addExtraFeeInfo(req, res);
  }

  @Post('fetchFeeInfoByName')
  fetchFeeInfoByName(@Req() req: any, @Res() res: any) {
    return this.service.fetchFeeInfoByName(req, res);
  }

  @Post('UpdateFeeInfo')
  UpdateFeeInfo(@Req() req: any, @Res() res: any) {
    return this.service.UpdateFeeInfo(req, res);
  }

  @Post('addDiscountType')
  addDiscountType(@Req() req: any, @Res() res: any) {
    return this.service.addDiscountType(req, res);
  }

  @Post('UpdateDiscountType')
  UpdateDiscountType(@Req() req: any, @Res() res: any) {
    return this.service.UpdateDiscountType(req, res);
  }

  @Post('getDiscountType')
  getDiscountType(@Req() req: any, @Res() res: any) {
    return this.service.getDiscountType(req, res);
  }

  @Post('getDiscountTypeById')
  getDiscountTypeById(@Req() req: any, @Res() res: any) {
    return this.service.getDiscountTypeById(req, res);
  }

  @Post('addDiscountStudent')
  addDiscountStudent(@Req() req: any, @Res() res: any) {
    return this.service.addDiscountStudent(req, res);
  }

  @Post('getDiscountDataByStudentId')
  getDiscountDataByStudentId(@Req() req: any, @Res() res: any) {
    return this.service.getDiscountDataByStudentId(req, res);
  }

  @Post('assignDiscount')
  assignDiscount(@Req() req: any, @Res() res: any) {
    return this.service.assignDiscount(req, res);
  }

  @Post('getassignDiscount')
  getassignDiscount(@Req() req: any, @Res() res: any) {
    return this.service.getassignDiscount(req, res);
  }

  @Post('getassignDiscountApprove')
  getassignDiscountApprove(@Req() req: any, @Res() res: any) {
    return this.service.getassignDiscountApprove(req, res);
  }

  @Post('UpdateAssignDiscountApprove')
  UpdateAssignDiscountApprove(@Req() req: any, @Res() res: any) {
    return this.service.UpdateAssignDiscountApprove(req, res);
  }

  @Post('getassignDiscountforUpdate')
  getassignDiscountforUpdate(@Req() req: any, @Res() res: any) {
    return this.service.getassignDiscountforUpdate(req, res);
  }

  @Post('getassignDiscounttById')
  getassignDiscounttById(@Req() req: any, @Res() res: any) {
    return this.service.getassignDiscounttById(req, res);
  }

  @Post('getassignDiscounttByStudentId')
  getassignDiscounttByStudentId(@Req() req: any, @Res() res: any) {
    return this.service.getassignDiscounttByStudentId(req, res);
  }

  @Post('getAllStudentDiscount')
  getAllStudentDiscount(@Req() req: any, @Res() res: any) {
    return this.service.getAllStudentDiscount(req, res);
  }

  @Post('deleteAssignDiscount')
  deleteAssignDiscount(@Req() req: any, @Res() res: any) {
    return this.service.deleteAssignDiscount(req, res);
  }

  @Post('UpdateAssignDiscount')
  UpdateAssignDiscount(@Req() req: any, @Res() res: any) {
    return this.service.UpdateAssignDiscount(req, res);
  }

  @Post('student-fees-due-report')
  student_fees_due_report(@Req() req: any, @Res() res: any) {
    return this.service.student_fees_due_report(req, res);
  }

  @Post('getStudentDueBalance')
  getStudentDueBalance(@Req() req: any, @Res() res: any) {
    return this.service.getStudentDueBalance(req, res);
  }

  @Post('manualClassFeesForward')
  async manualClassFeesForward(@Req() req: any, @Res() res: any) {
    return this.service.manualClassFeesForward(req, res);
  }

  @Get('FeesTest')
  FeesTest(@Req() req: any, @Res() res: any) {
    return this.service.FeesTest(req, res);
  }
}
