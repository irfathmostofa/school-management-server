import { Controller, Get, Post, Put, Delete, Patch, Req, Res } from "@nestjs/common";
import { ManagementService } from "./management.service";

@Controller("server")
export class ManagementController {
  constructor(private readonly service: ManagementService) {}

  @Get('')
  get(@Req() req: any, @Res() res: any) {
    return this.service.get(req, res);
  }
}
