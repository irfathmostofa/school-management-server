const BaseModel = require("./BaseModel");
const { db } = require("../config/database");

class Employee extends BaseModel {
  constructor() {
    super("employee");
  }

  findByEmpId(empId) {
    return db.query("SELECT * FROM employee WHERE emp_id = ?", [empId]);
  }
}

module.exports = new Employee();
