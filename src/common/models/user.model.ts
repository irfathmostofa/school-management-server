import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { BaseModel } from "./base.model";

@Injectable()
export class UserModel extends BaseModel {
  constructor(db: DatabaseService) {
    super(db, "users");
  }

  findByLogin(value: string) {
    return this.db.query(
      "SELECT * FROM users WHERE email = ? OR mobile = ? OR username = ?",
      [value, value, value],
    );
  }

  findByEmpId(empId: string) {
    return this.db.query("SELECT * FROM users WHERE emp_id = ?", [empId]);
  }
}
