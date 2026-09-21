const { db } = require("../config/database");

class BaseModel {
  constructor(table) {
    this.table = table;
  }

  query(sql, params) {
    return db.query(sql, params);
  }

  findAll() {
    return db.query(`SELECT * FROM ${this.table}`);
  }

  findById(id, column = "id") {
    return db.query(`SELECT * FROM ${this.table} WHERE ${column} = ?`, [id]);
  }

  create(data) {
    return db.query(`INSERT INTO ${this.table} SET ?`, data);
  }

  updateById(id, data, column = "id") {
    return db.query(`UPDATE ${this.table} SET ? WHERE ${column} = ?`, [data, id]);
  }

  deleteById(id, column = "id") {
    return db.query(`DELETE FROM ${this.table} WHERE ${column} = ?`, [id]);
  }
}

module.exports = BaseModel;
