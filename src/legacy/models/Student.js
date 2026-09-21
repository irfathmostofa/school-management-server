const BaseModel = require("./BaseModel");
const { db } = require("../config/database");

class Student extends BaseModel {
  constructor() {
    super("student");
  }

  findByStudentId(studentId) {
    return db.query("SELECT * FROM student WHERE student_id = ?", [studentId]);
  }
}

module.exports = new Student();
