import { Module } from "@nestjs/common";
import { AttendanceDeviceController } from "./attendance-device.controller";
import { AttendanceDeviceService } from "./attendance-device.service";

@Module({
  controllers: [AttendanceDeviceController],
  providers: [AttendanceDeviceService],
  exports: [AttendanceDeviceService],
})
export class AttendanceDeviceModule {}
