// @ts-nocheck
import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { NotificationService } from "../../common/notification/notification.service";
import { UploadService } from "../../common/upload/upload.service";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";

let db: any;
let sendNotification: any;
let sendAttendanceNotification: any;
let publicDirectory: string;

const now = new Date();
const dhakaTime = new Date(now.getTime() + (6 * 60 * 60 * 1000)).toISOString().slice(0, 19).replace('T', ' ');
const getDayNames = (startDate, endDate) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const days = [];

  const start = new Date(startDate);
  const end = new Date(endDate);
  const currentDate = new Date(start);

  while (currentDate <= end) {
    days.push(dayNames[currentDate.getDay()]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
};
const getDates = (startDate, endDate) => {
  const dates = [];

  const start = new Date(startDate);
  const end = new Date(endDate);
  const currentDate = new Date(start);

  while (currentDate <= end) {
    // Format the date to a string (e.g., 'YYYY-MM-DD')
    const formattedDate = currentDate.toISOString().split('T')[0];
    dates.push(formattedDate); // Push the formatted date
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }

  return dates; // Return the dates array
};

const uploadFile = (req, field) => {
  return new Promise((resolve, reject) => {
    if (req.files && req.files[field]) {
      const file = req.files[field];
      const newFilename = uuidv4() + "_" + file.name;
      file.mv(publicDirectory + "/image/" + newFilename, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(newFilename);
        }
      });
    } else {
      resolve("");
    }
  });
};


// router.post("/addExamSchedule", async (req, res) => {
//   try {
//     const { classId, title, term, session, compile } = req.body;
//     let filename = "";


//     // Handle file upload
//     if (req.files && req.files.media) {
//       try {
//         filename = await uploadFile(req, "media");
//       } catch (fileErr) {
//         console.error("File upload failed:", fileErr);
//         return res.status(500).json({ error: "File upload failed", details: fileErr });
//       }
//     }

//     const values = [classId, title, term, session, filename, compile];
//     const insertQuery = `
//       INSERT INTO ExamSchedule (classId, title, term, session, media, compile)
//       VALUES (?, ?, ?, ?, ?, ?)
//       ON DUPLICATE KEY UPDATE
//         title = VALUES(title),
//         media = VALUES(media),
//         compile = VALUES(compile)
//     `;

//     db.query(insertQuery, values, async (err, result) => {
//       if (err) {
//         console.error("Insert query error:", err);
//         return res.status(500).json({ error: "Database insert error", details: err });
//       }

//       const insertId = result.insertId || 0;

//       // Fetch device tokens
//       const tokenQuery = `
//         SELECT *
//         FROM (
//           SELECT sli.device, sli.student_id
//           FROM student AS s
//           LEFT JOIN class_name AS cn ON cn.class_name = s.Class
//           LEFT JOIN student_login_information AS sli ON s.student_id = sli.student_id
//           WHERE cn.id = ? 
        
//           UNION ALL
        
//           SELECT pli.device, pli.student_id
//           FROM student AS s
//           LEFT JOIN class_name AS cn ON cn.class_name = s.Class
//           LEFT JOIN parent_login_information AS pli ON s.student_id = pli.student_id
//           WHERE cn.id = ?
//         ) AS all_devices group BY student_id
//       `;

//       db.query(tokenQuery, [classId, classId], async (tokenErr, tokens) => {
//         if (tokenErr) {
//           console.error("Token query error:", tokenErr);
//           return res.status(500).json({ error: "Token query error", details: tokenErr });
//         }

//         // Send push notifications
//         for (const row of tokens) {
//           try {
//             await sendNotification(
//               row.device||null,
//               "Exam Schedule",
//               title,
//               "http://test.com",
//               "ExamSchedule",
//               insertId,
//               row.student_id,
//             );
//           } catch (notifyErr) {
//             console.warn("Notification error:", notifyErr.message);
//           }
//         }

//         // Success response
//         res.json({
//           ok: true,
//           message: "Exam schedule added/updated successfully",
//         });
//       });
//     });
//   } catch (error) {
//     console.error("Server error:", error.message);
//     res.status(500).json({ error: "Server error", details: error.message });
//   }
// });





// router.post("/getExamSchedule", (req, res) => {
//   const { classId, term, session } = req.body;

//   if (!session) {
//     return res.status(400).json({ error: "Session is mandatory" });
//   }

//   let query = `
//     SELECT ExamSchedule.*, cn.class_name 
//     FROM ExamSchedule 
//     JOIN class_name AS cn ON cn.id = ExamSchedule.classId
//     WHERE ExamSchedule.session = ?`;
//   const values = [session];

//   if (classId) {
//     query += " AND ExamSchedule.classId = ?";
//     values.push(classId);
//   }
//   if (term) {
//     query += " AND ExamSchedule.term = ?";
//     values.push(term);
//   }

//   db.query(query, values, (err, result) => {
//     if (err) {
//       console.error("Error executing query:", err);
//       return res.status(500).json({ error: "Database query error" });
//     }
//     res.json({ message: result });
//   });
// });




// router.post("/deteleRoutineItem", (req, res) => {
//     const { id } = req.body;
//     const sql = `DELETE FROM dynamic_class_routine WHERE id=?`;
//     db.query(sql,[id], (err, results) => {
//         if (err) {
//             console.error("Error executing query:", err);
//             return res.status(500).json({ message: false, error: err });
//         }
//         res.status(200).json({message:true}); 
//     });
// });


// update section by id

// update subject by id
// delete section by id

// Student Attendance


const getDatesInMonth = (month) => {
  const [year, mon] = month.split("-").map(Number);
  const firstDay = new Date(year, mon - 1, 1);
  const lastDay = new Date(year, mon, 0);
  const dates = [];
  
  const current = new Date(firstDay);
  while (current <= lastDay) {
    const d = current.getFullYear() + '-' + 
              String(current.getMonth() + 1).padStart(2, '0') + '-' + 
              String(current.getDate()).padStart(2, '0');
    dates.push(d);
    current.setDate(current.getDate() + 1);
  }
  return dates;
};


// router.post("/getAttendanceForClassbyMonth", (req, res) => {
//   const { month, session, class_name, section, campus } = req.body;

//   if (!month || !session || !class_name || !section || !campus) {
//     return res.status(400).json({ ok: false, message: "Missing required fields." });
//   }

//   const allDates = getDatesInMonth(month); 
//   const startDate = allDates[0];
//   const endDate = allDates[allDates.length - 1];

//   console.log("Generated dates for", month, ":", allDates); 

//   const query = `
//     SELECT 
//       s.student_id,
//       CONCAT(s.student_first_name, ' ', s.student_last_name) AS student_name,
//       sa.date,
//       sa.attendance
//     FROM 
//       student AS s
//     LEFT JOIN 
//       Student_Attendance AS sa
//       ON sa.student_id = s.student_id
//       AND sa.date >= ? AND sa.date <= ?
//       AND sa.session = ?
//       AND sa.section = ?
//     WHERE 
//       s.Class = ?
//       AND s.campus = ?
//     ORDER BY 
//       s.student_id, sa.date ASC
//   `;

//   db.query(
//     query,
//     [startDate, endDate, session, section, class_name, campus],
//     (err, rows) => {
//       if (err) {
//         console.log(err);
//         return res.status(500).json({ ok: false, message: "Internal server error." });
//       }

//       const result = {};

//       rows.forEach(row => {
//         if (!result[row.student_id]) {
//           result[row.student_id] = {
//             student_id: row.student_id,
//             student_name: row.student_name,
//             attendance: {},
//             total_present: 0,
//             total_absent: 0
//           };

//           // Initialize with only the correct month dates
//           allDates.forEach(date => {
//             result[row.student_id].attendance[date] = null;
//           });
//         }

//         if (row.date && allDates.includes(row.date)) {
//           result[row.student_id].attendance[row.date] = row.attendance;
//           if (row.attendance == 1) result[row.student_id].total_present++;
//           else if (row.attendance == 0) result[row.student_id].total_absent++;
//         }
//       });

//       res.json({ ok: true, message: Object.values(result) });
//     }
//   );
// });






// router.post("/getTermReportParameter", (req, res) => {
//   const { className, session } = req.body;
//   const query = `
//     SELECT 
//     COALESCE(trp.id, null) AS id,
//     s.class_name AS className,
//     s.subject_name,
//     COALESCE(trp.Term_Type, 'FixedMarks') AS Term_Type,
//     COALESCE(trp.Term_Value, 0) AS Term_Value,
//     COALESCE(trp.Term_Project_Type, 'FixedMarks') AS Term_Project_Type,
//     COALESCE(trp.Term_Project_Value, 0) AS Term_Project_Value,
//     COALESCE(trp.Home_Work_Type, 'FixedMarks') AS Home_Work_Type,
//     COALESCE(trp.Home_Work_Value, 0) AS Home_Work_Value,
//     COALESCE(trp.Class_Work_Type, 'FixedMarks') AS Class_Work_Type,
//     COALESCE(trp.Class_Work_Value, 0) AS Class_Work_Value,
//     COALESCE(trp.Class_Test_Type, 'FixedMarks') AS Class_Test_Type,
//     COALESCE(trp.Class_Test_Value, 0) AS Class_Test_Value,
//     s.session
// FROM 
//     subject_list AS s
// LEFT JOIN 
//     term_report_parameter AS trp 
//     ON trp.subject_name = s.subject_name 
//     AND trp.session = s.session 
//     AND trp.className = s.class_name
// WHERE 
//     s.class_name = ?
//     AND s.session = ?
//     AND s.report_eligibility = 'TRUE'
// ORDER BY 
//     s.id ASC
//   `;

//   db.query(query, [className, session], (err, result) => {
//     if (err) {
//       res.json({ ok: false, message: err });
//     } else {
//       res.json({ ok: true, message: result });
//     }
//   });
// });





// router.post("/addStudentClassTest", async (req, res) => {
//   const {
//     school,
//     campus,
//     className,
//     termName,
//     marks,
//     section,
//     session,
//     subject,
//     title,
//     date,
//     creatorID,
//     creatorName,
//   } = req.body;

//   // Local query wrapper
//   const query = (sql, params) => {
//     return new Promise((resolve, reject) => {
//       db.query(sql, params, (err, results) => {
//         if (err) return reject(err);
//         resolve(results);
//       });
//     });
//   };

//   try {
//     const classworkData = {
//       school,
//       campus,
//       termName,
//       className,
//       section,
//       session,
//       subject,
//       title,
//       marks,
//       date,
//       creatorID,
//       creatorName,
//     };

//     // Insert class test
//     const insertResult = await query(
//       "INSERT INTO student_classtest_list SET ?",
//       classworkData
//     );

//     const insertId = insertResult.insertId || 0;

//     // Fetch device tokens
//     const tokenQuery = `
//       SELECT *
//       FROM (
//         SELECT sli.device, sli.student_id
//         FROM student AS s
//         INNER JOIN class_name AS cn ON cn.class_name = s.Class
//         INNER JOIN student_login_information AS sli ON s.student_id = sli.student_id
//         WHERE cn.class_name = ? AND s.section = ? AND cn.campus = ?
      
//         UNION ALL
      
//         SELECT pli.device, pli.student_id
//         FROM student AS s
//         INNER JOIN class_name AS cn ON cn.class_name = s.Class
//         INNER JOIN parent_login_information AS pli ON s.student_id = pli.student_id
//         WHERE cn.class_name = ? AND s.section = ? AND cn.campus = ?
//       ) AS all_devices group BY student_id;
//     `;

//     const tokens = await query(tokenQuery, [className, section, campus, className, section, campus]);

//     // Send push notifications
//     for (const row of tokens) {
//       try {
//           const formattedDate = new Date(date).toLocaleDateString('en-US', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric'
//     });
//          await sendNotification(
//       row.device||null,
//       "Upcoming Class Test Reminder ðŸ“š",
//       `Dear Student, you have a ${title} in ${subject} scheduled on ${formattedDate}. Best of luck!`,
//       "http://test.com",
//       "classtest",
//       insertId,
//       row.student_id
//     );
//       } catch (notifyErr) {
//         console.warn("Notification error:", notifyErr.message);
//       }
//     }

//     res.json({
//       ok: true,
//       message: "Class Test has been successfully added",
//     });

//   } catch (err) {
//     console.error("Error:", err);
//     res.status(500).json({ ok: false, message: err.message });
//   }
// });





// router.post("/DeleteTermReportParameter", (req, res) => {
//     const { id } = req.body;
//     const query = `DELETE FROM term_report_parameter WHERE id = ?`;
//      db.query(query,[id],(err, result) => {
//      if (err) {
//         res.json({ ok: false });
//       } else {
//         res.json({ ok: true });
//       }
//     });
// });



// get class routine by class and section
// meeting plan

// router.post("/addDiary", async (req, res) => {
//   const {
//     session,
//     date,
//     class: class_name,
//     section,
//     subject,
//     student_id,
//     note,
//   } = req.body;

//   if (!session || !date || !class_name || !section || !subject || !student_id || !note) {
//     return res.status(400).json({ ok: false, message: "Missing required fields." });
//   }

//   let filename = "";

//   try {
//     if (req.files && req.files.media) {
//       filename = await uploadFile(req, "media");
//     }
//   } catch (uploadErr) {
//     console.error("File upload error:", uploadErr.message);
//     return res.status(500).json({ ok: false, message: "File upload failed." });
//   }

//   const insertSql = `
//     INSERT INTO student_diary (session, date, class, section, subject, student_id, note, media, approve)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   db.query(insertSql, [session, date, class_name, section, subject, student_id, note, filename, 0], async (err, result) => {
//     if (err) {
//       console.error("Database query error:", err.message);
//       return res.status(500).json({ ok: false, message: "Internal server error." });
//     }

//     return res.json({
//             ok: true,
//             message: "Records have been successfully added.",
//           });
//   });
// });



// router.post("/addDiary", async (req, res) => {
//   const {
//     session,
//     date,
//     class: class_name,
//     section,
//     subject,
//     student_id,
//     note,
//     classwork,
//     homework
//   } = req.body;

//   if (!session || !date || !class_name || !section || !subject || !student_id || !note) {
//     return res.status(400).json({ ok: false, message: "Missing required fields." });
//   }

//   let filename = "";

//   try {
//     if (req.files && req.files.media) {
//       filename = await uploadFile(req, "media");
//     }
//   } catch (uploadErr) {
//     console.error("File upload error:", uploadErr.message);
//     return res.status(500).json({ ok: false, message: "File upload failed." });
//   }

//   const insertSql = `
//     INSERT INTO student_diary (session, date, class, section, subject, student_id, note, classwork, homework, media, approve)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   db.query(insertSql, [session, date, class_name, section, subject, student_id, note, classwork, homework ,filename, 0], async (err, result) => {
//     if (err) {
//       console.error("Database query error:", err.message);
//       return res.status(500).json({ ok: false, message: "Internal server error." });
//     }

//     return res.json({
//       ok: true,
//       message: "Records have been successfully added.",
//     });
//   });
// });



// router.post("/approveDiary", (req, res) => {
//   const { id } = req.body;

//   if (!id) return res.status(400).json({ message: "Diary ID is required" });

//   db.query("UPDATE student_diary SET approve = 1 WHERE id = ?", [id], (err) => {
//     if (err) {
//       return res.status(500).json({ message: err.message });
//     }
    
//     // Fetch the diary entry
//     const sql = "SELECT * FROM student_diary WHERE id = ?";
//     db.query(sql, [id], async (err, result) => {
//       if (err || !result.length) {
//         return res.status(500).json({ message: "Failed to fetch diary data" });
//       }

//       const data = result[0];
//       const { student_id, subject, note, section } = data;

//       try {
//         if (student_id === "All") {
//           const tokenQuery = `
//             SELECT *
//             FROM (
//               SELECT sli.device, sli.student_id
//               FROM student s
//               JOIN student_login_information sli ON s.student_id = sli.student_id
//               WHERE s.Class = ? AND s.section = ?

//               UNION

//               SELECT pli.device, pli.student_id
//               FROM student s
//               JOIN parent_login_information pli ON s.student_id = pli.student_id
//               WHERE s.Class = ? AND s.section = ?
//             ) AS all_devices
//              GROUP BY student_id
//           `;

//           db.query(tokenQuery, [data.class, section, data.class, section], async (tokenErr, tokens) => {
//             if (tokenErr) {
//               console.error("Token fetch error:", tokenErr.message);
//               return res.status(500).json({ message: "Failed to fetch tokens" });
//             }

//             for (const row of tokens) {
//               try {
//                 await sendNotification(
//                   row.device||null,
//                   `New diary added for ${subject}`,
//                   note,
//                   "http://test.com",
//                   "diary",
//                   id,
//                   row.student_id
//                 );
//               } catch (notifyErr) {
//                 console.warn("Notification sending error:", notifyErr.message);
//               }
//             }

//             return res.json({ ok: true, message: "Diary approved and notifications sent to all" });
//           });
//         } else {
//           // Send to individual student and parent (if device exists)
//           const tokenQuery = `
//             SELECT student_id, device
//             FROM (
//               SELECT pli.student_id, pli.device
//               FROM parent_login_information pli
//               WHERE pli.student_id = ?

//               UNION

//               SELECT sli.student_id, sli.device
//               FROM student_login_information sli
//               WHERE sli.student_id = ?
//             ) AS combined_devices
//             GROUP BY student_id
//           `;

//           db.query(tokenQuery, [student_id, student_id], async (tokenErr, tokens) => {
//             if (tokenErr) {
//               console.error("Token fetch error:", tokenErr.message);
//               return res.status(500).json({ message: "Failed to fetch device tokens" });
//             }

//             for (const row of tokens) {
//               try {
//                 await sendNotification(
//                   row.device||null,
//                   `New diary added for ${subject}`,
//                   note,
//                   "http://test.com",
//                   "diary",
//                   id,
//                   student_id
//                 );
//               } catch (notifyErr) {
//                 console.warn("Notification sending error:", notifyErr.message);
//               }
//             }

//             return res.json({  ok: true});
//           });
//         }
//       } catch (mainErr) {
//         console.error("Main error:", mainErr.message);
//         return res.status(500).json({ message: "Approval successful, but notification failed" });
//       }
//     });
    
    
//   });
// });












// router.post("/getDiary", (req, res) => {
//   const { session, className, section } = req.body;
//   let sql = `SELECT * FROM student_diary WHERE session = ?`;
//   let queryParam = [session];

//   if (className) {
//     sql = sql + " AND class = ?";
//     queryParam.push(className);
//   }
//   if (section) {
//     sql = sql + " AND section = ?";
//     queryParam.push(section);
//   }

//   sql = sql + " ORDER BY date desc";

//   db.query(sql, queryParam, (err, result) => {
//     if (err) {
//       res.json({ ok: false, message: err });
//     } else {
//       res.json({ ok: true, message: result });
//     }
//   });
// });



//addExtraClass

// lesson plan
// router.post("/updateLessonPlans", (req, res) => {
//   const {
//     weekly_date_id,
//     day_of_week,
//     subject_id,
//     subjectName,
//     teacher_id,
//     plan_details,
//     materials,
//     notebooks,
//     homework,
//     date
//   } = req.body;

//   // Update for weeklyLessonPlans
//   const updateLessonPlansQuery = new Promise((resolve, reject) => {
//     db.query(
//       "UPDATE weeklyLessonPlans SET ? WHERE weekly_date_id = ? AND day_of_week=? AND subject_id=?",
//       [
//         { books: materials, notebooks: notebooks, plan_details: plan_details, update_date: dhakaTime },
//         weekly_date_id,
//         day_of_week,
//         subject_id
//       ],
//       (err, result) => {
//         if (err) {
//           console.error('Error updating Lesson Plans:', err);
//           return reject({ message: "Error updating Lesson Plans", info: err });
//         }
//         resolve(result);
//       }
//     );
//   });

//   // Update for student_homework_list
//   const updateHomeworkListQuery = new Promise((resolve, reject) => {
//     db.query(
//       "UPDATE student_homework_list SET ? WHERE date = ? AND subject = ?",
//       [{ title: homework }, date, subjectName],
//       (err, result) => {
//         if (err) {
//           console.error('Error updating Homework List:', err);
//           return reject({ message: "Error updating Homework List", info: err });
//         }
//         resolve(result);
//       }
//     );
//   });

//   // Update for student_classwork_list
//   const updateClassworkListQuery = new Promise((resolve, reject) => {
//     db.query(
//       "UPDATE student_classwork_list SET ? WHERE date = ? AND subject = ?",
//       [{ title: plan_details }, date, subjectName],
//       (err, result) => {
//         if (err) {
//           console.error('Error updating Classwork List:', err);
//           return reject({ message: "Error updating Classwork List", info: err });
//         }
//         resolve(result);
//       }
//     );
//   });

//   // Run all queries in parallel and handle the result
//   Promise.all([updateLessonPlansQuery, updateHomeworkListQuery, updateClassworkListQuery])
//     .then(() => {
//       res.json({ message: true, info: "Lesson Plans updated successfully" });
//     })
//     .catch((error) => {
//       res.status(500).json(error);
//     });
// });



// router.post('/postLessonPlans', (req, res) => {
//   const {
//     weekly_date_id,
//     day_of_week,
//     subject_id,
//     subjectName,
//     teacher_id,
//     plan_details,
//     materials,
//     notebooks,
//     homework,
//     date,
//     compile,
//     AcademicData
//   } = req.body;

//   if (!subject_id || !subjectName) {
//     return res.status(400).json({ message: "subject_id and subjectName are required fields" });
//   }

//   let info;
//   try {
//     info = JSON.parse(AcademicData);
//   } catch (error) {
//     return res.status(400).json({ message: "Invalid AcademicData format", info: error });
//   }

