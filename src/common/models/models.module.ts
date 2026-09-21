import { Global, Module } from "@nestjs/common";
import { UserModel } from "./user.model";
import { StudentModel } from "./student.model";
import { EmployeeModel } from "./employee.model";

@Global()
@Module({
  providers: [UserModel, StudentModel, EmployeeModel],
  exports: [UserModel, StudentModel, EmployeeModel],
})
export class ModelsModule {}
