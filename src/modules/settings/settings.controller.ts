import { Controller, Get, Post, Put, Delete, Patch, Req, Res } from "@nestjs/common";
import { SettingsService } from "./settings.service";

@Controller("server")
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Post('changeActiveSession')
  changeActiveSession(@Req() req: any, @Res() res: any) {
    return this.service.changeActiveSession(req, res);
  }

  @Post('addBulkUser')
  addBulkUser(@Req() req: any, @Res() res: any) {
    return this.service.addBulkUser(req, res);
  }

  @Post('updateNotifyStatus')
  updateNotifyStatus(@Req() req: any, @Res() res: any) {
    return this.service.updateNotifyStatus(req, res);
  }

  @Post('updateCallStatus')
  updateCallStatus(@Req() req: any, @Res() res: any) {
    return this.service.updateCallStatus(req, res);
  }

  @Post('addCampus')
  addCampus(@Req() req: any, @Res() res: any) {
    return this.service.addCampus(req, res);
  }

  @Post('addschool')
  addschool(@Req() req: any, @Res() res: any) {
    return this.service.addschool(req, res);
  }

  @Post('getschool')
  getschool(@Req() req: any, @Res() res: any) {
    return this.service.getschool(req, res);
  }

  @Post('updateSchoolById')
  updateSchoolById(@Req() req: any, @Res() res: any) {
    return this.service.updateSchoolById(req, res);
  }

  @Post('DeleteSchoolById')
  DeleteSchoolById(@Req() req: any, @Res() res: any) {
    return this.service.DeleteSchoolById(req, res);
  }

  @Post('getCampus')
  getCampus(@Req() req: any, @Res() res: any) {
    return this.service.getCampus(req, res);
  }

  @Get('settingTest')
  settingTest(@Req() req: any, @Res() res: any) {
    return this.service.settingTest(req, res);
  }

  @Post('addRole')
  addRole(@Req() req: any, @Res() res: any) {
    return this.service.addRole(req, res);
  }

  @Post('getRole')
  getRole(@Req() req: any, @Res() res: any) {
    return this.service.getRole(req, res);
  }

  @Post('getroleByID')
  getroleByID(@Req() req: any, @Res() res: any) {
    return this.service.getroleByID(req, res);
  }

  @Post('addprivileges')
  addprivileges(@Req() req: any, @Res() res: any) {
    return this.service.addprivileges(req, res);
  }

  @Post('getprivileges')
  getprivileges(@Req() req: any, @Res() res: any) {
    return this.service.getprivileges(req, res);
  }

  @Post('getprivilegesByID')
  getprivilegesByID(@Req() req: any, @Res() res: any) {
    return this.service.getprivilegesByID(req, res);
  }

  @Post('UpdatePrivilegeByRole')
  UpdatePrivilegeByRole(@Req() req: any, @Res() res: any) {
    return this.service.UpdatePrivilegeByRole(req, res);
  }

  @Post('UpdateCampusById')
  UpdateCampusById(@Req() req: any, @Res() res: any) {
    return this.service.UpdateCampusById(req, res);
  }

  @Post('DeleteCampusById')
  DeleteCampusById(@Req() req: any, @Res() res: any) {
    return this.service.DeleteCampusById(req, res);
  }

  @Post('getNotificationForStudent')
  getNotificationForStudent(@Req() req: any, @Res() res: any) {
    return this.service.getNotificationForStudent(req, res);
  }

  @Post('UpdateReadNotification')
  UpdateReadNotification(@Req() req: any, @Res() res: any) {
    return this.service.UpdateReadNotification(req, res);
  }
}
