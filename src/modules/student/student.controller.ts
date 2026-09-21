import { Controller, Get, Post, Put, Delete, Patch, Req, Res } from "@nestjs/common";
import { StudentService } from "./student.service";

@Controller("server/student")
export class StudentController {
  constructor(private readonly service: StudentService) {}

  @Post('getstudentParenttoken')
  getstudentParenttoken(@Req() req: any, @Res() res: any) {
    return this.service.getstudentParenttoken(req, res);
  }

  @Post('studentParentLogin')
  studentParentLogin(@Req() req: any, @Res() res: any) {
    return this.service.studentParentLogin(req, res);
  }

  @Post('updatePassword')
  updatePassword(@Req() req: any, @Res() res: any) {
    return this.service.updatePassword(req, res);
  }

  @Post('getParentsChild')
  getParentsChild(@Req() req: any, @Res() res: any) {
    return this.service.getParentsChild(req, res);
  }

  @Post('getStudentDashboardbyID')
  getStudentDashboardbyID(@Req() req: any, @Res() res: any) {
    return this.service.getStudentDashboardbyID(req, res);
  }

  @Post('getStudentPreviousSession')
  getStudentPreviousSession(@Req() req: any, @Res() res: any) {
    return this.service.getStudentPreviousSession(req, res);
  }

  @Post('getHomeWorkList')
  async getHomeWorkList(@Req() req: any, @Res() res: any) {
    return this.service.getHomeWorkList(req, res);
  }

  @Post('getClassWorkList')
  async getClassWorkList(@Req() req: any, @Res() res: any) {
    return this.service.getClassWorkList(req, res);
  }

  @Post('getClassTestList')
  async getClassTestList(@Req() req: any, @Res() res: any) {
    return this.service.getClassTestList(req, res);
  }

  @Post('getStudentAttendanceByID')
  getStudentAttendanceByID(@Req() req: any, @Res() res: any) {
    return this.service.getStudentAttendanceByID(req, res);
  }

  @Post('getSubjectList')
  getSubjectList(@Req() req: any, @Res() res: any) {
    return this.service.getSubjectList(req, res);
  }

  @Post('getSchoolName')
  getSchoolName(@Req() req: any, @Res() res: any) {
    return this.service.getSchoolName(req, res);
  }

  @Post('getStudentClasssRoutine')
  getStudentClasssRoutine(@Req() req: any, @Res() res: any) {
    return this.service.getStudentClasssRoutine(req, res);
  }

  @Post('getStudentDiary')
  getStudentDiary(@Req() req: any, @Res() res: any) {
    return this.service.getStudentDiary(req, res);
  }

  @Post('getStudentExtraClass')
  getStudentExtraClass(@Req() req: any, @Res() res: any) {
    return this.service.getStudentExtraClass(req, res);
  }

  @Post('getStudentLibraryItem')
  getStudentLibraryItem(@Req() req: any, @Res() res: any) {
    return this.service.getStudentLibraryItem(req, res);
  }

  @Post('getStudentEventNews')
  getStudentEventNews(@Req() req: any, @Res() res: any) {
    return this.service.getStudentEventNews(req, res);
  }

  @Post('getStudentAcademicCalendarNew')
  getStudentAcademicCalendarNew(@Req() req: any, @Res() res: any) {
    return this.service.getStudentAcademicCalendarNew(req, res);
  }

  @Post('getStudentAcademicCalendar')
  getStudentAcademicCalendar(@Req() req: any, @Res() res: any) {
    return this.service.getStudentAcademicCalendar(req, res);
  }

  @Post('getStudentIncomeById')
  getStudentIncomeById(@Req() req: any, @Res() res: any) {
    return this.service.getStudentIncomeById(req, res);
  }

  @Post('updateDeviceToken')
  updateDeviceToken(@Req() req: any, @Res() res: any) {
    return this.service.updateDeviceToken(req, res);
  }

  @Post('getStudentAttendanceDevice')
  getStudentAttendanceDevice(@Req() req: any, @Res() res: any) {
    return this.service.getStudentAttendanceDevice(req, res);
  }

  @Get('')
  get(@Req() req: any, @Res() res: any) {
    return this.service.get(req, res);
  }
}
