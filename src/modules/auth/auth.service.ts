// @ts-nocheck
import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { TokenService } from "../../common/jwt/jwt.service";
import { UploadService } from "../../common/upload/upload.service";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";

let db: any;
let sign: any;
let verify: any;
let publicDirectory: string;

//

@Injectable()
export class AuthService {
  constructor(
    private readonly database: DatabaseService,
    private readonly tokens: TokenService,
    private readonly upload: UploadService
  ) {
    db = this.database;
    sign = (payload: any, expiresIn?: any) => this.tokens.sign(payload, expiresIn);
    verify = (token: string) => this.tokens.verify(token);
    publicDirectory = this.upload.publicDirectory;
  
  }

  login(req: any, res: any) {
  const { email, password } = req.body;

  db.query(
    "SELECT *FROM users WHERE email = ? OR mobile = ? OR username=?",
    [email, email, email],
    (err, result) => {
      if (err || !result || result.length === 0) {
        res.json({ message: false });
      } else {
        var comp = bcrypt.compareSync(password, result[0].password);

        if (comp) {
          const id = result[0].id;
          const role = result[0].role;
          const username = result[0].username;
          const email = result[0].email;
          const mobile = result[0].mobile;
          const token = sign({ id });
          res.json({ message: true, token: token,role:role,username:username });
        } else {
          res.json({ message: "Phone or password incorrect" });
        }
      }
    }
  );
}

  adduser(req: any, res: any) {
  const {
    username,
    emp_id,
    mobile,
    campus,
    email,
    password,
    role,
    status,
    full_name,
    user_type,
  } = req.body;
  pass = bcrypt.hashSync(password, 10);
  db.query("SELECT *FROM users WHERE emp_id=?", emp_id, (err, empCheck) => {
    if (err) {
      return res.json({ alert: "Unable to add user", message: err });
    }
    if (empCheck.length > 0) {
      res.json({ alert: "Employee already exists", message: err });
    } else {
      db.query(
        "INSERT INTO users SET ? ",
        {
          username,
          emp_id,
          mobile,
          campus,
          email,
          password: pass,
          role,
          status: "",
          full_name,
          user_type,
        },
        (err, result) => {
          if (err) {
            res.json({ message: err });
          } else {
            const id = result.insertId;
            const token = sign({ id });
            res.json({ message: true, token: token });
          }
        }
      );
    }
  });
}

  changePasswordById(req: any, res: any) {
  const { id, password } = req.body;
  const pass = bcrypt.hashSync(password, 10);
  db.query(
    "UPDATE users SET ? WHERE id=?",
    [{ password: pass }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  deleteUser(req: any, res: any) {
  const { id } = req.body;
  const sql = `DELETE FROM users WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: "User has been successfully deleted." });
    }
  });
}

  changePassword(req: any, res: any) {
  const { emp_id, oldPassword, newPassword } = req.body;

  db.query("SELECT *FROM users WHERE emp_id=?", emp_id, (err, result) => {
    if (result.length > 0) {
      var comp = bcrypt.compareSync(oldPassword, result[0].password);
      if (comp) {
        const pass = bcrypt.hashSync(newPassword, 10);
        db.query(
          "UPDATE users SET ? WHERE emp_id=?",
          [{ password: pass }, emp_id],
          (err, result) => {
            if (err) {
              res.json({ ok: false, message: err });
            } else {
              res.json({ ok: true, message: "Password changed Successfully" });
            }
          }
        );
      } else {
        res.json({ ok: false, message: "Old password incorrect" });
      }
    } else {
      res.json({ ok: false, message: "User not found" });
    }
  });
}

  getusertoken(req: any, res: any) {
  const { token } = req.body;
  const decoded = verify(token);
  const id = decoded && decoded.id ? decoded.id : 0;
  db.query("SELECT *FROM users WHERE id=?", id, (err, result) => {
    if (err || !result || result.length === 0) {
      return res.json({ ok: false, message: "User not found" });
    }
    const empId = result[0].emp_id;
    db.query("SELECT *FROM employee WHERE emp_id=?", empId, (err, result2) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: result, emp: result2 });
      }
    });
  });
}

  getAlluser(req: any, res: any) {
  db.query("SELECT *FROM users", (err, result) => {
    res.json({ message: result });
  });
}

  getParentLoginInfo(req: any, res: any) {
  const { student_id } = req.body;

  const sql = `
    SELECT phone, parents_name FROM parent_login_information WHERE student_id = ?
  `;

  db.query(sql, [student_id], (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  });
}

  getAllParentLoginInfo(req: any, res: any) {
  db.query("SELECT student_id, phone FROM parent_login_information", (err, result) => {
    if (err) {
      return res.json({ message: err });
    }
    
    return res.json({ message: result });
  });
}

  updateStudentPass(req: any, res: any) {
  const { student_id, student_name, pass } = req.body;
  let password = bcrypt.hashSync(pass, 10);
  const studentData = { student_id, student_name, password };

  const sql = `
    INSERT INTO student_login_information 
    SET ?
    ON DUPLICATE KEY UPDATE
    password = VALUES(password)
  `;

  db.query(sql, studentData, (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
}

  updateParentPass(req: any, res: any) {
  const { student_id, parents_name, phone, pass } = req.body;
  let password = bcrypt.hashSync(pass, 10);
  const ParentData = { student_id, parents_name, phone, password };

  const sql = `
    INSERT INTO parent_login_information 
    SET ?
    ON DUPLICATE KEY UPDATE
    phone = VALUES(phone),
    password = VALUES(password)
  `;

  db.query(sql, ParentData, (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      db.query(
        "UPDATE parent_login_information SET password =? WHERE phone=?",
        [password, phone],
        (err, result) => {
          if (err) {
            res.json({ message: err });
          } else {
            res.json({ message: true });
          }
        }
      );
    }
  });
}

  AuthTest(req: any, res: any) {
  res.send("Auth");
}
}
