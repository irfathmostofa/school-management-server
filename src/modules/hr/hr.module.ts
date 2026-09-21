import { Module } from "@nestjs/common";
import { HrController } from "./hr.controller";
import { HrService } from "./hr.service";
import { StaffController } from "./staff.controller";
import { StaffService } from "./staff.service";

@Module({
  controllers: [HrController, StaffController],
  providers: [HrService, StaffService],
  exports: [HrService, StaffService],
})
export class HrModule {}
