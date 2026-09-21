import * as dotenv from "dotenv";
dotenv.config();

import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { json, urlencoded } from "express";
import fileUpload from "express-fileupload";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  app.use(urlencoded({ extended: true, limit: "20mb" }));
  app.use(json({ limit: "20mb" }));
  app.enableCors({ origin: "*", optionsSuccessStatus: 200 });
  app.use(
    fileUpload({
      createParentPath: true,
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = Number(process.env.PORT) || 5000;
  await app.listen(port);
  console.log(`SERVER RUNNING on port ${port}`);
}

bootstrap();
