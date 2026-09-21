import { Controller, Get, Post, Put, Delete, Patch, Req, Res } from "@nestjs/common";
import { AccountService } from "./account.service";

@Controller("server")
export class AccountController {
  constructor(private readonly service: AccountService) {}

  @Post('addpayment')
  addpayment(@Req() req: any, @Res() res: any) {
    return this.service.addpayment(req, res);
  }

  @Post('RandP-Report')
  RandP_Report(@Req() req: any, @Res() res: any) {
    return this.service.RandP_Report(req, res);
  }

  @Post('accountSummary')
  accountSummary(@Req() req: any, @Res() res: any) {
    return this.service.accountSummary(req, res);
  }

  @Post('accountSummaryForDaily')
  accountSummaryForDaily(@Req() req: any, @Res() res: any) {
    return this.service.accountSummaryForDaily(req, res);
  }

  @Post('addAmountTransfer')
  async addAmountTransfer(@Req() req: any, @Res() res: any) {
    return this.service.addAmountTransfer(req, res);
  }

  @Post('updateAmountTransfer')
  updateAmountTransfer(@Req() req: any, @Res() res: any) {
    return this.service.updateAmountTransfer(req, res);
  }

  @Post('deleteStudentIncome')
  deleteStudentIncome(@Req() req: any, @Res() res: any) {
    return this.service.deleteStudentIncome(req, res);
  }

  @Post('deletePayment')
  deletePayment(@Req() req: any, @Res() res: any) {
    return this.service.deletePayment(req, res);
  }

  @Post('deleteAmountTransfer')
  deleteAmountTransfer(@Req() req: any, @Res() res: any) {
    return this.service.deleteAmountTransfer(req, res);
  }

  @Post('addStudentIncome')
  addStudentIncome(@Req() req: any, @Res() res: any) {
    return this.service.addStudentIncome(req, res);
  }

  @Post('UpdateStudentIncome')
  UpdateStudentIncome(@Req() req: any, @Res() res: any) {
    return this.service.UpdateStudentIncome(req, res);
  }

  @Post('approveExpenseData')
  approveExpenseData(@Req() req: any, @Res() res: any) {
    return this.service.approveExpenseData(req, res);
  }

  @Post('approveIncomeData')
  approveIncomeData(@Req() req: any, @Res() res: any) {
    return this.service.approveIncomeData(req, res);
  }

  @Post('addGenaralIncome')
  addGenaralIncome(@Req() req: any, @Res() res: any) {
    return this.service.addGenaralIncome(req, res);
  }

  @Post('addAccount')
  addAccount(@Req() req: any, @Res() res: any) {
    return this.service.addAccount(req, res);
  }

  @Post('getAccount')
  getAccount(@Req() req: any, @Res() res: any) {
    return this.service.getAccount(req, res);
  }

  @Post('getStudentIncome')
  getStudentIncome(@Req() req: any, @Res() res: any) {
    return this.service.getStudentIncome(req, res);
  }

  @Post('getStudentIncomeById')
  getStudentIncomeById(@Req() req: any, @Res() res: any) {
    return this.service.getStudentIncomeById(req, res);
  }

  @Post('UpdateLibrarySell')
  UpdateLibrarySell(@Req() req: any, @Res() res: any) {
    return this.service.UpdateLibrarySell(req, res);
  }

  @Post('Updateprincipaleligible')
  Updateprincipaleligible(@Req() req: any, @Res() res: any) {
    return this.service.Updateprincipaleligible(req, res);
  }

  @Post('getExpensedataWithEmployeeInfo')
  getExpensedataWithEmployeeInfo(@Req() req: any, @Res() res: any) {
    return this.service.getExpensedataWithEmployeeInfo(req, res);
  }

  @Post('getAccountTransactionsbyId')
  getAccountTransactionsbyId(@Req() req: any, @Res() res: any) {
    return this.service.getAccountTransactionsbyId(req, res);
  }

  @Post('getExpensedata')
  getExpensedata(@Req() req: any, @Res() res: any) {
    return this.service.getExpensedata(req, res);
  }

  @Post('getPattyCashFromPayment')
  getPattyCashFromPayment(@Req() req: any, @Res() res: any) {
    return this.service.getPattyCashFromPayment(req, res);
  }

  @Post('addPattyCashItem')
  addPattyCashItem(@Req() req: any, @Res() res: any) {
    return this.service.addPattyCashItem(req, res);
  }

  @Post('getPattyCashItem')
  getPattyCashItem(@Req() req: any, @Res() res: any) {
    return this.service.getPattyCashItem(req, res);
  }

