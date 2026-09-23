import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import { join } from "path";

@Controller()
export class AppController {
  @Get("server/test")
  test(@Res() res: Response) {
    res.send("<h1>No Error test</h1>");
  }

  @Get("docs")
  docs(@Res() res: Response) {
    res.sendFile(join(process.cwd(), "public", "docs", "index.html"));
  }

  @Get("docs/frontend")
  frontendDocs(@Res() res: Response) {
    res.sendFile(join(process.cwd(), "public", "docs", "frontend.html"));
  }
}
