import { Controller, Get, Post, Put, Delete, Patch, Req, Res } from "@nestjs/common";
import { AdminService } from "./admin.service";

@Controller("server")
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Post('addAcadEvent')
  addAcadEvent(@Req() req: any, @Res() res: any) {
    return this.service.addAcadEvent(req, res);
  }

  @Post('deleteAcadEvent/:event_ID')
  deleteAcadEvent_event_ID(@Req() req: any, @Res() res: any) {
    return this.service.deleteAcadEvent_event_ID(req, res);
  }

  @Post('getAcademicEvent')
  getAcademicEvent(@Req() req: any, @Res() res: any) {
    return this.service.getAcademicEvent(req, res);
  }

  @Post('addtasks')
  async addtasks(@Req() req: any, @Res() res: any) {
    return this.service.addtasks(req, res);
  }

  @Post('edittasks/:task_ID')
  async edittasks_task_ID(@Req() req: any, @Res() res: any) {
    return this.service.edittasks_task_ID(req, res);
  }

  @Post('deletetask')
  deletetask(@Req() req: any, @Res() res: any) {
    return this.service.deletetask(req, res);
  }

  @Post('deletenote')
  deletenote(@Req() req: any, @Res() res: any) {
    return this.service.deletenote(req, res);
  }

  @Post('comments')
  async comments(@Req() req: any, @Res() res: any) {
    return this.service.comments(req, res);
  }

  @Post('addnote')
  async addnote(@Req() req: any, @Res() res: any) {
    return this.service.addnote(req, res);
  }

  @Post('tasks/:taskID/:username')
  tasks_taskID_username(@Req() req: any, @Res() res: any) {
    return this.service.tasks_taskID_username(req, res);
  }

  @Post('comments/:taskID/:isComment')
  comments_taskID_isComment(@Req() req: any, @Res() res: any) {
    return this.service.comments_taskID_isComment(req, res);
  }

  @Post('editnote/:stickyID/')
  editnote_stickyID_(@Req() req: any, @Res() res: any) {
    return this.service.editnote_stickyID_(req, res);
  }

  @Post('taskstatus/:taskID/:userName')
  taskstatus_taskID_userName(@Req() req: any, @Res() res: any) {
    return this.service.taskstatus_taskID_userName(req, res);
  }

  @Post('users')
  users(@Req() req: any, @Res() res: any) {
    return this.service.users(req, res);
  }

  @Post('users/:userName')
  users_userName(@Req() req: any, @Res() res: any) {
    return this.service.users_userName(req, res);
  }

  @Post('tasks/:userName')
  tasks_userName(@Req() req: any, @Res() res: any) {
    return this.service.tasks_userName(req, res);
  }

  @Post('stickynotes/:userName')
  stickynotes_userName(@Req() req: any, @Res() res: any) {
    return this.service.stickynotes_userName(req, res);
  }

  @Post('singletask/:taskID/:userName')
  singletask_taskID_userName(@Req() req: any, @Res() res: any) {
    return this.service.singletask_taskID_userName(req, res);
  }

  @Post('guests/:task_ID')
  guests_task_ID(@Req() req: any, @Res() res: any) {
    return this.service.guests_task_ID(req, res);
  }

  @Post('noteguests')
  noteguests(@Req() req: any, @Res() res: any) {
    return this.service.noteguests(req, res);
  }

  @Post('comments/:taskID')
  comments_taskID(@Req() req: any, @Res() res: any) {
    return this.service.comments_taskID(req, res);
  }

  @Post('addEvents')
  addEvents(@Req() req: any, @Res() res: any) {
    return this.service.addEvents(req, res);
  }

  @Post('getEvents')
  getEvents(@Req() req: any, @Res() res: any) {
    return this.service.getEvents(req, res);
  }

  @Post('addEventsTask')
  addEventsTask(@Req() req: any, @Res() res: any) {
    return this.service.addEventsTask(req, res);
  }

  @Post('getEventsInfoById')
  getEventsInfoById(@Req() req: any, @Res() res: any) {
    return this.service.getEventsInfoById(req, res);
  }

  @Post('getEventsTaskById')
  getEventsTaskById(@Req() req: any, @Res() res: any) {
    return this.service.getEventsTaskById(req, res);
  }

  @Post('UpdateEventsTask')
  UpdateEventsTask(@Req() req: any, @Res() res: any) {
    return this.service.UpdateEventsTask(req, res);
  }

  @Post('addDailytask')
  addDailytask(@Req() req: any, @Res() res: any) {
    return this.service.addDailytask(req, res);
  }

  @Post('getDailyTaskUser')
  getDailyTaskUser(@Req() req: any, @Res() res: any) {
    return this.service.getDailyTaskUser(req, res);
  }

  @Post('getDailyTaskAllUser')
  getDailyTaskAllUser(@Req() req: any, @Res() res: any) {
    return this.service.getDailyTaskAllUser(req, res);
  }

  @Post('getDailyTaskByDate')
  getDailyTaskByDate(@Req() req: any, @Res() res: any) {
    return this.service.getDailyTaskByDate(req, res);
  }

  @Post('UpdateDailyTaskStatus')
  UpdateDailyTaskStatus(@Req() req: any, @Res() res: any) {
    return this.service.UpdateDailyTaskStatus(req, res);
  }

  @Post('addRoute')
  addRoute(@Req() req: any, @Res() res: any) {
    return this.service.addRoute(req, res);
  }

  @Post('getRoute')
  getRoute(@Req() req: any, @Res() res: any) {
    return this.service.getRoute(req, res);
  }

  @Post('getRouteById')
  getRouteById(@Req() req: any, @Res() res: any) {
    return this.service.getRouteById(req, res);
  }

  @Post('DeleteRouteById')
  DeleteRouteById(@Req() req: any, @Res() res: any) {
    return this.service.DeleteRouteById(req, res);
  }

  @Post('AssignRouteEmployee')
  AssignRouteEmployee(@Req() req: any, @Res() res: any) {
    return this.service.AssignRouteEmployee(req, res);
  }

  @Post('geAssignRouteEmployee')
  geAssignRouteEmployee(@Req() req: any, @Res() res: any) {
    return this.service.geAssignRouteEmployee(req, res);
  }

  @Post('getApproveCount')
  getApproveCount(@Req() req: any, @Res() res: any) {
    return this.service.getApproveCount(req, res);
  }
}
