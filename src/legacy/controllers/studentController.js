const { db } = require("../models");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { sign, verify } = require("../utils/jwt");
const publicDirectory = path.join(__dirname, "../public");

// student parent login information

exports.getstudentParenttoken = (req, res) => {
  const { token, type } = req.body;
  const decoded = verify(token);
  const id = decoded && decoded.id ? decoded.id : 0;

  let sql = "";
  if (type === "parent") {
    sql = "SELECT *FROM parent_login_information WHERE id=?";
  }

  if (type === "student") {
    sql = "SELECT *FROM student_login_information WHERE id=?";
  }

  if (!sql) {
    return res.json({ message: [] });
  }

  db.query(sql, id, (err, result) => {
    if (err) {
      return res.json({ message: [] });
    }
    res.json({ message: result });
  });
}

exports.studentParentLogin = (req, res) => {
  const { phone, password, type } = req.body;
  let sql = "";
  if (type === "parent") {
    sql = "SELECT *FROM parent_login_information WHERE phone = ?";
  }
  if (type === "student") {
    sql = "SELECT *FROM student_login_information WHERE student_id = ?";
  }
  db.query(sql, [phone], (err, result) => {
    if (err || !result || result.length === 0) {
      res.json({ ok: false,message:"Something went wrong. Please try again." });
    } else {
      var comp = bcrypt.compareSync(password, result[0].password);

      if (comp) {
        const id = result[0].id;
        const token = sign({ id });
        res.json({ ok: true, message: "Success", token: token });
      } else {
        res.json({ ok: false, message: "Phone or password incorrect" });
      }
    }
  });
}

exports.updatePassword = (req, res) => {
  const { userType, userId, oldPassword, newPassword } = req.body;
  let tableName, idColumn;

  if (userType === 'student') {
    tableName = 'student_login_information';
    idColumn = 'student_id';
  } else if (userType === 'parent') {
    tableName = 'parent_login_information';
    idColumn = 'phone';
  } else {
    return res.json({ ok: false, message: "Invalid user type" });
  }

  db.query(
    `SELECT * FROM ${tableName} WHERE ${idColumn} = ?`,
    userId,
    (err, result) => {
      if (result.length === 0) {
        res.json({ ok: false, message: `${userType} not found` });
      } else {
        var comp = bcrypt.compareSync(oldPassword, result[0].password);
        if (comp) {
          const hashedPassword = bcrypt.hashSync(newPassword, 10);
          db.query(
            `UPDATE ${tableName} SET password = ? WHERE ${idColumn} = ?`,
            [hashedPassword, userId],
            (err, result) => {
              if (err) {
                res.json({ ok: false, message: err.message });
              } else {
                res.json({ ok: true, message: "Password updated successfully" });
              }
            }
          );
        } else {
          res.json({ ok: false, message: "Old password incorrect" });
        }
      }
    }
  );
}


exports.getParentsChild = (req, res) => {
  const { phone } = req.body;
  db.query(
    "SELECT parent_login_information.*, s.campus,s.student_first_name , s.student_last_name,s.student_picture,cn.id AS cId,sec.id AS secId FROM parent_login_information JOIN student AS s ON s.student_id=parent_login_information.student_id JOIN class_name AS cn ON s.Class=cn.class_name JOIN section AS sec ON cn.id=sec.class_id WHERE parent_login_information.phone = ? GROUP BY parent_login_information.student_id",
    phone,
    (err, result) => {
      res.json({ message: result });
    }
  );
}

exports.getStudentDashboardbyID = (req, res) => {
  const { student_id } = req.body;
  db.query(
    "SELECT student.*, cn.id AS cId,sec.id AS secId FROM student JOIN class_name AS cn ON student.Class=cn.class_name AND student.campus=cn.campus JOIN section AS sec ON student.section=sec.section_name WHERE student.student_id = ? GROUP BY student.student_id",
    student_id,
    (err, result) => {
      res.json({ message: result });
    }
  );
}

