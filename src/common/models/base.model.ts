import { DatabaseService } from "../database/database.service";

export class BaseModel {
  constructor(
    protected readonly db: DatabaseService,
    protected readonly table: string,
  ) {}

  query(sql: string, params?: any) {
    return this.db.query(sql, params);
  }

  findAll() {
    return this.db.query(`SELECT * FROM ${this.table}`);
  }

  findById(id: any, column = "id") {
    return this.db.query(`SELECT * FROM ${this.table} WHERE ${column} = ?`, [id]);
  }

  create(data: Record<string, any>) {
    return this.db.query(`INSERT INTO ${this.table} SET ?`, data);
  }

  updateById(id: any, data: Record<string, any>, column = "id") {
    return this.db.query(`UPDATE ${this.table} SET ? WHERE ${column} = ?`, [data, id]);
  }

  deleteById(id: any, column = "id") {
    return this.db.query(`DELETE FROM ${this.table} WHERE ${column} = ?`, [id]);
  }
}
