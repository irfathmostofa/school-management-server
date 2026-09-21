import { Controller, Get, Post, Put, Delete, Patch, Req, Res } from "@nestjs/common";
import { StoreInventoryService } from "./store-inventory.service";

@Controller("server")
export class StoreInventoryController {
  constructor(private readonly service: StoreInventoryService) {}

  @Post('addProductType')
  addProductType(@Req() req: any, @Res() res: any) {
    return this.service.addProductType(req, res);
  }

  @Post('getProductType')
  getProductType(@Req() req: any, @Res() res: any) {
    return this.service.getProductType(req, res);
  }

  @Post('getProductTypeinduById')
  getProductTypeinduById(@Req() req: any, @Res() res: any) {
    return this.service.getProductTypeinduById(req, res);
  }

  @Post('getProductTypeById')
  getProductTypeById(@Req() req: any, @Res() res: any) {
    return this.service.getProductTypeById(req, res);
  }

  @Post('UpdateProductType')
  UpdateProductType(@Req() req: any, @Res() res: any) {
    return this.service.UpdateProductType(req, res);
  }

  @Post('addProduct')
  addProduct(@Req() req: any, @Res() res: any) {
    return this.service.addProduct(req, res);
  }

  @Post('getProductByType')
  getProductByType(@Req() req: any, @Res() res: any) {
    return this.service.getProductByType(req, res);
  }

  @Post('getProduct')
  getProduct(@Req() req: any, @Res() res: any) {
    return this.service.getProduct(req, res);
  }

  @Post('getProductById')
  getProductById(@Req() req: any, @Res() res: any) {
    return this.service.getProductById(req, res);
  }

  @Post('UpdateProduct')
  UpdateProduct(@Req() req: any, @Res() res: any) {
    return this.service.UpdateProduct(req, res);
  }

  @Post('getProductLastID')
  getProductLastID(@Req() req: any, @Res() res: any) {
    return this.service.getProductLastID(req, res);
  }

  @Post('getStudentProducts')
  getStudentProducts(@Req() req: any, @Res() res: any) {
    return this.service.getStudentProducts(req, res);
  }

  @Post('addTransferProduct')
  addTransferProduct(@Req() req: any, @Res() res: any) {
    return this.service.addTransferProduct(req, res);
  }

  @Post('updateTransferProduct')
  updateTransferProduct(@Req() req: any, @Res() res: any) {
    return this.service.updateTransferProduct(req, res);
  }

  @Post('getTransferHistory')
  getTransferHistory(@Req() req: any, @Res() res: any) {
    return this.service.getTransferHistory(req, res);
  }

  @Post('updateTransferHistory')
  updateTransferHistory(@Req() req: any, @Res() res: any) {
    return this.service.updateTransferHistory(req, res);
  }

  @Post('getLibraryItems')
  getLibraryItems(@Req() req: any, @Res() res: any) {
    return this.service.getLibraryItems(req, res);
  }

  @Post('getLibraryItemByID')
  getLibraryItemByID(@Req() req: any, @Res() res: any) {
    return this.service.getLibraryItemByID(req, res);
  }

  @Post('getLibraryIssuedItems')
  getLibraryIssuedItems(@Req() req: any, @Res() res: any) {
    return this.service.getLibraryIssuedItems(req, res);
  }

  @Post('addLibraryIssueItems')
  async addLibraryIssueItems(@Req() req: any, @Res() res: any) {
    return this.service.addLibraryIssueItems(req, res);
  }

  @Post('getIssueInfo')
  getIssueInfo(@Req() req: any, @Res() res: any) {
    return this.service.getIssueInfo(req, res);
  }

  @Post('getLibraryReturnItems')
  getLibraryReturnItems(@Req() req: any, @Res() res: any) {
    return this.service.getLibraryReturnItems(req, res);
  }

  @Post('addLibraryReturnItems')
  async addLibraryReturnItems(@Req() req: any, @Res() res: any) {
    return this.service.addLibraryReturnItems(req, res);
  }

  @Post('addGRNinfo')
  addGRNinfo(@Req() req: any, @Res() res: any) {
    return this.service.addGRNinfo(req, res);
  }

  @Post('getGRNinfo')
  getGRNinfo(@Req() req: any, @Res() res: any) {
    return this.service.getGRNinfo(req, res);
  }

  @Post('getAllinfoByGRN')
  getAllinfoByGRN(@Req() req: any, @Res() res: any) {
    return this.service.getAllinfoByGRN(req, res);
  }

  @Post('updateGRNBillstatus')
  updateGRNBillstatus(@Req() req: any, @Res() res: any) {
    return this.service.updateGRNBillstatus(req, res);
  }

  @Post('updateGRNstatus')
  updateGRNstatus(@Req() req: any, @Res() res: any) {
    return this.service.updateGRNstatus(req, res);
  }

  @Post('addGRNitem')
  addGRNitem(@Req() req: any, @Res() res: any) {
    return this.service.addGRNitem(req, res);
  }

  @Post('addMDRinfo')
  addMDRinfo(@Req() req: any, @Res() res: any) {
    return this.service.addMDRinfo(req, res);
  }