//   const weeklyLessonPlans = {
//     weekly_date_id,
//     day_of_week,
//     date,
//     subject_id,
//     books: materials,
//     notebooks,
//     teacher_id,
//     plan_details,
//     create_date: dhakaTime
//   };

//   db.query("INSERT INTO weeklyLessonPlans SET ?", weeklyLessonPlans, (err, lessonPlansResult) => {
//     if (err) {
//       console.error('Error inserting Lesson Plans:', err);
//       return res.status(500).json({ message: "Error inserting Lesson Plans", info: err });
//     }

//     const id = lessonPlansResult.insertId;

//     const homeworkData = {
//       school: info[0].school,
//       termName: info[0].termName,
//       className: info[0].className,
//       section: info[0].section,
//       session: info[0].session,
//       subject: subjectName,
//       title: homework,
//       date,
//       weekly_date_id: id,
//       creatorID: info[0].creatorID,
//       creatorName: info[0].creatorName
//     };

//     const classworkData = {
//       school: info[0].school,
//       className: info[0].className,
//       termName: info[0].termName,
//       section: info[0].section,
//       session: info[0].session,
//       subject: subjectName,
//       title: plan_details,
//       date,
//       weekly_date_id: id,
//       creatorID: info[0].creatorID,
//       creatorName: info[0].creatorName
//     };

//     Promise.all([
//       new Promise((resolve, reject) => {
//         db.query("INSERT INTO student_homework_list SET ?", homeworkData, (err, result) => {
//           if (err) {
//             console.error('Error inserting Homework Data:', err);
//             reject({ message: "Error inserting Homework Data", info: err });
//           } else {
//             resolve(result);
//           }
//         });
//       }),
//       new Promise((resolve, reject) => {
//         db.query("INSERT INTO student_classwork_list SET ?", classworkData, (err, result) => {
//           if (err) {
//             console.error('Error inserting Classwork Data:', err);
//             reject({ message: "Error inserting Classwork Data", info: err });
//           } else {
//             resolve(result);
//           }
//         });
//       })
//     ])
//     .then(() => {
//       res.json({ message: true, info: "Lesson Plans added successfully" });
//     })
//     .catch((error) => {
//       res.status(500).json(error);
//     });
//   });
// });


// router.post("/UpdateResultPublish", (req, res) => {
//   const { id, status } = req.body;

//   db.query(`SELECT * FROM publish_result WHERE id = ?`, [id], async (err, results) => {
//     if (err) {
//       console.error("Fetch publish_result error:", err);
//       return res.status(500).json({ error: "Database fetch error", details: err });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ error: "Publish result not found" });
//     }

//     const publishResult = results[0];
//     const className = publishResult.className;
//     const sectionName = publishResult.sectionName;

    
//       const tokenQuery = `
//         SELECT device, MIN(student_id) AS student_id
//         FROM (
//           SELECT sli.device, sli.student_id
//           FROM student AS s
//           JOIN class_name AS cn ON cn.class_name = s.Class
//           JOIN student_login_information AS sli ON s.student_id = sli.student_id
//           WHERE cn.class_name = ? AND s.section = ?
          
//           UNION ALL
          
//           SELECT pli.device, pli.student_id
//           FROM student AS s
//           JOIN class_name AS cn ON cn.class_name = s.Class
//           JOIN parent_login_information AS pli ON s.student_id = pli.student_id
//           WHERE cn.class_name = ? AND s.section = ?
//         ) AS all_devices
//         GROUP BY student_id
//       `;

//       db.query(tokenQuery, [className, sectionName, className, sectionName], async (tokenErr, tokens) => {
//         if (tokenErr) {
//           console.error("Device token fetch error:", tokenErr);
//           return res.status(500).json({ error: "Device token fetch error", details: tokenErr });
//         }

//         for (const row of tokens) {
//           try {
//               if (status === "Publish") {
//             await sendNotification(
//               row.device||null,
//               "Result Published",
//               `Term Report Has been Publish for ${publishResult.className}`,
//               "http://test.com",
//               "TermReport",
//               id,
//               row.student_id
//             );
//               }
//           } catch (notifyErr) {
//             console.warn("Notification sending error:", notifyErr.message);
//           }
//         }

//         // After notifications, update status
//         db.query(
//           `UPDATE publish_result SET status = ? WHERE id = ?`,
//           [status, id],
//           (updateErr, updateResult) => {
//             if (updateErr) {
//               console.error("Update publish_result error:", updateErr);
//               return res.status(500).json({ error: "Update error", details: updateErr });
//             }
//             res.json({ message: true });
//           }
//         );
//       });

    
//   });
// });




// router.post("/UpdateMonthlyReportPublish", (req, res) => {
//   const { id, status } = req.body;

//   db.query(`SELECT * FROM monthly_progress_report WHERE id = ?`, [id], async (err, results) => {
//     if (err) {
//       console.error("Fetch publish_result error:", err);
//       return res.status(500).json({ error: "Database fetch error", details: err });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ error: "Publish result not found" });
//     }

//     const publishResult = results[0];
//     const className = publishResult.class_name;
//       const tokenQuery = `
//         SELECT device, MIN(student_id) AS student_id
//         FROM (
//           SELECT sli.device, sli.student_id
//           FROM student AS s
//           JOIN class_name AS cn ON cn.class_name = s.Class
//           JOIN student_login_information AS sli ON s.student_id = sli.student_id
//           WHERE cn.class_name = ?
          
//           UNION ALL
          
//           SELECT pli.device, pli.student_id
//           FROM student AS s
//           JOIN class_name AS cn ON cn.class_name = s.Class
//           JOIN parent_login_information AS pli ON s.student_id = pli.student_id
//           WHERE cn.class_name = ?
//         ) AS all_devices
//         GROUP BY student_id
//       `;

//       db.query(tokenQuery, [className, className], async (tokenErr, tokens) => {
//         if (tokenErr) {
//           console.error("Device token fetch error:", tokenErr);
//           return res.status(500).json({ error: "Device token fetch error", details: tokenErr });
//         }

//         for (const row of tokens) {
//           try {
//               if (status === "Publish") {
//             await sendNotification(
//               row.device||null,
//               "Result Published",
//               `Monthly progress has been publish for ${className}`,
//               "http://test.com",
//               "MonthlyReport",
//               id,
//               row.student_id
//             );
//               }
//           } catch (notifyErr) {
//             console.warn("Notification sending error:", notifyErr.message);
//           }
//         }

//         // After notifications, update status
//         db.query(
//         "UPDATE monthly_progress_report SET ? WHERE id = ?",
//         [{ publish:status }, id],
//         (err, result) => {
//           if (err) {
//             res.json({ message: err });
//           } else {
//             res.json({ message: true });
//           }
//         }
//       );
//       });

    
//   });
// });






// router.post('/getMonthlyReportAll', (req, res) => {
//   const { className, section, campus, startDate, endDate, studentId } = req.body;

//   let sql = `
//     SELECT 
//       s.student_id,
//       s.student_first_name,
//       s.student_last_name,
//       trp.subject_name,
//       IFNULL(COUNT(DISTINCT shl.id), 0) AS homeWork,
//       IFNULL(SUM(CASE WHEN shr.progress = 1 THEN 1 ELSE 0 END), 0) AS doneHomeWork,
//       IFNULL(scl.title, 'No Class Test') AS classtest_title,
//       IFNULL(scl.marks, 0) AS marks,
//       IFNULL(scr.obtain_marks, 0) AS obtain_marks
//     FROM 
//       student AS s
//     LEFT JOIN
//       term_report_parameter AS trp ON trp.className = s.Class
//     LEFT JOIN 
//       student_homework_list AS shl ON shl.subject = trp.subject_name 
//       AND s.Class = shl.className 
//       AND s.section = shl.section
//       AND shl.date BETWEEN ? AND ?
//     LEFT JOIN 
//       student_homework_response AS shr ON shr.selectedWorkID = shl.id 
//       AND shr.student_id = s.student_id
//     LEFT JOIN 
//       student_classtest_list AS scl ON scl.subject = trp.subject_name
//       AND s.Class = scl.className 
//       AND s.section = scl.section
//       AND scl.date BETWEEN ? AND ?
//     LEFT JOIN 
//       student_classtest_response AS scr ON scr.selectedTestID = scl.id
//       AND scr.student_id = s.student_id
//     WHERE 
//       s.campus = ?
//       AND s.Class = ?
//       AND s.section = ?
//       ${studentId ? 'AND s.student_id = ?' : ''}
//     GROUP BY 
//       s.student_id, trp.subject_name, scl.id, scl.title, scl.marks, scr.obtain_marks
//     ORDER BY trp.id ASC  
//       ;
//   `;

//   const queryParams = [startDate, endDate, startDate, endDate, campus, className, section];
//   if (studentId) queryParams.push(studentId);



//   db.query(sql, queryParams, (err, reportResults) => {
//     if (err) {
//       console.error("Error fetching report data:", err);
//       return res.status(500).json({ error: 'Error fetching report data', details: err });
//     }

//     const reportData = reportResults.reduce((acc, row) => {
//       let studentEntry = acc.find(entry => entry.studentId === row.student_id);
//       if (!studentEntry) {
//         studentEntry = {
//           studentId: row.student_id,
//           studentName: `${row.student_first_name} ${row.student_last_name}`,
//           subjectData: [],
//           attendanceData: null,
//         };
//         acc.push(studentEntry);
//       }

//       let subjectEntry = studentEntry.subjectData.find(subject => subject.subjectName === row.subject_name);
//       if (!subjectEntry) {
//         subjectEntry = {
//           subjectName: row.subject_name,
//           homeWork: row.homeWork,
//           doneHomeWork: row.doneHomeWork,
//           classTestData: []
//         };
//         studentEntry.subjectData.push(subjectEntry);
//       }

//       subjectEntry.classTestData.push({
//         classtestTitle: row.classtest_title,
//         marks: row.marks,
//         obtain_marks: row.obtain_marks
//       });

//       return acc;
//     }, []);

//     if (reportData.length === 0) {
//       return res.json([]);
//     }

//     // Now fetch attendance data
//     const attendanceQuery = `
//       SELECT 
//           COUNT(Student_Attendance.date) AS total_days,
//           SUM(CASE WHEN Student_Attendance.attendance = 1 THEN 1 ELSE 0 END) AS present,
//           SUM(CASE WHEN Student_Attendance.attendance = 0 THEN 1 ELSE 0 END) AS absent,
//           Student_Attendance.student_id,
//           s.campus,
//           CONCAT(s.student_first_name, ' ', s.student_last_name) AS student_name
//       FROM 
//           Student_Attendance
//       JOIN 
//           student AS s ON s.student_id = Student_Attendance.student_id
//       WHERE 
//           s.Class = ? AND s.section = ? 
//           AND s.campus = ? 
//           AND Student_Attendance.date BETWEEN ? AND ?
//           ${studentId ? "AND Student_Attendance.student_id = ?" : ""}
//       GROUP BY 
//           Student_Attendance.student_id;
//     `;

//     const attendanceParams = studentId 
//       ? [className, section, campus, startDate, endDate, studentId] 
//       : [className, section, campus, startDate, endDate];

   

//     db.query(attendanceQuery, attendanceParams, (err, attendanceResults) => {
//       if (err) {
//         console.error("Error fetching attendance data:", err);
//         return res.status(500).json({ error: 'Error fetching attendance data', details: err });
//       }

//       attendanceResults.forEach(att => {
//         const studentEntry = reportData.find(entry => entry.studentId === att.student_id);
//         if (studentEntry) {
//           studentEntry.attendanceData = {
//             totalDays: att.total_days,
//             present: att.present,
//             absent: att.absent,
//           };
//         }
//       });

//       res.json(reportData);
//     });
//   });
// });

@Injectable()
export class AcademicService {
  constructor(
    private readonly database: DatabaseService,
    private readonly notifications: NotificationService,
    private readonly upload: UploadService
  ) {
    db = this.database;
    sendNotification = (...args: any[]) => this.notifications.sendNotification(...args);
    sendAttendanceNotification = (...args: any[]) => this.notifications.sendAttendanceNotification(...args);
    publicDirectory = this.upload.publicDirectory;
  
  }

  async send_test_notification(req: any, res: any) {
  const { token, title, body, url, className, id } = req.body;

  const result = await sendNotification(token, title, body, url, className, id);
  res.json(result);
}

  async addExamSchedule(req: any, res: any) {
  const { classId, title, term, session, compile } = req.body;

  const query = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

  try {
    let filename = "";

    // 1️⃣ HANDLE FILE UPLOAD
    if (req.files && req.files.media) {
      try {
        filename = await uploadFile(req, "media");
      } catch (err) {
        return res
          .status(500)
          .json({ ok: false, message: "File upload failed" });
      }
    }

    // 2️⃣ INSERT / UPDATE EXAM SCHEDULE
    const insertResult = await query(
      `
      INSERT INTO ExamSchedule (classId, title, term, session, media, compile)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        media = VALUES(media),
        compile = VALUES(compile)
      `,
      [classId, title, term, session, filename, compile]
    );

    const insertId = insertResult.insertId ?? 0;

    // 3️⃣ FETCH STUDENTS OF THIS CLASS
    const students = await query(
      `
      SELECT s.student_id
      FROM student s
      LEFT JOIN class_name cn ON cn.class_name = s.Class
      WHERE cn.id = ?
      `,
      [classId]
    );

    if (!students.length) {
      return res.json({
        ok: true,
        message: "Exam schedule added but no students found.",
      });
    }

    const studentIds = students.map((s) => s.student_id);

    // 4️⃣ FETCH STUDENT TOKENS
    const studentTokens = await query(
      `
      SELECT student_id, device
      FROM student_login_information
      WHERE student_id IN (?)
      AND device IS NOT NULL
      `,
      [studentIds]
    );

    // 5️⃣ FETCH PARENT TOKENS
    const parentTokens = await query(
      `
      SELECT student_id, device
      FROM parent_login_information
      WHERE student_id IN (?)
      AND device IS NOT NULL
      `,
      [studentIds]
    );

    // 6️⃣ MERGE TOKENS
    const allTokens = [...studentTokens, ...parentTokens];

    // Optional: remove duplicate tokens
    const uniqueTokens = Array.from(
      new Map(allTokens.map((i) => [i.device, i])).values()
    );

    // 7️⃣ SEND PUSH NOTIFICATIONS
    for (const row of uniqueTokens) {
      try {
        await sendNotification(
          row.device,
          "Exam Schedule 📘",
          title,
          "http://test.com",
          "ExamSchedule",
          insertId,
          row.student_id
        );
      } catch (err) {
        console.warn("Notification failed:", err.message);
      }
    }

    // 8️⃣ RESPONSE
    res.json({
      ok: true,
      message: "Exam schedule added & notifications sent successfully.",
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      ok: false,
      message: "Server error",
      error: error.message,
    });
  }
}

