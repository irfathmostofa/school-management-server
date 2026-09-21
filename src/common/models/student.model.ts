import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { BaseModel } from "./base.model";

@Injectable()
export class StudentModel extends BaseModel {
  constructor(db: DatabaseService) {
    super(db, "student");
  }

  findByStudentId(studentId: string) {
    return this.db.query("SELECT * FROM student WHERE student_id = ?", [studentId]);
  }
}