exports.getStudentPreviousSession = (req, res) => {
  const { student_id} = req.body;
  db.query(
    "SELECT *FROM student_promotion WHERE student_id = ? AND principal_approvel = ? ",
    [student_id, 'Approved'],
    (err, result) => {
      if(err){
        res.json({ ok: false, message: err.message });
      }
      else{
        res.json({ ok: true, message: result });
      }
    }
  );
}

exports.getHomeWorkList = async (req, res) => {
  const { className, section, session, student_id, termName, subject,date } =
    req.body;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * pageSize;

  try {
    let countQuery =
      "SELECT COUNT(*) AS total FROM student_homework_list AS hw LEFT JOIN student_homework_response AS hwr ON hw.id = hwr.selectedWorkID AND hwr.student_id = ? WHERE hw.className = ? AND hw.section = ? AND hw.session = ?";
    let homeworkListQuery = `SELECT hw.*, COALESCE(hwr.progress, 'N/A') AS progress FROM student_homework_list AS hw LEFT JOIN student_homework_response AS hwr ON hw.id = hwr.selectedWorkID AND hwr.student_id = ? WHERE hw.className = ? AND hw.section = ? AND hw.session = ?`;

    let queryParam = [student_id, className, section, session];

    if (termName !== "") {
      countQuery += " AND hw.termName = ?";
      homeworkListQuery += " AND hw.termName = ?";
      queryParam.push(termName);
    }

    if (subject !== "") {
      countQuery += " AND hw.subject = ?";
      homeworkListQuery += " AND hw.subject = ?";
      queryParam.push(subject);
    }

    if (date !== "") {
      countQuery += " AND hw.date = ?";
      homeworkListQuery += " AND hw.date = ?";
      queryParam.push(date);
    }

    homeworkListQuery += " LIMIT ? OFFSET ?";

    const total = await new Promise((resolve, reject) => {
      db.query(countQuery, queryParam, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result[0].total);
        }
      });
    });

    const homeworkList = await new Promise((resolve, reject) => {
      db.query(
        homeworkListQuery,
        [...queryParam, pageSize, offset],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });

    const totalPage = Math.ceil(total / pageSize);

    res.json({ ok: true, message: homeworkList, totalPage });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
}

exports.getClassWorkList = async (req, res) => {
  const { className, section, session, student_id, termName, subject, date } =
    req.body;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * pageSize;

  try {
    let countQuery =
      "SELECT COUNT(*) AS total FROM student_classwork_list AS cw LEFT JOIN student_classwork_response AS cwr ON cw.id = cwr.selectedWorkID AND cwr.student_id = ? WHERE cw.className = ? AND cw.section = ? AND cw.session = ?";

    let classWorkListQuery = `SELECT cw.*, COALESCE(cwr.progress, 'N/A') AS progress FROM student_classwork_list AS cw LEFT JOIN student_classwork_response AS cwr ON cw.id = cwr.selectedWorkID AND cwr.student_id = ? WHERE cw.className = ? AND cw.section = ? AND cw.session = ?`;

    let queryParam = [student_id, className, section, session];

    if (termName !== "") {
      countQuery += " AND cw.termName = ?";
      classWorkListQuery += " AND cw.termName = ?";
      queryParam.push(termName);
    }

    if (subject !== "") {
      countQuery += ` AND cw.subject = ?`;
      classWorkListQuery += " AND cw.subject = ?";
      queryParam.push(subject);
    }

    if (date !== "") {
      countQuery += ` AND cw.date = ?`;
      classWorkListQuery += " AND cw.date = ?";
      queryParam.push(date);
    }

    classWorkListQuery += " LIMIT ? OFFSET ?";

    const total = await new Promise((resolve, reject) => {
      db.query(countQuery, queryParam, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result[0].total);
        }
      });
    });

    const classWorkList = await new Promise((resolve, reject) => {
      db.query(
        classWorkListQuery,
        [...queryParam, pageSize, offset],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });

    const totalPage = Math.ceil(total / pageSize);

    res.json({ ok: true, message: classWorkList, totalPage });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
}

