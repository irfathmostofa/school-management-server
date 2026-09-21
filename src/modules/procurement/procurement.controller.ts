import { Controller, Get, Post, Put, Delete, Patch, Req, Res } from "@nestjs/common";
import { ProcurementService } from "./procurement.service";

@Controller("server")
export class ProcurementController {
  constructor(private readonly service: ProcurementService) {}

  @Post('getrequisionItemById')
  getrequisionItemById(@Req() req: any, @Res() res: any) {
    return this.service.getrequisionItemById(req, res);
  }

  @Post('getrequisionItemByIdList')
  getrequisionItemByIdList(@Req() req: any, @Res() res: any) {
    return this.service.getrequisionItemByIdList(req, res);
  }

  @Post('getrequisionItemApprovelChk')
  getrequisionItemApprovelChk(@Req() req: any, @Res() res: any) {
    return this.service.getrequisionItemApprovelChk(req, res);
  }

  @Post('DeleteRequisionFullApproved')
  DeleteRequisionFullApproved(@Req() req: any, @Res() res: any) {
    return this.service.DeleteRequisionFullApproved(req, res);
  }

  @Post('DeleteRequisionApproval')
  DeleteRequisionApproval(@Req() req: any, @Res() res: any) {
    return this.service.DeleteRequisionApproval(req, res);
  }

  @Post('getrequisionFullApprovedChk')
  getrequisionFullApprovedChk(@Req() req: any, @Res() res: any) {
    return this.service.getrequisionFullApprovedChk(req, res);
  }

  @Post('getrequisionApprovedChk')
  getrequisionApprovedChk(@Req() req: any, @Res() res: any) {
    return this.service.getrequisionApprovedChk(req, res);
  }

  @Post('getitemsByCsRequId')
  getitemsByCsRequId(@Req() req: any, @Res() res: any) {
    return this.service.getitemsByCsRequId(req, res);
  }

  @Post('getrequisionBycsId')
  getrequisionBycsId(@Req() req: any, @Res() res: any) {
    return this.service.getrequisionBycsId(req, res);
  }

  @Post('getrequisioncsByID')
  getrequisioncsByID(@Req() req: any, @Res() res: any) {
    return this.service.getrequisioncsByID(req, res);
  }

  @Post('submitrequisionCSRemark')
  submitrequisionCSRemark(@Req() req: any, @Res() res: any) {
    return this.service.submitrequisionCSRemark(req, res);
  }

  @Post('DeleteRequisionItemById')
  DeleteRequisionItemById(@Req() req: any, @Res() res: any) {
    return this.service.DeleteRequisionItemById(req, res);
  }

  @Post('getrequisionData')
  getrequisionData(@Req() req: any, @Res() res: any) {
    return this.service.getrequisionData(req, res);
  }

  @Post('getrequisionCSData')
  getrequisionCSData(@Req() req: any, @Res() res: any) {
    return this.service.getrequisionCSData(req, res);
  }

  @Post('getCSDataById')
  getCSDataById(@Req() req: any, @Res() res: any) {
    return this.service.getCSDataById(req, res);
  }

  @Post('getrequisitionItemId')
  getrequisitionItemId(@Req() req: any, @Res() res: any) {
    return this.service.getrequisitionItemId(req, res);
  }

  @Post('requisitionItemSubmit')
  requisitionItemSubmit(@Req() req: any, @Res() res: any) {
    return this.service.requisitionItemSubmit(req, res);
  }

  @Post('requisitionCSitemsubmit')
  requisitionCSitemsubmit(@Req() req: any, @Res() res: any) {
    return this.service.requisitionCSitemsubmit(req, res);
  }

  @Post('deleteRequisitionTimeline')
  deleteRequisitionTimeline(@Req() req: any, @Res() res: any) {
    return this.service.deleteRequisitionTimeline(req, res);
  }

  @Post('UpdaterequisitionCSApproveUpdate')
  UpdaterequisitionCSApproveUpdate(@Req() req: any, @Res() res: any) {
    return this.service.UpdaterequisitionCSApproveUpdate(req, res);
  }

  @Post('UpdaterequisitionItemUpdate')
  UpdaterequisitionItemUpdate(@Req() req: any, @Res() res: any) {
    return this.service.UpdaterequisitionItemUpdate(req, res);
  }

  @Post('UpdateStoreRequisitionItemUpdate')
  UpdateStoreRequisitionItemUpdate(@Req() req: any, @Res() res: any) {
    return this.service.UpdateStoreRequisitionItemUpdate(req, res);
  }

  @Post('csubmit')
  csubmit(@Req() req: any, @Res() res: any) {
    return this.service.csubmit(req, res);
  }

  @Post('StoreSubmit')
  StoreSubmit(@Req() req: any, @Res() res: any) {
    return this.service.StoreSubmit(req, res);
  }