  @Post('getPattyCash')
  getPattyCash(@Req() req: any, @Res() res: any) {
    return this.service.getPattyCash(req, res);
  }

  @Post('addPattyCash')
  addPattyCash(@Req() req: any, @Res() res: any) {
    return this.service.addPattyCash(req, res);
  }

  @Post('getExpensedataById')
  getExpensedataById(@Req() req: any, @Res() res: any) {
    return this.service.getExpensedataById(req, res);
  }

  @Post('getstudentIncomeaById')
  getstudentIncomeaById(@Req() req: any, @Res() res: any) {
    return this.service.getstudentIncomeaById(req, res);
  }

  @Post('UpdateExpensedata')
  UpdateExpensedata(@Req() req: any, @Res() res: any) {
    return this.service.UpdateExpensedata(req, res);
  }

  @Post('getAmountTransferDataForReport')
  getAmountTransferDataForReport(@Req() req: any, @Res() res: any) {
    return this.service.getAmountTransferDataForReport(req, res);
  }

  @Post('getExpensedataForReport')
  getExpensedataForReport(@Req() req: any, @Res() res: any) {
    return this.service.getExpensedataForReport(req, res);
  }

  @Post('getAllCollectedfeesReport')
  getAllCollectedfeesReport(@Req() req: any, @Res() res: any) {
    return this.service.getAllCollectedfeesReport(req, res);
  }

  @Post('getIncomeDataForReport')
  getIncomeDataForReport(@Req() req: any, @Res() res: any) {
    return this.service.getIncomeDataForReport(req, res);
  }

  @Post('getAllIncomedata')
  getAllIncomedata(@Req() req: any, @Res() res: any) {
    return this.service.getAllIncomedata(req, res);
  }

  @Post('getGeneralIncomedata')
  getGeneralIncomedata(@Req() req: any, @Res() res: any) {
    return this.service.getGeneralIncomedata(req, res);
  }

  @Post('addExpense_head')
  addExpense_head(@Req() req: any, @Res() res: any) {
    return this.service.addExpense_head(req, res);
  }

  @Post('updateExpense_head')
  updateExpense_head(@Req() req: any, @Res() res: any) {
    return this.service.updateExpense_head(req, res);
  }

  @Post('approveExpenseHead')
  approveExpenseHead(@Req() req: any, @Res() res: any) {
    return this.service.approveExpenseHead(req, res);
  }

  @Post('getExpense_head')
  getExpense_head(@Req() req: any, @Res() res: any) {
    return this.service.getExpense_head(req, res);
  }

  @Post('deleteExpense_head')
  deleteExpense_head(@Req() req: any, @Res() res: any) {
    return this.service.deleteExpense_head(req, res);
  }

  @Post('deleteIncomeHead')
  deleteIncomeHead(@Req() req: any, @Res() res: any) {
    return this.service.deleteIncomeHead(req, res);
  }

  @Post('addincome_head')
  addincome_head(@Req() req: any, @Res() res: any) {
    return this.service.addincome_head(req, res);
  }

  @Post('Updateincome_head')
  Updateincome_head(@Req() req: any, @Res() res: any) {
    return this.service.Updateincome_head(req, res);
  }

  @Post('approveIncomeHead')
  approveIncomeHead(@Req() req: any, @Res() res: any) {
    return this.service.approveIncomeHead(req, res);
  }

  @Post('getincome_head')
  getincome_head(@Req() req: any, @Res() res: any) {
    return this.service.getincome_head(req, res);
  }

  @Post('getincomeheadById')
  getincomeheadById(@Req() req: any, @Res() res: any) {
    return this.service.getincomeheadById(req, res);
  }

  @Post('getincomeHeadStudent')
  getincomeHeadStudent(@Req() req: any, @Res() res: any) {
    return this.service.getincomeHeadStudent(req, res);
  }

  @Post('getincomeHeadGeneral')
  getincomeHeadGeneral(@Req() req: any, @Res() res: any) {
    return this.service.getincomeHeadGeneral(req, res);
  }

  @Post('addSupplyPayment')
  addSupplyPayment(@Req() req: any, @Res() res: any) {
    return this.service.addSupplyPayment(req, res);
  }

  @Post('getSupplyPayment')
  getSupplyPayment(@Req() req: any, @Res() res: any) {
    return this.service.getSupplyPayment(req, res);
  }

