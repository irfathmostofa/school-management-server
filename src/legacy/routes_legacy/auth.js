const express = require("express");
const router = express.Router();
const cors = require("cors");
const mysql = require("mysql");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const db = require("../database.js");
const publicDirectory = path.join(__dirname, '../public');

router.use(express.static(publicDirectory));

router.use("image", express.static(publicDirectory + "/image"));

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // For legacy browser support
};

router.use(cors(corsOptions));

const db = mysql.createConnection({
  host: "localhost",
  user: "rooh_db",
  password: "7qcqZQ7FTm46TWA?",
  database: "rooh_db",
  timezone: "utc",
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT *FROM users WHERE email = ? OR mobile = ? OR username=?",
    [email, email, email],
    (err, result) => {
      if (result.length === 0) {
        res.json({ message: false });
      } else {
        var comp = bcrypt.compareSync(password, result[0].password);

        if (comp) {
          const id = result[0].id;
          const role = result[0].role;
          const username = result[0].username;
          const email = result[0].email;
          const mobile = result[0].mobile;
          const token = jwt.sign({ id }, "mysupersecretpassword", {
            expiresIn: "1d",
          });
          res.json({ message: true, token: token,role:role,username:username });
        } else {
          res.json({ message: "Phone or password incorrect" });
        }
      }
    }
  );
});

router.post("/adduser", (req, res) => {
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
            const token = jwt.sign({ id }, "mysupersecretpassword", {
              expiresIn: "1d",
            });
            res.json({ message: true, token: token });
          }
        }
      );
    }
  });
});

router.post("/changePasswordById", (req, res) => {
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
});

router.post("/deleteUser", (req, res) => {
  const { id } = req.body;
  const sql = `DELETE FROM users WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: "User has been successfully deleted." });
    }
  });
});

router.post("/changePassword", (req, res) => {
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
});



router.post("/getusertoken", (req, res) => {
  const { token } = req.body;
  const id = jwt.verify(token, "mysupersecretpassword", (err, decoded) => {
    if (!err) {
      return decoded.id;
    } else {
      return 0;
    }
  });
  db.query("SELECT *FROM users WHERE id=?", id, (err, result) => {
      const empId = result[0].emp_id;
      db.query("SELECT *FROM employee WHERE emp_id=?", empId, (err, result2) => {
           if (err) {
              res.json({ ok: false, message: err });
            } else {
              res.json({ ok: true, message: result,emp:result2 });
            }
      
      })
    
  });
});

router.post("/getAlluser", (req, res) => {
  db.query("SELECT *FROM users", (err, result) => {
    res.json({ message: result });
  });
});

router.post("/getParentLoginInfo", (req, res) => {
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
});

router.post("/getAllParentLoginInfo", (req, res) => {
  db.query("SELECT student_id, phone FROM parent_login_information", (err, result) => {
    if (err) {
      return res.json({ message: err });
    }
    
    return res.json({ message: result });
  });
});

router.post("/updateStudentPass", (req, res) => {
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
});

router.post("/updateParentPass", (req, res) => {
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
});

router.get("/AuthTest", (req, res) => {
  res.send("Auth");
});

module.exports = router;