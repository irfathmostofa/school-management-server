const BaseModel = require("./BaseModel");
const { db } = require("../config/database");

class User extends BaseModel {
  constructor() {
    super("users");
  }

  findByLogin(value) {
    return db.query(
      "SELECT * FROM users WHERE email = ? OR mobile = ? OR username = ?",
      [value, value, value]
    );
  }

  findByEmpId(empId) {
    return db.query("SELECT * FROM users WHERE emp_id = ?", [empId]);
  }
}

module.exports = new User();