  @Post('getSupplyPaymentById')
  getSupplyPaymentById(@Req() req: any, @Res() res: any) {
    return this.service.getSupplyPaymentById(req, res);
  }

  @Post('UpdateSupplyPayment')
  UpdateSupplyPayment(@Req() req: any, @Res() res: any) {
    return this.service.UpdateSupplyPayment(req, res);
  }

  @Post('getSupplyPaymentCountFR')
  getSupplyPaymentCountFR(@Req() req: any, @Res() res: any) {
    return this.service.getSupplyPaymentCountFR(req, res);
  }

  @Post('getSupplyPaymentCountSP')
  getSupplyPaymentCountSP(@Req() req: any, @Res() res: any) {
    return this.service.getSupplyPaymentCountSP(req, res);
  }

  @Post('addbudgetinfo')
  addbudgetinfo(@Req() req: any, @Res() res: any) {
    return this.service.addbudgetinfo(req, res);
  }

  @Post('addbudgetItem')
  addbudgetItem(@Req() req: any, @Res() res: any) {
    return this.service.addbudgetItem(req, res);
  }

  @Post('getbudgetitemById')
  getbudgetitemById(@Req() req: any, @Res() res: any) {
    return this.service.getbudgetitemById(req, res);
  }

  @Post('updatebudgetitemById')
  updatebudgetitemById(@Req() req: any, @Res() res: any) {
    return this.service.updatebudgetitemById(req, res);
  }

  @Post('updatebudgetDoneById')
  updatebudgetDoneById(@Req() req: any, @Res() res: any) {
    return this.service.updatebudgetDoneById(req, res);
  }

  @Post('budgetitemdelete')
  budgetitemdelete(@Req() req: any, @Res() res: any) {
    return this.service.budgetitemdelete(req, res);
  }

  @Post('updatebudgetinfoById')
  updatebudgetinfoById(@Req() req: any, @Res() res: any) {
    return this.service.updatebudgetinfoById(req, res);
  }

  @Post('getbudgetFullinfo')
  getbudgetFullinfo(@Req() req: any, @Res() res: any) {
    return this.service.getbudgetFullinfo(req, res);
  }

  @Post('getbudgetAllinfo')
  getbudgetAllinfo(@Req() req: any, @Res() res: any) {
    return this.service.getbudgetAllinfo(req, res);
  }

  @Post('addKarzRequest')
  addKarzRequest(@Req() req: any, @Res() res: any) {
    return this.service.addKarzRequest(req, res);
  }

  @Post('getKarzRequest')
  getKarzRequest(@Req() req: any, @Res() res: any) {
    return this.service.getKarzRequest(req, res);
  }

  @Post('getKarzRequestByUser')
  getKarzRequestByUser(@Req() req: any, @Res() res: any) {
    return this.service.getKarzRequestByUser(req, res);
  }

  @Post('getKarzRequestById')
  getKarzRequestById(@Req() req: any, @Res() res: any) {
    return this.service.getKarzRequestById(req, res);
  }

  @Post('ApprovelkarzById')
  ApprovelkarzById(@Req() req: any, @Res() res: any) {
    return this.service.ApprovelkarzById(req, res);
  }

  @Post('addBankAccount')
  addBankAccount(@Req() req: any, @Res() res: any) {
    return this.service.addBankAccount(req, res);
  }

  @Post('addBulkBankInfo')
  addBulkBankInfo(@Req() req: any, @Res() res: any) {
    return this.service.addBulkBankInfo(req, res);
  }

  @Post('getBankAccount')
  getBankAccount(@Req() req: any, @Res() res: any) {
    return this.service.getBankAccount(req, res);
  }

  @Post('getFinalSalarySheetForPay')
  getFinalSalarySheetForPay(@Req() req: any, @Res() res: any) {
    return this.service.getFinalSalarySheetForPay(req, res);
  }

  @Post('getFinalSalarySheetByMonth')
  getFinalSalarySheetByMonth(@Req() req: any, @Res() res: any) {
    return this.service.getFinalSalarySheetByMonth(req, res);
  }

  @Post('getFinalSalarySheetByID')
  getFinalSalarySheetByID(@Req() req: any, @Res() res: any) {
    return this.service.getFinalSalarySheetByID(req, res);
  }

  @Post('getOverTimeReportByID')
  getOverTimeReportByID(@Req() req: any, @Res() res: any) {
    return this.service.getOverTimeReportByID(req, res);
  }

  @Get('accountTest')
  accountTest(@Req() req: any, @Res() res: any) {
    return this.service.accountTest(req, res);
  }
}
