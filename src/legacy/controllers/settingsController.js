const { db } = require("../models");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const publicDirectory = path.join(__dirname, "../public");

exports.changeActiveSession = (req, res) => {
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
exports.addBulkUser = (req, res) => {
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

exports.updateNotifyStatus = (req, res) => {
  const { id, isNotify } = req.body;
  db.query(
    "UPDATE admission SET ? WHERE id = ?",
    [{ isNotify: isNotify }, id],
    (err, result) => {
      res.json({ message: result });
    }
  );
}

exports.updateCallStatus = (req, res) => {
  const { id, isCall } = req.body;
  db.query(
    "UPDATE admission SET ? WHERE id = ?",
    [{ isCall: isCall }, id],
    (err, result) => {
      res.json({ message: result });
    }
  );
}

exports.addCampus = (req, res) => {
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

exports.addschool = (req, res) => {
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

exports.getschool = (req, res) => {
  db.query("SELECT *FROM school", (err, result) => {
    res.json({ message: result });
  });
}

exports.updateSchoolById = (req, res) => {
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


exports.DeleteSchoolById = (req, res) => {
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


exports.getCampus = (req, res) => {
  db.query("SELECT *FROM campus", (err, result) => {
    res.json({ message: result });
  });
}

exports.settingTest = (req, res) => {
  res.send("Setting");
}
exports.addRole = (req, res) => {
  const { roleName } = req.body;
  db.query("INSERT INTO role SET ?", { roleName }, (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
}

exports.getRole = (req, res) => {
  db.query("SELECT *FROM role", (err, result) => {
    res.json({ message: result });
  });
}

exports.getroleByID = (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM role WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
}
//Role

// privileges

exports.addprivileges = (req, res) => {
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

exports.getprivileges = (req, res) => {
  db.query("SELECT *FROM privileges", (err, result) => {
    res.json({ message: result });
  });
}

exports.getprivilegesByID = (req, res) => {
  const { role } = req.body;
  db.query("SELECT *FROM privileges WHERE role=?", role, (err, result) => {
    res.json({ message: result });
  });
}

exports.UpdatePrivilegeByRole = (req, res) => {
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

exports.UpdateCampusById = (req, res) => {
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

exports.DeleteCampusById = (req, res) => {
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

exports.getNotificationForStudent = (req, res) => {
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

exports.UpdateReadNotification = (req, res) => {
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
