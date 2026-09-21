import { Controller, Get, Post, Put, Delete, Patch, Req, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("server")
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('login')
  login(@Req() req: any, @Res() res: any) {
    return this.service.login(req, res);
  }

  @Post('adduser')
  adduser(@Req() req: any, @Res() res: any) {
    return this.service.adduser(req, res);
  }

  @Post('changePasswordById')
  changePasswordById(@Req() req: any, @Res() res: any) {
    return this.service.changePasswordById(req, res);
  }

  @Post('deleteUser')
  deleteUser(@Req() req: any, @Res() res: any) {
    return this.service.deleteUser(req, res);
  }

  @Post('changePassword')
  changePassword(@Req() req: any, @Res() res: any) {
    return this.service.changePassword(req, res);
  }

  @Post('getusertoken')
  getusertoken(@Req() req: any, @Res() res: any) {
    return this.service.getusertoken(req, res);
  }

  @Post('getAlluser')
  getAlluser(@Req() req: any, @Res() res: any) {
    return this.service.getAlluser(req, res);
  }

  @Post('getParentLoginInfo')
  getParentLoginInfo(@Req() req: any, @Res() res: any) {
    return this.service.getParentLoginInfo(req, res);
  }

  @Post('getAllParentLoginInfo')
  getAllParentLoginInfo(@Req() req: any, @Res() res: any) {
    return this.service.getAllParentLoginInfo(req, res);
  }

  @Post('updateStudentPass')
  updateStudentPass(@Req() req: any, @Res() res: any) {
    return this.service.updateStudentPass(req, res);
  }

  @Post('updateParentPass')
  updateParentPass(@Req() req: any, @Res() res: any) {
    return this.service.updateParentPass(req, res);
  }

  @Get('AuthTest')
  AuthTest(@Req() req: any, @Res() res: any) {
    return this.service.AuthTest(req, res);
  }
}
