import { Controller, Get, Post, Put, Delete, Patch, Req, Res } from "@nestjs/common";
import { FrontOfficeService } from "./front-office.service";

@Controller("server")
export class FrontOfficeController {
  constructor(private readonly service: FrontOfficeService) {}

  @Post('getAllEmployee')
  getAllEmployee(@Req() req: any, @Res() res: any) {
    return this.service.getAllEmployee(req, res);
  }

  @Post('addEmployeeContact')
  addEmployeeContact(@Req() req: any, @Res() res: any) {
    return this.service.addEmployeeContact(req, res);
  }

  @Post('getEmployeeContactData')
  getEmployeeContactData(@Req() req: any, @Res() res: any) {
    return this.service.getEmployeeContactData(req, res);
  }

  @Post('getEmployeeContactDataById')
  getEmployeeContactDataById(@Req() req: any, @Res() res: any) {
    return this.service.getEmployeeContactDataById(req, res);
  }

  @Post('UpdateEmployeeContact')
  UpdateEmployeeContact(@Req() req: any, @Res() res: any) {
    return this.service.UpdateEmployeeContact(req, res);
  }

  @Post('addVisitorBook')
  addVisitorBook(@Req() req: any, @Res() res: any) {
    return this.service.addVisitorBook(req, res);
  }

  @Post('updateVisitorBook')
  updateVisitorBook(@Req() req: any, @Res() res: any) {
    return this.service.updateVisitorBook(req, res);
  }

  @Post('getVisitorBook')
  getVisitorBook(@Req() req: any, @Res() res: any) {
    return this.service.getVisitorBook(req, res);
  }

  @Post('DeleteVisitorBook')
  DeleteVisitorBook(@Req() req: any, @Res() res: any) {
    return this.service.DeleteVisitorBook(req, res);
  }

  @Post('addComplainBox')
  addComplainBox(@Req() req: any, @Res() res: any) {
    return this.service.addComplainBox(req, res);
  }

  @Post('getComplainBoxData')
  getComplainBoxData(@Req() req: any, @Res() res: any) {
    return this.service.getComplainBoxData(req, res);
  }

  @Post('getComplainBoxDataByUser')
  getComplainBoxDataByUser(@Req() req: any, @Res() res: any) {
    return this.service.getComplainBoxDataByUser(req, res);
  }

  @Post('DeleteComplainBoxDataById')
  DeleteComplainBoxDataById(@Req() req: any, @Res() res: any) {
    return this.service.DeleteComplainBoxDataById(req, res);
  }

  @Post('getComplainBoxDataById')
  getComplainBoxDataById(@Req() req: any, @Res() res: any) {
    return this.service.getComplainBoxDataById(req, res);
  }

  @Post('UpdateComplainBox')
  UpdateComplainBox(@Req() req: any, @Res() res: any) {
    return this.service.UpdateComplainBox(req, res);
  }

  @Post('addPostalDispatch')
  addPostalDispatch(@Req() req: any, @Res() res: any) {
    return this.service.addPostalDispatch(req, res);
  }

  @Post('getPostalDispatchData')
  getPostalDispatchData(@Req() req: any, @Res() res: any) {
    return this.service.getPostalDispatchData(req, res);
  }

  @Post('getPostalDispatchDataById')
  getPostalDispatchDataById(@Req() req: any, @Res() res: any) {
    return this.service.getPostalDispatchDataById(req, res);
  }

  @Post('deletePostalDispatchDataById')
  deletePostalDispatchDataById(@Req() req: any, @Res() res: any) {
    return this.service.deletePostalDispatchDataById(req, res);
  }

  @Post('deletePostalReceiveDataById')
  deletePostalReceiveDataById(@Req() req: any, @Res() res: any) {
    return this.service.deletePostalReceiveDataById(req, res);
  }

  @Post('getPostalReceiveData')
  getPostalReceiveData(@Req() req: any, @Res() res: any) {
    return this.service.getPostalReceiveData(req, res);
  }

  @Post('getPostalReceiveDataById')
  getPostalReceiveDataById(@Req() req: any, @Res() res: any) {
    return this.service.getPostalReceiveDataById(req, res);
  }

  @Post('UpdatePostalDispatch')
  UpdatePostalDispatch(@Req() req: any, @Res() res: any) {
    return this.service.UpdatePostalDispatch(req, res);
  }

  @Post('addPostalReceive')
  addPostalReceive(@Req() req: any, @Res() res: any) {
    return this.service.addPostalReceive(req, res);
  }

  @Post('UpdatePostalReceive')
  UpdatePostalReceive(@Req() req: any, @Res() res: any) {
    return this.service.UpdatePostalReceive(req, res);
  }

  @Post('getEventNews')
  getEventNews(@Req() req: any, @Res() res: any) {
    return this.service.getEventNews(req, res);
  }

  @Post('addEventNews')
  async addEventNews(@Req() req: any, @Res() res: any) {
    return this.service.addEventNews(req, res);
  }

  @Post('deleteEventNews')
  deleteEventNews(@Req() req: any, @Res() res: any) {
    return this.service.deleteEventNews(req, res);
  }

  @Get('frontOfficeTest')
  frontOfficeTest(@Req() req: any, @Res() res: any) {
    return this.service.frontOfficeTest(req, res);
  }
}
