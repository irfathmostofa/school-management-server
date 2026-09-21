import { Controller, Get, Post, Put, Delete, Patch, Req, Res } from "@nestjs/common";
import { PaymentService } from "./payment.service";

@Controller("server/payment")
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Post('initiatePayment')
  async initiatePayment(@Req() req: any, @Res() res: any) {
    return this.service.initiatePayment(req, res);
  }

  @Post('callback')
  async callback(@Req() req: any, @Res() res: any) {
    return this.service.callback(req, res);
  }

  @Get('')
  get(@Req() req: any, @Res() res: any) {
    return this.service.get(req, res);
  }
}
