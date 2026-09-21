// @ts-nocheck
import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

let db: any;

@Injectable()
export class ManagementService {
  constructor(
    private readonly database: DatabaseService
  ) {
    db = this.database;
  
  }

  get(req: any, res: any) {
  res.send("Server is Running");
}
}
