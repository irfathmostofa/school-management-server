import { Module } from "@nestjs/common";
import { StadController } from "./stad.controller";
import { StadService } from "./stad.service";

@Module({
  controllers: [StadController],
  providers: [StadService],
  exports: [StadService],
})
export class StadModule {}