  @Post('removePermission')
  removePermission(@Req() req: any, @Res() res: any) {
    return this.service.removePermission(req, res);
  }

  @Post('CoSubmit')
  CoSubmit(@Req() req: any, @Res() res: any) {
    return this.service.CoSubmit(req, res);
  }

  @Post('managersubmit')
  managersubmit(@Req() req: any, @Res() res: any) {
    return this.service.managersubmit(req, res);
  }

  @Post('requisitionStatus')
  requisitionStatus(@Req() req: any, @Res() res: any) {
    return this.service.requisitionStatus(req, res);
  }

  @Post('requisitionApproveCHP')
  requisitionApproveCHP(@Req() req: any, @Res() res: any) {
    return this.service.requisitionApproveCHP(req, res);
  }

  @Post('UpdaterequisitionApprovelUpdate')
  UpdaterequisitionApprovelUpdate(@Req() req: any, @Res() res: any) {
    return this.service.UpdaterequisitionApprovelUpdate(req, res);
  }

  @Post('requisitionSubmit')
  requisitionSubmit(@Req() req: any, @Res() res: any) {
    return this.service.requisitionSubmit(req, res);
  }

  @Post('supplierSubmit')
  supplierSubmit(@Req() req: any, @Res() res: any) {
    return this.service.supplierSubmit(req, res);
  }

  @Post('getsupplier')
  getsupplier(@Req() req: any, @Res() res: any) {
    return this.service.getsupplier(req, res);
  }

  @Post('getsupplierByID')
  getsupplierByID(@Req() req: any, @Res() res: any) {
    return this.service.getsupplierByID(req, res);
  }

  @Post('UpdateSupplierByID')
  UpdateSupplierByID(@Req() req: any, @Res() res: any) {
    return this.service.UpdateSupplierByID(req, res);
  }

  @Post('PoSubmit')
  PoSubmit(@Req() req: any, @Res() res: any) {
    return this.service.PoSubmit(req, res);
  }

  @Post('UpdateApprovelPO')
  UpdateApprovelPO(@Req() req: any, @Res() res: any) {
    return this.service.UpdateApprovelPO(req, res);
  }

  @Post('UpdateApprovelforPrincipal')
  UpdateApprovelforPrincipal(@Req() req: any, @Res() res: any) {
    return this.service.UpdateApprovelforPrincipal(req, res);
  }

  @Post('PoItemSubmit')
  PoItemSubmit(@Req() req: any, @Res() res: any) {
    return this.service.PoItemSubmit(req, res);
  }

  @Post('getpolist')
  getpolist(@Req() req: any, @Res() res: any) {
    return this.service.getpolist(req, res);
  }

  @Post('getpoItemallinfo')
  getpoItemallinfo(@Req() req: any, @Res() res: any) {
    return this.service.getpoItemallinfo(req, res);
  }

  @Post('addFundRequest')
  addFundRequest(@Req() req: any, @Res() res: any) {
    return this.service.addFundRequest(req, res);
  }

  @Post('getFundRequest')
  getFundRequest(@Req() req: any, @Res() res: any) {
    return this.service.getFundRequest(req, res);
  }

  @Post('getFundRequestById')
  getFundRequestById(@Req() req: any, @Res() res: any) {
    return this.service.getFundRequestById(req, res);
  }

  @Post('UpdateFundRequestApprovel')
  UpdateFundRequestApprovel(@Req() req: any, @Res() res: any) {
    return this.service.UpdateFundRequestApprovel(req, res);
  }

  @Post('UpdateSPApprovel')
  UpdateSPApprovel(@Req() req: any, @Res() res: any) {
    return this.service.UpdateSPApprovel(req, res);
  }

  @Post('UpdateFundRequest')
  UpdateFundRequest(@Req() req: any, @Res() res: any) {
    return this.service.UpdateFundRequest(req, res);
  }

  @Post('addSupplyPaymentItem')
  addSupplyPaymentItem(@Req() req: any, @Res() res: any) {
    return this.service.addSupplyPaymentItem(req, res);
  }

  @Post('getSupplyPaymentItem')
  getSupplyPaymentItem(@Req() req: any, @Res() res: any) {
    return this.service.getSupplyPaymentItem(req, res);
  }

  @Post('getSupplyPaymentItemById')
  getSupplyPaymentItemById(@Req() req: any, @Res() res: any) {
    return this.service.getSupplyPaymentItemById(req, res);
  }

  @Post('getfundrequestInfo')
  getfundrequestInfo(@Req() req: any, @Res() res: any) {
    return this.service.getfundrequestInfo(req, res);
  }

  UpdateSupplyPayment(@Req() req: any, @Res() res: any) {
    return this.service.UpdateSupplyPayment(req, res);
  }

  @Get('procurementTest')
  procurementTest(@Req() req: any, @Res() res: any) {
    return this.service.procurementTest(req, res);
  }
}
