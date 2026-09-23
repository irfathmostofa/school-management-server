import { Controller, Post, Req, Res } from "@nestjs/common";
import { AttendanceDeviceService } from "./attendance-device.service";

@Controller("server")
export class AttendanceDeviceController {
  constructor(private readonly service: AttendanceDeviceService) {}

  @Post("addAttendanceDeviceSetting")
  addAttendanceDeviceSetting(@Req() req: any, @Res() res: any) {
    return this.service.addAttendanceDeviceSetting(req, res);
  }

  @Post("getAttendanceDeviceSetting")
  getAttendanceDeviceSetting(@Req() req: any, @Res() res: any) {
    return this.service.getAttendanceDeviceSetting(req, res);
  }

  @Post("getAttendanceDeviceSettingById")
  getAttendanceDeviceSettingById(@Req() req: any, @Res() res: any) {
    return this.service.getAttendanceDeviceSettingById(req, res);
  }

  @Post("updateAttendanceDeviceSetting")
  updateAttendanceDeviceSetting(@Req() req: any, @Res() res: any) {
    return this.service.updateAttendanceDeviceSetting(req, res);
  }

  @Post("connectAttendanceDevice")
  connectAttendanceDevice(@Req() req: any, @Res() res: any) {
    return this.service.connectAttendanceDevice(req, res);
  }

  @Post("disconnectAttendanceDevice")
  disconnectAttendanceDevice(@Req() req: any, @Res() res: any) {
    return this.service.disconnectAttendanceDevice(req, res);
  }

  @Post("updateAttendanceDeviceSyncRule")
  updateAttendanceDeviceSyncRule(@Req() req: any, @Res() res: any) {
    return this.service.updateAttendanceDeviceSyncRule(req, res);
  }

  @Post("syncAttendanceDevice")
  syncAttendanceDevice(@Req() req: any, @Res() res: any) {
    return this.service.syncAttendanceDevice(req, res);
  }
}