exports.getClassTestList = async (req, res) => {
  const { className, section, session, student_id, termName, title } =
    req.body;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * pageSize;

  try {
    let countQuery =
      "SELECT COUNT(*) AS total FROM student_classtest_list AS ct LEFT JOIN student_classtest_response AS ctr ON ct.id = ctr.selectedTestID AND ctr.student_id = ? WHERE ct.className = ? AND ct.section = ? AND ct.session = ?";

    let classTestListQuery = `SELECT ct.*, COALESCE(ctr.obtain_marks, 'N/A') AS obtain_marks FROM student_classtest_list AS ct LEFT JOIN student_classtest_response AS ctr ON ct.id = ctr.selectedTestID AND ctr.student_id = ? WHERE ct.className = ? AND ct.section = ? AND ct.session = ?`;

    let queryParam = [student_id, className, section, session];

    if (termName !== "") {
      countQuery += " AND ct.termName = ?";
      classTestListQuery += " AND ct.termName = ?";
      queryParam.push(termName);
    }

    if (title !== "") {
      countQuery += " AND ct.title = ?";
      classTestListQuery += " AND ct.title = ?";
      queryParam.push(title);
    }
    // if (date !== "") {
    //   countQuery += " AND ct.date = ?";
    //   classTestListQuery += " AND ct.date = ?";
    //   queryParam.push(date);
    // }

    classTestListQuery += " LIMIT ? OFFSET ?";

    const total = await new Promise((resolve, reject) => {
      db.query(countQuery, queryParam, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result[0].total);
        }
      });
    });

    const classTestList = await new Promise((resolve, reject) => {
      db.query(
        classTestListQuery,
        [...queryParam, pageSize, offset],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });

    const totalPage = Math.ceil(total / pageSize);

    res.json({ ok: true, message: classTestList, totalPage });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
}

exports.getStudentAttendanceByID = (req, res) => {
  const { student_id, month } = req.body;
  const startOfMonth = `${month}-01`;
  const endOfMonth = `${month}-31`;

  db.query(
    `SELECT *FROM Student_Attendance WHERE student_id = ? 
    AND date BETWEEN ? AND ? ORDER BY date ASC`,
    [student_id, startOfMonth, endOfMonth],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err.message });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

exports.getSubjectList = (req, res) => {
  const { className, campus } = req.body;
  db.query(
    "SELECT *FROM subject_list WHERE class_name = ? AND pstatus = ? AND campus = ?",
    [className, 1,campus],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err.message });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

exports.getSchoolName = (req, res) => {
  const { class_name } = req.body;
  db.query(
    "SELECT class_type as school FROM class_name WHERE class_name = ? AND pstatus = ?",
    [class_name, 1],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err.message });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

exports.getStudentClasssRoutine = (req, res) => {
  const { className, section, session } = req.body;
  db.query(
    `SELECT cr.*,  
    COALESCE(teacher.emp_fname, 'N/A') as teacher_fname,
    COALESCE(teacher.emp_lname, 'N/A')  as teacher_lname
    FROM class_routine AS cr
    LEFT JOIN employee AS teacher
     ON cr.teacherID = teacher.emp_id
    WHERE cr.className = ? AND cr.section = ? AND cr.session = ?`,
    [className, section, session],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err.message });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

// router.post("/getStudentDiary", (req, res) => {
//   const { student_id, className, section, session, month } = req.body;

//   const startOfMonth = `${month}-01`;
//   const endOfMonth = new Date(month.split("-")[0], month.split("-")[1], 0)
//     .toISOString()
//     .split("T")[0]; 


//   db.query(
//     `SELECT * FROM student_diary 
//      WHERE (student_id = ? OR student_id = 'All') 
//      AND class = ? 
//      AND section = ? 
//      AND session = ?
//      AND approve = 1
//      AND date BETWEEN ? AND ? 
//      ORDER BY date DESC`,
//     [student_id, className, section, session, startOfMonth, endOfMonth],
//     (err, result) => {
//       if (err) {
//         res.json({ ok: false, message: err.message });
//       } else {
//         res.json({ ok: true, message: result });
//       }
//     }
//   );
// });



