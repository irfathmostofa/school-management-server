// @ts-nocheck
import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { UploadService } from "../../common/upload/upload.service";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";

let db: any;
let publicDirectory: string;

//Role

// privileges

@Injectable()
export class SettingsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly upload: UploadService
  ) {
    db = this.database;
    publicDirectory = this.upload.publicDirectory;
  
  }

  changeActiveSession(req: any, res: any) {
  const { id } = req.body;

  db.query(
    "UPDATE session SET status = ? WHERE id != ?",
    [0, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        db.query(
          "UPDATE session SET status = ? WHERE id = ?",
          [1, id],
          (err, result) => {
            if (err) {
              res.json({ message: err });
            } else {
              res.json({ message: true });
            }
          }
        );
      }
    }
  );
}

  addBulkUser(req: any, res: any) {
  const { selectedCSVData } = req.body;

  const checkIfExistsPromises = selectedCSVData.map((user) => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT COUNT(*) as count FROM users WHERE emp_id = ?",
        [user.emp_id],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            const count = result[0].count;
            resolve(count > 0);
          }
        }
      );
    });
  });

  Promise.all(checkIfExistsPromises)
    .then((results) => {
      const recordsToInsert = selectedCSVData;

      if (recordsToInsert.length === 0) {
        return res.json({
          ok: true,
          message: "No new user records to insert",
        });
      }

      const query = `
      INSERT INTO users (
        username,
          emp_id,
          mobile,
          email,
          password,
          role,
          status,
          full_name,
          user_type
      )
      VALUES ?
      ON DUPLICATE KEY UPDATE
        username = VALUES(username),
        emp_id = VALUES(emp_id),
        mobile = VALUES(mobile),
        email = VALUES(email),
        password = VALUES(password),
        role = VALUES(role),
        status = VALUES(status),
        full_name = VALUES(full_name),
        user_type = VALUES(user_type)
    `;

      const values = recordsToInsert.map((user) => [
        user.username,
        user.emp_id,
        user.mobile,
        user.email,
        bcrypt.hashSync(user.emp_id, 10),
        user.role,
        user.status,
        user.full_name,
        user.user_type,
      ]);
      db.query(query, [values], (err, result) => {
        if (err) {
          console.error(err);
          res.json({
            ok: false,
            message: "Error occurred while adding bulk attendance",
            results: err,
          });
        } else {
          res.json({
            ok: true,
            message: "All Attendance Added",
            result: result,
          });
        }
      });
    })
    .catch((err) => {
      console.error(err);
      res.json({
        ok: false,
        message: "Error occurred while checking for existing records",
        results: err,
      });
    });
}

  updateNotifyStatus(req: any, res: any) {
  const { id, isNotify } = req.body;
  db.query(
    "UPDATE admission SET ? WHERE id = ?",
    [{ isNotify: isNotify }, id],
    (err, result) => {
      res.json({ message: result });
    }
  );
}

  updateCallStatus(req: any, res: any) {
  const { id, isCall } = req.body;
  db.query(
    "UPDATE admission SET ? WHERE id = ?",
    [{ isCall: isCall }, id],
    (err, result) => {
      res.json({ message: result });
    }
  );
}

  addCampus(req: any, res: any) {
  const { campus_name } = req.body;
  const now = new Date();
  const dhakaTime = new Date(now.getTime() + (6 * 60 * 60 * 1000)).toISOString().slice(0, 19).replace('T', ' ');

  const newCampus = {
    campus_name: campus_name,
    create_date: dhakaTime,
  };

  db.query(
    "INSERT INTO campus SET ?",
    newCampus,
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  addschool(req: any, res: any) {
  const { school } = req.body;
  db.query(
    "INSERT INTO school SET ?",
    {
      school,
      status: "",
    },
    (err, result) => {
     res.json({ message: true });
    }
  );
}

  getschool(req: any, res: any) {
  db.query("SELECT *FROM school", (err, result) => {
    res.json({ message: result });
  });
}

  updateSchoolById(req: any, res: any) {
  const { id, schoolName } = req.body;
  
  if (!id || !schoolName) {
    return res.status(400).json({ message: "Missing id or schoolName in request body.",ok:false });
  }

  const query = "UPDATE school SET school = ? WHERE id = ?";
  
  db.query(query, [schoolName, id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error updating school.", error: err,ok:false });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "School not found.",ok:false });
    }

    res.json({ message: "School updated successfully.",ok:true });
  });
}

  DeleteSchoolById(req: any, res: any) {
  const { id } = req.body;
  
  if (!id) {
    return res.status(400).json({ message: "Missing id in request body.",ok:false });
  }

  const query = "DELETE FROM school WHERE id = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error deleting school.", error: err,ok:false });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "School not found.",ok:false });
    }

    res.json({ message: "School deleted successfully.",ok:true });
  });
}

  getCampus(req: any, res: any) {
  db.query("SELECT *FROM campus", (err, result) => {
    res.json({ message: result });
  });
}

  settingTest(req: any, res: any) {
  res.send("Setting");
}

  addRole(req: any, res: any) {
  const { roleName } = req.body;
  db.query("INSERT INTO role SET ?", { roleName }, (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
}

  getRole(req: any, res: any) {
  db.query("SELECT *FROM role", (err, result) => {
    res.json({ message: result });
  });
}

  getroleByID(req: any, res: any) {
  const { id } = req.body;
  db.query("SELECT *FROM role WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
}

  addprivileges(req: any, res: any) {
  const { role, create, read, update, dlt } = req.body;
  db.query("SELECT *FROM privileges WHERE role=?", role, (err, result) => {
    if (result.length > 0) {
      res.json({ message: "already Exist" });
    } else {
      db.query(
        "INSERT INTO privileges SET ?",
        { role, create, read, update, dlt },
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

  getprivileges(req: any, res: any) {
  db.query("SELECT *FROM privileges", (err, result) => {
    res.json({ message: result });
  });
}

  getprivilegesByID(req: any, res: any) {
  const { role } = req.body;
  db.query("SELECT *FROM privileges WHERE role=?", role, (err, result) => {
    res.json({ message: result });
  });
}

  UpdatePrivilegeByRole(req: any, res: any) {
  const { role, create, read, update, dlt } = req.body;
  db.query(
    "UPDATE privileges SET ? WHERE role=?",
    [{ create, read, update, dlt }, role],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  UpdateCampusById(req: any, res: any) {
  const { id,name } = req.body;
   const now = new Date();
  const dhakaTime = new Date(now.getTime() + (6 * 60 * 60 * 1000)).toISOString().slice(0, 19).replace('T', ' ');
  db.query(
    "UPDATE campus SET ? WHERE campus_id=?",
    [{ campus_name:name, update_date:dhakaTime }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  DeleteCampusById(req: any, res: any) {
  const {id} = req.body;
  db.query("DELETE FROM campus WHERE campus_id=?",[id],(err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  getNotificationForStudent(req: any, res: any) {
  const { studentId, page = 1 } = req.body;
  const limit = 10;
  const offset = (page - 1) * limit;

  const countQuery = "SELECT COUNT(*) AS total FROM notifications WHERE user = ?";
  db.query(countQuery, [studentId], (countErr, countResult) => {
    if (countErr) {
      return res.status(500).json({ message: "Count query error", error: countErr });
    }

    const totalNotifications = countResult[0].total;
    const totalPages = Math.ceil(totalNotifications / limit);

    const dataQuery = `
      SELECT *
      FROM notifications
      WHERE user = ?
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    db.query(dataQuery, [studentId, limit, offset], (dataErr, notifications) => {
      if (dataErr) {
        return res.status(500).json({ message: "Data query error", error: dataErr });
      }

      res.json({
        currentPage: page,
        totalPages: totalPages,
        totalNotifications: totalNotifications,
        notifications: notifications
      });
    });
  });
}

  UpdateReadNotification(req: any, res: any) {
  const { id } = req.body;
  db.query(
    "UPDATE notifications SET ? WHERE id=?",
    [{ readMsg:'true' }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}
}
