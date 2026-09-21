import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { BaseModel } from "./base.model";

@Injectable()
export class EmployeeModel extends BaseModel {
  constructor(db: DatabaseService) {
    super(db, "employee");
  }

  findByEmpId(empId: string) {
    return this.db.query("SELECT * FROM employee WHERE emp_id = ?", [empId]);
  }
}
