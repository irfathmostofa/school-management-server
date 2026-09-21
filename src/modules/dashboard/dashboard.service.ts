// @ts-nocheck
import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { UploadService } from "../../common/upload/upload.service";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";

let db: any;
let publicDirectory: string;

// router.post("/getDashboardEventNews", (req, res) => {
//   let { page, limit, session, eventFor } = req.body;
//   page = parseInt(page);
//   limit = parseInt(limit);
//   const offset = (page - 1) * limit;
//   db.query(
//     `SELECT * FROM event_news WHERE event_for LIKE ?
//      ORDER BY id DESC LIMIT ?, ?`,
//     [`%${eventFor}%`, offset, limit],
//     (err, result) => {
//       if (err) {
//         res.json({ ok: false, message: err });
//       } else {
//         // Get total count of news items
//         db.query(
//           "SELECT COUNT(*) AS total FROM event_news",
//           (err, countResult) => {
//             if (err) {
//               res.json({ ok: false, message: err });
//             } else {
//               const totalCount = countResult[0].total;
//               res.json({ ok: true, message: result, totalCount });
//             }
//           }
//         );
//       }
//     }
//   );
// });













// router.post("/dashboardStatForStudents", async (req, res) => {
//   const { session, campus } = req.body;
//   let query = "SELECT *FROM class_name WHERE pstatus = '1' AND session=?";
//   let params = [session];

//   if (campus != "all") {
//     query += " AND campus=?";
//     params.push(campus);
//   }

//   db.query(query, params, (err, result) => {
//     if (result.length === 0) {
//       return res.json({ message: [] });
//     }

//     var slist = [];
//     result.forEach((classItem, index) => {
//       var cls = classItem.class_name;
//       let query = "SELECT COUNT(*) AS maleCount FROM student WHERE gender='Male' AND session=? AND Class=?";
//       let params = [session, cls];

//       if (campus != "all") {
//         query += " AND campus=?";
//         params.push(campus);
//       }

//       db.query(query, params, (err, maleResult) => {
//         if (err) {
//           // Handle the error
//         } else {
//           const maleCount = maleResult[0].maleCount;

//           let query2 = "SELECT COUNT(*) AS femaleCount FROM student WHERE gender='Female' AND session=? AND Class=?";
//           let params2 = [session, cls];

//           if (campus != "all") {
//             query2 += " AND campus=?";
//             params2.push(campus);
//           }

//           db.query(query2, params2, (err, femaleResult) => {
//             if (err) {
//               // Handle the error
//             } else {
//               const femaleCount = femaleResult[0].femaleCount;
//               if (result.length >= 0) {
//                 var classData = {
//                   Classname: cls,
//                   male: maleCount,
//                   female: femaleCount,
//                 };
//                 slist.push(classData);
//               }

//               if (index === result.length - 1) {
//                 res.json({ message: slist });
//               }
//             }
//           });
//         }
//       });
//     });
//   });
// });




// router.post("/dashboardStatForStudents", async (req, res) => {
//   const { session, campus } = req.body;

 
//   let query = "SELECT * FROM class_name WHERE pstatus = '1' AND session=?";
//   const params = [session];

//   if (campus !== "all") {
//     query += " AND campus=?";
//     params.push(campus);
//   }

//   db.query(query, params, (err, result) => {
//     if (err) return res.status(500).json({ error: err });
//     if (result.length === 0) return res.json({ message: [] });

//     const slist = [];
//     let completed = 0;

//     result.forEach((classItem) => {
//       const cls = classItem.class_name;

//       const maleQuery =
//         "SELECT COUNT(*) AS maleCount FROM student WHERE gender='Male' AND session=? AND Class=?";
//       const maleParams = [session, cls];
//       if (campus !== "all") maleParams.push(campus);

//       db.query(maleQuery, maleParams, (err, maleResult) => {
//         if (err) return;
//         const maleCount = maleResult[0].maleCount;

