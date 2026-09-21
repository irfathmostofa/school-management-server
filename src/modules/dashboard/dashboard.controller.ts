import { Controller, Get, Post, Put, Delete, Patch, Req, Res } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";

@Controller("server")
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Post('getDashboardMonthlyFeesData')
  getDashboardMonthlyFeesData(@Req() req: any, @Res() res: any) {
    return this.service.getDashboardMonthlyFeesData(req, res);
  }

  @Post('getDashboardLeaveRequest')
  getDashboardLeaveRequest(@Req() req: any, @Res() res: any) {
    return this.service.getDashboardLeaveRequest(req, res);
  }

  @Post('getDashboardExpenseData')
  getDashboardExpenseData(@Req() req: any, @Res() res: any) {
    return this.service.getDashboardExpenseData(req, res);
  }

  @Post('getDashboardUnPaidFeesData')
  getDashboardUnPaidFeesData(@Req() req: any, @Res() res: any) {
    return this.service.getDashboardUnPaidFeesData(req, res);
  }

  @Post('getDashboardEventNews')
  getDashboardEventNews(@Req() req: any, @Res() res: any) {
    return this.service.getDashboardEventNews(req, res);
  }

  @Post('dashboardStat')
  async dashboardStat(@Req() req: any, @Res() res: any) {
    return this.service.dashboardStat(req, res);
  }

  @Post('dashboardStatForEmployee')
  async dashboardStatForEmployee(@Req() req: any, @Res() res: any) {
    return this.service.dashboardStatForEmployee(req, res);
  }

  @Post('dashboardStatForStudents')
  async dashboardStatForStudents(@Req() req: any, @Res() res: any) {
    return this.service.dashboardStatForStudents(req, res);
  }

  @Post('sidebarBadgeCount')
  async sidebarBadgeCount(@Req() req: any, @Res() res: any) {
    return this.service.sidebarBadgeCount(req, res);
  }

  @Post('DailyAttendanceInfo')
  DailyAttendanceInfo(@Req() req: any, @Res() res: any) {
    return this.service.DailyAttendanceInfo(req, res);
  }

  @Post('DailyAttendanceForClassSection')
  DailyAttendanceForClassSection(@Req() req: any, @Res() res: any) {
    return this.service.DailyAttendanceForClassSection(req, res);
  }

  @Post('DailyLessonPlanForClassSection')
  DailyLessonPlanForClassSection(@Req() req: any, @Res() res: any) {
    return this.service.DailyLessonPlanForClassSection(req, res);
  }

  @Post('DailyClassTestForClassSection')
  DailyClassTestForClassSection(@Req() req: any, @Res() res: any) {
    return this.service.DailyClassTestForClassSection(req, res);
  }

  @Post('DailyHomeworkForClassSection')
  DailyHomeworkForClassSection(@Req() req: any, @Res() res: any) {
    return this.service.DailyHomeworkForClassSection(req, res);
  }

  @Get('dashboardTest')
  dashboardTest(@Req() req: any, @Res() res: any) {
    return this.service.dashboardTest(req, res);
  }
}