exports.getStudentDiary = (req, res) => {
  const { student_id, className, section, session, date } = req.body;

  // validation
  if (!date) {
    return res.json({
      ok: false,
      message: "Date is required"
    });
  }

  db.query(
    `SELECT * FROM student_diary 
     WHERE (student_id = ? OR student_id = 'All') 
     AND class = ? 
     AND section = ? 
     AND session = ?
     AND approve = 1
     AND date = ? 
     ORDER BY date DESC`,
    [student_id, className, section, session, date],
    (err, result) => {
      if (err) {
        return res.json({ ok: false, message: err.message });
      }

      res.json({ ok: true, message: result });
    }
  );
}



exports.getStudentExtraClass = (req, res) => {
  const { student_id, className, section, session, month } = req.body;
  const startOfMonth = `${month}-01`;
  const endOfMonth = `${month}-31`;
  db.query(
    `SELECT *FROM extra_class WHERE student_id = ? AND class = ? AND section = ? AND session = ? 
    AND date BETWEEN ? AND ?
    ORDER BY date AND time DESC`,
    [student_id, className, section, session, startOfMonth, endOfMonth],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err.message });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

exports.getStudentLibraryItem = (req, res) => {
  const { receiver_id, session, month } = req.body;
  const startOfMonth = `${month}-01`;
  const endOfMonth = `${month}-31`;
  db.query(
    `SELECT *FROM item_issue_list WHERE receiver_id = ? AND session = ? 
    AND issueDate BETWEEN ? AND ? ORDER BY issueDate DESC`,
    [receiver_id, session, startOfMonth, endOfMonth],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err.message });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

exports.getStudentEventNews = (req, res) => {
  let { className, session, page, limit } = req.body;

  // Ensure page and limit are valid numbers
  page = parseInt(page, 10) || 1;
  limit = parseInt(limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Default className to empty string if not provided
  className = className || "";

  // First, query to get the total count of news
  db.query(
    `SELECT COUNT(*) AS totalCount FROM event_news 
    WHERE session = ? 
    AND event_for = ? 
    AND (event_type = ? OR FIND_IN_SET(?, class) > 0)`,
    [session, "Student", "Global", className],
    (err, countResult) => {
      if (err) {
        return res.json({ ok: false, message: err.message });
      }

      const totalCount = countResult[0]?.totalCount || 0;

      // Query to get paginated results
      db.query(
        `SELECT * FROM event_news 
        WHERE session = ? 
        AND event_for = ? 
        AND (event_type = ? OR FIND_IN_SET(?, class) > 0)
        ORDER BY id ASC 
        LIMIT ?, ?`,
        [session, "Student", "Global", className, startIndex, limit],
        (err, result) => {
          if (err) {
            return res.json({ ok: false, message: err.message });
          }

          res.json({
            ok: true,
            totalNewsCount: totalCount,
            message: result,
          });
        }
      );
    }
  );
}


// router.post("/getStudentAcademicCalendarNew", (req, res) => {
//   const { month, type } = req.body;

//   if (!month) {
//     return res.json({ ok: false, message: "Invalid month format. Use 'YYYY-MM'." });
//   }

//   let query = `SELECT * FROM academic_calendar WHERE (start LIKE ? OR end LIKE ?)`;
//   let params = [`%${month}%`, `%${month}%`];

//   if (type) {
//     query += ` AND event_Type IN (?, 'Academic')`;
//     params.push(type);
//   }

//   db.query(query, params, (err, result) => {
//     if (err) {
//       res.json({ ok: false, message: err.message });
//     } else {
//       res.json({ ok: true, data: result });
//     }
//   });
// });






exports.getStudentAcademicCalendarNew = (req, res) => {
  const { month, type, campus } = req.body;

  if (!month) {
    return res.json({
      ok: false,
      message: "Invalid month format. Use 'YYYY-MM'.",
    });
  }

  let query = `
    SELECT *
    FROM academic_calendar
    WHERE (start LIKE ? OR end LIKE ?)
  `;

  let params = [`%${month}%`, `%${month}%`];

 
  if (type) {
    query += ` AND (event_Type = ? OR event_Type = 'Academic')`;
    params.push(type);
  }


  if (campus) {
    query += ` AND campus = ?`;
    params.push(campus);
  }

  db.query(query, params, (err, result) => {
    if (err) {
      return res.json({ ok: false, message: err.message });
    }

    res.json({ ok: true, data: result });
  });
}



exports.getStudentAcademicCalendar = (req, res) => {
  const {month } = req.body;

  db.query(
    `SELECT *FROM academic_calendar WHERE event_Type = ? AND ( start LIKE ? OR end LIKE ? )`,
    ["General", "Hifz", `${month}%` , `${month}%`],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err.message });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

exports.getStudentIncomeById = (req, res) => {
  const { student_id, session } = req.body;
  db.query(
    "SELECT *FROM student_income WHERE status=0 AND student_id= ? AND session = ?",
    [student_id, session],
    (err, result) => {
      res.json({ message: result });
    }
  );
}

exports.updateDeviceToken = (req, res) => {
  const { type, user, token } = req.body;

  if (!type || !user) {
    return res.status(400).json({ error: "Missing required fields: type, user, or token." });
  }

  let query = "";
  let params = [];

  if (type === "student") {
    query = `UPDATE student_login_information SET device = ? WHERE student_id = ?`;
    params = [token, user];
  } else if (type === "parent") {
    query = `UPDATE parent_login_information SET device = ? WHERE phone = ?`;
    params = [token, user];
  } else {
    return res.status(400).json({ error: "Invalid type. Must be 'student' or 'parent'." });
  }

  db.query(query, params, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error." });
    }

    res.json({ message: "Device token updated successfully.", result });
  });
}