//         const femaleQuery =
//           "SELECT COUNT(*) AS femaleCount FROM student WHERE gender='Female' AND session=? AND Class=?";
//         const femaleParams = [session, cls];
//         if (campus !== "all") femaleParams.push(campus);

//         db.query(femaleQuery, femaleParams, (err, femaleResult) => {
//           if (err) return;
//           const femaleCount = femaleResult[0].femaleCount;

          
//           slist.push({
//             Classname: cls,
//             male: maleCount,
//             female: femaleCount,
//             order: classItem.order, 
//           });

//           completed++;
//           if (completed === result.length) {
//             res.json({ message: slist });
//           }
//         });
//       });
//     });
//   });
// });

@Injectable()
export class DashboardService {
  constructor(
    private readonly database: DatabaseService,
    private readonly upload: UploadService
  ) {
    db = this.database;
    publicDirectory = this.upload.publicDirectory;
  
  }

  getDashboardMonthlyFeesData(req: any, res: any) {
  const { month, session } = req.body;
  const firstDate = `${month}-01`;
  const lastDate = `${month}-31`;
  db.query(
    `SELECT 
  SUM(paid) as totalPaid,
  SUM(balance) as totalDue
   FROM fees_collection WHERE  session = ? AND
    payment_date BETWEEN ? AND ?`,
    [session, firstDate, lastDate],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

  getDashboardLeaveRequest(req: any, res: any) {
  const { leaveType, campus } = req.body;

  let query = `
    SELECT 
      la.*, em.campus 
    FROM 
      leave_application la 
    JOIN 
      employee em ON la.applicantIdNo = em.emp_id
    WHERE 
      1=1
  `;

  const queryParams = [];

  if (leaveType && leaveType !== "") {
    query += ` AND la.leaveType = ?`;
    queryParams.push(leaveType);
  }

  if (campus && campus !== "") {
    query += ` AND em.campus = ?`;
    queryParams.push(campus);
  }

  query += ` ORDER BY id DESC LIMIT 5`;

  db.query(query, queryParams, (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  });
}

  getDashboardExpenseData(req: any, res: any) {
  const { type } = req.body;

  db.query(
    `SELECT *FROM payment WHERE type='expense'
    ${type !== "" ? `AND ptype = '${type}'` : ""}
    ORDER BY id DESC LIMIT 5`,
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

  getDashboardUnPaidFeesData(req: any, res: any) {
  const { unPaidClassName, campus } = req.body;

  const query = `SELECT 
    SUM(fc.balance) AS total_due, 
    s.student_first_name, 
    s.student_last_name, 
    s.Class, 
    s.section, 
    s.student_picture 
FROM 
    fees_collection fc 
JOIN 
    student s ON fc.student_id = s.student_id 
WHERE fc.balance > 0
    ${unPaidClassName !== "" ? `AND s.Class = ?` : ""} 
    AND s.campus = ?
GROUP BY 
    s.student_id
ORDER BY fc.id DESC 
    LIMIT 5
    `;
//   const query = `
//     SELECT fc.* , s.student_first_name, s.student_last_name, s.Class, s.section, s.student_picture 
//     FROM fees_collection fc 
//     JOIN student s ON s.student_id = fc.student_id 
//     WHERE fc.balance > 0
//     ${unPaidClassName !== "" ? `AND s.Class = ?` : ""} 
//     AND s.campus = ?
//     ORDER BY fc.id DESC 
//     LIMIT 5
//   `;

  const queryParams = [];
  if (unPaidClassName !== "") {
    queryParams.push(unPaidClassName); // Add class to the query params if it's not empty
  }
  queryParams.push(campus); // Always add campus to the query params

  db.query(query, queryParams, (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  });
}

  getDashboardEventNews(req: any, res: any) {
  let { page, limit, session, eventFor, campus } = req.body;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const offset = (page - 1) * limit;

  let conditions = [];
  let values = [];

  if (eventFor) {
    conditions.push("event_for LIKE ?");
    values.push(`%${eventFor}%`);
  }

  if (session) {
    conditions.push("session = ?");
    values.push(session);
  }

  if (campus) {
    conditions.push("campus = ?");
    values.push(campus);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  
  const query = `
    SELECT * FROM event_news
    ${whereClause}
    ORDER BY id DESC
    LIMIT ?, ?
  `;
  values.push(offset, limit);

  db.query(query, values, (err, result) => {
    if (err) {
      return res.json({ ok: false, message: err });
    }

    // Total count query with same conditions
    const countQuery = `SELECT COUNT(*) AS total FROM event_news ${whereClause}`;
    db.query(countQuery, values.slice(0, values.length - 2), (err, countResult) => {
      if (err) {
        return res.json({ ok: false, message: err });
      }

      const totalCount = countResult[0].total;
      res.json({ ok: true, message: result, totalCount });
    });
  });
}

  async dashboardStat(req: any, res: any) {
  const { campus } = req.body; 
  let resMsg = {};
  var today = new Date();
  var y = today.getFullYear();
  var m = today.getMonth() + 1;
  var d = today.getDate();

  if (m < 10) {
    m = "0" + m;
  }

  if (d < 10) {
    d = "0" + d;
  }

  var thisDay = y + "-" + m + "-" + d;
  const thisMonth = y + "-" + m;

  const thisMonthFeesCollection = (resMsg) => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT SUM(paid) AS TotalPaid FROM fees_collection WHERE payment_date LIKE ?",
        [thisMonth + "%"],
        (err, result) => {
          if (err) {
            resMsg.error = err;
            resolve(resMsg);
          } else {
            const totalPaid = result[0].TotalPaid || 0;
            resMsg.monthlyPaid = totalPaid;
            resolve(resMsg);
          }
        }
      );
    });
  };

  const thisMonthDue = (resMsg) => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT SUM(balance) AS TotalDue FROM fees_collection WHERE payment_date LIKE ?",
        [thisMonth + "%"],
        (err, result) => {
          if (err) {
            resMsg.error2 = err;
            resolve(resMsg);
          } else {
            const totalDue = result[0].TotalDue || 0;
            resMsg.monthlyDue = totalDue;
            resolve(resMsg);
          }
        }
      );
    });
  };

  const thisMonthExpense = (resMsg) => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT SUM(amount) AS TotalExpense FROM payment WHERE date LIKE ? AND type='expense' ",
        [thisMonth + "%"],
        (err, result) => {
          if (err) {
            resMsg.error3 = err;
            resolve(resMsg);
          } else {
            const totalExpense = result[0].TotalExpense || 0;
            resMsg.monthlyExpense = totalExpense;
            resolve(resMsg);
          }
        }
      );
    });
  };

  const TotalStudent = (resMsg) => {
    return new Promise((resolve, reject) => {
      let query = "SELECT *FROM student WHERE principal_approve='Approved'";
      let params = [];

      if (campus != "Boys & Girls Campus") { 
        query += " AND campus=?";
        params.push(campus);
      }

      db.query(query, params, (err, result) => {
        if (err) {
          resMsg.error4 = err;
          resolve(resMsg);
        } else {
          resMsg.AllStudent = result.length;
          resolve(resMsg);
        }
      });
    });
  };

  await thisMonthFeesCollection(resMsg);
  await thisMonthDue(resMsg);
  await thisMonthExpense(resMsg);
  await TotalStudent(resMsg);

  res.json({ resMsg });
}

  async dashboardStatForEmployee(req: any, res: any) {
  const { campus } = req.body; 
  const empType = ["Support Staff", "Academic", "Admin"];
  var elist = [];

  empType.forEach((emptype, index) => {
    let query = "SELECT COUNT(*) AS maleCount FROM employee WHERE gender='Male' AND emp_type=?";
    let params = [emptype];

    if (campus != "all") {
      query += " AND campus=?";
      params.push(campus);
    }

    db.query(query, params, (err, maleResult) => {
      if (err) {
        // Handle the error
      } else {
        const maleCount = maleResult[0].maleCount;

        let query2 = "SELECT COUNT(*) AS femaleCount FROM employee WHERE gender='Female' AND emp_type=?";
        let params2 = [emptype];

        if (campus != "all") {
          query2 += " AND campus=?";
          params2.push(campus);
        }

        db.query(query2, params2, (err, femaleResult) => {
          if (err) {
            // Handle the error
          } else {
            const femaleCount = femaleResult[0].femaleCount;
            var employeeData = {
              empType: emptype,
              male: maleCount,
              female: femaleCount,
            };
            elist.push(employeeData);

            if (index === empType.length - 1) {
              res.json({ message: elist });
            }
          }
        });
      }
    });
  });
}

  async dashboardStatForStudents(req: any, res: any) {
  const { session, campus } = req.body;
  console.log(req.body)

  let query = "SELECT * FROM class_name WHERE pstatus = '1' AND session=?";
  const params = [session];

  if (campus !== "all") {
    query += " AND campus=?";
    params.push(campus);
  }

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.json({ message: [] });

    const slist = [];
    let completed = 0;

    result.forEach((classItem) => {
      const cls = classItem.class_name;

      const maleQuery =
        "SELECT COUNT(*) AS maleCount FROM student WHERE gender='Male' AND session=? AND Class=? AND campus = ?";
      const maleParams = [session, cls, campus];
      if (campus !== "all") maleParams.push(campus);

      db.query(maleQuery, maleParams, (err, maleResult) => {
        if (err) return;
        const maleCount = maleResult[0].maleCount;

        const femaleQuery =
          "SELECT COUNT(*) AS femaleCount FROM student WHERE gender='Female' AND session=? AND Class=? AND campus = ?";
        const femaleParams = [session, cls, campus];
        if (campus !== "all") femaleParams.push(campus);

        db.query(femaleQuery, femaleParams, (err, femaleResult) => {
          if (err) return;
          const femaleCount = femaleResult[0].femaleCount;
          
          slist.push({
            Classname: cls,
            male: maleCount,
            female: femaleCount,
            order: classItem.order, 
          });

          completed++;
          if (completed === result.length) {
            res.json({ message: slist });
          }
        });
      });
    });
  });
}

  async sidebarBadgeCount(req: any, res: any) {
  const { campus,userid,username } = req.body;

  const query = (sql, params) =>
    new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) return reject(err);
        resolve(result[0].count);
      });
    });

  try {
    const librarySale = await query(
      "SELECT COUNT(*) as count FROM student_income WHERE status = 1 AND campus = ?",
      [campus]
    );

    const Enrolled = await query(
      "SELECT COUNT(*) as count FROM student WHERE isEnrolled = 'false' AND principal_approve = 'Approved' AND campus = ?",
      [campus]
    );

    const pendingAdmission = await query(
      "SELECT COUNT(*) as count FROM student WHERE principal_approve != 'Approved' AND isEnrolled = 'false' AND campus = ?",
      [campus]
    );

    const feeApproval = await query(
      `SELECT COUNT(*) AS count 
FROM student 
JOIN fees_collection ON student.student_id = fees_collection.student_id 
    AND fees_collection.status2 = 1
JOIN payment AS p ON p.payment_id = fees_collection.payment_id
WHERE student.campus = ?
`,
      [campus]
    );

    const expenseApproval = await query(
      "SELECT COUNT(*) as count FROM payment WHERE type = 'expense' AND verified = '0' AND campus = ?",
      [campus]
    );

    const incomeApproval = await query(
      "SELECT COUNT(*) as count FROM payment WHERE ptype IN ('general', 'student') AND verified = '' AND campus = ?",
      [campus]
    );
    const Requisition = await query("SELECT COUNT(*) as count FROM requisition WHERE Principal IS NULL");
    const mdr = await query("SELECT COUNT(*) as count FROM mdr WHERE rname=? AND status=''",[username]);

    res.json({
      librarySale,
      Enrolled,
      pendingAdmission,
      feeApproval,
      expenseApproval,
      incomeApproval,
      Requisition,
      mdr,
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Error fetching badge counts" });
  }
}

  DailyAttendanceInfo(req: any, res: any) {
  const { campus } = req.body;

  let query = `
    SELECT 
      COUNT(CASE WHEN attendance = 0 THEN 1 END) AS absent,
      COUNT(CASE WHEN attendance = 1 THEN 1 END) AS present
    FROM Student_Attendance
    JOIN student ON Student_Attendance.student_id = student.student_id
    WHERE Student_Attendance.date = CURDATE()`;

  const params = [];

  if (campus) {
    query += " AND student.campus = ?";
    params.push(campus);
  }

  db.query(query, params, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching attendance data" });
    } else {
      res.json(result[0]); // Send the result directly as JSON
    }
  });
}

  DailyAttendanceForClassSection(req: any, res: any) {
  const { campus } = req.body;

  let query = `
    SELECT 
      cls.class_name,
      sec.section_name,
      COUNT(CASE WHEN sa.attendance = 0 THEN 1 END) AS absent,
      COUNT(CASE WHEN sa.attendance = 1 THEN 1 END) AS present
    FROM class_name cls
    JOIN section sec ON cls.id = sec.class_id
    LEFT JOIN student s ON s.Class = cls.class_name AND s.section = sec.section_name
    LEFT JOIN Student_Attendance sa ON sa.student_id = s.student_id AND sa.date = CURDATE()`;

  let params = [];

 
  if (campus) {
    query += " WHERE s.campus = ?";
    params.push(campus);
  } else {
    query += " WHERE 1";   
  }


  query += `
    GROUP BY cls.class_name, sec.section_name
    ORDER BY cls.id, cls.class_name, sec.section_name ASC
  `;

  db.query(query, params, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching attendance data", error: err });
    } else {
      res.json({ message: result });
    }
  });
}

  DailyLessonPlanForClassSection(req: any, res: any) {
  const { campus, class_id, section_id } = req.body;
  
  let query = `
    SELECT wl.*, sl.subject_name
    FROM weeklyDates 
    JOIN weeklyLessonPlans AS wl ON weeklyDates.id = wl.weekly_date_id
    JOIN subject_list AS sl ON wl.subject_id = sl.id
    WHERE weeklyDates.class_id = ? 
      AND weeklyDates.section_id = ?
      AND weeklyDates.campus = ?
      AND CURDATE() BETWEEN weeklyDates.start_date AND weeklyDates.end_date
      AND wl.day_of_week = DAYNAME(CURDATE())
  `;

  let params = [class_id, section_id,campus];

  db.query(query, params, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching lesson plan data", error: err });
    } else {
      res.json({ message: result });
    }
  });
}

  DailyClassTestForClassSection(req: any, res: any) {
    const {session } = req.body;
  

    const query = `
        SELECT scl.title,scl.className,scl.section
        FROM student_classtest_list AS scl
        JOIN student_classtest_response AS scr 
        ON scl.id = scr.selectedTestID
        WHERE scr.obtain_marks = '' 
        AND scr.session = ? GROUP BY scr.selectedTestID, scl.title, scr.className, scr.section
    `;
    
    const params = [session];
    db.query(query, params, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching class test data",info: false, error: err });
        }

        res.json({ info: true, message: result });
    });
}

  DailyHomeworkForClassSection(req: any, res: any) {
    const {session } = req.body;
   
    const query = `
       SELECT shl.title,shr.className,shr.section FROM student_homework_list AS shl JOIN student_homework_response AS shr ON shl.id=shr.selectedWorkID WHERE shr.progress='' AND shr.session = ? GROUP BY shr.selectedWorkID, shl.title, shr.className, shr.section`;
    
    const params = [session];
    db.query(query, params, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching class test data",info: false, error: err });
        }

        res.json({ info: true, message: result });
    });
}

  dashboardTest(req: any, res: any) {
  res.send("Dashboard");
}
}