  getExamSchedule(req: any, res: any) {
  let { classId, term, session, page = 1, limit = 10000 } = req.body;

  if (!session) {
    return res.status(400).json({ error: "Session is mandatory" });
  }

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10000;
  const offset = (page - 1) * limit;

  let baseQuery = `
    FROM ExamSchedule 
    JOIN class_name AS cn ON cn.id = ExamSchedule.classId
    WHERE ExamSchedule.session = ?`;
  const values = [session];

  if (classId) {
    baseQuery += " AND ExamSchedule.classId = ?";
    values.push(classId);
  }
  if (term) {
    baseQuery += " AND ExamSchedule.term = ?";
    values.push(term);
  }

 
  const countQuery = `SELECT COUNT(*) AS total ${baseQuery}`;

  db.query(countQuery, values, (err, countResult) => {
    if (err) {
      console.error("Error executing count query:", err);
      return res.status(500).json({ error: "Database count query error" });
    }

    const total = countResult[0].total;

   
    const dataQuery = `SELECT ExamSchedule.*, cn.class_name ${baseQuery} LIMIT ? OFFSET ?`;
    const dataValues = [...values, limit, offset];

    db.query(dataQuery, dataValues, (err, result) => {
      if (err) {
        console.error("Error executing data query:", err);
        return res.status(500).json({ error: "Database data query error" });
      }

      res.json({
        message: result,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    });
  });
}

  deleteExamSchedule(req: any, res: any) {
  const { id } = req.body;
  db.query("DELETE FROM ExamSchedule WHERE id = ?", id, (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
}

  addPeriods(req: any, res: any) {
  const {class_name, campus, session, type,name, start_time, end_time} = req.body;
  db.query("INSERT INTO periods SET ?",{class_name, campus, session,type,name, start_time, end_time},(err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );  
}

  getPeriodsList(req: any, res: any) {
  const { class_name,campus, session } = req.body;
  
  db.query(
    "SELECT * FROM `periods` WHERE class_name = ? AND campus = ? AND session = ?",
    [class_name, campus, session],
    (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ error: "Database query error" });
      }
      res.json({ message: result });
    }
  );
}

  getPeriods(req: any, res: any) {
  const { class_name, campus, session } = req.body;
  
  db.query(
    "SELECT * FROM `periods` WHERE class_name = ? AND type='Period' AND campus = ? AND session = ?",
    [class_name, campus, session],
    (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ error: "Database query error" });
      }
      res.json({ message: result });
    }
  );
}

  updatePeriods(req: any, res: any) {
  const { id,name,type,start_time, end_time } = req.body;
  db.query(
    "UPDATE periods SET ? WHERE id = ?",
    [{ name:name,type:type,start_time:start_time, end_time:end_time }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  deletePeriods(req: any, res: any) {
  const { id } = req.body;
  db.query("DELETE FROM periods WHERE id = ?", id, (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
}

  async bulkUpsertRoutine(req: any, res: any) {
    const routines = JSON.parse(req.body.routines); // Ensure correct parsing

    try {
        const insertQuery = `
            INSERT INTO newRoutine (class_name, section_name, campus, session, day, period_id, subject_id, teacher_id)
            VALUES ?
            ON DUPLICATE KEY UPDATE
                subject_id = VALUES(subject_id),
                teacher_id = VALUES(teacher_id)
        `;

        const values = routines.flatMap(routine =>
            routine.periods.map(period => [
                period.class_name,
                period.section_name,
                period.campus,
                period.session,
                routine.day,
                period.periodId,
                period.subjectId,
                period.teacherId
            ])
        );

        db.query(insertQuery, [values], (err, result) => {
            if (err) {
                console.error("Error executing query:", err); // Log the full error
                return res.status(500).json({ ok: false, message: "Database error occurred.", error: err.message });
            } else {
                console.log("Result from DB query:", result); // Log the result
                res.json({ ok: true, message: "Routine added successfully!", affectedRows: result.affectedRows,routines:routines });
            }
        });
    } catch (error) {
        console.error("Error inserting routine data:", error);
        res.status(500).json({
            ok: false,
            message: "Server error. Please try again later.",
            error: error.message,
        });
    }
}

  async getRoutinesForTeacher(req: any, res: any) {
  const { emp_id } = req.body;

  if (!emp_id) {
    return res.status(400).json({ error: 'emp_id is required.' });
  }

  try {
    const query = `
      SELECT 
        nr.class_name,
        nr.section_name,
        nr.day,
        nr.subject_id,
        p.name,
        p.start_time,
        p.end_time
      FROM 
        (SELECT 'SAT' as day UNION SELECT 'SUN' UNION SELECT 'MON' UNION SELECT 'TUE' UNION SELECT 'WED' UNION SELECT 'THU') as days
      LEFT JOIN newRoutine as nr ON nr.teacher_id = ? AND nr.day = days.day
      LEFT JOIN periods as p ON nr.period_id = p.id AND p.type = 'Period'
      ORDER BY FIELD(days.day, 'SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU');
    `;

    db.query(query, [emp_id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Structure the response by day
      const daysOfWeek = ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU'];
      const formattedData = daysOfWeek.map(day => {
        // Filter routines for the current day
        const dayData = results.filter(item => item.day === day);

        return {
          day,
          data: dayData.length > 0 ? dayData : [],  // Return empty array if no data for the day
        };
      });

      res.status(200).json({ routines: formattedData });
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching routines.' });
  }
}

  getRoutinesForView(req: any, res: any) {
    const { class_name, section_name, campus, session } = req.body;
    const query = `
        SELECT 
        nr.day, 
        nr.class_name, 
        nr.section_name, 
        nr.campus, 
        nr.session,
        nr.period_id AS periodId, 
        nr.subject_id AS subjectId, 
        nr.teacher_id AS teacherId,
        e.emp_fname AS fName,
        e.emp_lname AS lName
        FROM newRoutine AS nr
        JOIN employee AS e ON nr.teacher_id = e.emp_id
        WHERE nr.class_name=? AND nr.section_name=? AND nr.campus=? AND nr.session=?
        ORDER BY nr.id ASC;
    `;

    // Corrected the missing comma here
    db.query(query, [class_name, section_name, campus, session], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query error' });
        }

        // Transform the results into the desired format
        const routines = results.reduce((acc, current) => {
            const { day, ...rest } = current;
            const dayEntry = acc.find(entry => entry.day === day);

            if (dayEntry) {
                dayEntry.periods.push(rest);
            } else {
                acc.push({ day, periods: [rest] });
            }

            return acc;
        }, []);

        res.json({ message: routines });
    });
}

  getRoutines(req: any, res: any) {
    const { class_name, section_name, campus, session } = req.body;
    const query = `
        SELECT 
            day, 
            class_name, 
            section_name, 
            campus, 
            session,
            period_id AS periodId, 
            subject_id AS subjectId, 
            teacher_id AS teacherId 
        FROM newRoutine 
        WHERE class_name=? AND section_name=? AND campus=? AND session=?
        ORDER BY id ASC;
    `;

    // Corrected the missing comma here
    db.query(query, [class_name, section_name, campus, session], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query error' });
        }

        // Transform the results into the desired format
        const routines = results.reduce((acc, current) => {
            const { day, ...rest } = current;
            const dayEntry = acc.find(entry => entry.day === day);

            if (dayEntry) {
                dayEntry.periods.push(rest);
            } else {
                acc.push({ day, periods: [rest] });
            }

            return acc;
        }, []);

        res.json({ message: routines });
    });
}

  addGroup(req: any, res: any) {
  const {group_name,class_name,section,session,campus,term,assigned_date,submission_date,coordinator,project_name,project_description} = req.body;
  db.query("INSERT INTO `group` SET ?",{group_name,class_name,section,session,campus,term,assigned_date,submission_date,coordinator,project_name,project_description},(err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  getGroups(req: any, res: any) {
    const{campus,session,class_name,section}=req.body;
  db.query("SELECT *FROM `group` WHERE campus=? AND session=? AND class_name=? AND section=?",[campus,session,class_name,section], (err, result) => {
    res.json({ message: result });
  });
}

  getgroupByClassSection(req: any, res: any) {
    const{campus,session,class_name,section}=req.body;
  db.query("SELECT *FROM `group` WHERE campus=? AND session=? AND class_name=?ANDsection=?",[campus,session,class_name,section], (err, result) => {
    res.json({ message: result });
  });
}

  addGroupAssignStudents(req: any, res: any) {
  const {group_id,student_id,student_name,role} = req.body;
  db.query("INSERT INTO group_assign_students  SET ?",{group_id,student_id,student_name,role},(err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  getGroupAssignStudents(req: any, res: any) {
    const{group_id}=req.body;
  db.query("SELECT *FROM group_assign_students WHERE group_id=?",[group_id], (err, result) => {
    res.json({ message: result });
  });
}

  updateGroupAssignStudents(req: any, res: any) {
  const { id,role } = req.body;
  db.query(
    "UPDATE group_assign_students SET ? WHERE id = ?",
    [{ role: role }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  deleteGroupAssignStudents(req: any, res: any) {
  const { id } = req.body;
  db.query("DELETE FROM group_assign_students WHERE id = ?", id, (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
}

  addGroupComments(req: any, res: any) {
  const {group_id,student_id,comments } = req.body;
  db.query("INSERT INTO group_project_comments   SET ?",{group_id,student_id,comments},(err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  getGroupComments(req: any, res: any) {
  const { group_id } = req.body;

  if (!group_id) {
    return res.status(400).json({ message: "group_id is required" });
  }

  const query = `
    SELECT 
      group_project_comments.*, 
      student.student_first_name, 
      student.student_last_name, 
      student.Class, 
      student.section 
    FROM 
      group_project_comments 
    INNER JOIN 
      student 
    ON 
      group_project_comments.student_id = student.student_id 
    WHERE 
      group_project_comments.group_id = ? 
    ORDER BY 
      group_project_comments.id DESC`;

  db.query(query, [group_id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database query error", error: err });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "No comments found for the provided group_id" });
    }

    res.status(200).json({ message: true, data: result });
  });
}

  addSection(req: any, res: any) {
  const { section, classname,class_id,session } = req.body;
  db.query(
    "INSERT INTO section SET ?",
    {
      section_name: section,
      class_name: classname,
      class_id: class_id,
      session: session,
      pstatus: "",
    },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  updateSection(req: any, res: any) {
  const { id, section } = req.body;
  db.query(
    "UPDATE section SET ? WHERE id = ?",
    [{ section_name: section }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  deleteSubstituteTeacher(req: any, res: any) {
  const { id } = req.body;
  db.query("DELETE FROM substitute_teacher WHERE id = ?", id, (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
}

  UpdateStatusSubstituteTeacher(req: any, res: any) {
  const { id,status } = req.body;
  db.query("UPDATE substitute_teacher SET ? WHERE id = ?",[{ status: status }, id], (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
}

  addSubstituteTeacher(req: any, res: any) {
  const {period_id, routine_id, session,term,date, teacher, subTeacher } = req.body;
  db.query(
    "INSERT INTO substitute_teacher SET ?",{period_id, routine_id, session,term,date, teacher, subTeacher},(err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true,data:req.body });
      }
    }
  );
}

  getSubstituteTeacherData(req: any, res: any) {
    const { class_name, section_name, startDate, endDate, teacher, subTeacher } = req.body;

    let query = `
    SELECT 
        st.id,
        st.date, 
        st.term, 
        st.teacher, 
        st.subTeacher,
        st.status,
        nr.class_name,
        nr.section_name,
        nr.subject_id,
        p.name AS period_name,
        CONCAT(p.start_time, '-', p.end_time) AS timePeriod,
        CONCAT(et.emp_fname, ' ', et.emp_lname) AS eTeacher,  
        CONCAT(subEmp.emp_fname, ' ', subEmp.emp_lname) AS sTeacher  
    FROM substitute_teacher AS st
    JOIN employee AS et ON et.emp_id = st.teacher  
    JOIN employee AS subEmp ON subEmp.emp_id = st.subTeacher 
    LEFT JOIN newRoutine AS nr ON nr.id = st.routine_id
    LEFT JOIN periods AS p ON p.id = st.period_id
    WHERE 1=1
    `;

    const params = [];
    
    if (class_name) {
        query += " AND nr.class_name = ?";
        params.push(class_name);
    }
    if (section_name) {
        query += " AND nr.section_name = ?";
        params.push(section_name);
    }
    if (teacher) {
        query += " AND st.teacher = ?";
        params.push(teacher);
    }
    if (subTeacher) {
        query += " AND st.subTeacher = ?";
        params.push(subTeacher);
    }
    if (startDate && endDate) {
        query += " AND st.date BETWEEN ? AND ?";
        params.push(startDate, endDate);
    }

    db.query(query, params, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.json({ data: result });
    });
}

  addSubject(req: any, res: any) {
  const { subject_name, class_name,campus,session } = req.body;
  db.query(
    "INSERT INTO subject_list SET ?",
    {
      subject_name,
      class_name,
      campus,
      session,
      pstatus: "",
    },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  updateSubject(req: any, res: any) {
  const { id, subject } = req.body;
  db.query(
    "UPDATE subject_list SET ? WHERE id = ?",
    [{ subject_name: subject }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  updateReportStatus(req: any, res: any) {
  const { id, status } = req.body;
  db.query(
    "UPDATE subject_list SET ? WHERE id = ?",
    [{ report_eligibility: status }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  getSection(req: any, res: any) {
    const{session,campus}=req.body;
  db.query("SELECT s.*,cn.campus FROM `section` AS s JOIN class_name AS cn ON cn.id=s.class_id WHERE s.session=? AND cn.campus=? GROUP BY s.id",[session,campus], (err, result) => {
    res.json({ message: result });
  });
}

  deleteSection(req: any, res: any) {
  const { id } = req.body;
  db.query("DELETE FROM section WHERE id = ?", id, (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
}

  getSubject(req: any, res: any) {
  db.query("SELECT *FROM subject_list", (err, result) => {
    res.json({ message: result });
  });
}

  deleteSubject(req: any, res: any) {
  const { id } = req.body;
  db.query("DELETE FROM subject_list WHERE id = ?", id, (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
}

  getSectionApprovel(req: any, res: any) {
  db.query("SELECT *FROM section WHERE pstatus=''", (err, result) => {
    res.json({ message: result });
  });
}

  getSubjectApprovel(req: any, res: any) {
  db.query("SELECT *FROM subject_list WHERE pstatus=''", (err, result) => {
    res.json({ message: result });
  });
}

  UpdateSectionApprovel(req: any, res: any) {
  const { id, status } = req.body;
  db.query(
    "UPDATE section SET ? WHERE id = ?",
    [{ pstatus: status }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  UpdateSubjectApprovel(req: any, res: any) {
  const { id, status } = req.body;
  db.query(
    "UPDATE subject_list SET ? WHERE id = ?",
    [{ pstatus: status }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  addClass(req: any, res: any) {
  const { class_name, campus, class_type, session,order } = req.body;
  db.query(
    "INSERT INTO class_name SET ?",
    { class_name, campus, class_type, session, pstatus: "",order },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  getClass(req: any, res: any) {
  const { session,campus } = req.body;
  db.query("SELECT * FROM class_name WHERE session=? AND campus=?", [session,campus], (err, result) => {
     res.json({ message: result });
  });
}

  getStudentByID(req: any, res: any) {
  const { student_id } = req.body;
  db.query(
    "SELECT *FROM student WHERE student_id=?",
    [student_id],
    (err, result) => {
      res.json({ message: result });
    }
  );
}

  getStudentByClassSectionWithCampus(req: any, res: any) {
  const { class_name, section_name, session,campus } = req.body;
  db.query(
    "SELECT *FROM student WHERE Class=? AND section=? AND session=? AND campus=?",
    [class_name, section_name, session,campus],
    (err, result) => {
      res.json({ message: result });
    }
  );
}

  getStudentByClassSection(req: any, res: any) {
  const { class_name, section_name, session } = req.body;
  db.query(
    "SELECT *FROM student WHERE Class=? AND section=? AND session=?",
    [class_name, section_name, session],
    (err, result) => {
      res.json({ message: result });
    }
  );
}

  getClassApprovel(req: any, res: any) {
  db.query("SELECT *FROM class_name WHERE pstatus=''", (err, result) => {
    res.json({ message: result });
  });
}

  UpdateClassApprovel(req: any, res: any) {
  const { id, status } = req.body;
  db.query(
    "UPDATE class_name SET ? WHERE id = ?",
    [{ pstatus: status }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: id });
      }
    }
  );
}

  addSession(req: any, res: any) {
  const { session } = req.body;
  db.query("INSERT INTO session SET ?", { session }, (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
}

  getSession(req: any, res: any) {
  db.query("SELECT *FROM session", (err, result) => {
    res.json({ message: result });
  });
}

  getSessionActive(req: any, res: any) {
  db.query("SELECT *FROM session WHERE status=1", (err, result) => {
    res.json({ message: result });
  });
}

  getAttendanceForClass(req: any, res: any) {
  const { startDate, endDate, session, class_name, section,campus } = req.body;
  if (!startDate || !endDate || !session || !class_name || !section) {
    return res.status(400).json({ ok: false, message: "Missing required fields." });
  }
  const query = `
  SELECT 
    s.student_id, 
    CONCAT(s.student_first_name, ' ', s.student_last_name) AS student_name,  
    SUM(CASE WHEN sa.attendance = 0 THEN 1 ELSE 0 END) AS absand, 
    SUM(CASE WHEN sa.attendance = 1 THEN 1 ELSE 0 END) AS present
FROM  
	student AS s
LEFT JOIN 
     Student_Attendance AS sa
    ON sa.student_id = s.student_id
WHERE 
    sa.date BETWEEN ? AND ?
    AND sa.session = ? 
    AND s.Class = ?
    AND sa.section = ? 
    AND s.campus = ?
GROUP BY 
    s.student_id
ORDER BY 
    s.student_id ASC
  `;

  db.query(query, [startDate, endDate, session, class_name, section,campus], (err, result) => {
    if (err) {
      return res.status(500).json({ ok: false, message: "Internal server error." });
    }
    res.json({ ok: true, message: result });
  });
  
}

  getAttendanceForClassbyMonth(req: any, res: any) {
  const { month, session, class_name, section, campus } = req.body;

  if (!month || !session || !class_name || !section || !campus) {
    return res.status(400).json({ ok: false, message: "Missing required fields." });
  }

  const allDates = getDatesInMonth(month);
  const startDate = allDates[0];
  const endDate = allDates[allDates.length - 1];

  console.log("Generated dates for", month, ":", allDates);

  const query = `
    SELECT 
      s.student_id,
      CONCAT(s.student_first_name, ' ', s.student_last_name) AS student_name,
      sa.date,
      sa.attendance
    FROM 
      student AS s
    LEFT JOIN 
      Student_Attendance AS sa
      ON sa.student_id = s.student_id
      AND sa.class = s.Class
      AND sa.section = s.section
      AND sa.date >= ?
      AND sa.date <= ?
      AND sa.session = ?
    WHERE 
      s.Class = ?
      AND s.section = ?
      AND s.campus = ?
    ORDER BY 
      s.student_id, sa.date ASC
  `;

 
  db.query(
    query,
    [startDate, endDate, session, class_name, section, campus],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: "Internal server error." });
      }

      const result = {};

      rows.forEach(row => {
        if (!result[row.student_id]) {
          result[row.student_id] = {
            student_id: row.student_id,
            student_name: row.student_name,
            attendance: {},
            total_present: 0,
            total_absent: 0
          };

          // initialize the month dates
          allDates.forEach(date => {
            result[row.student_id].attendance[date] = null;
          });
        }

        if (row.date && allDates.includes(row.date)) {
          result[row.student_id].attendance[row.date] = row.attendance;

          if (row.attendance == 1) {
            result[row.student_id].total_present++;
          } else if (row.attendance == 0) {
            result[row.student_id].total_absent++;
          }
        }
      });

      res.json({ ok: true, message: Object.values(result) });
    }
  );
}

  getTotalAttendanceForClassSection(req: any, res: any) {
  const { date, session, campus } = req.body;
  if (!date || !session || !campus) {
    return res.status(400).json({ ok: false, message: "Missing required fields." });
  }

  const query = `
    SELECT 
      cn.campus,
      cn.class_name, 
      sec.section_name, 
      SUM(CASE WHEN sa.attendance = 0 THEN 1 ELSE 0 END) AS total_absent, 
      SUM(CASE WHEN sa.attendance = 1 THEN 1 ELSE 0 END) AS total_present
    FROM
      Student_Attendance AS sa
    LEFT JOIN 
      class_name AS cn 
      ON cn.class_name = sa.class AND
      cn.campus = sa.campus
    LEFT JOIN
      section AS sec 
      ON sec.class_id = cn.id AND sec.section_name = sa.section
    WHERE 
      sa.date = ?
      AND sa.session = ?
      AND cn.campus = ?
    GROUP BY 
       cn.campus, cn.class_name, sec.section_name
    ORDER BY 
      cn.class_name, sec.section_name ASC
  `;

  db.query(query, [date, session, campus], (err, result) => {
    if (err) {
      return res.status(500).json({ ok: false, message: "Internal server error." });
    }

    // Transform the query result into the desired format
    const transformedData = result.reduce((acc, { class_name, section_name, total_absent, total_present }) => {
      let classData = acc.find(item => item.class_name === class_name);

      if (!classData) {
        classData = { class_name, sectionData: [] };
        acc.push(classData);
      }

      classData.sectionData.push({
        sectionName: section_name,
        totalAbsent: total_absent,
        totalPresent: total_present
      });

      return acc;
    }, []);

    // Send the transformed data in the response
    res.json({ ok: true, data: transformedData });
  });
}

  deleteStudentAttendence(req: any, res: any) {
  const { date, session, class_name, section, campus } = req.body;
  if (!date || !session || !class_name || !section || !campus) {
    return res.status(400).json({
      ok: false,
      message: "All fields (date, session, class_name, section, campus) are required.",
    });
  }

  const deleteQuery = `
    DELETE sa FROM Student_Attendance AS sa
    JOIN student AS s ON sa.class = s.Class
                     AND sa.section = s.section
                     AND sa.session = s.session
    WHERE s.Class = ?
      AND s.section = ?
      AND s.session = ?
      AND s.campus = ?
      AND sa.date = ?
  `;

  db.query(
    deleteQuery,
    [class_name, section, session, campus, date],
    (err, result) => {
      if (err) {
        return res.status(500).json({ ok: false, message: "Database error", error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, message: "No matching records found to delete." });
      }

      res.json({ ok: true, message: "Attendance records deleted successfully.", result });
    }
  );
}

  getstudentattendence(req: any, res: any) {
  const { date, session, class_name, section, campus } = req.body;

  db.query(
    `
    SELECT 
      s.student_id,
      CONCAT(s.student_first_name, ' ', s.student_last_name) AS student_name, 
      COALESCE(sa.attendance, 1) AS attendance, 
      sa.date,
      sa.session,
      sa.section
    FROM 
      student AS s
    LEFT JOIN 
      Student_Attendance AS sa
      ON sa.student_id = s.student_id
      AND sa.date = ?  
      AND sa.session = ?
    WHERE 
      s.Class = ? 
      AND s.section = ?  
      AND s.campus = ?
    GROUP BY 
      s.student_id
    ORDER BY 
      s.student_id ASC;
    `,
    [date, session, class_name, section, campus],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

  getTermReport(req: any, res: any) {
    const { className, sectionName, campus, term, session, studentId } = req.body;

    const gradingMarksQuery = `SELECT * FROM grading_marks WHERE className = ? ORDER BY id ASC`;
    const gradingMarksParams = [className];

    const attendanceQuery = `
        SELECT 
            COUNT(DISTINCT Student_Attendance.date) AS total_days,
            SUM(CASE WHEN Student_Attendance.attendance = 1 THEN 1 ELSE 0 END) AS present,
            SUM(CASE WHEN Student_Attendance.attendance = 0 THEN 1 ELSE 0 END) AS absent,
            Student_Attendance.student_id,
            s.campus,
            CONCAT(s.student_first_name, ' ', s.student_last_name) AS student_name
        FROM 
            Student_Attendance
        JOIN 
            student AS s ON s.student_id = Student_Attendance.student_id
        WHERE 
            s.Class = ? AND s.section = ? AND Student_Attendance.termName = ? AND s.campus = ? AND Student_Attendance.session = ?
            ${studentId ? "AND Student_Attendance.student_id = ?" : ""}
        GROUP BY 
            Student_Attendance.student_id, s.campus
    `;
    const attendanceParams = studentId ? [className, sectionName, term, campus, session, studentId] : [className, sectionName, term, campus, session];

const subjectResultQuery = `
SELECT 
    str.student_id,
    str.student_name,
    str.subject,
    str.termName,
    str.className,
    str.section,
    ROUND(str.Term_Obtaint_Marks) AS Term_Obtaint_Marks,
    str.Term_Total_Marks,
    ROUND(str.CT_Obtaint_Marks) as CT_Obtaint_Marks,
    str.CT_Total_Marks,
    str.doneClassWork,
    str.TotalClassWork,
    str.doneHomeWork,
    str.TotalHomeWork,
    str.CW_Obtaint_Marks,
    str.CW_Total_Marks,
    str.HW_Obtaint_Marks,
    str.HW_Total_Marks,
    str.session,
    COALESCE(scp.total_marks, 0) AS total_marks,
    COALESCE(scp.obtain_marks, 0) AS obtain_marks,
    str.Term_Obtaint_Marks,
    ROUND(str.CT_Obtaint_Marks + 
          
         COALESCE(scp.obtain_marks, 0) + 
         str.Term_Obtaint_Marks) AS Grand_Obtain_Marks,
    gm.grade,
    gm.performance,
    gm.description,
    sl.id AS subject_order
FROM 
    student_term_report AS str
LEFT JOIN 
    student_class_performance AS scp 
    ON scp.student_id = str.student_id 
    AND scp.subject = str.subject
    AND scp.term = str.termName
    AND scp.session = str.session
LEFT JOIN 
    grading_marks AS gm 
    ON gm.className = str.className 
    AND gm.session = str.session
    AND ROUND((str.CT_Obtaint_Marks + 
              
              COALESCE(scp.obtain_marks, 0) + 
              str.Term_Obtaint_Marks)) 
        BETWEEN gm.minNumber AND gm.maxNumber
JOIN 
    subject_list AS sl 
    ON sl.class_name = str.className 
    AND sl.session = str.session 
    AND sl.subject_name = str.subject
WHERE 
    str.className = ?
    AND str.section = ?
    AND str.termName = ?
    AND str.session = ?
    ${studentId ? "AND str.student_id = ?" : ""}
GROUP BY 
    str.student_id, 
    str.subject, 
    str.termName
ORDER BY 
    subject_order ASC
`;


    const subjectResultParams = studentId ? [className, sectionName, term, session, studentId] : [className, sectionName, term, session];

    const performanceQuery = `
        SELECT 
            student_performance.*, 
            s.campus
        FROM 
            student_performance
        JOIN 
            student AS s ON s.student_id = student_performance.studentId
        WHERE 
            s.Class = ? AND s.section = ? AND student_performance.term = ? AND s.campus = ? AND student_performance.session = ?
            ${studentId ? "AND student_performance.studentId = ?" : ""}
    `;
    const performanceParams = studentId ? [className, sectionName, term, campus, session, studentId] : [className, sectionName, term, campus, session];

    // Execute the queries and combine results
    db.query(gradingMarksQuery, gradingMarksParams, (err, gradingMarksResult) => {
        if (err) return res.json({ error: 'Error fetching grading marks', details: err });

        db.query(attendanceQuery, attendanceParams, (err, attendanceResult) => {
            if (err) return res.json({ error: 'Error fetching attendance data', details: err });

            db.query(subjectResultQuery, subjectResultParams, (err, subjectResult) => {
                if (err) return res.json({ error: 'Error fetching subject results', details: err });

                db.query(performanceQuery, performanceParams, (err, performanceResult) => {
                    if (err) return res.json({ error: 'Error fetching performance data', details: err });

                    // Combine data for each student
                    const studentData = {};
                    attendanceResult.forEach((att) => {
                        const studentId = att.student_id;
                        if (!studentData[studentId]) {
                            studentData[studentId] = {
                                student_id: att.student_id,
                                campus: att.campus,
                                student_name: att.student_name,
                                data: {
                                    gradingMarks: gradingMarksResult,
                                    subjectResult: [],
                                    attendanceData: [],
                                    studentPerformance: [],
                                },
                            };
                        }
                        studentData[studentId].data.attendanceData.push(att);
                    });

                    subjectResult.forEach((sub) => {
                        const studentId = sub.student_id;
                        if (studentData[studentId]) {
                            studentData[studentId].data.subjectResult.push(sub);
                        }
                    });

                    performanceResult.forEach((perf) => {
                        const studentId = perf.studentId;
                        if (studentData[studentId]) {
                            studentData[studentId].data.studentPerformance.push(perf);
                        }
                    });

                    // Convert the data object to an array
                    const response = Object.values(studentData);

                    res.json({
                        ok: true,
                        message: response,
                    });
                });
            });
        });
    });
}

  addStudentClassPerformance(req: any, res: any) {
  const { Records } = req.body;
  const parsedRecords = JSON.parse(Records);
  const query = `
   INSERT INTO student_class_performance
  (student_id, term, subject, total_marks, obtain_marks, date, session, compile)
    VALUES ?
    ON DUPLICATE KEY UPDATE
  total_marks = VALUES(total_marks),
  obtain_marks = VALUES(obtain_marks),
  date = VALUES(date),
  compile = VALUES(compile)
  `;

  const values = parsedRecords.map((record) => [
    record.student_id,
    record.term,
    record.subject,
    record.total_marks,
    record.obtain_marks,
    record.date,
    record.session,
    record.compile,
  ]);

  db.query(query, [values], (err, result) => {
    if (err) {
      console.error(err);
      return res.json({ error: 'Database error' });
    }

   res.json({ ok: true, message: 'Student performance data added/updated successfully' });
  });
}

  getStudentClassPerformance(req: any, res: any) {
  const { className, sectionName, campus, term, session,subject } = req.body; 

  if (!className || !sectionName || !campus || !term || !session ||!subject) {
    return res.json({ error: 'Missing required parameters: class, section, campus, term, or session' });
  }

  const query = `
        SELECT 
    s.student_first_name,
    s.student_last_name,
    s.Class,
    s.section,
    s.campus,
    s.student_id,
    scp.term,
    scp.subject,
    scp.total_marks,
    scp.obtain_marks,
    scp.date,
    scp.session,
    scp.compile
FROM student s
LEFT JOIN (
    SELECT *
    FROM student_class_performance
    WHERE term = ?
      AND session = ?
      AND subject = ?
) scp ON scp.student_id = s.student_id
WHERE s.Class = ?
  AND s.section = ?
  AND s.campus = ?
  `;

  db.query(query, [ term, session,subject,className, sectionName, campus], (err, results) => {
    if (err) {
      console.error(err);
      return res.json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.json({ message: 'No performance data found for the provided filters.' });
    }

    res.json({
      ok: true,
      message: results
    });
  });
}

  deleteStudentAttendance(req: any, res: any) {
  const { attendanceRecords, date } = req.body;

  let parsedAttendanceRecords;
    parsedAttendanceRecords = JSON.parse(attendanceRecords);

  // Extract student IDs
  const studentIds = parsedAttendanceRecords.map((attendance) => attendance.student_id);

  const query = `
    DELETE FROM Student_Attendance
    WHERE student_id IN (?) AND date = ?
  `;

  db.query(query, [studentIds, date], (err, result) => {
    if (err) {
      return res.status(500).json({ ok: false, message: "Error deleting attendance.", error: err });
    }

    res.status(200).json({ ok: true, message: "Attendance deleted successfully." });
  });
}

  addStudentAttendance(req: any, res: any) {
  const { attendanceRecords } = req.body;
  const parsedAttendanceRecords = JSON.parse(attendanceRecords);

  const query = `
    INSERT INTO Student_Attendance(student_id, student_name, termName, class,campus, school, section, date, attendance, session,creatorID,creatorName )
    VALUES ?
    ON DUPLICATE KEY UPDATE
      student_name = VALUES(student_name),
      termName = VALUES(termName),
      class = VALUES(class),
      campus = VALUES(campus),
      school = VALUES(school),
      section = VALUES(section),
      date = VALUES(date),
      attendance = VALUES(attendance),
      session = VALUES(session),
      creatorID = VALUES(creatorID),
      creatorName = VALUES(creatorName)
  `;

  const values = parsedAttendanceRecords.map((attendance) => [
    attendance.student_id,
    attendance.student_name,
    attendance.termName,
    attendance.class,
    attendance.campus,
    attendance.school,
    attendance.section,
    attendance.date,
    attendance.attendance,
    attendance.session,
    attendance.creatorID,
    attendance.creatorName,
  ]);

  db.query(query, [values], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({
        ok: true,
        message: "Attendance data has been successfully Added",
      });
    }
  });
}

  addStudentHomeworkRecords(req: any, res: any) {
  const { homeWorkRecords } = req.body;
  const parsedhomeWorkRecords = JSON.parse(homeWorkRecords);

  const query = `
  INSERT INTO student_homework_response
  (student_id, student_name,termName, className, school, section, subject, date, progress, selectedWorkID, selectedWork, session, creatorID, creatorName)
  VALUES ? 
  ON DUPLICATE KEY UPDATE
    student_name = VALUES(student_name),
    termName = VALUES(termName),
    className = VALUES(className),
    school = VALUES(school),
    section = VALUES(section),
    subject = VALUES(subject),
    date = VALUES(date),
    progress = VALUES(progress),
    selectedWorkID = VALUES(selectedWorkID),
    selectedWork = VALUES(selectedWork),
    session = VALUES(session),
    creatorID = VALUES(creatorID),
    creatorName = VALUES(creatorName)
`;

  const values = parsedhomeWorkRecords.map((work) => [
    work.student_id,
    work.student_name,
    work.termName,
    work.className,
    work.school,
    work.section,
    work.subject,
    work.date,
    work.progress,
    work.selectedWorkID,
    work.selectedWork,
    work.session,
    work.creatorID,
    work.creatorName,
  ]);

  db.query(query, [values], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({
        ok: true,
        message: "working progress data has been successfully Added",
      });
    }
  });
}

  addStudentClassworkRecords(req: any, res: any) {
  const { classWorkRecords } = req.body;
  const parsedclassWorkRecords = JSON.parse(classWorkRecords);

  const query = `
  INSERT INTO student_classwork_response
  (student_id, student_name,termName, className, school, section, subject, date, progress, selectedWorkID, selectedWork, session, creatorID, creatorName)
  VALUES ? 
  ON DUPLICATE KEY UPDATE
    student_name = VALUES(student_name),
    termName = VALUES(termName),
    className = VALUES(className),
    school = VALUES(school),
    section = VALUES(section),
    subject = VALUES(subject),
    date = VALUES(date),
    progress = VALUES(progress),
    selectedWorkID = VALUES(selectedWorkID),
    selectedWork = VALUES(selectedWork),
    session = VALUES(session),
    creatorID = VALUES(creatorID),
    creatorName = VALUES(creatorName)
`;

  const values = parsedclassWorkRecords.map((work) => [
    work.student_id,
    work.student_name,
    work.termName,
    work.className,
    work.school,
    work.section,
    work.subject,
    work.date,
    work.progress,
    work.selectedWorkID,
    work.selectedWork,
    work.session,
    work.creatorID,
    work.creatorName,
  ]);

  db.query(query, [values], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({
        ok: true,
        message: "Working progress data has been successfully Added",
      });
    }
  });
}

  addStudentPerformance(req: any, res: any) {
  const { PerformanceRecords } = req.body;
  const parsedPerformanceRecords = JSON.parse(PerformanceRecords);

  const query = `
  INSERT INTO student_performance
  (studentId, name, punctuality, behavior, cleanliness, handwriting,comments,term, session, compile, create_date, update_date)
  VALUES ? 
  ON DUPLICATE KEY UPDATE
    studentId = VALUES(studentId),
    name = VALUES(name),
    punctuality = VALUES(punctuality),
    behavior = VALUES(behavior),
    cleanliness = VALUES(cleanliness),
    handwriting = VALUES(handwriting),
    comments = VALUES(comments),
    compile = VALUES(compile),
    update_date = VALUES(update_date);
`;

  const values = parsedPerformanceRecords.map((work) => [
    work.studentId,
    work.name,
    work.punctuality,
    work.behavior,
    work.cleanliness,
    work.handwriting,
    work.comments,
    work.term,
    work.session,
    work.compile,
    work.create_date,
    work.update_date, 
  ]);

  db.query(query, [values], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({
        ok: true,
        message: "Performance added successfully",
      });
    }
  });
}

  getStudentPerformance(req: any, res: any) {
  const { selectClass, selectSection, term, session, campus } = req.body;

  // Validate input to avoid unexpected issues
  if (!selectClass || !selectSection || !term || !session || !campus) {
    return res.json({ message: err });
  }

  const query = `
    SELECT 
      student_performance.*, 
      s.student_first_name,
      s.student_last_name,
      s.Class, 
      s.section, 
      s.campus 
    FROM 
      student_performance 
    JOIN 
      student AS s 
    ON 
      s.student_id = student_performance.studentId 
    WHERE 
      s.Class = ? 
      AND s.section = ? 
      AND student_performance.term = ? 
      AND student_performance.session = ? 
      AND s.campus = ? 
    ORDER BY 
      student_performance.id ASC;
  `;

  db.query(query, [selectClass, selectSection, term, session, campus], (err, result) => {
    if (err) {
      // Handle database error
      return res.json({
        ok: false,
        message: `Database error: ${err.message}`,
      });
    }

    if (result.length > 0) {
      // Return successful response with data
      return res.json({
        ok: true,
        message: result,
      });
    } else {
      // Handle case when no results are found
      return res.json({
        ok: false,
        message: "No student performance data found for the provided filters.",
      });
    }
  });
}

  addStudentClassTestRecords(req: any, res: any) {
  const { classTestRecords } = req.body;

  try {
    // Parse the input data
    const parsedclassTestRecords = JSON.parse(classTestRecords);

    // Validate that all records include the subject field
    for (const record of parsedclassTestRecords) {
      if (!record.subject || record.subject.trim() === "") {
        return res.json({
          ok: false,
          data:parsedclassTestRecords,
          message: "The 'subject' field is mandatory for all records.",
        });
      }
    }

    // SQL query to insert data
    const query = `
      INSERT INTO student_classtest_response
      (student_id, student_name, termName, className, school, section, subject, date, selectedTestID, selectedTest, total_marks, obtain_marks, session, creatorID, creatorName)
      VALUES ? 
      ON DUPLICATE KEY UPDATE
        student_name = VALUES(student_name),
        termName = VALUES(termName),
        className = VALUES(className),
        school = VALUES(school),
        section = VALUES(section),
        subject = VALUES(subject),
        date = VALUES(date),
        selectedTestID = VALUES(selectedTestID),
        selectedTest = VALUES(selectedTest),
        total_marks = VALUES(total_marks),
        obtain_marks = VALUES(obtain_marks),
        session = VALUES(session),
        creatorID = VALUES(creatorID),
        creatorName = VALUES(creatorName)
    `;

    // Prepare the values for the query
    const values = parsedclassTestRecords.map((work) => [
      work.student_id,
      work.student_name,
      work.termName,
      work.className,
      work.school,
      work.section,
      work.subject,
      work.date,
      work.selectedTestID,
      work.selectedTest,
      work.total_marks,
      work.obtain_marks,
      work.session,
      work.creatorID,
      work.creatorName,
    ]);

    // Execute the query
    db.query(query, [values], (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({
          ok: true,
          message: "Test progress data has been successfully added.",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "An error occurred while processing the request.",
      error: error.message,
    });
  }
}

  getStudentClassTestRecords(req: any, res: any) {
  const { selectedTestID } = req.body;

  db.query(
    "SELECT * FROM student_classtest_response WHERE selectedTestID = ?",
    [selectedTestID],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({
          ok: true,
          message: result,
        });
      }
    }
  );
}

  getStudentClassWorkRecords(req: any, res: any) {
  const { selectedWorkID } = req.body;

  db.query(
    "SELECT * FROM student_classwork_response WHERE selectedWorkID = ?",
    [selectedWorkID],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({
          ok: true,
          message: result,
        });
      }
    }
  );
}

  getStudentHomeWorkRecords(req: any, res: any) {
  const { selectedWorkID } = req.body;

  db.query(
    "SELECT * FROM student_homework_response WHERE selectedWorkID = ?",
    [selectedWorkID],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({
          ok: true,
          message: result,
        });
      }
    }
  );
}

  async DeleteAllWorks(req: any, res: any) {
  const { id, type } = req.body;

  if (!id || !type) {
    return res.status(400).json({ ok: false, message: "Missing required parameters" });
  }

  let query, query2;

  try {
    if (type === 'homework') {
      query = `DELETE FROM student_homework_list WHERE id = ?`;
      query2 = `DELETE FROM student_homework_response WHERE selectedWorkID = ?`;

    } else if (type === 'classwork') {
      const classResult = await new Promise((resolve, reject) => {
        db.query(
          `SELECT * FROM student_classwork_list WHERE id = ?`,
          [id],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });

      if (classResult.length === 0) {
        return res.status(404).json({ ok: false, message: "Classwork not found" });
      }

      const { weekly_date_id } = classResult[0];

      await new Promise((resolve, reject) => {
        db.query(
          `UPDATE weeklyLessonPlans SET plan_details = "" WHERE id = ?`,
          [weekly_date_id],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });

      query = `DELETE FROM student_classwork_list WHERE id = ?`;
      query2 = `DELETE FROM student_classwork_response WHERE selectedWorkID = ?`;

    } else if (type === 'classtest') {
      query = `DELETE FROM student_classtest_list WHERE id = ?`;
      query2 = `DELETE FROM student_classtest_response WHERE selectedTestID = ?`;

    } else {
      return res.status(400).json({ ok: false, message: 'Invalid work type' });
    }

    // Perform deletions
    await new Promise((resolve, reject) => {
      db.query(query, [id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.query(query2, [id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    return res.json({ ok: true, message: "Records have been deleted" });

  } catch (error) {
    console.error("Deletion failed:", error);
    return res.status(500).json({ ok: false, message: "Deletion failed", error });
  }
}

  addTermReportParameter(req: any, res: any) {
  const { parameterList } = req.body;
  const parsedParameterList = JSON.parse(parameterList);

  const query = `
    INSERT INTO term_report_parameter
    (className, subject_name, Term_Type, Term_Value, Term_Project_Type, Term_Project_Value, Home_Work_Type, Home_Work_Value, Class_Work_Type, Class_Work_Value, Class_Test_Type, Class_Test_Value, session)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      className = VALUES(className),
      subject_name = VALUES(subject_name),
      Term_Type = VALUES(Term_Type),
      Term_Value = VALUES(Term_Value),
      Term_Project_Type = VALUES(Term_Project_Type),
      Term_Project_Value = VALUES(Term_Project_Value),
      Home_Work_Type = VALUES(Home_Work_Type),
      Home_Work_Value = VALUES(Home_Work_Value),
      Class_Work_Type = VALUES(Class_Work_Type),
      Class_Work_Value = VALUES(Class_Work_Value),
      Class_Test_Type = VALUES(Class_Test_Type),
      Class_Test_Value = VALUES(Class_Test_Value),
      session = VALUES(session)
  `;

  const values = parsedParameterList.map((pr) => [
    pr.className,
    pr.subject_name,
    pr.Term_Type,
    pr.Term_Value,
    pr.Term_Project_Type,
    pr.Term_Project_Value,
    pr.Home_Work_Type,
    pr.Home_Work_Value,
    pr.Class_Work_Type,
    pr.Class_Work_Value,
    pr.Class_Test_Type,
    pr.Class_Test_Value,
    pr.session,
  ]);

  db.query(query, [values], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: "Records have been successfully added" });
    }
  });
}

  getTermReportParameter(req: any, res: any) {
  const { className, session, campus } = req.body;
  const query = `
    SELECT 
      COALESCE(trp.id, null) AS id,
      s.class_name AS className,
      s.subject_name,
      COALESCE(trp.Term_Type, 'FixedMarks') AS Term_Type,
      COALESCE(trp.Term_Value, 0) AS Term_Value,
      COALESCE(trp.Term_Project_Type, 'FixedMarks') AS Term_Project_Type,
      COALESCE(trp.Term_Project_Value, 0) AS Term_Project_Value,
      COALESCE(trp.Home_Work_Type, 'FixedMarks') AS Home_Work_Type,
      COALESCE(trp.Home_Work_Value, 0) AS Home_Work_Value,
      COALESCE(trp.Class_Work_Type, 'FixedMarks') AS Class_Work_Type,
      COALESCE(trp.Class_Work_Value, 0) AS Class_Work_Value,
      COALESCE(trp.Class_Test_Type, 'FixedMarks') AS Class_Test_Type,
      COALESCE(trp.Class_Test_Value, 0) AS Class_Test_Value,
      s.session
    FROM 
      subject_list AS s
    LEFT JOIN 
      term_report_parameter AS trp 
      ON trp.subject_name = s.subject_name 
      AND trp.session = s.session 
      AND trp.className = s.class_name
    WHERE 
      s.class_name = ?
      AND s.session = ?
      AND s.report_eligibility = 'TRUE'
      AND s.campus = ?
    ORDER BY 
      s.id ASC
  `;

  db.query(query, [className, session, campus], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  });
}

  getTermReportParameterBySubject(req: any, res: any) {
  const { className, session, subject } = req.body;

  const query = `
    SELECT * FROM term_report_parameter
    WHERE className = ? AND session = ? AND subject_name = ?
  `;

  db.query(query, [className, session, subject], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  });
}

  addStudentTermProjectRecords(req: any, res: any) {
  const { classTermProjectRecords } = req.body;
  const parsedclassTermProjectRecords = JSON.parse(classTermProjectRecords);

  const query = `
  INSERT INTO student_term_project_response
  (student_id, student_name,termName, className, school, section, subject, date,  projectName,total_marks,obtain_marks, session, creatorID, creatorName)
  VALUES ? 
  ON DUPLICATE KEY UPDATE
    student_name = VALUES(student_name),
    termName = VALUES(termName),
    className = VALUES(className),
    school = VALUES(school),
    section = VALUES(section),
    subject = VALUES(subject),
    date = VALUES(date),
    projectName = VALUES(projectName),
    total_marks = VALUES(total_marks),
    obtain_marks = VALUES(obtain_marks),
    session = VALUES(session),
    creatorID = VALUES(creatorID),
    creatorName = VALUES(creatorName)
`;

  const values = parsedclassTermProjectRecords.map((work) => [
    work.student_id,
    work.student_name,
    work.termName,
    work.className,
    work.school,
    work.section,
    work.subject,
    work.date,
    work.projectName,
    work.total_marks,
    work.obtain_marks,
    work.session,
    work.creatorID,
    work.creatorName,
  ]);

  db.query(query, [values], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({
        ok: true,
        message: "Term project data has been successfully Added",
      });
    }
  });
}

  addStudentTermRecords(req: any, res: any) {
  const { studentTermReport, creator_ID, creator_Name } = req.body;
  const parsedStudentTermReport = JSON.parse(studentTermReport);

  const query = `
    INSERT INTO student_term_report
    (student_id, student_name, subject, termName, className, section, Term_Obtaint_Marks, Term_Total_Marks, CT_Obtaint_Marks, CT_Total_Marks, doneClassWork, TotalClassWork, doneHomeWork, TotalHomeWork, CW_Obtaint_Marks, CW_Total_Marks, HW_Obtaint_Marks, HW_Total_Marks, session, creator_ID, creator_Name)
    VALUES ? 
    ON DUPLICATE KEY UPDATE
 student_name = VALUES(student_name),
 subject = VALUES(subject),
 termName = VALUES(termName),
 className = VALUES(className), 
 section = VALUES(section),
 Term_Obtaint_Marks = VALUES(Term_Obtaint_Marks),
 Term_Total_Marks = VALUES(Term_Total_Marks),
 CT_Obtaint_Marks = VALUES(CT_Obtaint_Marks), 
 CT_Total_Marks = VALUES(CT_Total_Marks), 
 doneClassWork = VALUES(doneClassWork), 
 TotalClassWork = VALUES(TotalClassWork), 
 doneHomeWork = VALUES(doneHomeWork), 
 TotalHomeWork = VALUES(TotalHomeWork), 
 CW_Obtaint_Marks = VALUES(CW_Obtaint_Marks), 
 CW_Total_Marks = VALUES(CW_Total_Marks), 
 HW_Obtaint_Marks = VALUES(HW_Obtaint_Marks),
 HW_Total_Marks = VALUES(HW_Total_Marks), 
 session = VALUES(session),
 creator_ID = VALUES(creator_ID), 
 creator_Name = VALUES(creator_Name)
  `;

  const values = parsedStudentTermReport.map((work) => [
    work.student_id,
    work.student_name,
    work.subject,
    work.termName,
    work.className,
    work.section,
    work.Term_Obtaint_Marks || 0,
    work.Term_Total_Marks || 0,
    work.CT_Obtaint_Marks || 0,
    work.CT_Total_Marks || 0,
    work.doneClassWork || 0,
    work.TotalClassWork || 0,
    work.doneHomeWork || 0,
    work.TotalHomeWork || 0,
    work.CW_Obtaint_Marks || 0,
    work.CW_Total_Marks || 0,
    work.HW_Obtaint_Marks || 0,
    work.HW_Total_Marks || 0,
    work.session,
    creator_ID,
    creator_Name,
  ]);
  db.query(query, [values], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({
        ok: true,
        message: "Term Report has been successfully Added",
      });
    }
  });
}

  getStudentTermReport(req: any, res: any) {
  const { className, termName, section, session, subject } = req.body;

  // Validate input
  if (!className || !termName || !section || !session || !subject) {
    return res.status(400).json({ 
      ok: false, 
      message: "All fields (className, termName, section, session, subject) are required." 
    });
  }

  // Query the database
  const query = `
    SELECT * 
    FROM student_term_report 
    WHERE className = ? AND section = ? AND subject = ? AND termName = ? AND session = ?
  `;
  
  db.query(query, [className, section, subject, termName, session], (err, result) => {
    if (err) {
      return res.status(500).json({ 
        ok: false, 
        message: "An error occurred while fetching the student term report.", 
        error: err.message 
      });
    }

    res.status(200).json({ 
      ok: true, 
      message: true, 
      data: result 
    });
  });
}

  addJrStudentTermRecords(req: any, res: any) {
  const { jrStudentTermReport, creator_ID, creator_Name } = req.body;
  const parsedStudentTermReport = JSON.parse(jrStudentTermReport);

  const query = `
    INSERT INTO junior_student_term_report
    (
    student_id,
    student_name,
    subject,
    termName,
    className,
    section,
    Term_CP_Obtaint_Marks,
    Term_CP_Total_Marks,
    Term_Efort_Obtaint_Marks,
    Term_Efort_Total_Marks,
    TotalClassWork,
    TotalHomeWork,
    doneClassWork,
    doneHomeWork,
    projectObtainMarks,
    projectTotalMarks,
    segmentAvgMarks,
    segmentTotalMarks,
    session,
    creator_ID,
    creator_Name
    )
    VALUES ? 
    
    ON DUPLICATE KEY UPDATE
    Term_CP_Obtaint_Marks = VALUES(Term_CP_Obtaint_Marks),
    Term_CP_Total_Marks = VALUES(Term_CP_Total_Marks),
    Term_Efort_Obtaint_Marks = VALUES(Term_Efort_Obtaint_Marks),
    Term_Efort_Total_Marks = VALUES(Term_Efort_Total_Marks),
    TotalClassWork = VALUES(TotalClassWork),
    TotalHomeWork = VALUES(TotalHomeWork),
    doneClassWork = VALUES(doneClassWork),
    doneHomeWork = VALUES(doneHomeWork),
    projectObtainMarks = VALUES(projectObtainMarks),
    projectTotalMarks = VALUES(projectTotalMarks),
    segmentAvgMarks = VALUES(segmentAvgMarks),
    segmentTotalMarks = VALUES(segmentTotalMarks),
    creator_ID = VALUES(creator_ID),
    creator_Name = VALUES(creator_Name);
  `;
  const values = parsedStudentTermReport.map((work) => [
    work.student_id,
    work.student_name,
    work.subject,
    work.termName,
    work.className,
    work.section,
    work.Term_CP_Obtaint_Marks,
    work.Term_CP_Total_Marks,
    work.Term_Efort_Obtaint_Marks,
    work.Term_Efort_Total_Marks,
    work.TotalClassWork,
    work.TotalHomeWork,
    work.doneClassWork,
    work.doneHomeWork,
    work.projectObtainMarks,
    work.projectTotalMarks,
    work.segmentAvgMarks,
    work.segmentTotalMarks,
    work.session,
    creator_ID,
    creator_Name,
  ]);
  db.query(query, [values], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({
        ok: true,
        message: "Term Report has been successfully Added",
      });
    }
  });
}

  addStudentHomeWork(req: any, res: any) {
  const {
    school,
    className,
    termName,
    section,
    session,
    subject,
    title,
    description,
    date,
    creatorID,
    creatorName,
  } = req.body;

  let filename = "";

  const uploadFile = (req, field) => {
    return new Promise((resolve, reject) => {
      if (req.files && req.files[field]) {
        const file = req.files[field];
        const newFilename = uuidv4() + "_" + file.name;
        file.mv(publicDirectory + "/image/" + newFilename, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(newFilename);
          }
        });
      } else {
        resolve("");
      }
    });
  };

  if (req.files && req.files.media) {
    uploadFile(req, "media")
      .then((uploadedFilename) => {
        filename = uploadedFilename;

        const homeworkData = {
          school,
          termName,
          className,
          section,
          session,
          subject,
          title,
          description,
          media: filename,
          date,
          creatorID,
          creatorName,
        };

        db.query("INSERT INTO student_homework_list SET ?", homeworkData, (err, result) => {
          if (err) {
            res.json({ ok: false, message: err });
          } else {
            res.json({ ok: true, message: "Homework has been successfully added" });
          }
        });
      })
      .catch((err) => {
        res.json({ ok: false, message: err });
      });
  } else {
    const homeworkData = {
      school,
      termName,
      className,
      section,
      session,
      subject,
      title,
      description,
      media: "", 
      date,
      creatorID,
      creatorName,
    };

    db.query("INSERT INTO student_homework_list SET ?", homeworkData, (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: "Homework has been successfully added" });
      }
    });
  }
}

  async updateStudentWork(req: any, res: any) {
  const { id, title, description, type } = req.body;

  if (!id) {
    return res.json({ ok: false, message: "Missing homework ID" });
  }

  let filename = "";

  // Helper function to upload file
  const uploadFile = (req, field) => {
    return new Promise((resolve, reject) => {
      if (req.files && req.files[field]) {
        const file = req.files[field];
        const newFilename = uuidv4() + "_" + file.name;
        const filePath = path.join(publicDirectory, "image", newFilename);

        file.mv(filePath, (err) => {
          if (err) reject(err);
          else resolve(newFilename);
        });
      } else {
        resolve(""); // No file uploaded
      }
    });
  };

  try {
    if (req.files && req.files.media) {
      filename = await uploadFile(req, "media");
    }

    const updateData = { title, description };
    if (filename) updateData.media = filename;

    const tableName =
      type === "Home" ? "student_homework_list" : "student_classwork_list";

    // First, update student_homework_list or student_classwork_list
    const updateWorkQuery = `UPDATE ${tableName} SET ? WHERE id = ?`;
    await new Promise((resolve, reject) => {
      db.query(updateWorkQuery, [updateData, id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    // If type is Class (not Home), update the weeklyLessonPlans
    if (type !== "Home") {
      const classResult = await new Promise((resolve, reject) => {
        db.query(
          `SELECT * FROM student_classwork_list WHERE id = ?`,
          [id],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });

      if (classResult.length === 0) {
        return res
          .status(404)
          .json({ ok: false, message: "Classwork not found" });
      }

      const {
        weekly_date_id
      } = classResult[0];

      const lessonPlanUpdateQuery = `
        UPDATE weeklyLessonPlans 
        SET plan_details = ? 
        WHERE id = ?`;

      await new Promise((resolve, reject) => {
        db.query(
          lessonPlanUpdateQuery,
          [title, weekly_date_id],
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );
      });
    }

    res.json({ ok: true, message: "Work has been successfully updated" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
}

  async addStudentClassWork(req: any, res: any) {
  const {
    school,
    className,
    termName,
    section,
    session,
    subject,
    title,
    description,
    date,
    creatorID,
    creatorName,
  } = req.body;

  let filename = "";

  const uploadFile = (req, field) => {
    return new Promise((resolve, reject) => {
      if (req.files && req.files[field]) {
        const file = req.files[field];
        const newFilename = uuidv4() + "_" + file.name;
        file.mv(publicDirectory + "/image/" + newFilename, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(newFilename);
          }
        });
      } else {
        resolve("");
      }
    });
  };

  try {
    if (req.files && req.files.media) {
      filename = await uploadFile(req, "media");
    }

    const classworkData = {
      school,
      className,
      termName,
      section,
      session,
      subject,
      title,
      description,
      media: filename, // Add the uploaded filename here
      date,
      creatorID,
      creatorName,
    };

    db.query(
      "INSERT INTO student_classwork_list SET ?",
      classworkData,
      (err, result) => {
        if (err) {
          res.json({ ok: false, message: err });
        } else {
          res.json({
            ok: true,
            message: "Class Work has been successfully added",
          });
        }
      }
    );
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
}

  getStudentHomeWork(req: any, res: any) {
  const { className, section, session, subject, termName, date } = req.body;
  const dateObj = new Date(date);
  const formattedDate = dateObj.toISOString().split('T')[0];

  db.query(
    "SELECT * FROM student_homework_list WHERE className = ? AND section = ? AND subject = ? AND termName = ? AND session = ? AND date = ?",
    [className, section, subject, termName, session, formattedDate],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

  getAllStudentTermProjectRecords(req: any, res: any) {
  const { termName, className, section, session, subject } = req.body;

  db.query(
    "SELECT * FROM student_term_project_response WHERE termName= ? AND className= ? AND section= ? AND subject= ? AND session = ? ",
    [termName, className, section, subject, session],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

  getStudentClassWork(req: any, res: any) {
  const { className, section, session, subject, termName, date } = req.body;
  const dateObj = new Date(date);
  const formattedDate = dateObj.toISOString().split('T')[0];

  db.query(
    "SELECT * FROM student_classwork_list WHERE className = ? AND section = ? AND subject = ? AND termName = ? AND session = ? AND date = ?",
    [className, section, subject, termName, session, formattedDate],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

  ClassTestPublish(req: any, res: any) {
  const { id, status } = req.body;

  const query = "UPDATE student_classtest_list SET ? WHERE id = ?";
  db.query(query, [{ publish: status }, id], (err, result) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        severity: "error",
        summary: "Database Error",
        detail: "Failed to update publish status. Please try again.",
      });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        severity: "error",
        summary: "Not Found",
        detail: "No record found with the given ID.",
      });
    }
    return res.status(200).json({
      ok: true,
      severity: "success",
      summary: "Publish Status Updated",
      detail: "Publish status has been successfully updated.",
    });
  });
}

  getStudentClassTest(req: any, res: any) {
  const { className, termName, section, session, subject } = req.body;

  db.query(
    "SELECT * FROM student_classtest_list WHERE termName = ? AND className= ? AND section= ? AND subject= ? AND session = ? ",
    [termName, className, section, subject, session],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

  getStudentClassTestUpdate(req: any, res: any) {
  const { className, termName, section, session,title } = req.body;
  db.query(
    "SELECT * FROM student_classtest_list WHERE termName = ? AND className= ? AND section= ? AND session = ? AND title=? ORDER BY id ASC",
    [termName, className, section, session,title],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

  getSingleStudentMonthlyReport(req: any, res: any) {
  const { student_id, selectedMonth } = req.body;

  const sql = `
      SELECT
        A.student_id,
        A.student_name,
        A.subject,
        IFNULL(A.doneHomeWork, 0) AS doneHomeWork,
        IFNULL(A.TotalHomeWork, 0) AS TotalHomeWork,
        IFNULL(B.doneClassWork, 0) AS doneClassWork,
        IFNULL(B.TotalClassWork, 0) AS TotalClassWork
      FROM
        (SELECT
          student_id,
          student_name,
          subject,
          SUM(progress) AS doneHomeWork,
          COUNT(progress) AS TotalHomeWork
        FROM
          student_homework_response
        WHERE
          DATE_FORMAT(date, '%Y-%m') = ?
          AND student_id = ?
        GROUP BY
          student_id, subject) AS A

      LEFT JOIN

        (SELECT
          student_id,
          student_name,
          subject,
          SUM(progress) AS doneClassWork,
          COUNT(progress) AS TotalClassWork
        FROM
          student_classwork_response
        WHERE
          DATE_FORMAT(date, '%Y-%m') = ?
          AND student_id = ?
        GROUP BY
          student_id, subject) AS B

      ON
        A.student_id = B.student_id
        AND A.subject = B.subject`;

  db.query(
    sql,
    [selectedMonth, student_id, selectedMonth, student_id],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        db.query(
          `SELECT student_id,student_name,subject,selectedTestID,selectedTest,total_marks,obtain_marks  FROM student_classtest_response WHERE DATE_FORMAT(date, '%Y-%m') = ? AND student_id= ?`,
          [selectedMonth, student_id],
          (err, result2) => {
            if (err) {
              res.json({ ok: false, message: err });
            } else {
              db.query(
                `SELECT SUM(attendance) as totalPresentDays , COUNT(attendance) as totalWorkingDays  FROM Student_Attendance WHERE DATE_FORMAT(date, '%Y-%m') = ? AND student_id= ?`,
                [selectedMonth, student_id],
                (err, result3) => {
                  if (err) {
                    res.json({ ok: false, message: err });
                  } else {
                    res.json({
                      ok: true,
                      message: { result, result2, result3 },
                    });
                  }
                }
              );
            }
          }
        );
      }
    }
  );
}

  getSingleStudentJrMonthlyReport(req: any, res: any) {
  const { student_id, date1, date2 } = req.body;

  const sql = `
      SELECT * FROM junior_school_segment_result WHERE student_id = ? AND date BETWEEN ? AND ?
       `;

  db.query(sql, [student_id, date1, date2], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      db.query(
        `SELECT SUM(attendance) as totalPresentDays , COUNT(attendance) as totalWorkingDays  FROM Student_Attendance WHERE date BETWEEN ? AND ? AND student_id= ?`,
        [date1, date2, student_id],
        (err, result2) => {
          if (err) {
            res.json({ ok: false, message: err });
          } else {
            res.json({ ok: true, message: { result, result2 } });
          }
        }
      );
    }
  });
}

  getSingleStudentTermReport(req: any, res: any) {
  const { student_id, termName, session, className } = req.body;

  const sql = `
      SELECT * FROM student_term_report WHERE student_id = ? AND termName  = ? AND session = ? AND className = ?
       `;

  db.query(sql, [student_id, termName, session, className], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      db.query(
        `SELECT SUM(attendance) as totalPresentDays , COUNT(attendance) as totalWorkingDays  FROM Student_Attendance WHERE termName  = ? AND student_id= ? AND session = ?`,
        [termName, student_id, session],
        (err, result2) => {
          if (err) {
            res.json({ ok: false, message: err });
          } else {
            res.json({ ok: true, message: { result, result2 } });
          }
        }
      );
    }
  });
}

  getSingleJrStudentTermReport(req: any, res: any) {
  const { student_id, termName, session, className } = req.body;

  const sql = `
      SELECT * FROM junior_student_term_report WHERE student_id = ? AND termName  = ? AND session = ? AND className = ?
       `;

  db.query(sql, [student_id, termName, session, className], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      db.query(
        `SELECT SUM(attendance) as totalPresentDays , COUNT(attendance) as totalWorkingDays  FROM Student_Attendance WHERE termName  = ? AND student_id= ? AND session = ?`,
        [termName, student_id, session],
        (err, result2) => {
          if (err) {
            res.json({ ok: false, message: err });
          } else {
            res.json({ ok: true, message: { result, result2 } });
          }
        }
      );
    }
  });
}

  getStudentTermMarks(req: any, res: any) {
  const { termName, className, section, subject, session,campus } = req.body;

  const sql = `
    SELECT
      Student.student_id,
      CONCAT(Student.student_first_name, ' ', Student.student_last_name) AS student_name,
      Student.className,
      Student.section,
      A.subject,
      A.session,
      A.termName,
      IFNULL(A.doneHomeWork, 0) AS doneHomeWork,
      IFNULL(A.TotalHomeWork, 0) AS TotalHomeWork,
      IFNULL(B.doneClassWork, 0) AS doneClassWork,
      IFNULL(B.TotalClassWork, 0) AS TotalClassWork,
      trm.Term_Type,
      trm.Term_Value,
      trm.Term_Project_Type,
      trm.Term_Project_Value,
      trm.Home_Work_Type,
      trm.Home_Work_Value,
      trm.Class_Work_Type,
      trm.Class_Work_Value,
      trm.Class_Test_Type,
      trm.Class_Test_Value
    FROM
      (
        SELECT 
          student_id,
          student_first_name,
          student_last_name,
          Class AS className,
          section,
          session
        FROM 
          student
        WHERE
          session = ?
          AND Class = ?
          AND section = ?
          AND campus = ?
      ) AS Student
    LEFT JOIN
      (
        SELECT
          student_id,
          subject,
          termName,
          session,
          SUM(progress) AS doneHomeWork,
          COUNT(progress) AS TotalHomeWork
        FROM
          student_homework_response
        WHERE
          subject = ?
          AND session = ?
          AND termName = ?
          AND className = ?
          AND section = ?
        GROUP BY
          student_id, subject
      ) AS A
      ON
        Student.student_id = A.student_id
    LEFT JOIN
      (
        SELECT
          student_id,
          subject,
          termName,
          session,
          SUM(progress) AS doneClassWork,
          COUNT(progress) AS TotalClassWork
        FROM
          student_classwork_response
        WHERE
          subject = ?
          AND session = ?
          AND termName = ?
          AND className = ?
          AND section = ?
        GROUP BY
          student_id, subject
      ) AS B
      ON
        Student.student_id = B.student_id
    JOIN
      term_report_parameter AS trm
      ON
        trm.subject_name = ?
        AND trm.className = ?
    ORDER BY
      Student.student_id
  `;

  const params = [
    session, className, section,campus, // For student
    subject, session, termName, className, section, // For homework
    subject, session, termName, className, section, // For classwork
    subject, className // Term report parameter
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({ ok: false, message: err });
    }

    const classtestSQL = `
      SELECT
        scr.student_id,
        scr.student_name,
        scr.termName,
        scl.className,
        scl.section,
        scr.session,
        scl.subject,
        scr.selectedTestID,
        scl.title AS selectedTest,
        scl.marks AS total_marks,
        scr.obtain_marks
      FROM
        student_classtest_response AS scr
      JOIN 
        student_classtest_list AS scl 
        ON scl.id = scr.selectedTestID
      WHERE
        scl.termName = ?
        AND scl.className = ?
        AND scl.subject = ?
        AND scl.section = ?
        AND scl.session = ?
      GROUP BY 
        scr.student_id, scr.selectedTestID
      ORDER BY 
        scr.selectedTest ASC
    `;

    db.query(classtestSQL, [termName, className, subject, section, session], (err2, result2) => {
      if (err2) {
        console.error("Database error:", err2);
        return res.json({ ok: false, message: err2 });
      }

      const reportSQL = `
        SELECT * 
        FROM student_term_report 
        WHERE className = ? AND section = ? AND subject = ? AND termName = ? AND session = ?
      `;

      db.query(reportSQL, [className, section, subject, termName, session], (err3, result3) => {
        if (err3) {
          console.error("Database error:", err3);
          return res.json({ ok: false, message: err3 });
        }

        return res.json({ ok: true, message: { result, result2, result3 } });
      });
    });
  });
}

  getJrStudentTermMarks(req: any, res: any) {
  const { termName, className, section, subject, session } = req.body;

  const sql = `
            SELECT
            Student.student_id,
            CONCAT(Student.student_first_name, ' ', Student.student_last_name) AS student_name,
        Student.className,
        Student.section,
		COALESCE(A.subject, B.subject, segmentMarks.subject) AS subject,
        COALESCE(A.session, B.session, segmentMarks.session) AS session,
        COALESCE(A.termName, B.termName, segmentMarks.termName) AS termName,
        IFNULL(A.doneHomeWork, 0) AS doneHomeWork,
        IFNULL(A.TotalHomeWork, 0) AS TotalHomeWork,
        IFNULL(B.doneClassWork, 0) AS doneClassWork,
        IFNULL(B.TotalClassWork, 0) AS TotalClassWork,
        IFNULL(project.projectObtainMarks, 0) AS projectObtainMarks,
        IFNULL(project.projectTotalMarks, 0) AS projectTotalMarks,
        segmentMarks.segmentAvgMarks
      FROM
      
      (
        SELECT 
          student_id,
          student_first_name,
          student_last_name,
          Class as className,
          section,
          session
          FROM 
          student
          WHERE
          session = ?
          AND Class = ?
          AND section = ?
      ) AS Student

      LEFT JOIN 

      (SELECT
          student_id,
          student_name,
			class as className,
			section,
         termName,
         session
        FROM
          Student_Attendance
        WHERE
           session = ?
         AND termName = ?
         AND class = ?
         AND section = ?
        GROUP BY
          student_id) AS Att

      ON
        Student.student_id = Att.student_id
        AND Student.className = Att.className
        AND Student.section = Att.section
        AND Student.session = Att.session

      LEFT JOIN
      
        (SELECT
          student_id,
          student_name,
			className,
			section,
          subject,
         termName,
         session,
          SUM(progress) AS doneHomeWork,
          COUNT(progress) AS TotalHomeWork
        FROM
          student_homework_response
        WHERE
          subject = ?
          AND session = ?
         AND termName = ?
         AND className = ?
         AND section = ?
        GROUP BY
          student_id, subject) AS A
          
    ON
    Student.student_id = A.student_id
        AND Student.className = A.className
        AND Student.section = A.section
    
        LEFT JOIN

        (SELECT
          student_id,
          student_name,
           termName,
		      className,
	      	section,
          subject,
           session,
          SUM(progress) AS doneClassWork,
          COUNT(progress) AS TotalClassWork
           FROM
           student_classwork_response
             WHERE
               subject = ?
               AND session = ?
             AND termName = ?
           AND className = ?
             AND section = ?
          GROUP BY
          student_id, subject) AS B

            ON
            Student.student_id = B.student_id
              AND A.subject = B.subject
              AND Student.session = B.session
              AND A.termName = B.termName
                AND Student.className = B.className
                  AND Student.section = B.section
             
         LEFT JOIN
      
        (SELECT student_id,
          student_name,
         termName, className,section, subject, session, AVG(obtain_marks) as segmentAvgMarks FROM junior_school_segment_result 
        WHERE termName = ? 
        AND className = ? 
        AND section = ? 
        AND subject = ? 
        AND session = ?
        GROUP BY
          student_id, subject) AS segmentMarks
          
    ON
    Student.student_id = segmentMarks.student_id
       AND  Student.className = segmentMarks.className
       AND  Student.section = segmentMarks.section
       AND  B.subject = segmentMarks.subject
       
       LEFT JOIN
      
        (SELECT student_id,
          student_name,
         termName, className,section, subject, session, total_marks as projectTotalMarks, obtain_marks as projectObtainMarks FROM student_term_project_response 
        WHERE termName = ? 
        AND className = ? 
        AND section = ? 
        AND subject = ? 
        AND session = ?
        GROUP BY
          student_id, subject) AS project
          
    ON
    Student.student_id = project.student_id
       AND  Student.className = project.className
       AND  Student.section = project.section
       AND  segmentMarks.subject = project.subject
        
        `;

  db.query(
    sql,
    [
      session,
      className,
      section,
      session,
      termName,
      className,
      section,
      subject,
      session,
      termName,
      className,
      section,
      subject,
      session,
      termName,
      className,
      section,
      termName,
      className,
      section,
      subject,
      session,
      termName,
      className,
      section,
      subject,
      session,
    ],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({
          ok: true,
          message: { result },
          sql: sql,
          params: [
            session,
            termName,
            className,
            section,
            subject,
            session,
            termName,
            className,
            section,
            subject,
            session,
            termName,
            className,
            section,
            termName,
            className,
            section,
            subject,
            session,
          ],
        });
      }
    }
  );
}

  async addStudentClassTest(req: any, res: any) {
  const {
    school,
    campus,
    className,
    termName,
    marks,
    section,
    session,
    subject,
    title,
    date,
    creatorID,
    creatorName,
  } = req.body;

  const query = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

  try {
    // Insert class test
    const classworkData = {
      school,
      campus,
      termName,
      className,
      section,
      session,
      subject,
      title,
      marks,
      date,
      creatorID,
      creatorName,
    };

    const insert = await query(
      "INSERT INTO student_classtest_list SET ?",
      classworkData
    );
    const insertId = insert.insertId ?? 0;

    // 1️⃣ FETCH ALL STUDENTS IN CLASS
    const students = await query(
      `SELECT student_id 
       FROM student 
       WHERE Class = ? AND section = ?`,
      [className, section]
    );

    if (!students.length) {
      return res.json({
        ok: true,
        message: "Test added but no students found in this class.",
      });
    }

    const studentIds = students.map((s) => s.student_id);

    // 2️⃣ FETCH ALL STUDENT TOKENS
    const studentTokens = await query(
      `
      SELECT student_id, device 
      FROM student_login_information 
      WHERE student_id IN (?)
      AND device IS NOT NULL
    `,
      [studentIds]
    );

    // 3️⃣ FETCH ALL PARENT TOKENS
    const parentTokens = await query(
      `
      SELECT student_id, device 
      FROM parent_login_information 
      WHERE student_id IN (?)
      AND device IS NOT NULL
    `,
      [studentIds]
    );

    // MERGE BOTH
    const allTokens = [...studentTokens, ...parentTokens];

    // 4️⃣ SEND PUSH NOTIFICATIONS
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    for (const row of allTokens) {
      await sendNotification(
        row.device, // token
        "Upcoming Class Test Reminder 📚",
        `Dear Student/Parent, there is a ${title} in ${subject} on ${formattedDate}.`,
        "http://test.com",
        "classtest",
        insertId,
        row.student_id
      );
    }

    res.json({
      ok: true,
      message: "Class Test added & notifications sent successfully.",
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
}

  getAllClassTeacherAndCoOrdinator(req: any, res: any) {
  db.query(
    `
 SELECT
    CASE WHEN cc.emp_name IS NULL THEN 'N/A' ELSE cc.emp_name END AS coordinator_name,
    CASE WHEN ct.emp_name IS NULL THEN 'N/A' ELSE ct.emp_name END AS teacher_name,
    CASE WHEN cc.class IS NULL THEN 'N/A' ELSE cc.class END AS class,
    CASE WHEN ct.section IS NULL THEN 'N/A' ELSE ct.section END AS section
FROM
    class_coordinator cc
LEFT JOIN
    class_teacher ct
ON
    cc.class = ct.class;

  `,
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

  getClassTeacherAndCoOrdinator(req: any, res: any) {
  const { class_name, section_name, session } = req.body;

  db.query(
    "SELECT * FROM class_teacher WHERE class=? AND section=? AND session=?",
    [class_name, section_name, session],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        db.query(
          "SELECT * FROM class_coordinator WHERE class=? AND session=?",
          [class_name, session],
          (err, result2) => {
            if (err) {
              res.json({ ok: false, message: err });
            } else {
              res.json({ ok: true, message1: result, message2: result2 });
            }
          }
        );
      }
    }
  );
}

  addClassTeacher(req: any, res: any) {
  const { emp_id, emp_name, className, section,campus,session } = req.body;

  const insertData = {
    emp_id: emp_id,
    emp_name: emp_name,
    class: className,
    section: section,
    campus: campus,
    session: session,
  };

  const query = "INSERT INTO class_teacher SET ? ON DUPLICATE KEY UPDATE ?";

  db.query(query, [insertData, insertData], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: "Class Teacher Updated Successfully..." });
    }
  });
}

  addClassCoOrd(req: any, res: any) {
  const { emp_id, emp_name, className,campus,session } = req.body;

  const insertData = {
    emp_id: emp_id,
    emp_name: emp_name,
    class: className,
    campus:campus,
    session: session,
  };

  const query = "INSERT INTO class_coordinator SET ? ON DUPLICATE KEY UPDATE ?";

  db.query(query, [insertData, insertData], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({
        ok: true,
        message: "Class Co-Ordinator Updated Successfully...",
      });
    }
  });
}

  getAllGradeMarks(req: any, res: any) {
  const { session } = req.body;

  db.query(
    "SELECT * FROM grading_marks WHERE session= ? ORDER BY id ASC",
    [session],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

  addGradeMarks(req: any, res: any) {
  const { className, minNumber, maxNumber, grade, performance, description, session } = req.body;

  db.query(
    "INSERT INTO `grading_marks` (`className`, `minNumber`, `maxNumber`, `grade`, `performance`, `description`, `session`) " +
    "VALUES (?, ?, ?, ?, ?, ?, ?) " +
    "ON DUPLICATE KEY UPDATE `minNumber` = VALUES(`minNumber`), `maxNumber` = VALUES(`maxNumber`), `grade` = VALUES(`grade`), `performance` = VALUES(`performance`), `description` = VALUES(`description`), `session` = VALUES(`session`)",
    [className, minNumber, maxNumber, grade, performance, description, session],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: "Data inserted" });
      }
    }
  );
}

  getGradeMarksByClass(req: any, res: any) {
  const { className, session } = req.body;

  db.query(
    "SELECT * FROM grading_marks WHERE className= ? AND session = ? ORDER BY id ASC",
    [className, session],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

  DeleteGradeMarksById(req: any, res: any) {
    const { id } = req.body;
    const query = `DELETE FROM grading_marks WHERE id = ?`;
     db.query(query,[id],(err, result) => {
     res.json({ ok: true,message:"Deleted" });
    }
  );
}

  DeleteTermReportParameter(req: any, res: any) {
  const { id } = req.body;

  // validation check
  if (!id) {
    return res.json({
      ok: false,
      message: "ID is required"
    });
  }

  const query = `DELETE FROM term_report_parameter WHERE id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) {
      return res.json({
        ok: false,
        message: "Database error"
      });
    }

    // optional: check if actually deleted
    if (result.affectedRows === 0) {
      return res.json({
        ok: false,
        message: "No record found with this ID"
      });
    }

    res.json({
      ok: true,
      message: "Deleted successfully"
    });
  });
}

  getPreTermReportForm(req: any, res: any) {
  const { termName, className, session } = req.body;

  const query = `
    SELECT * FROM student_preSchool_term_report WHERE termName = ? AND className = ? AND type = ? AND session = ?
  `;

  const values = [termName, className, "form", session];

  db.query(query, values, (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  });
}

  getSingleStudentPreTermReport(req: any, res: any) {
  const { termName, student_id, section, className, session } = req.body;

  const query = `
    SELECT * FROM student_preSchool_term_report WHERE termName = ? AND className = ? AND type = ? AND session = ? AND student_id = ? AND section = ?
  `;

  const values = [
    termName,
    className,
    "response",
    session,
    student_id,
    section,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  });
}

  addPreTermReportForm(req: any, res: any) {
  const {
    termName,
    className,
    resultQuestion,
    creatorID,
    creatorName,
    session,
  } = req.body;

  const query = `
    INSERT INTO student_preSchool_term_report (type, termName, className, section, student_id, student_name, description, creatorID, creatorName, session)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      description = VALUES(description),
      creatorID = VALUES(creatorID),
      creatorName = VALUES(creatorName)
  `;

  const values = [
    "form",
    termName,
    className,
    "all",
    "teacher",
    "name",
    resultQuestion,
    creatorID,
    creatorName,
    session,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({
        ok: true,
        message: "Result Form has been successfully added.",
      });
    }
  });
}

  addPreTermReportResponse(req: any, res: any) {
  const {
    termName,
    className,
    student_id,
    student_name,
    section,
    resultResponse,
    creatorID,
    creatorName,
    session,
  } = req.body;

  const query = `
    INSERT INTO student_preSchool_term_report (type, termName, className, section, student_id, student_name, description, creatorID, creatorName, session)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      description = VALUES(description),
      creatorID = VALUES(creatorID),
      creatorName = VALUES(creatorName)
  `;

  db.query(
    query,
    [
      "response",
      termName,
      className,
      section,
      student_id,
      student_name,
      resultResponse,
      creatorID,
      creatorName,
      session,
    ],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({
          ok: true,
          message: "Result Response has been successfully added.",
        });
      }
    }
  );
}

  addJrSegmentForm(req: any, res: any) {
  const { termName, className, subjectName, segments, session } = req.body;

  const query = `
    INSERT INTO junior_school_subject_segments (termName, className, subjectName, segments, session)
    VALUES (?,?,?,?,?)
    ON DUPLICATE KEY UPDATE
    segments = VALUES(segments)
  `;

  db.query(
    query,
    [termName, className, subjectName, segments, session],
    (err, results) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({
          ok: true,
          message: "Data inserted or updated successfully",
        });
      }
    }
  );
}

  getJrSegmentForm(req: any, res: any) {
  const { termName, className, subjectName, session } = req.body;

  const query = `
    SELECT * FROM junior_school_subject_segments WHERE termName = ? AND className = ? AND subjectName = ? AND  session = ?
  `;

  db.query(
    query,
    [termName, className, subjectName, session],
    (err, results) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: results });
      }
    }
  );
}

  addJrResultResponse(req: any, res: any) {
  const { jrResultRecords } = req.body;
  const parsedJrResultRecords = JSON.parse(jrResultRecords);

  const query = `
  INSERT INTO junior_school_segment_result
  (termName,	className,	section,	subject,	student_id,	student_name,	segmentName,	contentName,	obtain_marks,	obtain_grade,	session,	creatorID,	creatorName,	date)
  VALUES ? 
  ON DUPLICATE KEY UPDATE
    obtain_marks = VALUES(obtain_marks),
    obtain_grade = VALUES(obtain_grade),
    date = VALUES(date),
    creatorID = VALUES(creatorID),
    creatorName = VALUES(creatorName)
`;

  const values = parsedJrResultRecords.map((rec) => [
    rec.termName,
    rec.className,
    rec.section,
    rec.subject,
    rec.student_id,
    rec.student_name,
    rec.segmentName,
    rec.contentName,
    rec.obtain_marks,
    rec.obtain_grade,
    rec.session,
    rec.creatorID,
    rec.creatorName,
    rec.date,
  ]);

  db.query(query, [values], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: "Result has been successfully Added" });
    }
  });
}

  getPreviousJrResultResponse(req: any, res: any) {
  const { segmentName, contentName, session } = req.body;

  const query = `
    SELECT * FROM junior_school_segment_result WHERE segmentName = ? AND contentName = ? AND session = ?    
  `;

  db.query(query, [segmentName, contentName, session], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  });
}

  addClasssRoutine(req: any, res: any) {
  const { routineData, className, section, session } = req.body;

  const parsedRoutineData = JSON.parse(routineData);

  const query = `
    INSERT INTO class_routine (className, section, dayName, slotName, subjectName, teacherID, session)
    VALUES ? 
    ON DUPLICATE KEY UPDATE
      subjectName = VALUES(subjectName),
      teacherID = VALUES(teacherID)
  `;

  const values = parsedRoutineData.map((routine) => [
    className,
    section,
    routine.day,
    routine.slot,
    routine.subject,
    routine.teacher,
    session,
  ]);

  db.query(query, [values], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({
        ok: true,
        message: "Class Routine has been successfully added.",
      });
    }
  });
}

  getClassRoutineByClassNSection(req: any, res: any) {
  const { className, section } = req.body;
  db.query(
    `
SELECT nr.*, p.name, p.start_time, p.end_time, e.emp_id, e.emp_fname, e.emp_lname 
FROM newRoutine AS nr 
JOIN periods AS p ON p.id = nr.period_id 
JOIN employee AS e ON e.emp_id = nr.teacher_id 
WHERE nr.class_name = ? 
AND nr.section_name = ?;
    `,
    [className, section],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: result });
      }
    }
  );
}

  getClasssRoutineByID(req: any, res: any) {
  const { selectedTeacherID, session } = req.body;

  db.query(
    `SELECT * FROM class_routine WHERE teacherID = ? AND session = ?  `,
    [selectedTeacherID, session],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

  addLessionPlan(req: any, res: any) {
  const {
    termName,
    className,
    subjectName,
    chapterName,
    topicName,
    lessonName,
    duration,
    aim,
    learnigObjective,
    topicSentence,
    starterActivity,
    priorKnowledge,
    lowerAbility,
    middleAbility,
    higherAbility,
    mediumPresent,
    mediumSourcing,
    learnerOutcomes,
    week,
    assessmentActivity,
    meterialSourcing,
    teacherFeedback,
    teacherReflection,
    session,
    creatorID,
    creatorName,
  } = req.body;

  const query = `
    INSERT INTO lessonPlan (
      termName,
      className,
      subjectName,
      chapterName,
      topicName,
      lessonName,
      duration,
      aim,
      learnigObjective,
      topicSentence,
      starterActivity,
      priorKnowledge,
      lowerAbility,
      middleAbility,
      higherAbility,
      mediumPresent,
      mediumSourcing,
      learnerOutcomes,
      week,
      approval,
      assessmentActivity,
      meterialSourcing,
      teacherFeedback,
      teacherReflection,
      session,
      creatorID,
      creatorName
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
    ON DUPLICATE KEY UPDATE
      duration = VALUES(duration),
      aim = VALUES(aim),
      learnigObjective = VALUES(learnigObjective),
      topicSentence = VALUES(topicSentence),
      starterActivity = VALUES(starterActivity),
      priorKnowledge = VALUES(priorKnowledge),
      lowerAbility = VALUES(lowerAbility),
      middleAbility = VALUES(middleAbility),
      higherAbility = VALUES(higherAbility),
      mediumPresent = VALUES(mediumPresent),
      mediumSourcing = VALUES(mediumSourcing),
      learnerOutcomes = VALUES(learnerOutcomes),
      week = VALUES(week),
      approval = VALUES(approval),
      assessmentActivity = VALUES(assessmentActivity),
      meterialSourcing = VALUES(meterialSourcing),
      teacherFeedback = VALUES(teacherFeedback),
      teacherReflection = VALUES(teacherReflection),
      creatorID = VALUES(creatorID),
      creatorName = VALUES(creatorName);
  `;

  const values = [
    termName,
    className,
    subjectName,
    chapterName,
    topicName,
    lessonName,
    duration,
    aim,
    learnigObjective,
    topicSentence,
    starterActivity,
    priorKnowledge,
    lowerAbility,
    middleAbility,
    higherAbility,
    mediumPresent,
    mediumSourcing,
    learnerOutcomes,
    week,
    approval = 0,
    assessmentActivity,
    meterialSourcing,
    teacherFeedback,
    teacherReflection,
    session,
    creatorID,
    creatorName,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({
        ok: true,
        message: "Lesson Plan has been successfully updated.",
      });
    }
  });
}

  updateLessonApproval(req: any, res: any) {
  const { id, approval } = req.body;

  if (!id || approval === undefined) {
    return res.json({ ok: false, message: "Invalid data" });
  }

  const query = `
    UPDATE lessonPlan
    SET approval = ? WHERE id = ?
  `;

  db.query(query, [approval, id], (err, result) => {
    if (err) return res.json({ ok: false, message: err.message });
    return res.json({ ok: true });
  });
}

  getLessionPlan(req: any, res: any) {
  const { termName, className, subjectName, session } = req.body;

  const query = `
    SELECT * FROM lessonPlan WHERE termName = ? AND className = ? AND subjectName = ? AND session = ?
  `;

  db.query(
    query,
    [termName, className, subjectName, session],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

  deleteLessonPlanById(req: any, res: any) {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Lesson Plan ID is required" });
  }

  const deleteLessonPlan = `DELETE FROM lessonPlan WHERE id = ?`;

  db.query(deleteLessonPlan, [id], (err, result) => {
    if (err) {
      console.error("Error deleting lesson plan:", err);
      return res.status(500).json({ message: "Failed to delete lesson plan" });
    }

    res.json({ message: "Lesson Plan deleted successfully" });
  });
}

  adddepartmentmeetingPlan(req: any, res: any) {
  const { department, meeting_title, meeting_date, session } = req.body;

  const query = `
    INSERT INTO department_meeting (department, meeting_title, meeting_date, session)
    VALUES (?, ?, ?, ?) 
    ON DUPLICATE KEY UPDATE
      meeting_title = VALUES(meeting_title)
  `;

  db.query(
    query,
    [department, meeting_title, meeting_date, session],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: "Records has been successfully added." });
      }
    }
  );
}

  getdepartmentmeetingPlan(req: any, res: any) {
  const { department, month, session } = req.body;

  const query = `
    SELECT * FROM department_meeting  WHERE department= ? AND session = ? AND DATE_FORMAT(meeting_date, '%Y-%m') = ?
  `;

  db.query(query, [department, session, month], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  });
}

  updatedepartmentmeetingPlan(req: any, res: any) {
  const { id, agenda_outcome } = req.body;

  const query = `
    UPDATE department_meeting SET agenda_outcome = ? WHERE id = ?
  `;

  db.query(query, [agenda_outcome, id], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: "Meeting Agenda and Outcome Updated." });
    }
  });
}

  promoteStudents(req: any, res: any) {
  const {
    selectedClassToPromote,
    selectedSectionToPromote,
    selectedSessionToPromote,
    selectedCampus,
    selectedTypeToPromote,
    selectedStudents,
  } = req.body;

  let parsedStudents;

  try {
    parsedStudents = Array.isArray(selectedStudents)
      ? selectedStudents
      : JSON.parse(selectedStudents);
  } catch (err) {
    return res.status(400).json({ ok: false, message: "Invalid student data." });
  }

  let completed = 0;
  let hasError = false;

  parsedStudents.forEach((student) => {
    // Step 1: INSERT into promotion table
    db.query(
      "INSERT INTO student_promotion (student_id, class, section, session, campus, type, principal_approvel) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        student.student_id,
        selectedClassToPromote,
        selectedSectionToPromote,
        selectedSessionToPromote,
        selectedCampus,
        selectedTypeToPromote,
        "Pending",
      ],
      (insertErr) => {
        if (insertErr) {
          if (!hasError) {
            hasError = true;
            return res
              .status(500)
              .json({ ok: false, message: "Insert failed", error: insertErr });
          }
          return;
        }

        // Step 2: UPDATE student table
        db.query(
          "UPDATE student SET Class = ?, section = ?, session = ?, campus = ? WHERE student_id = ?",
          [
            selectedClassToPromote,
            selectedSectionToPromote,
            selectedSessionToPromote,
            selectedCampus,
            student.student_id,
          ],
          (updateErr) => {
            if (updateErr) {
              if (!hasError) {
                hasError = true;
                return res
                  .status(500)
                  .json({ ok: false, message: "Update failed", error: updateErr });
              }
              return;
            }

            // If both insert and update succeeded
            completed++;
            if (completed === parsedStudents.length && !hasError) {
              res.json({ ok: true, message: "Records have been successfully updated." });
            }
          }
        );
      }
    );
  });
}

  getPromotedStudents(req: any, res: any) {
  const sql = `SELECT s.*, sp.class as class_from, sp.session as session_from,sp.type,sp.principal_approvel FROM student s JOIN student_promotion sp ON s.student_id = sp.student_id`;
  db.query(sql, (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  });
}

  async addDiary(req: any, res: any) {
  const {
    session,
    date,
    class: class_name,
    section,
    subject,
    student_id,
    note,
    classwork,
    homework_titles,
    homework_ids,
    classwork_ids
  } = req.body;

  console.log("Request body:", req.body);

  if (!session || !date || !class_name || !section || !subject || !student_id || !note) {
    return res.status(400).json({ ok: false, message: "Missing required fields." });
  }

  let filename = "";
  try {
    if (req.files && req.files.media) {
      filename = await uploadFile(req, "media");
    }
  } catch (uploadErr) {
    console.error("File upload error:", uploadErr.message);
    return res.status(500).json({ ok: false, message: "File upload failed." });
  }

  const insertSql = `
    INSERT INTO student_diary (
      session, date, class, section, subject, student_id,
      note, classwork, homework, media, approve
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertSql,
    [
      session,
      date,
      class_name,
      section,
      subject,
      student_id,
      note,
      classwork || "",
      homework_titles || "",
      filename,
      0,
    ],
    async (err, result) => {
      if (err) {
        console.error("Database query error:", err.message);
        return res.status(500).json({ ok: false, message: "Internal server error." });
      }

  
      const hwIds = homework_ids?.split(",").map((id) => id.trim()) || [];
      const hwTitles = homework_titles?.split(",").map((t) => t.trim()) || [];

      for (let i = 0; i < hwIds.length; i++) {
        const id = hwIds[i];
        const newTitle = hwTitles[i];
        if (!id || !newTitle) continue;

        db.query("SELECT title FROM student_homework_list WHERE id=?", [id], (selErr, selRes) => {
          if (selErr) return console.error("Select error:", selErr.message);

          if (selRes.length > 0 && selRes[0].title !== newTitle) {
            db.query(
              "UPDATE student_homework_list SET title=? WHERE id=?",
              [newTitle, id],
              (updErr) => {
                if (updErr) console.error(`Failed to update homework id ${id}:`, updErr.message);
                else console.log(` Homework ID ${id} title updated to "${newTitle}"`);
              }
            );
          }
        });
      }

   
      const cwIds = classwork_ids?.split(",").map((id) => id.trim()) || [];
      const cwTitles = classwork?.split(",").map((t) => t.trim()) || [];

      for (let i = 0; i < cwIds.length; i++) {
        const id = cwIds[i];
        const newTitle = cwTitles[i];
        if (!id || !newTitle) continue;

        db.query("SELECT title FROM student_classwork_list WHERE id=?", [id], (selErr, selRes) => {
          if (selErr) return console.error("Select error:", selErr.message);

          if (selRes.length > 0 && selRes[0].title !== newTitle) {
            db.query(
              "UPDATE student_classwork_list SET title=? WHERE id=?",
              [newTitle, id],
              (updErr) => {
                if (updErr) console.error(`Failed to update classwork id ${id}:`, updErr.message);
                else console.log(` Classwork ID ${id} title updated to "${newTitle}"`);
              }
            );
          }
        });
      }

      return res.json({
        ok: true,
        message: "Diary added successfully. Homework/Classwork titles updated if changed.",
      });
    }
  );
}

  async approveDiary(req: any, res: any) {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Diary ID is required" });
  }

  // helper query function
  const query = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

  try {
    // 1️⃣ APPROVE DIARY
    await query(
      "UPDATE student_diary SET approve = 1 WHERE id = ?",
      [id]
    );

    // 2️⃣ FETCH DIARY DATA
    const diaryResult = await query(
      "SELECT * FROM student_diary WHERE id = ?",
      [id]
    );

    if (!diaryResult.length) {
      return res.status(404).json({ message: "Diary not found" });
    }

    const data = diaryResult[0];
    const { student_id, subject, note, section } = data;

    // ===============================
    // CASE 1️⃣ : DIARY FOR ALL STUDENTS
    // ===============================
    if (student_id === "All") {
      // 3️⃣ FETCH STUDENTS OF CLASS
      const students = await query(
        `SELECT student_id FROM student WHERE Class = ? AND section = ?`,
        [data.class, section]
      );

      if (!students.length) {
        return res.json({
          ok: true,
          message: "Diary approved but no students found",
        });
      }

      const studentIds = students.map((s) => s.student_id);

      // 4️⃣ STUDENT TOKENS
      const studentTokens = await query(
        `
        SELECT student_id, device
        FROM student_login_information
        WHERE student_id IN (?)
        AND device IS NOT NULL
        `,
        [studentIds]
      );

      // 5️⃣ PARENT TOKENS
      const parentTokens = await query(
        `
        SELECT student_id, device
        FROM parent_login_information
        WHERE student_id IN (?)
        AND device IS NOT NULL
        `,
        [studentIds]
      );

      // 6️⃣ MERGE TOKENS
      const allTokens = [...studentTokens, ...parentTokens];

      // 7️⃣ SEND NOTIFICATIONS
      for (const row of allTokens) {
        try {
          await sendNotification(
            row.device,
            `New diary added for ${subject}`,
            note,
            "http://test.com",
            "diary",
            id,
            row.student_id
          );
        } catch (err) {
          console.warn("Notification failed:", err.message);
        }
      }

      return res.json({
        ok: true,
        message: "Diary approved & notifications sent to all students and parents",
      });
    }

    // ===================================
    // CASE 2️⃣ : DIARY FOR SINGLE STUDENT
    // ===================================

    // STUDENT TOKEN
    const studentTokens = await query(
      `
      SELECT student_id, device
      FROM student_login_information
      WHERE student_id = ?
      AND device IS NOT NULL
      `,
      [student_id]
    );

    // PARENT TOKEN
    const parentTokens = await query(
      `
      SELECT student_id, device
      FROM parent_login_information
      WHERE student_id = ?
      AND device IS NOT NULL
      `,
      [student_id]
    );

    // MERGE
    const allTokens = [...studentTokens, ...parentTokens];

    // SEND NOTIFICATION
    for (const row of allTokens) {
      try {
        await sendNotification(
          row.device,
          `New diary added for ${subject}`,
          note,
          "http://test.com",
          "diary",
          id,
          student_id
        );
      } catch (err) {
        console.warn("Notification failed:", err.message);
      }
    }

    return res.json({
      ok: true,
      message: "Diary approved & notification sent",
    });
  } catch (error) {
    console.error("Approve diary error:", error);
    return res.status(500).json({
      ok: false,
      message: "Diary approved but notification failed",
      error: error.message,
    });
  }
}

  getDiary(req: any, res: any) {
  const { session, className, section, page = 1, limit = 10 } = req.body;

  if (!session) {
    return res.status(400).json({ ok: false, message: "Session is required" });
  }

  let sql = `SELECT * FROM student_diary WHERE session = ?`;
  let queryParam = [session];

  if (className) {
    sql += " AND class = ?";
    queryParam.push(className);
  }

  if (section) {
    sql += " AND section = ?";
    queryParam.push(section);
  }

  sql += " ORDER BY date DESC LIMIT ? OFFSET ?";

  const offset = (page - 1) * limit;
  queryParam.push(Number(limit), Number(offset));

  db.query(sql, queryParam, (err, result) => {
    if (err) {
      return res.json({ ok: false, message: err });
    }

    // get total count for pagination
    let countSql = `SELECT COUNT(*) as total FROM student_diary WHERE session = ?`;
    let countParams = [session];

    if (className) {
      countSql += " AND class = ?";
      countParams.push(className);
    }

    if (section) {
      countSql += " AND section = ?";
      countParams.push(section);
    }

    db.query(countSql, countParams, (countErr, countResult) => {
      if (countErr) {
        return res.json({ ok: false, message: countErr });
      }

      res.json({
        ok: true,
        data: result,
        pagination: {
          total: countResult[0].total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(countResult[0].total / limit),
        },
      });
    });
  });
}

  DeleteDiaryById(req: any, res: any) {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Diary ID is required" });
  }
  const deleteDiaryQuery = `DELETE FROM student_diary WHERE id = ?`;
  const deleteNotificationQuery = `DELETE FROM notifications WHERE content_Id = ?`;

  db.query(deleteDiaryQuery, [id], (err, result) => {
    db.query(deleteNotificationQuery, [id], (err, result2) => {
      res.json({ message: "Diary deleted successfully" });
    });
  });
}

  addExtraClass(req: any, res: any) {
  const {
    selectedStudents,
    selectedClass,
    selectedSection,
    selectedSubject,
    submissionDate,
    submissionTime,
    session,
    note,
  } = req.body;

  const parsedselectedStudents = JSON.parse(selectedStudents);

  const insertPromises = parsedselectedStudents.map((student) => {
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO extra_class (student_id, class, section, subject, note, time, date, session) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          student.student_id,
          selectedClass,
          selectedSection,
          selectedSubject,
          note,
          submissionTime,
          submissionDate,
          session,
        ],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  });

  Promise.all([...insertPromises])
    .then(() => {
      res.json({ ok: true, message: "Records have been successfully added." });
    })

    .catch((err) => {
      res.json({ ok: false, message: err });
    });
}

  getExtraClass(req: any, res: any) {
  const { className, section, session } = req.body;

  db.query(
    `SELECT ec.*, s.student_first_name, s.student_last_name FROM extra_class ec, student s WHERE 
    s.student_id = ec.student_id AND
    ec.class = ? AND ec.section = ? AND ec.session = ? 
    ORDER BY ec.date AND ec.time DESC`,
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

  postWeeklyDates(req: any, res: any) {
  const {weekName,term,class_id, section_id,campus, session, start_date, end_date,teacher_id,compile } = req.body;
  if (!weekName || !term || !class_id|| !section_id|| !campus|| !session|| !start_date||!teacher_id) {
            return res.json({ message: false, info: 'Missing required fields' });
    }
    db.query("INSERT INTO weeklyDates SET ?",{weekName,term,class_id, section_id,campus, session, start_date, end_date,teacher_id,compile,create_date:dhakaTime},(err, result) => {
      if (err) {
        res.json({ message: err,info:"Error inserting weekly date" });
      } else {
        res.json({ message: true,info:"Weekly date added successfully" });
      }
    });
}

  getWeeklyDates(req: any, res: any) {
  const { term, classId, sectionId, session, campus } = req.body;

  db.query(
    'SELECT * FROM weeklyDates WHERE term=? AND class_id = ? AND section_id = ? AND session = ? AND campus = ?',
    [term, classId, sectionId, session, campus],
    (err, results) => {
      if (err) {
        return res.json({ ok: false, message: err });
      }

      const resultsWithDays = results.map(result => {
        return {
          ...result,
          dates: getDates(result.start_date, result.end_date), // Fix the date field to return all dates in the range
          days: getDayNames(result.start_date, result.end_date), // Get the day names based on start and end date
        };
      });

      return res.json({ ok: true, message: resultsWithDays });
    }
  );
}

  async deleteLessonPlansSubjectData(req: any, res: any) {
    try {
        const { weekly_date_id, day_of_week, subject_id } = req.body;

        if (!weekly_date_id || !day_of_week || !subject_id) {
            return res.json({ ok: false, message: 'Missing required fields' });
        }

        db.query(
            'SELECT id FROM weeklyLessonPlans WHERE weekly_date_id=? AND day_of_week=? AND subject_id=?',
            [weekly_date_id, day_of_week, subject_id],
            async (err, result) => {
                if (err) {
                    console.error('Database query error:', err);
                    return res.json({ ok: false, message: 'Database query error', error: err.message });
                }

                if (!result || result.length === 0) {
                    return res.json({ ok: false, message: 'Lesson plan not found' });
                }

                const id = result[0].id;

                try {
                    
                    await db.query(`DELETE FROM student_classwork_list WHERE weekly_date_id=?`, [id]);
                    await db.query(`DELETE FROM student_homework_list WHERE weekly_date_id=?`, [id]);
                    
                    await db.query(`DELETE FROM weeklyLessonPlans WHERE id=?`,[id]);

                    res.json({ ok: true, message: 'Lesson plan and related data deleted successfully' });
                } catch (deleteError) {
                    res.json({ ok: false, message: 'Error deleting records', error: deleteError.message });
                }
            }
        );
    } catch (error) {
        res.json({ ok: false, message: 'Internal server error', error: error.message });
    }
}

  async DeleteWeeklyDatesById(req: any, res: any) {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Missing weekly date ID" });
  }

  try {
    // Step 1: Get all matching weekly lesson plans
    const [lessonPlans] = await new Promise((resolve, reject) => {
      db.query(
        'SELECT id FROM weeklyLessonPlans WHERE weekly_date_id = ?',
        [id],
        (err, result) => {
          if (err) return reject(err);
          resolve([result]);
        }
      );
    });

    // Step 2: Delete related homework and classwork entries
    for (const item of lessonPlans) {
      await new Promise((resolve, reject) => {
        db.query(
          `DELETE FROM student_classwork_list WHERE weekly_date_id = ?`,
          [item.id],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });

      await new Promise((resolve, reject) => {
        db.query(
          `DELETE FROM student_homework_list WHERE weekly_date_id = ?`,
          [item.id],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });
    }

    // Step 3: Delete from weeklyLessonPlans
    await new Promise((resolve, reject) => {
      db.query(
        `DELETE FROM weeklyLessonPlans WHERE weekly_date_id = ?`,
        [id],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    // Step 4: Delete from weeklyDates
    await new Promise((resolve, reject) => {
      db.query(
        `DELETE FROM weeklyDates WHERE id = ?`,
        [id],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    return res.json({ message: true });

  } catch (error) {
    console.error("Deletion failed:", error);
    return res.status(500).json({ message: "Deletion failed", error });
  }
}

  postLessonPlans(req: any, res: any) {
  const {
    weekly_date_id,
    day_of_week,
    subject_id,
    subjectName,
    teacher_id,
    plan_details,
    materials,
    notebooks,
    homework,
    date,
    compile,
    AcademicData
  } = req.body;

  if (!subject_id || !subjectName) {
    return res.status(400).json({ message: "subject_id and subjectName are required fields" });
  }

  let info;
  try {
    info = JSON.parse(AcademicData);
  } catch (error) {
    return res.status(400).json({ message: "Invalid AcademicData format", info: error });
  }

  const weeklyLessonPlans = {
    weekly_date_id,
    day_of_week,
    date,
    subject_id,
    books: materials,
    notebooks,
    teacher_id,
    plan_details,
    create_date: dhakaTime
  };

  db.query("INSERT INTO weeklyLessonPlans SET ?", weeklyLessonPlans, (err, lessonPlansResult) => {
    if (err) {
      console.error('Error inserting Lesson Plans:', err);
      return res.status(500).json({ message: "Error inserting Lesson Plans", info: err });
    }

    const id = lessonPlansResult.insertId;
    const promises = [];

    if (homework && homework.trim() !== "") {
      const homeworkData = {
        school: info[0].school,
        termName: info[0].termName,
        className: info[0].className,
        section: info[0].section,
        session: info[0].session,
        subject: subjectName,
        title: homework,
        date,
        weekly_date_id: id,
        creatorID: info[0].creatorID,
        creatorName: info[0].creatorName
      };

      promises.push(new Promise((resolve, reject) => {
        db.query("INSERT INTO student_homework_list SET ?", homeworkData, (err, result) => {
          if (err) {
            console.error('Error inserting Homework Data:', err);
            reject({ message: "Error inserting Homework Data", info: err });
          } else {
            resolve(result);
          }
        });
      }));
    }

    if (plan_details && plan_details.trim() !== "") {
      const classworkData = {
        school: info[0].school,
        className: info[0].className,
        termName: info[0].termName,
        section: info[0].section,
        session: info[0].session,
        subject: subjectName,
        title: plan_details,
        date,
        weekly_date_id: id,
        creatorID: info[0].creatorID,
        creatorName: info[0].creatorName
      };

      promises.push(new Promise((resolve, reject) => {
        db.query("INSERT INTO student_classwork_list SET ?", classworkData, (err, result) => {
          if (err) {
            console.error('Error inserting Classwork Data:', err);
            reject({ message: "Error inserting Classwork Data", info: err });
          } else {
            resolve(result);
          }
        });
      }));
    }

    Promise.all(promises)
      .then(() => {
        res.json({ message: true, info: "Lesson Plans added successfully" });
      })
      .catch((error) => {
        res.status(500).json(error);
      });
  });
}

  async updateLessonPlans(req: any, res: any) {
  const {
    weekly_date_id,
    day_of_week,
    subject_id,
    subjectName,
    teacher_id,
    plan_details = "",
    materials = "",
    notebooks = "",
    homework = "",
    Planid = "",
    date,
    AcademicData
  } = req.body;

  let info;
  try {
    info = AcademicData ? JSON.parse(AcademicData) : [];
  } catch (error) {
    return res.status(400).json({ message: "Invalid AcademicData format", info: error });
  }

  try {
    

    await new Promise((resolve, reject) => {
      db.query(
        "UPDATE weeklyLessonPlans SET ? WHERE weekly_date_id = ? AND day_of_week = ? AND subject_id = ?",
        [
          {
            books: materials,
            notebooks: notebooks,
            plan_details,
            update_date: dhakaTime
          },
          weekly_date_id, day_of_week, subject_id
        ],
        (err, result) => {
          if (err) return reject({ message: "Error updating Lesson Plans", info: err });
          resolve(result);
        }
      );
    });

    if (homework.trim() !== "") {
      await new Promise((resolve, reject) => {
        db.query(
          "SELECT COUNT(*) AS count FROM student_homework_list WHERE date = ? AND subject = ? AND weekly_date_id=?",
          [date, subjectName,Planid],
          (err, result) => {
            if (err) return reject({ message: "Error checking Homework existence", info: err });

            const exists = result[0].count > 0;
            const query = exists
              ? "UPDATE student_homework_list SET title = ? WHERE date = ? AND subject = ? AND weekly_date_id=?"
              : "INSERT INTO student_homework_list SET ?";
            const params = exists
              ? [homework, date, subjectName,Planid]
              : {
                  school: info[0]?.school,
                  termName: info[0]?.termName,
                  className: info[0]?.className,
                  section: info[0]?.section,
                  session: info[0]?.session,
                  subject: subjectName,
                  title: homework,
                  date,
                  weekly_date_id: Planid,
                  creatorID: info[0]?.creatorID,
                  creatorName: info[0]?.creatorName
                };

            db.query(query, params, (err, result) => {
              if (err) return reject({ message: "Error saving Homework", info: err });
              resolve(result);
            });
          }
        );
      });
    }else {
      await new Promise((resolve, reject) => {
        db.query(
          "SELECT COUNT(*) AS count FROM student_homework_list WHERE date = ? AND subject = ? AND weekly_date_id = ?",
          [date, subjectName, Planid],
          (err, result) => {
            if (err) return reject({ message: "Error checking Homework existence", info: err });
    
            if (result[0].count > 0) {
              db.query(
                "DELETE FROM student_homework_list WHERE date = ? AND subject = ? AND weekly_date_id = ?",
                [date, subjectName, Planid],
                (err, delResult) => {
                  if (err) return reject({ message: "Error deleting Homework", info: err });
                  resolve(delResult);
                }
              );
            } else {
              resolve(); 
            }
          }
        );
      });
    }

    if (plan_details.trim() !== "") {
      await new Promise((resolve, reject) => {
        db.query(
          "SELECT COUNT(*) AS count FROM student_classwork_list WHERE date = ? AND subject = ? AND weekly_date_id=?",
          [date, subjectName,Planid],
          (err, result) => {
            if (err) return reject({ message: "Error checking Classwork existence", info: err });

            const exists = result[0].count > 0;
            const query = exists
              ? "UPDATE student_classwork_list SET title = ? WHERE date = ? AND subject = ? AND weekly_date_id=?"
              : "INSERT INTO student_classwork_list SET ?";
            const params = exists
              ? [plan_details, date, subjectName,Planid]
              : {
                  school: info[0]?.school,
                  termName: info[0]?.termName,
                  className: info[0]?.className,
                  section: info[0]?.section,
                  session: info[0]?.session,
                  subject: subjectName,
                  title: plan_details,
                  date,
                  weekly_date_id: Planid,
                  creatorID: info[0]?.creatorID,
                  creatorName: info[0]?.creatorName
                };

            db.query(query, params, (err, result) => {
              if (err) return reject({ message: "Error saving Classwork", info: err });
              resolve(result);
            });
          }
        );
      });
    }
    else {
      await new Promise((resolve, reject) => {
        db.query(
          "SELECT COUNT(*) AS count FROM student_classwork_list WHERE date = ? AND subject = ? AND weekly_date_id=?",
          [date, subjectName, Planid],
          (err, result) => {
            if (err) return reject({ message: "Error checking classwork existence", info: err });
    
            if (result[0].count > 0) {
              db.query(
                "DELETE FROM student_classwork_list WHERE date = ? AND subject = ? AND weekly_date_id = ?",
                [date, subjectName, Planid],
                (err, delResult) => {
                  if (err) return reject({ message: "Error deleting classwork", info: err });
                  resolve(delResult);
                }
              );
            } else {
              resolve(); 
            }
          }
        );
      });
    }

    res.json({ message: true, info: "Lesson Plans updated successfully" });

  } catch (error) {
    console.error("Error in /updateLessonPlans:", error);
    res.status(500).json(error);
  }
}

  getWeeklyScheduleDataForUpdateId(req: any, res: any) {
  const { weekly_date_id, subject_id } = req.body;

  const query = `
    SELECT
      a.day_of_week AS day_of_week,
      a.weekly_date_id AS weekly_date_id,
      a.notebooks AS notebooks,
      a.books AS books,
      a.plan_details AS plan_details,
      COALESCE(a.date, b.date) AS date,
      b.title AS homework,
      c.title AS classwork,
      s.id AS subject_id,
      s.subject_name AS subject_name,
      a.id as lessonPlansId
    FROM weeklyLessonPlans a
    LEFT JOIN student_homework_list b ON a.id = b.weekly_date_id
    LEFT JOIN student_classwork_list c ON a.id = c.weekly_date_id
    JOIN subject_list s ON a.subject_id = s.id
    WHERE a.subject_id = ? AND a.weekly_date_id = ?
    ORDER BY a.weekly_date_id DESC,
      FIELD(a.day_of_week, 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')
  `;

  db.query(query, [subject_id, weekly_date_id], (err, result) => {
    if (err || result.length === 0) {
      return res.json({ ok: false, message: 'Database query failed or no data found', error: err });
    } else {
      return res.json({ ok: true, data: result });
    }
  });
}

  getWeeklyLessonPlanForCurrentDate(req: any, res: any) {
  const { class_id,section_id } = req.body;
  const query = `
  SELECT 
    wd.start_date AS start_date, 
    wd.end_date AS end_date, 
    wd.campus AS campus, 
    wd.session AS session, 
    lp.day_of_week AS day_of_week, 
    s.subject_name AS subject_name, 
    lp.plan_details AS plan_details, 
    lp.books AS books, 
    lp.notebooks AS notebooks, 
    hl.title AS homework
    FROM weeklyDates wd
    LEFT JOIN weeklyLessonPlans lp ON wd.id = lp.weekly_date_id
    LEFT JOIN student_homework_list hl ON lp.id = hl.weekly_date_id 
    LEFT JOIN subject_list s ON lp.subject_id = s.id 
    WHERE wd.class_id = ?
    AND wd.section_id = ?
    AND CURDATE() BETWEEN wd.start_date AND wd.end_date
    AND (hl.date IS NULL OR hl.date = CURDATE())
    ORDER BY FIELD(lp.day_of_week, 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')
  `;
  db.query(query, [class_id,section_id], (err, result) => {
    if (result.length===0) {
      res.json({ ok: false, message: 'Database query failed', error: err });
    }else{
        res.json({ ok: true, data: result }); 
    }
   
  });
}

  getWeeklyScheduleById(req: any, res: any) {
  const { id } = req.body;
  const sql = `
    SELECT wd.start_date AS start_date, wd.end_date AS end_date, wd.campus AS campus, wd.session AS session, lp.day_of_week AS day_of_week, s.subject_name AS subject_name, lp.plan_details AS plan_details, lp.books AS books, lp.notebooks AS notebooks, hl.title AS homework
    FROM weeklyDates wd 
    LEFT JOIN weeklyLessonPlans lp ON wd.id = lp.weekly_date_id 
    LEFT JOIN student_homework_list hl ON lp.id = hl.weekly_date_id 
    LEFT JOIN subject_list s ON lp.subject_id = s.id 
    WHERE wd.id = ? 
    ORDER BY FIELD(lp.day_of_week,'Saturday','Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')`;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error fetching weekly schedule data', err);
      return res.status(500).json({ error: 'Error fetching weekly schedule data' });
    }

    const formattedData = [];
    const weeklyDateMap = new Map();

    results.forEach(row => {
      let currentWeeklyDate = weeklyDateMap.get(row.start_date);
      
      if (!currentWeeklyDate) {
        currentWeeklyDate = {
          start_date: row.start_date,
          end_date: row.end_date,
          campus: row.campus,
          session: row.session,
          days: []
        };
        weeklyDateMap.set(row.start_date, currentWeeklyDate);
        formattedData.push(currentWeeklyDate);
      }

      let currentDay = currentWeeklyDate.days.find(day => day.day === row.day_of_week);
      if (!currentDay) {
        currentDay = {
          day: row.day_of_week || 'N/A',
          subjects: []
        };
        currentWeeklyDate.days.push(currentDay);
      }

      const subjectExists = currentDay.subjects.some(subject => subject.subject === row.subject_name && subject.lesson_plan === row.plan_details);
      if (!subjectExists) {
        currentDay.subjects.push({
          subject: row.subject_name || 'No Subject',
          lesson_plan: row.plan_details || 'No Lesson Plan',
          books: row.books || 'N/A',
          notebooks: row.notebooks || 'N/A',
          homework: row.homework || 'N/A'
        });
      }
    });

    res.status(200).json(formattedData);
  });
}

  getWeeklySchedule(req: any, res: any) {
  const { session, campus } = req.body;
  const sql = `
    SELECT wd.start_date AS start_date, wd.end_date AS end_date, wd.campus AS campus, wd.session AS session, lp.day_of_week AS day_of_week, s.subject_name AS subject_name, lp.plan_details AS plan_details
    FROM weeklyDates wd
    LEFT JOIN weeklyLessonPlans lp ON wd.id = lp.weekly_date_id
    LEFT JOIN subject_list s ON lp.subject_id = s.id 
    WHERE wd.session = ? AND wd.campus = ?`;

  db.query(sql, [session, campus], (err, results) => {
    if (err) {
      console.error('Error fetching weekly schedule data', err);
      return res.status(500).json({ error: 'Error fetching weekly schedule data' });
    }

    // Structure data into the desired format
    const formattedData = [];

    results.forEach(row => {
      let currentWeeklyDate = formattedData.find(date => date.start_date === row.start_date);
      
      if (!currentWeeklyDate) {
        // New weekly date
        currentWeeklyDate = {
          start_date: row.start_date,
          end_date: row.end_date,
          campus: row.campus,
          session: row.session,
          days: []
        };
        formattedData.push(currentWeeklyDate);
      }

      // Check if day exists for current day of the week
      let currentDay = currentWeeklyDate.days.find(day => day.day === row.day_of_week);
      if (!currentDay) {
        // New day entry
        currentDay = {
          day: row.day_of_week,
          subjects: []
        };
        currentWeeklyDate.days.push(currentDay);
      }

      // Add subject and lesson plan details
      currentDay.subjects.push({
        subject: row.subject_name || 'No Subject',
        lesson_plan: row.plan_details || 'No Lesson Plan'
      });
    });

    res.status(200).json(formattedData);
  });
}

  resultPublish(req: any, res: any) {
    const { className, sectionName, campus, type, session, resultFor, status } = req.body; 
    db.query("INSERT INTO publish_result SET ?",{className, sectionName, campus, type, session, resultFor, status},(err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  getResultPublishInfo(req: any, res: any) {
  const { className, sectionName, campus, type, session, resultFor } = req.body; 
  let sql = `SELECT * FROM publish_result WHERE className=? AND sectionName=? AND campus=? AND type=? AND session=? AND resultFor=?`;
  let queryParam = [className, sectionName, campus, type, session, resultFor];

  db.query(sql, queryParam, (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  }); 
}

  async UpdateResultPublish(req: any, res: any) {
  const { id, status } = req.body;

  const query = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

  try {
    // 1️⃣ FETCH PUBLISH RESULT DATA
    const results = await query(
      `SELECT * FROM publish_result WHERE id = ?`,
      [id]
    );

    if (!results.length) {
      return res.status(404).json({ error: "Publish result not found" });
    }

    const publishResult = results[0];
    const { className, sectionName } = publishResult;

    // 2️⃣ FETCH STUDENTS OF CLASS + SECTION
    const students = await query(
      `
      SELECT student_id
      FROM student
      WHERE Class = ? AND section = ?
      `,
      [className, sectionName]
    );

    if (!students.length) {
      return res.json({
        ok: true,
        message: "No students found for notification",
      });
    }

    const studentIds = students.map((s) => s.student_id);

    // 3️⃣ STUDENT TOKENS
    const studentTokens = await query(
      `
      SELECT student_id, device
      FROM student_login_information
      WHERE student_id IN (?)
      AND device IS NOT NULL
      `,
      [studentIds]
    );

    // 4️⃣ PARENT TOKENS
    const parentTokens = await query(
      `
      SELECT student_id, device
      FROM parent_login_information
      WHERE student_id IN (?)
      AND device IS NOT NULL
      `,
      [studentIds]
    );

    // 5️⃣ MERGE TOKENS
    const allTokens = [...studentTokens, ...parentTokens];

    // Optional: remove duplicate devices
    const uniqueTokens = Array.from(
      new Map(allTokens.map((i) => [i.device, i])).values()
    );

    // 6️⃣ SEND NOTIFICATIONS
    if (status === "Publish") {
      for (const row of uniqueTokens) {
        try {
          await sendNotification(
            row.device,
            "Result Published 🎓",
            `Term Report has been published for ${className}`,
            "http://test.com",
            "TermReport",
            id,
            row.student_id
          );
        } catch (err) {
          console.warn("Notification failed:", err.message);
        }
      }
    }

    // 7️⃣ UPDATE STATUS
    await query(
      `UPDATE publish_result SET status = ? WHERE id = ?`,
      [status, id]
    );

    res.json({
      ok: true,
      message: "Result status updated & notifications sent",
    });
  } catch (error) {
    console.error("UpdateResultPublish error:", error);
    res.status(500).json({
      ok: false,
      message: "Failed to publish result",
      error: error.message,
    });
  }
}

  async UpdateMonthlyReportPublish(req: any, res: any) {
  const { id, status } = req.body;

  const query = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

  try {
    // 1️⃣ FETCH MONTHLY REPORT DATA
    const results = await query(
      `SELECT * FROM monthly_progress_report WHERE id = ?`,
      [id]
    );

    if (!results.length) {
      return res.status(404).json({ error: "Monthly report not found" });
    }

    const publishResult = results[0];
    const className = publishResult.class_name;

    // 2️⃣ FETCH STUDENTS OF CLASS
    const students = await query(
      `
      SELECT student_id
      FROM student
      WHERE Class = ?
      `,
      [className]
    );

    if (!students.length) {
      return res.json({
        ok: true,
        message: "No students found for notification",
      });
    }

    const studentIds = students.map((s) => s.student_id);

    // 3️⃣ STUDENT TOKENS
    const studentTokens = await query(
      `
      SELECT student_id, device
      FROM student_login_information
      WHERE student_id IN (?)
      AND device IS NOT NULL
      `,
      [studentIds]
    );

    // 4️⃣ PARENT TOKENS
    const parentTokens = await query(
      `
      SELECT student_id, device
      FROM parent_login_information
      WHERE student_id IN (?)
      AND device IS NOT NULL
      `,
      [studentIds]
    );

    // 5️⃣ MERGE TOKENS
    const allTokens = [...studentTokens, ...parentTokens];

    // Optional: remove duplicate devices
    const uniqueTokens = Array.from(
      new Map(allTokens.map((i) => [i.device, i])).values()
    );

    // 6️⃣ SEND NOTIFICATIONS
    if (status === "Publish") {
      for (const row of uniqueTokens) {
        try {
          await sendNotification(
            row.device,
            "Monthly Report Published 📊",
            `Monthly progress has been published for ${className}`,
            "http://test.com",
            "MonthlyReport",
            id,
            row.student_id
          );
        } catch (err) {
          console.warn("Notification failed:", err.message);
        }
      }
    }

    // 7️⃣ UPDATE PUBLISH STATUS
    await query(
      "UPDATE monthly_progress_report SET publish = ? WHERE id = ?",
      [status, id]
    );

    res.json({
      ok: true,
      message: "Monthly report status updated & notifications sent",
    });
  } catch (error) {
    console.error("UpdateMonthlyReportPublish error:", error);
    res.status(500).json({
      ok: false,
      message: "Failed to publish monthly report",
      error: error.message,
    });
  }
}

  getMonthlyReport(req: any, res: any) {
  const { className, section, campus, startDate, endDate, studentId } = req.body;

  let sql = `
    SELECT 
      s.student_id,
      shl.student_name,
      trp.subject_name,
      IFNULL(COUNT(DISTINCT shl.id), 0) AS homeWork,
      IFNULL(SUM(CASE WHEN shr.progress = 1 THEN 1 ELSE 0 END), 0) AS doneHomeWork,
      IFNULL(scl.title, 'No Class Test') AS classtest_title,
      IFNULL(scl.marks, 0) AS marks,
      IFNULL(scr.obtain_marks, 0) AS obtain_marks
    FROM 
      student AS s
    LEFT JOIN
      term_report_parameter AS trp ON trp.className = s.Class
    LEFT JOIN 
      student_homework_list AS shl ON shl.subject = trp.subject_name 
      AND s.Class = shl.className 
      AND s.section = shl.section
      AND shl.date BETWEEN ? AND ?
    LEFT JOIN 
      student_homework_response AS shr ON shr.selectedWorkID = shl.id 
      AND shr.student_id = s.student_id
    LEFT JOIN 
      student_classtest_list AS scl ON scl.subject = trp.subject_name
      AND s.Class = scl.className 
      AND s.section = scl.section
      AND scl.date BETWEEN ? AND ?
    LEFT JOIN 
      student_classtest_response AS scr ON scr.selectedTestID = scl.id
      AND scr.student_id = s.student_id
    WHERE 
      s.campus = ?
      AND s.Class = ?
      AND s.section = ?
      ${studentId ? 'AND s.student_id = ?' : ''}
    GROUP BY 
      s.student_id, trp.subject_name, scl.id, scl.title, scl.marks, scr.obtain_marks;
  `;

  const queryParams = [startDate, endDate, startDate, endDate, campus, className, section];
  if (studentId) queryParams.push(studentId);

  db.query(sql, queryParams, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Data transformation
    const reportData = results.reduce((acc, row) => {
      let studentEntry = acc.find(entry => entry.studentId === row.student_id);
      if (!studentEntry) {
        studentEntry = {
          studentId: row.student_id,
          subjectData: []
        };
        acc.push(studentEntry);
      }

      let subjectEntry = studentEntry.subjectData.find(subject => subject.subjectName === row.subject_name);
      if (!subjectEntry) {
        subjectEntry = {
          subjectName: row.subject_name,
          homeWork: row.homeWork,
          doneHomeWork: row.doneHomeWork,
          classTestData: []
        };
        studentEntry.subjectData.push(subjectEntry);
      }

      subjectEntry.classTestData.push({
        classtestTitle: row.classtest_title,
        marks: row.marks,
        obtain_marks: row.obtain_marks
      });

      return acc;
    }, []);

    res.json(reportData);
  });
}

  getMonthlyReportAll(req: any, res: any) {
  const { className, section, campus, startDate, endDate, studentId } = req.body;

  let sql = `
    SELECT 
      s.student_id,
      s.student_first_name,
      s.student_last_name,
      trp.subject_name,
      IFNULL(COUNT(DISTINCT shl.id), 0) AS homeWork,
      IFNULL(SUM(CASE WHEN shr.progress = 1 THEN 1 ELSE 0 END), 0) AS doneHomeWork,
      IFNULL(scl.title, 'No Class Test') AS classtest_title,
      IFNULL(scl.marks, 0) AS marks,
      IFNULL(scr.obtain_marks, 0) AS obtain_marks
    FROM 
      student AS s
    LEFT JOIN 
      class_name AS cn ON cn.class_name = s.Class
    LEFT JOIN
      term_report_parameter AS trp ON trp.className = cn.class_name
    LEFT JOIN 
      student_homework_list AS shl ON shl.subject = trp.subject_name 
      AND shl.className = cn.id
      AND cn.campus = s.campus
      AND s.section = shl.section
      AND shl.date BETWEEN ? AND ?
    LEFT JOIN 
      student_homework_response AS shr ON shr.selectedWorkID = shl.id 
      AND shr.student_id = s.student_id
    LEFT JOIN 
      student_classtest_list AS scl ON scl.subject = trp.subject_name
      AND s.Class = scl.className 
      AND s.section = scl.section
      AND scl.date BETWEEN ? AND ?
    LEFT JOIN 
      student_classtest_response AS scr ON scr.selectedTestID = scl.id
      AND scr.student_id = s.student_id
    WHERE 
      s.campus = ?
      AND s.Class = ?
      AND s.section = ?
      ${studentId ? 'AND s.student_id = ?' : ''}
    GROUP BY 
      s.student_id, trp.subject_name, scl.id, scl.title, scl.marks, scr.obtain_marks
    ORDER BY trp.id ASC  
      ;
  `;

  const queryParams = [startDate, endDate, startDate, endDate, campus, className, section];
  if (studentId) queryParams.push(studentId);



  db.query(sql, queryParams, (err, reportResults) => {
    if (err) {
      console.error("Error fetching report data:", err);
      return res.status(500).json({ error: 'Error fetching report data', details: err });
    }

   

    const reportData = reportResults.reduce((acc, row) => {
      let studentEntry = acc.find(entry => entry.studentId === row.student_id);
      if (!studentEntry) {
        studentEntry = {
          studentId: row.student_id,
          studentName: `${row.student_first_name} ${row.student_last_name}`,
          subjectData: [],
          attendanceData: null,
        };
        acc.push(studentEntry);
      }

      let subjectEntry = studentEntry?.subjectData.find(subject => subject.subjectName === row.subject_name);
      if (!subjectEntry) {
        subjectEntry = {
          subjectName: row.subject_name,
          homeWork: row.homeWork,
          doneHomeWork: row.doneHomeWork,
          classTestData: []
        };
        studentEntry.subjectData.push(subjectEntry);
      }

     

      subjectEntry?.classTestData?.push({
        classtestTitle: row.classtest_title,
        marks: row.marks,
        obtain_marks: row.obtain_marks
      });

      return acc;
    }, []);

    if (reportData.length === 0) {
      return res.json([]);
    }

    // Now fetch attendance data
    const attendanceQuery = `
      SELECT 
          COUNT(Student_Attendance.date) AS total_days,
          SUM(CASE WHEN Student_Attendance.attendance = 1 THEN 1 ELSE 0 END) AS present,
          SUM(CASE WHEN Student_Attendance.attendance = 0 THEN 1 ELSE 0 END) AS absent,
          Student_Attendance.student_id,
          s.campus,
          CONCAT(s.student_first_name, ' ', s.student_last_name) AS student_name
      FROM 
          Student_Attendance
      JOIN 
          student AS s ON s.student_id = Student_Attendance.student_id
      WHERE 
          s.Class = ? AND s.section = ? 
          AND s.campus = ? 
          AND Student_Attendance.date BETWEEN ? AND ?
          ${studentId ? "AND Student_Attendance.student_id = ?" : ""}
      GROUP BY 
          Student_Attendance.student_id;
    `;

    const attendanceParams = studentId
      ? [className, section, campus, startDate, endDate, studentId]
      : [className, section, campus, startDate, endDate];



    db.query(attendanceQuery, attendanceParams, (err, attendanceResults) => {
      if (err) {
        console.error("Error fetching attendance data:", err);
        return res.status(500).json({ error: 'Error fetching attendance data', details: err });
      }

      attendanceResults.forEach(att => {
        const studentEntry = reportData.find(entry => entry.studentId === att.student_id);
        if (studentEntry) {
          studentEntry.attendanceData = {
            totalDays: att.total_days,
            present: att.present,
            absent: att.absent,
          };
        }
      });

      res.json(reportData);
    });
  });
}

  async getDataForMonthlyDataSubmit(req: any, res: any) {
    const { className, section, campus, startDate, endDate, studentId, subjectName } = req.body;

    const sql = `
        SELECT 
            s.student_id,
            s.student_first_name,
            s.student_last_name,
            trp.subject_name,
            IFNULL(COUNT(DISTINCT shl.id), 0) AS homeWork,
            IFNULL(SUM(CASE WHEN shr.progress = 1 THEN 1 ELSE 0 END), 0) AS doneHomeWork,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'classtest_title', scl.title,
                        'marks', scl.marks,
                        'obtain_marks', IFNULL(scr.obtain_marks, 0)
                    )
                ) 
                FROM student_classtest_list AS scl
                LEFT JOIN student_classtest_response AS scr 
                    ON scr.selectedTestID = scl.id
                    AND scr.student_id = s.student_id
                WHERE scl.subject = trp.subject_name
                    AND scl.className = s.Class 
                    AND scl.section = s.section
                    AND scl.date BETWEEN ? AND ?
            ) AS classTests
        FROM student AS s
        LEFT JOIN term_report_parameter AS trp 
            ON trp.className = s.Class ORDER BY trp.id
        LEFT JOIN student_homework_list AS shl 
            ON shl.subject = trp.subject_name 
            AND s.Class = shl.className 
            AND s.section = shl.section
            AND shl.date BETWEEN ? AND ?
        LEFT JOIN student_homework_response AS shr 
            ON shr.selectedWorkID = shl.id 
            AND shr.student_id = s.student_id
        WHERE s.campus = ? 
            AND s.Class = ? 
            AND s.section = ?
            AND trp.subject_name = ?
            ${studentId ? "AND s.student_id = ?" : ""}
        GROUP BY s.student_id, trp.subject_name;
    `;

    const params = [startDate, endDate, startDate, endDate, campus, className, section, subjectName];
    if (studentId) params.push(studentId);

    db.query(sql, params, (err, reportResults) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ error: "Database error" });
        }

        // Ensure `classTests` is a valid JSON array (empty when null)
        reportResults = reportResults.map(row => ({
            ...row,
            classTests: row.classTests ? JSON.parse(row.classTests) : [] // Convert JSON string to array, default to []
        }));

        res.json(reportResults);
    });
}

  postMonthlyProgressReport(req: any, res: any) {
    const { class_name, campus, term, fromDate, toDate, session, compile } = req.body;

    const sql = `
        INSERT INTO monthly_progress_report 
        (class_name, campus, term, fromDate, toDate, session, compile) 
        VALUES (?, ?, ?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
        fromDate = VALUES(fromDate), 
        toDate = VALUES(toDate), 
        compile = VALUES(compile)
    `;

    db.query(sql, [class_name, campus, term, fromDate, toDate, session, compile], (err, result) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.json({ message: "Success", result });
    });
}

  getMonthlyProgressReport(req: any, res: any) {
  const { class_name, campus, term, session } = req.body; 
  let sql = `SELECT * FROM monthly_progress_report WHERE class_name=? AND campus=? AND term=? AND session=?`;
  let queryParam = [class_name, campus, term, session];

  db.query(sql, queryParam, (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: result});
    }
  }); 
}

  deleteMonthlyProgressReport(req: any, res: any) {
  const { id } = req.body;
  db.query("DELETE FROM monthly_progress_report WHERE id = ?", id, (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
}

  AcademicTest(req: any, res: any) {
  res.send("Academic");
}
}
