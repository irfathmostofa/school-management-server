import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import appConfig from "./common/config/app.config";
import { DatabaseModule } from "./common/database/database.module";
import { TokenModule } from "./common/jwt/jwt.module";
import { UploadModule } from "./common/upload/upload.module";
import { NotificationModule } from "./common/notification/notification.module";
import { ModelsModule } from "./common/models/models.module";
import { SmsModule } from "./common/sms/sms.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AdminModule } from "./modules/admin/admin.module";
import { AcademicModule } from "./modules/academic/academic.module";
import { AccountModule } from "./modules/account/account.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { FeesModule } from "./modules/fees/fees.module";
import { FrontOfficeModule } from "./modules/front-office/front-office.module";
import { HrModule } from "./modules/hr/hr.module";
import { PaymentModule } from "./modules/payment/payment.module";
import { ProcurementModule } from "./modules/procurement/procurement.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { StadModule } from "./modules/stad/stad.module";
import { StoreInventoryModule } from "./modules/store-inventory/store-inventory.module";
import { StudentModule } from "./modules/student/student.module";
import { ManagementModule } from "./modules/management/management.module";
import { AppController } from "./app.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    ServeStaticModule.forRoot(
      { rootPath: join(process.cwd(), "public"), serveRoot: "/" },
      { rootPath: join(process.cwd(), "public", "image"), serveRoot: "/image" },
      { rootPath: join(process.cwd(), "public", "doTask"), serveRoot: "/doTask" },
      {
        rootPath: join(process.cwd(), "public", "RecruitmentApplicantCV"),
        serveRoot: "/RecruitmentApplicantCV",
      },
      { rootPath: join(process.cwd(), "public", "csv"), serveRoot: "/csv" },
      { rootPath: join(process.cwd(), "public", "temp"), serveRoot: "/temp" },
    ),
    DatabaseModule,
    TokenModule,
    UploadModule,
    NotificationModule,
    ModelsModule,
    SmsModule,
    AuthModule,
    AdminModule,
    AcademicModule,
    AccountModule,
    DashboardModule,
    FeesModule,
    FrontOfficeModule,
    HrModule,
    PaymentModule,
    ProcurementModule,
    SettingsModule,
    StadModule,
    StoreInventoryModule,
    StudentModule,
    ManagementModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