exports.getStudentAttendanceDevice = (req, res) => {
  const { date, campus, classType, className, section } = req.body;

  if (!date || !campus) {
    return res.json({ ok: false, message: "Date and campus are required" });
  }

  // -----------------------------
  // WHERE conditions & params
  // -----------------------------
  let conditions = `
    sad.attendance_date = ?
    AND cn.campus COLLATE utf8mb4_unicode_ci = ?
  `;
  const params = [date, campus];

  if (classType) {
    conditions += ` AND cn.class_type COLLATE utf8mb4_unicode_ci = ?`;
    params.push(classType);
  }

  if (className) {
    conditions += ` AND sa.Class COLLATE utf8mb4_unicode_ci = ?`;
    params.push(className);
  }

  if (section) {
    conditions += ` AND sa.section COLLATE utf8mb4_unicode_ci = ?`;
    params.push(section);
  }

  // -----------------------------
  // Query with COLLATE fixes
  // -----------------------------
  const queryStr = `
    SELECT
      sad.student_id,
      cn.class_type,
      sa.Class,
      sa.section,
      sad.inTime,
      sad.outTime,
      sad.attendance_date
    FROM student_attendance_device AS sad
    LEFT JOIN student AS sa
      ON sa.student_id COLLATE utf8mb4_unicode_ci = sad.student_id COLLATE utf8mb4_unicode_ci
    LEFT JOIN class_name AS cn
      ON cn.class_name COLLATE utf8mb4_unicode_ci = sa.Class COLLATE utf8mb4_unicode_ci
      AND cn.campus COLLATE utf8mb4_unicode_ci = sa.campus COLLATE utf8mb4_unicode_ci
    WHERE ${conditions}
    ORDER BY sa.Class COLLATE utf8mb4_unicode_ci, sa.section COLLATE utf8mb4_unicode_ci, sad.student_id COLLATE utf8mb4_unicode_ci
  `;

  // -----------------------------
  // Execute query
  // -----------------------------
  db.query(queryStr, params, (err, result) => {
    if (err) {
      return res.json({ ok: false, message: err });
    }

    res.json({
      ok: true,
      message: {
        total: result.length,
        data: result
      }
    });
  });
}










exports.get = (req, res) => {
  res.send("Hello from student");
}