  @Post('getMDRinfo')
  getMDRinfo(@Req() req: any, @Res() res: any) {
    return this.service.getMDRinfo(req, res);
  }

  @Post('updateMDRstatus')
  updateMDRstatus(@Req() req: any, @Res() res: any) {
    return this.service.updateMDRstatus(req, res);
  }

  @Post('getAllMDRinfoByID')
  getAllMDRinfoByID(@Req() req: any, @Res() res: any) {
    return this.service.getAllMDRinfoByID(req, res);
  }

  @Post('addMDRitem')
  addMDRitem(@Req() req: any, @Res() res: any) {
    return this.service.addMDRitem(req, res);
  }

  @Post('addCustomer')
  addCustomer(@Req() req: any, @Res() res: any) {
    return this.service.addCustomer(req, res);
  }

  @Post('UpdateCustomer')
  UpdateCustomer(@Req() req: any, @Res() res: any) {
    return this.service.UpdateCustomer(req, res);
  }

  @Post('getCustomerByID')
  getCustomerByID(@Req() req: any, @Res() res: any) {
    return this.service.getCustomerByID(req, res);
  }

  @Post('getAllSearchCustomer')
  getAllSearchCustomer(@Req() req: any, @Res() res: any) {
    return this.service.getAllSearchCustomer(req, res);
  }

  @Post('getAllCustomer')
  getAllCustomer(@Req() req: any, @Res() res: any) {
    return this.service.getAllCustomer(req, res);
  }

  @Post('deleteCustomer')
  deleteCustomer(@Req() req: any, @Res() res: any) {
    return this.service.deleteCustomer(req, res);
  }

  @Post('addquotation')
  addquotation(@Req() req: any, @Res() res: any) {
    return this.service.addquotation(req, res);
  }

  @Post('getLastQuotationId')
  getLastQuotationId(@Req() req: any, @Res() res: any) {
    return this.service.getLastQuotationId(req, res);
  }

  @Post('getallquotation')
  getallquotation(@Req() req: any, @Res() res: any) {
    return this.service.getallquotation(req, res);
  }

  @Post('getquotationItemById')
  getquotationItemById(@Req() req: any, @Res() res: any) {
    return this.service.getquotationItemById(req, res);
  }

  @Post('addinvoice')
  addinvoice(@Req() req: any, @Res() res: any) {
    return this.service.addinvoice(req, res);
  }

  @Post('getallinvoice')
  getallinvoice(@Req() req: any, @Res() res: any) {
    return this.service.getallinvoice(req, res);
  }

  @Post('deleteinvoice')
  deleteinvoice(@Req() req: any, @Res() res: any) {
    return this.service.deleteinvoice(req, res);
  }

  @Post('addvendor')
  addvendor(@Req() req: any, @Res() res: any) {
    return this.service.addvendor(req, res);
  }

  @Post('UpdateVendor')
  UpdateVendor(@Req() req: any, @Res() res: any) {
    return this.service.UpdateVendor(req, res);
  }

  @Post('getvendorID')
  getvendorID(@Req() req: any, @Res() res: any) {
    return this.service.getvendorID(req, res);
  }

  @Post('getAllVendor')
  getAllVendor(@Req() req: any, @Res() res: any) {
    return this.service.getAllVendor(req, res);
  }

  @Post('deleteVendor')
  deleteVendor(@Req() req: any, @Res() res: any) {
    return this.service.deleteVendor(req, res);
  }

  @Post('getLastPurchaseId')
  getLastPurchaseId(@Req() req: any, @Res() res: any) {
    return this.service.getLastPurchaseId(req, res);
  }

  @Post('addStoreProduct')
  addStoreProduct(@Req() req: any, @Res() res: any) {
    return this.service.addStoreProduct(req, res);
  }

  @Post('getLastStoreProductId')
  getLastStoreProductId(@Req() req: any, @Res() res: any) {
    return this.service.getLastStoreProductId(req, res);
  }

  @Post('getallStoreProduct')
  getallStoreProduct(@Req() req: any, @Res() res: any) {
    return this.service.getallStoreProduct(req, res);
  }

  @Post('getallStoreProductItemlist')
  getallStoreProductItemlist(@Req() req: any, @Res() res: any) {
    return this.service.getallStoreProductItemlist(req, res);
  }

  @Post('getStoreProductItemById')
  getStoreProductItemById(@Req() req: any, @Res() res: any) {
    return this.service.getStoreProductItemById(req, res);
  }

  @Post('addbill')
  addbill(@Req() req: any, @Res() res: any) {
    return this.service.addbill(req, res);
  }

  @Post('getallbillinfo')
  getallbillinfo(@Req() req: any, @Res() res: any) {
    return this.service.getallbillinfo(req, res);
  }

  @Post('deletebill')
  deletebill(@Req() req: any, @Res() res: any) {
    return this.service.deletebill(req, res);
  }

  @Get('storeInventoryTest')
  get(@Req() req: any, @Res() res: any) {
    return this.service.get(req, res);
  }
}
