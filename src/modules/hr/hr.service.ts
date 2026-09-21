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

// Leave Application Management

// router.post("/getAllLeaveRequest", (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const pageSize = parseInt(req.query.pageSize) || 9999;
//   const offset = (page - 1) * pageSize;

//   db.query(
//     "SELECT * FROM leave_application ORDER BY applicantDate DESC  LIMIT ? OFFSET ?",[pageSize, offset], (err, result) => {
//       if (err) {
//         res.json({ message: err });
//       } else {
//         res.json({ message: result });
//       }
//     }
//   );
//   });

// Update Employee

// update attendance salary

// Depertment

// delete department
// Designation

// delete designation
//update attendance period
// delete staff
//exit application

// router.post("/addExitApplicationForm", (req, res) => {
//   const { id, emp_id, exitDate, reason, strongestPoint, toDevArea, managementAttitude, financialDealing, leaveContact, suggestion } = req.body;
//   const date = new Date(); // current date
//   db.query(
//     "INSERT INTO exit_application SET ?",
//     { id, emp_id, exitDate : date, reason, strongestPoint, toDevArea, managementAttitude, financialDealing, leaveContact, suggestion },
//     (err, result) => {
//       if (err) {
//         res.json({ message: err });
//       } else {
//         res.json({ message: true });
//       }
//     }
//   );
// });

// // get exit application

// router.post("/getExitApplicationForm", (req, res) => {
//   db.query("SELECT * FROM exit_application ", (err, result) => {
//     res.json({ message: result });
//   });
// });

//get exit applications with emp_name by joining exit_application and employee table

//getExitApplicationById

//update student
// Get the current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const day = currentDate.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const fetchDataAndPost = async () => {
  try {
    const requestBody = {
      operation: "fetch_log",
      auth_user: "ALHASANAIN",
      auth_code: "0wras71cp4bp4f47ihz66z0zinp3fdo",
      start_date: getCurrentDate(),
      end_date: getCurrentDate(),
      start_time: "00:00:00",
      end_time: "23:59:59"
    };

    const response = await fetch(`https://rumytechnologies.com/rams/json_api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();
    const selectResult = data?.log;

    if (!selectResult || !Array.isArray(selectResult)) {
      console.error("No valid data fetched.");
      return;
    }

    console.log("Data fetched successfully.");

   for (const row of selectResult) {
  const { registration_id, user_name, access_date, access_time } = row;

  const insertQuery = `
    INSERT INTO attendance_device (empID, empName, date, inTime, outTime, total_time) 
    VALUES (?, ?, ?, ?, ?, ?) 
    ON DUPLICATE KEY UPDATE 
      empName = VALUES(empName), 
      outTime = VALUES(outTime),
      total_time = TIMEDIFF(VALUES(outTime), inTime)
  `;

  const values = [
    registration_id,
    user_name || "Unknown",
    access_date,
    access_time,
    access_time,
    "00:00"
  ];

  db.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error("Database error:", err);
    } else {
      console.log("Attendance data inserted/updated successfully.");
    }
  });
}

  } catch (error) {
    console.error("Error fetching or inserting data:", error);
  }
};


const startFetchingData = () => {
  setInterval(() => {
    (async () => {
      try {
        await fetchDataAndPost();
      } catch (error) {
        console.error("Error in interval fetching:", error);
      }
    })();
  }, 900000); // 15 minutes in milliseconds
};


startFetchingData();




/////////  new ////////



// const allowedPrefixes = ["ahb-", "ahg-"];

// // 🔹 Promise-based DB query helper
// const query = (sql, params = []) =>
//   new Promise((resolve, reject) => {
//     db.query(sql, params, (err, result) => {
//       if (err) reject(err);
//       else resolve(result);
//     });
//   });

// let isRunning = false;

// const fetchDataAndPostStudentAttendance = async () => {
//   if (isRunning) {
//     console.log("Previous attendance sync still running – skipping this cycle");
//     return;
//   }

//   isRunning = true;

//   try {
//     const today = getCurrentDate();

//     const requestBody = {
//       operation: "fetch_log",
//       auth_code: "0wras71cp4bp4f47ihz66z0zinp3fdo",
//       start_date: "2026-01-08",
//       end_date: "2026-01-08",
//       start_time: "00:00:00",
//       end_time: "23:59:59",
//     };

//     const response = await fetch("https://rumytechnologies.com/rams/json_api", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(requestBody),
//     });

//     if (!response.ok) {
//       throw new Error(`Error fetching data: ${response.statusText}`);
//     }

//     const data = await response.json();
//     const logs = data?.log;

//     if (!Array.isArray(logs) || logs.length === 0) {
//       console.log("No attendance logs found for today");
//       return;
//     }

//     for (const row of logs) {
//       try {
//         let { registration_id, user_name, access_date, access_time } = row;
//         if (!registration_id || !access_date || !access_time) continue;

//         registration_id = registration_id.trim();

//         // Prefix validation
//         const isValid = allowedPrefixes.some((p) =>
//           registration_id.toLowerCase().startsWith(p)
//         );
//         if (!isValid) continue;

//         // Format time
//         const [h, m, s] = access_time.split(":");
//         const formattedTime = [h, m, s].map(v => v.padStart(2,"0")).join(":");

//         // Insert / Update attendance
//         const result = await query(
//           `INSERT INTO student_attendance_device
//             (student_id, studentName, attendance_date, inTime, outTime)
//           VALUES (?, ?, ?, ?, ?)
//           ON DUPLICATE KEY UPDATE
//              outTime = VALUES(outTime)`,
//           [registration_id, user_name?.trim() || "Unknown", access_date, formattedTime, formattedTime]
//         );

//         // Skip if no new row or update
//         if (result.affectedRows < 1) continue;

//         // 🔔 DUPLICATE CHECK IN FETCH FUNCTION
//         const alreadyNotified = await query(
//           `SELECT id FROM notifications
//           WHERE LOWER(user) = LOWER(?)
//           AND section = 'attendance'
//           AND notification_date = ?
//           LIMIT 1`,
//           [registration_id, access_date]
//         );

//         if (alreadyNotified.length > 0) {
//           // Already notified → skip sending
//           continue;
//         }

//         // Fetch device tokens
//         const tokens = await query(
//           `SELECT device FROM student_login_information
//           WHERE LOWER(student_id) = LOWER(?) AND device IS NOT NULL
//           UNION ALL
//           SELECT device FROM parent_login_information
//           WHERE LOWER(student_id) = LOWER(?) AND device IS NOT NULL`,
//           [registration_id, registration_id]
//         );

//         if (!tokens.length) continue;

//         // Send notification
//         for (const t of tokens) {
//           try {
//             await sendNotification(
//               t.device,
//               "Attendance Recorded",
//               `Hello ${user_name || "Student"}, your attendance has been successfully marked on ${access_date} at ${formattedTime}.`,
//               "http://test.com",
//               "attendance",
//               registration_id,
//               registration_id,
//               access_date
//             );
//           } catch (notifError) {
//             console.error("Notification send error:", notifError.message);
//           }
//         }
//       } catch (rowError) {
//         console.error("Row processing error:", rowError.message);
//         continue;
//       }
//     }

//     console.log(`Attendance sync completed for ${today}`);
//   } catch (error) {
//     console.error("Attendance sync error:", error.message);
//   } finally {
//     isRunning = false;
//   }
// };


// // ⏰ Run every 1 hour
// const startFetchingStudentData = () => {
//   setInterval(() => {
//   fetchDataAndPostStudentAttendance();
//   }, 60000); // 1 hour
// };

// startFetchingStudentData();




///////////////new 2 //////////////////////////




const allowedPrefixes = ["ahb-", "ahg-"];

// 🔹 Promise-based DB query helper
const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

let isRunning = false;

const fetchDataAndPostStudentAttendance = async () => {
  if (isRunning) {
    console.log("⏳ Previous attendance sync running – skipping this cycle");
    return;
  }

  isRunning = true;

  try {
    const today = getCurrentDate();

    const requestBody = {
      operation: "fetch_log",
      auth_code: "0wras71cp4bp4f47ihz66z0zinp3fdo",
      start_date: today,
      end_date: today,
      start_time: "00:00:00",
      end_time: "23:59:59",
    };

    const response = await fetch("https://rumytechnologies.com/rams/json_api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();
    const logs = data?.log;

    if (!Array.isArray(logs) || logs.length === 0) {
      console.log("ℹ️ No attendance logs found for today");
      return;
    }

    for (const row of logs) {
      try {
        let { registration_id, user_name, access_date, access_time } = row;
        if (!registration_id || !access_date || !access_time) continue;

        registration_id = registration_id.trim();

        // ✅ Prefix validation
        if (!allowedPrefixes.some(p => registration_id.toLowerCase().startsWith(p))) continue;

        // ✅ Format time HH:MM:SS
        const [h, m, s] = access_time.split(":");
        const formattedTime = [h, m, s].map(v => v.padStart(2,"0")).join(":");

        // ✅ Insert / Update attendance
        const result = await query(
          `INSERT INTO student_attendance_device
            (student_id, studentName, attendance_date, inTime, outTime)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE outTime = VALUES(outTime)`,
          [registration_id, user_name?.trim() || "Unknown", access_date, formattedTime, formattedTime]
        );

        if (result.affectedRows < 1) continue; // skip if no insert/update

        // 🔔 DUPLICATE CHECK AT FETCH FUNCTION LEVEL
        const alreadyNotified = await query(
          `SELECT id FROM notifications
          WHERE LOWER(user) = LOWER(?)
          AND section = 'attendance'
          AND notification_date = ?
          LIMIT 1`,
          [registration_id, access_date]
        );

        if (alreadyNotified.length > 0) {
          continue; // Already notified → skip
        }

        // ✅ Insert notification in DB BEFORE sending (only once)
        await query(
          `INSERT INTO notifications
          (user, title, body, section, content_Id, notification_date)
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            registration_id,
            "Attendance Recorded",
            `Hello ${user_name || "Student"}, your attendance has been successfully marked on ${access_date} at ${formattedTime}.`,
            "attendance",
            registration_id,
            access_date
          ]
        );

        // ✅ Fetch device tokens
        const tokens = await query(
          `SELECT device FROM student_login_information
          WHERE LOWER(student_id) = LOWER(?) AND device IS NOT NULL
          UNION ALL
          SELECT device FROM parent_login_information
          WHERE LOWER(student_id) = LOWER(?) AND device IS NOT NULL`,
          [registration_id, registration_id]
        );

        if (!tokens.length) continue;

        // ✅ Send push notifications only (DB insert removed from sendNotification)
        for (const t of tokens) {
          try {
            await sendAttendanceNotification (
              t.device,
              "Attendance Recorded",
              `Hello ${user_name || "Student"}, your attendance has been successfully marked on ${access_date} at ${formattedTime}.`,
              "http://test.com",
              "attendance",
              registration_id,
              registration_id,
              access_date
            );
          } catch (notifError) {
            console.error("Notification send error:", notifError.message);
          }
        }

      } catch (rowError) {
        console.error("Row processing error:", rowError.message);
        continue;
      }
    }

    console.log(`✅ Attendance sync completed for ${today}`);

  } catch (error) {
    console.error("Attendance sync error:", error.message);
  } finally {
    isRunning = false;
  }
};


const startFetchingStudentData = () => {
  setInterval(() => {
    fetchDataAndPostStudentAttendance();
  }, 60000);
};

@Injectable()
export class HrService {
  constructor(
    private readonly database: DatabaseService,
    private readonly notifications: NotificationService,
    private readonly upload: UploadService
  ) {
    db = this.database;
    sendNotification = (...args: any[]) => this.notifications.sendNotification(...args);
    sendAttendanceNotification = (...args: any[]) => this.notifications.sendAttendanceNotification(...args);
    publicDirectory = this.upload.publicDirectory;
    startFetchingStudentData();
  }

  addRecruitmentRequest(req: any, res: any) {
  const {
    requester_name,
    requester_designation,
    department_name,
    employee_type,
    number_of_employee,
    deadline,
  } = req.body;

  db.query(
    "INSERT INTO recruitment_request SET ?",
    {
      requester_name,
      requester_designation,
      department_name,
      employee_type,
      number_of_employee,
      deadline,
      status: "Pending",
    },
    (err, result) => {
      if (err) {
        res.json({ message: err, asf: req.body });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  changeRecruitmentRequestStatus(req: any, res: any) {
  const { status, id } = req.body;

  db.query(
    "UPDATE recruitment_request SET status= ? WHERE id=?",
    [status, id],
    (err, result) => {
      if (err) {
        res.json({ message: err, ok: false });
      } else {
        res.json({ ok: true, message: "updated" });
      }
    }
  );
}

  changeEvolutionQA(req: any, res: any) {
  const { id, evolution_question } = req.body;

  db.query(
    "UPDATE recruitment_applicant_list SET evolution_question= ? WHERE id=?",
    [evolution_question, id],
    (err, result) => {
      if (err) {
        res.json({ message: err, ok: false });
      } else {
        res.json({ ok: true, message: "updated" });
      }
    }
  );
}

  changeTeacherInterviewData(req: any, res: any) {
  const { id, interview_section } = req.body;

  db.query(
    "UPDATE recruitment_applicant_list SET interview_section= ? WHERE id=?",
    [interview_section, id],
    (err, result) => {
      if (err) {
        res.json({ message: err, ok: false });
      } else {
        res.json({ ok: true, message: "updated" });
      }
    }
  );
}

  addRecruitmentApplicant(req: any, res: any) {
  const {
    applicant_name,
    department_name,
    apply_for,
    applicant_cv,
    date,
    care_of,
  } = req.body;

  var applicant_cv_name = "";

  if (req.files !== null && req.files.applicant_cv !== undefined) {
    var file = req.files.applicant_cv;
    applicant_cv_name = uuidv4() + file.name;
    file.mv(
      publicDirectory + "/RecruitmentApplicantCV/" + applicant_cv_name,
      (err) => {
        if (err) {
          res.json({ message: err });
        } else {
          console.log("File uploaded");
        }
      }
    );
  } else {
    applicant_cv_name = applicant_cv;
  }

  db.query(
    "INSERT INTO recruitment_applicant_list SET ?",
    {
      applicant_name,
      department_name,
      apply_for,
      applicant_cv: applicant_cv_name,
      date,
      care_of,
      status: "Pending",
      feedback: "",
      evolution: "",
    },
    (err, result) => {
      if (err) {
        res.json({ message: err, asf: req.body });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  changeRecruitmentApplicantStatus(req: any, res: any) {
  const { status, id } = req.body;

  db.query(
    "UPDATE recruitment_applicant_list SET status= ? WHERE id=?",
    [status, id],
    (err, result) => {
      if (err) {
        res.json({ message: err, ok: false });
      } else {
        res.json({ ok: true, message: "updated" });
      }
    }
  );
}

  changeRecruitmentApplicantEvolutor(req: any, res: any) {
  const { evolutor_name, evolutorID, id } = req.body;

  db.query(
    "UPDATE recruitment_applicant_list SET evolutor_name = ?, evolutorID = ? WHERE id = ?",
    [evolutor_name, evolutorID, id],
    (err, result) => {
      if (err) {
        res.json({ message: err, ok: false });
      } else {
        res.json({ ok: true, message: "updated" });
      }
    }
  );
}

  changeRecruitmentApplicantFeedback(req: any, res: any) {
  const { feedback, id } = req.body;

  db.query(
    "UPDATE recruitment_applicant_list SET feedback= ? WHERE id=?",
    [feedback, id],
    (err, result) => {
      if (err) {
        res.json({ message: err, ok: false });
      } else {
        res.json({ ok: true, message: "updated" });
      }
    }
  );
}

  getAllRecruitmentRequest(req: any, res: any) {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 9999;
  const offset = (page - 1) * pageSize;

  db.query(
    "SELECT * FROM recruitment_request LIMIT ? OFFSET ?",
    [pageSize, offset],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: result });
      }
    }
  );
}

  getAllEvolutorData(req: any, res: any) {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 9999;
  const offset = (page - 1) * pageSize;

  db.query(
    "SELECT * FROM users WHERE role IN ('co-ordinator', 'manager', 'HR Officer') LIMIT ? OFFSET ?",
    [pageSize, offset],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: result });
      }
    }
  );
}

  getAllRecruitmentApplicantList(req: any, res: any) {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 9999;
  const offset = (page - 1) * pageSize;

  db.query(
    "SELECT * FROM recruitment_applicant_list LIMIT ? OFFSET ?",
    [pageSize, offset],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: result });
      }
    }
  );
}

  getAllRecruitmentApplicantListByID(req: any, res: any) {
  const { adder_id } = req.body;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 9999;
  const offset = (page - 1) * pageSize;

  db.query(
    "SELECT * FROM recruitment_applicant_list WHERE adder_id=? LIMIT ? OFFSET ?",
    [adder_id, pageSize, offset],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: result });
      }
    }
  );
}

  createLeaveRequest(req: any, res: any) {
  const {
    leaveType,
    leaveTopic,
    applicantName,
    applicantType,
    applicantTitle,
    applicantIdNo,
    applicantContactNo,
    applicantDepartment,
    applicantLeaveFrom,
    applicantLeaveTo,
    applicantReason,
    checkInTime,
    applicantDate,
    applicantProposedTeacher,
    applicantLeaveTotalDays,
    role
  } = req.body;

  const getBangladeshTime = () => {
    return new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
  };

  const checkOutTime = new Date(getBangladeshTime()).getTime();

  // Role Definitions
  const academicRoles = [
    "Academic Coordinator",
    "Academic Coordinator (Arabic)",
    "Academic Supervisor",
    "Academic Support Coordinator",
    "Class Coordinator",
    "Class Teacher",
    "Junior School Academic Coordinator",
    "Junior School Class Teacher",
    "Junior School Coordinator",
    "Junior School Teacher",
    "Preschool Academic Coordinator",
    "Preschool Class Teacher",
    "Preschool Teacher",
    "Teacher",
  ];

  const hifzRoles = ["Hifz Ustad", "Hifz Mushrif", "Ustad"];

  const adminRoles = [
    "Vice Principal",
    "Technician",
    "Store and library officer",
    "Student Affairs officer",
    "Principal",
    "Procurement officer",
    "Maintenance officer",
    "Marketing Executive",
    "IT officer",
    "HR officer",
    "Head of Campus",
    "Deputy head of campus",
    "Director",
    "Account officer",
    "Admin",
  ];

  // Initialize fields
  let e1 = "";
  let e2 = "";
  let e3 = "";


  // Role-Based Approval Assignment
  if (academicRoles.includes(role)) {
    e1 = "Academic Coordinator,Academic Support Coordinator,Super Admin";
    e2 = "HR Officer,Super Admin";
    e3 = "Academic Supervisor,Vice Principal,Principal,Super Admin";

  } else if (hifzRoles.includes(role)) {
    e1 = "Hifz Mushrif,Super Admin";
    e2 = "HR Officer,Super Admin";
    e3 = "Academic Coordinator (Arabic),Hifz Mushrif,Vice Principal,Principal,Super Admin";

  } else if (adminRoles.includes(role)) {
    e1 = "";
    e2 = "HR Officer,Super Admin";
    e3 = "Vice Principal,Principal,Super Admin";

  }

  // Early Leave Validation
  if (leaveType === "Early") {
    const currentTime = new Date(getBangladeshTime());
    if (currentTime.getHours() < 12) {
      return res.json({
        ok: false,
        message: "You can't apply for short leave before 12 PM Dhaka time.",
      });
    }
  }

  // Insert Leave Request into Database
  const insertQuery = `
  INSERT INTO leave_application (
    leaveType, leaveTopic, applicantName, applicantType, applicantTitle,
    applicantIdNo, applicantContactNo, applicantDepartment, applicantLeaveFrom,
    applicantLeaveTo, applicantReason, checkOutTime, checkInTime,
    applicantDate, applicantProposedTeacher, applicantLeaveTotalDays,
    e1, e2, e3
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const queryValues = [
  leaveType,
  leaveTopic || "others", // Default value for leaveTopic
  applicantName,
  applicantType,
  applicantTitle,
  applicantIdNo,
  applicantContactNo,
  applicantDepartment || null, // NULL for optional columns
  applicantLeaveFrom,
  applicantLeaveTo,
  applicantReason,
  checkOutTime || "", // Default value for checkOutTime
  checkInTime || "", // Default value for checkInTime
  applicantDate,
  applicantProposedTeacher || null, // NULL for optional columns
  applicantLeaveTotalDays,
  e1,
  e2,
  e3,
];



  db.query(insertQuery, queryValues, (err, result) => {
    if (err) {
      return res.status(500).json({ ok: false, message: "Something went wrong!",err,data:req.body });
    }
    res.json({ ok: true, message: "Leave Request Successful" });
  });
}

  changeLeaveCheckIn(req: any, res: any) {
  const { id } = req.body;

  const checkInTime = new Date().getTime();

  db.query(
    "UPDATE leave_application SET ? WHERE id = ?",
    [{ checkInTime }, id],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: "Something went wrong!", err });
      } else {
        res.json({ ok: true, message: "Leave Request Successful" });
      }
    }
  );
}

  async getApprovingAuthority(req: any, res: any) {
  const { authorityInfo, campus, department } = req.body;
  const info = JSON.parse(authorityInfo);
  // res.json({
  //   ok: true,
  //   message: { a: info.e1.title, b: info.e1.isCampus, c: info.e3.isDepartment },
  // });
  const authorityTitle = info.e1.title;
  const authorityTitle2 = info.e2.title;
  const authorityTitle3 = info.e3.title;

  const needCampus = info.e1.isCampus;
  const needCampus2 = info.e2.isCampus;
  const needCampus3 = info.e3.isCampus;

  const needDepartment = info.e1.isDepartment;
  const needDepartment2 = info.e2.isDepartment;
  const needDepartment3 = info.e3.isDepartment;

  let s1 = "approved";
  let s2 = "approved";
  let s3 = "approved";

  let e1 = [];
  let e2 = [];
  let e3 = [];

  let query1 = "";
  let query2 = "";
  let query3 = "";

  if (authorityTitle !== "N/A") {
    s1 = "pending";
    query1 = `SELECT emp_id , emp_title, emp_fname, emp_lname, designation, department, campus, school FROM employee WHERE emp_title = '${authorityTitle}' ${
      needCampus ? `AND campus = '${campus}'` : ""
    } ${needDepartment ? `AND department = '${department}'` : ""}`;
  }
  if (authorityTitle2 !== "N/A") {
    s2 = "pending";
    query2 = `SELECT emp_id , emp_title, emp_fname, emp_lname, designation, department, campus, school FROM employee WHERE emp_title = '${authorityTitle2}' ${
      needCampus2 ? `AND campus = '${campus}'` : ""
    } ${needDepartment2 ? `AND department = '${department}'` : ""}`;
  }
  if (authorityTitle3 !== "N/A") {
    s3 = "pending";
    query3 = `SELECT emp_id , emp_title, emp_fname, emp_lname, designation, department, campus, school FROM employee WHERE emp_title = '${authorityTitle3}' ${
      needCampus3 ? `AND campus = '${campus}'` : ""
    } ${needDepartment3 ? `AND department = '${department}'` : ""}`;
  }

  if (query1 !== "") {
    e1 = await new Promise((resolve, reject) => {
      db.query(query1, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  if (query2 !== "") {
    e2 = await new Promise((resolve, reject) => {
      db.query(query2, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  if (query3 !== "") {
    e3 = await new Promise((resolve, reject) => {
      db.query(query3, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  res.json({ ok: true, message: { e1, e2, e3, s1, s2, s3 } });
}

  changeLeaveApplicationStatus(req: any, res: any) {
  const { id, cldata, valueData } = req.body;

  db.query(
    `UPDATE leave_application SET ${cldata} = ? WHERE id = ?`,
    [valueData, id],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: "Updated " });
      }
    }
  );
}

  changeResignationApplicationStatus(req: any, res: any) {
  const { id, cldata, valueData } = req.body;

  db.query(
    `UPDATE resignation_request SET ${cldata} = ? WHERE id = ?`,
    [valueData, id],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: "Updated " });
      }
    }
  );
}

  getAllLeaveRequest(req: any, res: any) {
  const { userID, searchFilter = "", selectedFilter = "" } = req.body; // Default empty string for filters
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const offset = (page - 1) * pageSize;

  // Construct the base query
  let query = `SELECT * FROM leave_application WHERE (e1 LIKE ? OR e2 LIKE ? OR e3 LIKE ?) `;
  let queryParams = [`%${userID}%`, `%${userID}%`, `%${userID}%`]; // Search within e1, e2, e3 using LIKE

  // Add search filter if provided
  if (searchFilter) {
    query += `AND (applicantIdNo LIKE ? OR applicantName LIKE ?) `;
    queryParams.push(`%${searchFilter}%`, `%${searchFilter}%`);
  }

  // Add selected filter for leaveType if provided
  if (selectedFilter) {
    query += `AND leaveType = ? `;
    queryParams.push(selectedFilter);
  }

  // Add ordering, pagination, and limit
  query += `ORDER BY applicantDate DESC LIMIT ? OFFSET ?`;
  queryParams.push(pageSize, offset);

  // Execute the main query
  db.query(query, queryParams, (err, result) => {
    if (err) {
      return res.json({ message: err });
    }

    // Build the count query for pagination
    let countQuery = `SELECT COUNT(*) as totalCount FROM leave_application WHERE (e1 LIKE ? OR e2 LIKE ? OR e3 LIKE ?) `;
    let countParams = [`%${userID}%`, `%${userID}%`, `%${userID}%`];

    // Add the same search filter to the count query
    if (searchFilter) {
      countQuery += `AND (applicantIdNo LIKE ? OR applicantName LIKE ?) `;
      countParams.push(`%${searchFilter}%`, `%${searchFilter}%`);
    }

    // Add the same selected filter to the count query
    if (selectedFilter) {
      countQuery += `AND leaveType = ? `;
      countParams.push(selectedFilter);
    }

    // Execute the count query
    db.query(countQuery, countParams, (err, totalCountResult) => {
      if (err) {
        return res.json({ message: err });
      }

      const totalCount = totalCountResult[0].totalCount;
      const totalPages = Math.ceil(totalCount / pageSize);

      // Send back the results and pagination info
      res.json({ ok: true, message: result, totalPages });
    });
  });
}

  getAllResignRequest(req: any, res: any) {
  const { userID } = req.body;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const offset = (page - 1) * pageSize;

  db.query(
    "SELECT * FROM resignation_request WHERE e1 = ? OR e2 = ? OR e3 = ? ORDER BY id DESC LIMIT ? OFFSET ?",
    [userID, userID, userID, pageSize, offset],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        db.query(
          "SELECT COUNT(*) as totalCount FROM resignation_request",
          (err, totalCountResult) => {
            if (err) {
              res.json({ message: err });
            } else {
              const totalCount = totalCountResult[0].totalCount;
              const totalPages = Math.ceil(totalCount / pageSize);
              res.json({ ok: true, message: result, totalPages });
            }
          }
        );
      }
    }
  );
}

  getLeaveRequestByID(req: any, res: any) {
  const { applicantIdNo, sortType } = req.body;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 9999;
  const offset = (page - 1) * pageSize;

  db.query(
    `
    SELECT leave_application.*, employee_attendance_salary.t_yearly_leave
    FROM leave_application
    JOIN employee_attendance_salary ON leave_application.applicantIdNo = employee_attendance_salary.emp_id
    WHERE leave_application.applicantIdNo = ? AND  leave_application.leaveType = ?
    LIMIT ?
    OFFSET ?
`,
    [applicantIdNo, sortType, pageSize, offset],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: result });
      }
    }
  );
}

  async getRegisnationApprovingAuthority(req: any, res: any) {
  const { authorityInfo, school, department } = req.body;
  const info = JSON.parse(authorityInfo);
  // res.json({
  //   ok: true,
  //   message: { a: info.e1.title, b: info.e1.isCampus, c: info.e3.isDepartment },
  // });
  const authorityTitle = info.e1.title;
  const authorityTitle2 = info.e2.title;
  const authorityTitle3 = info.e3.title;

  const needSchool = info.e1.isSchool;
  const needSchool2 = info.e2.isSchool;
  const needSchool3 = info.e3.isSchool;

  const needDepartment = info.e1.isDepartment;
  const needDepartment2 = info.e2.isDepartment;
  const needDepartment3 = info.e3.isDepartment;

  let s1 = "approved";
  let s2 = "approved";
  let s3 = "approved";

  let eList1 = [];
  let eList2 = [];
  let eList3 = [];

  let query1 = "";
  let query2 = "";
  let query3 = "";

  if (authorityTitle !== "N/A") {
    s1 = "pending";
    query1 = `SELECT emp_id , emp_title, emp_fname, emp_lname, designation, department, campus, school  FROM employee WHERE emp_title = '${authorityTitle}' ${
      needSchool ? `AND school = '${school}'` : ""
    } ${needDepartment ? `AND department = '${department}'` : ""}`;
  }
  if (authorityTitle2 !== "N/A") {
    s2 = "pending";
    query2 = `SELECT emp_id , emp_title, emp_fname, emp_lname, designation, department, campus, school  FROM employee WHERE emp_title = '${authorityTitle2}' ${
      needSchool2 ? `AND school = '${school}'` : ""
    } ${needDepartment2 ? `AND department = '${department}'` : ""}`;
  }
  if (authorityTitle3 !== "N/A") {
    s3 = "pending";
    query3 = `SELECT emp_id , emp_title, emp_fname, emp_lname, designation, department, campus, school  FROM employee WHERE emp_title = '${authorityTitle3}' ${
      needSchool3 ? `AND school = '${school}'` : ""
    } ${needDepartment3 ? `AND department = '${department}'` : ""}`;
  }

  if (query1 !== "") {
    eList1 = await new Promise((resolve, reject) => {
      db.query(query1, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  if (query2 !== "") {
    eList2 = await new Promise((resolve, reject) => {
      db.query(query2, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  if (query3 !== "") {
    eList3 = await new Promise((resolve, reject) => {
      db.query(query3, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  res.json({ ok: true, message: { eList1, eList2, eList3, s1, s2, s3 } });
}

  createResignation(req: any, res: any) {
  const {
    applicantName,
    applicantType,
    applicantIdNo,
    applicantTitle,
    applicantReason,
    lastWorkingDay,
    e1,
    e2,
    e3,
    s1,
    s2,
    s3,
  } = req.body;

  db.query(
    "INSERT INTO resignation_request SET ? ON DUPLICATE KEY UPDATE " +
      "applicantName = VALUES(applicantName), " +
      "applicantType = VALUES(applicantType), " +
      "applicantTitle = VALUES(applicantTitle), " +
      "applicantReason = VALUES(applicantReason), " +
      "lastWorkingDay = VALUES(lastWorkingDay), " +
      "e1 = VALUES(e1), " +
      "e2 = VALUES(e2), " +
      "e3 = VALUES(e3), " +
      "s1 = VALUES(s1), " +
      "s2 = VALUES(s2), " +
      "s3 = VALUES(s3)",
    {
      applicantName,
      applicantType,
      applicantIdNo,
      applicantTitle,
      applicantReason,
      lastWorkingDay,
      e1,
      e2,
      e3,
      s1,
      s2,
      s3,
    },
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        db.query(
          "UPDATE employee SET status = 'Resigned' WHERE emp_id = ?",
          applicantIdNo,
          (err, result) => {
            if (err) {
              res.json({ ok: false, message: err });
            } else {
              res.json({ ok: true, message: "Data inserted successfully!" });
            }
          }
        );
        res.json({ ok: true, message: "Data inserted successfully!" });
      }
    }
  );
}

  getResignationById(req: any, res: any) {
  const { applicantIdNo } = req.body;

  db.query(
    "SELECT * FROM resignation_request WHERE applicantIdNo = ?",
    applicantIdNo,
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

  deleteResignation(req: any, res: any) {
  const { applicantIdNo } = req.body;

  db.query(
    "DELETE FROM resignation_request WHERE applicantIdNo = ?",
    applicantIdNo,
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        db.query(
          "UPDATE employee SET status = '' WHERE emp_id = ?",
          applicantIdNo,
          (err, result) => {
            if (err) {
              res.json({ ok: false, message: err });
            } else {
              res.json({ ok: true, message: "Data deleted successfully!" });
            }
          }
        );
        res.json({ ok: true, message: "Data deleted successfully!" });
      }
    }
  );
}

  createClearanceForm(req: any, res: any) {
  const {
    emp_id,
    emp_name,
    emp_designation,
    emp_department,
    resignDate,
    reason,
    librarian,
    librarianName,
    accountant,
    accountantName,
    itian,
    itianName,
    admin,
    adminName,
    hr,
    hrName,
  } = req.body;

  db.query(
    "INSERT INTO clearance_form SET ? " +
      "ON DUPLICATE KEY UPDATE " +
      "emp_name = VALUES(emp_name), " +
      "emp_designation = VALUES(emp_designation), " +
      "emp_department = VALUES(emp_department), " +
      "resignDate = VALUES(resignDate), " +
      "reason = VALUES(reason), " +
      "librarian = VALUES(librarian), " +
      "librarianName = VALUES(librarianName), " +
      "accountant = VALUES(accountant), " +
      "accountantName = VALUES(accountantName), " +
      "itian = VALUES(itian), " +
      "itianName = VALUES(itianName), " +
      "admin = VALUES(admin), " +
      "adminName = VALUES(adminName), " +
      "hr = VALUES(hr), " +
      "hrName = VALUES(hrName)",
    {
      emp_id,
      emp_name,
      emp_designation,
      emp_department,
      resignDate,
      reason,
      librarian,
      librarianName,
      accountant,
      accountantName,
      itian,
      itianName,
      admin,
      adminName,
      hr,
      hrName,
    },
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        db.query(
          "UPDATE employee SET status = 'Resigned' WHERE emp_id = ?",
          emp_id,
          (err, result) => {
            if (err) {
              res.json({ ok: false, message: err });
            } else {
              res.json({ ok: true, message: "Data inserted successfully!" });
            }
          }
        );
        res.json({ ok: true, message: "Data inserted successfully!" });
      }
    }
  );
}

  getClearanceFormList(req: any, res: any) {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 9999;
  const offset = (page - 1) * pageSize;

  db.query(
    "SELECT COUNT(*) as totalCount FROM clearance_form",
    (err, totalCountResult) => {
      if (err) {
        res.json({ message: err });
      } else {
        const totalCount = totalCountResult[0].totalCount;
        const totalPages = Math.ceil(totalCount / pageSize);
        db.query(
          "SELECT * FROM clearance_form LIMIT ? OFFSET ?",
          [pageSize, offset],
          (err, result) => {
            if (err) {
              res.json({ ok: false, message: err });
            } else {
              res.json({ ok: true, message: result, totalPages });
            }
          }
        );
      }
    }
  );
}

  updateClearanceForm(req: any, res: any) {
  const {
    id,
    columnDes,
    columnDesValue,
    columnRemarks,
    columnRemarksValue,
    columnStatus,
    columnStatusValue,
  } = req.body;

  db.query(
    `UPDATE clearance_form SET ${columnDes} = ?, ${columnRemarks} = ?, ${columnStatus} = ? WHERE id = ?`,
    [columnDesValue, columnRemarksValue, columnStatusValue, id],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: "Data updated successfully!" });
      }
    }
  );
}

  uploadClearanceScanCopy(req: any, res: any) {
  const { id } = req.body;

  if (req.files !== null) {
    if (req.files.scanCopy !== undefined) {
      var file = req.files.scanCopy;
      var filename = uuidv4() + file.name;
      file.mv(publicDirectory + "/clearanceScanCopy/" + filename, (err) => {
        if (err) {
          res.json({ ok: false, message: err });
        } else {
          db.query(
            "UPDATE clearance_form SET scanCopy = ? WHERE id = ?",
            [filename, id],
            (err, result) => {
              if (err) {
                res.json({ ok: false, message: err });
              } else {
                res.json({ ok: true, message: "Data updated successfully!" });
              }
            }
          );
        }
      });
    }
  }
}

  getClearanceEmployee(req: any, res: any) {
  db.query(
    `
    SELECT 
    employee.*, 
    clearance_form.*, 
    employee_salary_management.new_salary
FROM 
    clearance_form
JOIN 
    employee ON clearance_form.emp_id = employee.emp_id
JOIN 
    employee_salary_management ON clearance_form.emp_id = employee_salary_management.emp_id
WHERE 
    clearance_form.hrStatus = 'Approved' 
    AND clearance_form.adminStatus = 'Approved' 
    AND clearance_form.itianStatus = 'Approved' 
    AND clearance_form.accountantStatus = 'Approved'
    AND clearance_form.librarianStatus = 'Approved'
    AND (clearance_form.emp_id, employee_salary_management.applicable_month) IN (
        SELECT 
            emp_id, 
            MAX(applicable_month) AS max_applicable_month
        FROM 
            employee_salary_management
        GROUP BY 
            emp_id
    );

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

  addCompensationBenefits(req: any, res: any) {
  const {
    emp_id,
    emp_name,
    designation,
    department,
    joiningDate,
    resignDate,
    releaseFromService,
    grossSalary,
    basicSalary,
    totalPayableAmount,
    netPayableAmount,
    adjustments,
    lessReasons,
  } = req.body;

  db.query(
    "INSERT INTO compensation_benefits SET ? ON DUPLICATE KEY UPDATE " +
      "emp_name = VALUES(emp_name), " +
      "designation = VALUES(designation), " +
      "department = VALUES(department), " +
      "joiningDate = VALUES(joiningDate), " +
      "resignDate = VALUES(resignDate), " +
      "releaseFromService = VALUES(releaseFromService), " +
      "grossSalary = VALUES(grossSalary), " +
      "basicSalary = VALUES(basicSalary), " +
      "totalPayableAmount = VALUES(totalPayableAmount), " +
      "netPayableAmount = VALUES(netPayableAmount), " +
      "adjustments = VALUES(adjustments), " +
      "lessReasons = VALUES(lessReasons) ",
    {
      emp_id,
      emp_name,
      designation,
      department,
      joiningDate,
      resignDate,
      releaseFromService,
      grossSalary,
      basicSalary,
      totalPayableAmount,
      netPayableAmount,
      adjustments,
      lessReasons,
    },
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: "Data inserted successfully!" });
      }
    }
  );
}

  getCompensationBenefitsList(req: any, res: any) {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 9999;
  const offset = (page - 1) * pageSize;

  db.query(
    "SELECT COUNT(*) as totalCount FROM compensation_benefits",
    (err, totalCountResult) => {
      if (err) {
        res.json({ message: err });
      } else {
        const totalCount = totalCountResult[0].totalCount;
        const totalPages = Math.ceil(totalCount / pageSize);
        db.query(
          "SELECT * FROM compensation_benefits LIMIT ? OFFSET ?",
          [pageSize, offset],
          (err, result) => {
            if (err) {
              res.json({ ok: false, message: err });
            } else {
              res.json({ ok: true, message: result, totalPages });
            }
          }
        );
      }
    }
  );
}

  addOtherLeave(req: any, res: any) {
  const {
    emp_id,
    name,
    designation,
    explainForLeave,
    type,
    chk_in,
    chk_out,
    date,
  } = req.body;

  if (type == "Short Leave") {
    db.query(
      "INSERT INTO other_leave SET ?",
      {
        emp_id,
        name,
        designation,
        explainForLeave,
        type,
        chk_in,
        chk_out,
        co_approval: "",
        hod_approval: "",
        date,
      },
      (err, result) => {
        if (err) {
          res.json({ message: err });
        } else {
          res.json({ message: true });
        }
      }
    );
  } else {
    db.query(
      "INSERT INTO other_leave SET ?",
      {
        emp_id,
        name,
        designation,
        explainForLeave,
        type,
        chk_in: "",
        chk_out,
        co_approval: "",
        hod_approval: "",
        date,
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
}

  getOtherLeave(req: any, res: any) {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 9999;
  const offset = (page - 1) * pageSize;

  db.query(
    "SELECT * FROM other_leave LIMIT ? OFFSET ?",
    [pageSize, offset],
    (err, result) => {
      res.json({ message: result });
    }
  );
}

  getOtherLeaveById(req: any, res: any) {
  const { id } = req.body;
  db.query("SELECT * FROM other_leave WHERE emp_id=?", id, (err, result) => {
    res.json({ message: result });
  });
}

  EditOtherLeaveById(req: any, res: any) {
  const { id } = req.body;
  db.query("SELECT * FROM other_leave WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
}

  DeleteOtherLeaveById(req: any, res: any) {
  const { id } = req.body;
  db.query("DELETE FROM other_leave WHERE id=?", id, (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
}

  UpdateOtherLeaveById(req: any, res: any) {
  const { id, explainForLeave, type, chk_in, chk_out, date } = req.body;
  if (type == "Short Leave") {
    db.query(
      "UPDATE other_leave SET ? WHERE id=?",
      [
        {
          explainForLeave: explainForLeave,
          chk_in: chk_in,
          chk_out: chk_out,
          date: date,
        },
        id,
      ],
      (err, result) => {
        if (err) {
          res.json({ message: err });
        } else {
          res.json({ message: true });
        }
      }
    );
  } else {
    db.query(
      "UPDATE other_leave SET ? WHERE id=?",
      [{ explainForLeave: explainForLeave, chk_out: chk_out, date: date }, id],
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

  ApprovelOtherLeaveById(req: any, res: any) {
  const { id, user, approvel } = req.body;
  if (user == "co-ordinator") {
    db.query(
      "UPDATE other_leave SET ? WHERE id=?",
      [{ co_approval: approvel }, id],
      (err, result) => {
        if (err) {
          res.json({ message: err });
        } else {
          res.json({ message: true });
        }
      }
    );
  } else {
    db.query(
      "UPDATE other_leave SET ? WHERE id=?",
      [{ hod_approval: approvel }, id],
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

  updateEmployee(req: any, res: any) {
  const {
    emp_id,
    emp_type,
    emp_title,
    emp_fileNo,
    emp_fname,
    emp_lname,
    designation,
    department,
    school,
    campus,
    assigned_subject,
    assigned_class,
    trainee_period,
    trainee_joining,
    trainee_end_joining,
    trainee_increment,
    joining_as_teacher,
    joining_as_permanent,
    img,
    gender,
    phone,
    dob,
    email,
    blood,
    education,
    pAddress,
    perAddress,
    nid_birth_number,
    guardian_name,
    guardian_nid,
    guardian_contact,
    word_exp_form,
    previous_insti,
    special_achievement,
    special_time,
    role,
  } = req.body;

  let filename = "";
  if (req.files !== null) {
    if (req.files.img !== undefined) {
      const file = req.files.img;
      filename = uuidv4() + file.name;
      file.mv(publicDirectory + "/image/" + filename, (err) => {
        if (err) {
          console.log("file Not uploaded");
        } else {
          console.log("file uploaded");
        }
      });
    }
  }

  // Conditionally update the `img` field if `filename` is set
  let updateQuery = `
    UPDATE employee 
    SET emp_type = ?, emp_title = ?, emp_fileNo = ?, emp_fname = ?, emp_lname = ?, 
        designation = ?, department = ?, school = ?, campus = ?, assigned_subject = ?, 
        assigned_class = ?, trainee_period = ?, trainee_joining = ?, trainee_end_joining = ?, 
        trainee_increment = ?, joining_as_teacher = ?, joining_as_permanent = ?, gender = ?, 
        phone = ?, dob = ?, email = ?, blood = ?, education = ?, pAddress = ?, 
        perAddress = ?, nid_birth_number = ?, guardian_name = ?, guardian_nid = ?, 
        guardian_contact = ?, word_exp_form = ?, previous_insti = ?, special_achievement = ?, 
        special_time = ?, role = ?, status = ?`;

  // If `filename` is not empty, append the `img` column to the query
  const queryParams = [
    emp_type,
    emp_title,
    emp_fileNo,
    emp_fname,
    emp_lname,
    designation,
    department,
    school,
    campus,
    assigned_subject,
    assigned_class,
    trainee_period,
    trainee_joining,
    trainee_end_joining,
    trainee_increment,
    joining_as_teacher,
    joining_as_permanent,
    gender,
    phone,
    dob,
    email,
    blood,
    education,
    pAddress,
    perAddress,
    nid_birth_number,
    guardian_name,
    guardian_nid,
    guardian_contact,
    word_exp_form,
    previous_insti,
    special_achievement,
    special_time,
    role,
    "", // status field
  ];

  if (filename) {
    updateQuery += `, img = ?`;
    queryParams.push(filename);
  }

  updateQuery += ` WHERE emp_id = ?`;
  queryParams.push(emp_id);

  db.query(updateQuery, queryParams, (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
}

  updateEmployeeAttendancePeriod(req: any, res: any) {
  const {
    emp_id,
    attendance_inTime,
    attendance_outTime,
    salary,
    increment_amount,
    t_yearly_leave,
    session,
  } = req.body;
  db.query(
    "UPDATE employee_attendance_salary SET attendance_inTime = ?, attendance_outTime = ?, salary = ?, increment_amount = ?, t_yearly_leave = ?, r_yearly_leave = ?, session = ? WHERE emp_id = ?",
    [
      attendance_inTime,
      attendance_outTime,
      salary,
      increment_amount,
      t_yearly_leave,
      t_yearly_leave,
      session,
      emp_id,
    ],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  editdepartment(req: any, res: any) {
  const { id, department, type } = req.body;
  db.query(
    "UPDATE department SET department = ?, type = ? WHERE id = ?",
    [department, type, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  deleteDept(req: any, res: any) {
  const { id } = req.body;
  db.query("DELETE FROM department WHERE id = ?", id, (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
}

  editdesignation(req: any, res: any) {
  const { id, designation } = req.body;
  db.query(
    "UPDATE designation SET designation = ? WHERE id = ?",
    [designation, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  deleteDesg(req: any, res: any) {
  const { id } = req.body;
  db.query("DELETE FROM designation WHERE id = ?", id, (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
}

  editEmployeeAttendancePeriod(req: any, res: any) {
  const { id, pname, stime, etime } = req.body;
  db.query(
    "UPDATE employee_attendance_period SET pname = ?, stime = ?, etime = ? WHERE id = ?",
    [pname, stime, etime, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  deleteEmployee(req: any, res: any) {
  const { emp_id } = req.body;
  db.query("DELETE FROM employee WHERE emp_id = ?", emp_id, (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
}

  addExitApplicationForm(req: any, res: any) {
  const {
    id,
    emp_id,
    exitDate,
    reason,
    strongestPoint,
    toDevArea,
    managementAttitude,
    financialDealing,
    leaveContact,
    suggestion,
  } = req.body;
  const date = new Date();
  db.query(
    "SELECT * FROM exit_application WHERE emp_id = ?",
    [emp_id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        if (result.length > 0) {
          db.query(
            "UPDATE exit_application SET ? WHERE emp_id = ?",
            [
              {
                id,
                exitDate: date,
                reason,
                strongestPoint,
                toDevArea,
                managementAttitude,
                financialDealing,
                leaveContact,
                suggestion,
              },
              emp_id,
            ],
            (err, result) => {
              if (err) {
                res.json({ message: err });
              } else {
                res.json({ message: true });
              }
            }
          );
        } else {
          db.query(
            "INSERT INTO exit_application SET ?",
            {
              id,
              emp_id,
              exitDate: date,
              reason,
              strongestPoint,
              toDevArea,
              managementAttitude,
              financialDealing,
              leaveContact,
              suggestion,
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
      }
    }
  );
}

  getExitApplicationForm(req: any, res: any) {
  db.query(
    "SELECT * FROM exit_application JOIN employee ON exit_application.emp_id = employee.emp_id",
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: result });
      }
    }
  );
}

  getExitApplicationFormById(req: any, res: any) {
  const { emp_id } = req.body;
  db.query(
    "SELECT * FROM exit_application JOIN employee ON exit_application.emp_id = employee.emp_id WHERE exit_application.emp_id = ?",
    emp_id,
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: result });
      }
    }
  );
}

  getStudentViewByStId(req: any, res: any) {
  const { student_id } = req.body;
  db.query(
    "SELECT *FROM student WHERE student_id = ?",
    student_id,
    (err, result) => {
      res.json({ message: result });
    }
  );
}

  updateAmissionStudentImagesById(req: any, res: any) {
    const { form_number,type } = req.body;
    let filename = "";

    if (!req.files || !req.files.img) {
        return res.status(400).json({ ok: false, message: "No image file provided" });
    }

    const file = req.files.img;
    filename = uuidv4() + file.name;
    file.mv(publicDirectory + "/image/" + filename, (err) => {
        if (err) {
            console.log("File not uploaded:", err);
            return res.status(500).json({ ok: false, message: "Failed to upload image" });
        }

        let updateField;
        if (type === "student") {
            updateField = "student_picture";
        } else if (type === "father") {
            updateField = "father_img";
        } else if (type === "mother") {
            updateField = "mother_img";
        } else if (type === "guardianimg1") {
            updateField = "gurdian1_img";
        } else if (type === "guardianimg2") {
            updateField = "gurdian2_img";
        } else {
            return res.status(400).json({ ok: false, message: "Invalid type" });
        }

        db.query("UPDATE admission SET ? WHERE form_number = ?", [{ [updateField]: filename }, form_number], (err, result) => {
            if (err) {
                console.log("Database error:", err);
                return res.status(500).json({ ok: false, message: "Failed to update image in database" });
            }

            console.log("Image updated successfully");
            return res.json({ ok: true, message: "Image updated successfully" });
        });
    });
}

  updateStudentImagesById(req: any, res: any) {
    const { student_id,type } = req.body;
    let filename = "";

    if (!req.files || !req.files.img) {
        return res.status(400).json({ ok: false, message: "No image file provided" });
    }

    const file = req.files.img;
    filename = uuidv4() + file.name;
    file.mv(publicDirectory + "/image/" + filename, (err) => {
        if (err) {
            console.log("File not uploaded:", err);
            return res.status(500).json({ ok: false, message: "Failed to upload image" });
        }

        let updateField;
        if (type === "student") {
            updateField = "student_picture";
        } else if (type === "father") {
            updateField = "father_img";
        } else if (type === "mother") {
            updateField = "mother_img";
        } else if (type === "guardianimg1") {
            updateField = "guardianimg1";
        } else if (type === "guardianimg2") {
            updateField = "guardianimg2";
        } else if (type === "tcimg") {
            updateField = "tcimg";
        } else if (type === "bcimg") {
            updateField = "bcimg";
        } else if (type === "report_img") {
            updateField = "report_img";
        } else if (type === "other_img") {
            updateField = "other_img";
        } else {
            return res.status(400).json({ ok: false, message: "Invalid type" });
        }

        db.query("UPDATE student SET ? WHERE student_id = ?", [{ [updateField]: filename }, student_id], (err, result) => {
            if (err) {
                console.log("Database error:", err);
                return res.status(500).json({ ok: false, message: "Failed to update image in database" });
            }

            console.log("Image updated successfully");
            return res.json({ ok: true, message: "Image updated successfully" });
        });
    });
}

  async updateStudent(req: any, res: any) {
  const {
    student_id,
    student_first_name,
    student_last_name,
    admission_date,
    Class,
    section,
    category,
    dob,
    age,
    gender,
    pob,
    nationality,
    religion,
    birthCertificate,
    passnumber,
    house,
    student_picture,
    current_school,
    csdate,
    cgrade,
    cfdate,
    cfgrade,
    clanguage,
    previous_school1,
    psdate1,
    psgrade1,
    pfdate1,
    pfgrade1,
    planguage1,
    previous_school2,
    psdate2,
    psgrade2,
    pfdate2,
    pfgrade2,
    planguage2,
    previous_school3,
    psdate3,
    psgrade3,
    pfdate3,
    pfgrade3,
    planguage3,
    physical_disability,
    partially_signted,
    hearing_imparment,
    mobility_difficulties,
    mental_health,
    blood_group,
    other,
    remarks,
    father_name,
    father_occ,
    father_edu,
    father_nid_pass,
    father_tin,
    mother_name,
    mother_occ,
    mother_edu,
    mother_nid_pass,
    mother_tin,
    guardian_name1,
    grealtion1,
    guardian_name2,
    grealtion2,
    sibling_info,
    father_img,
    mother_img,
    guardianimg1,
    guardianimg2,
    present_address,
    permanent_address,
    lpresentdist,
    lpresentcity,
    lpresentstreet,
    lperdist,
    lpercity,
    lperstreet,
    father_contact,
    father_email,
    mother_contact,
    mother_email,
    guardianContact1,
    guardianContact2,
    emergency_con1,
    erelation1,
    esms1,
    emergency_con2,
    erelation2,
    esms2,
    whowillpay,
    pay_relation,
    designation,
    sibling1,
    sibling2,
    sibling3,
    sibling4,
    sibling5,
    note,
    financial_aid_type,
    admission_fee,
    admission_discount,
    admission_amount,
    tuition_fee,
    tuition_discount,
    tuition_amount,
    annual_fee,
    annual_discount,
    annual_amount,
    ot_discount,
    ot_discount_type,
    ot_amount,
    residency,
    tc,
    tcimg,
    report,
    adminbirthcertificate,
    bcimg,
    fourpphoto,
    admin_note,
    report_img,
    other_img,
    session,
  } = req.body;




  try {
    db.query(
      "UPDATE student SET ? WHERE student_id = ?",
      [
        {
          student_first_name,
          student_last_name,
          admission_date,
          Class,
          section,
          category,
          dob,
          age,
          gender,
          pob,
          nationality,
          religion,
          birthCertificate,
          passnumber,
          house,
        //   student_picture: filename,
          current_school,
          csdate,
          cgrade,
          cfdate,
          cfgrade,
          clanguage,
          previous_school1,
          psdate1,
          psgrade1,
          pfdate1,
          pfdate1,
          pfgrade1,
          planguage1,
          previous_school2,
          psdate2,
          psgrade2,
          pfdate2,
          pfgrade2,
          planguage2,
          previous_school3,
          psdate3,
          psgrade3,
          pfdate3,
          pfgrade3,
          planguage3,
          physical_disability,
          partially_signted,
          hearing_imparment,
          mobility_difficulties,
          mental_health,
          blood_group,
          other,
          remarks,
          father_name,
          father_occ,
          father_edu,
          father_nid_pass,
          father_tin,
          mother_name,
          mother_occ,
          mother_edu,
          mother_nid_pass,
          mother_tin,
          guardian_name1,
          grealtion1,
          guardian_name2,
          grealtion2,
          sibling_info,
        //   father_img: filename2,
        //   mother_img: filename3,
        //   guardianimg1: filename4,
        //   guardianimg2: filename5,
          present_address,
          permanent_address,
          lpresentdist,
          lpresentcity,
          lpresentstreet,
          lperdist,
          lpercity,
          lperstreet,
          father_contact,
          father_email,
          mother_contact,
          mother_email,
          guardianContact1,
          guardianContact2,
          emergency_con1,
          erelation1,
          esms1,
          emergency_con2,
          erelation2,
          esms2,
          whowillpay,
          pay_relation,
          designation,
          sibling1,
          sibling2,
          sibling3,
          sibling4,
          sibling5,
          note,
          financial_aid_type,
          admission_fee,
          admission_discount,
          admission_amount,
          tuition_fee,
          tuition_discount,
          tuition_amount,
          annual_fee,
          annual_discount,
          annual_amount,
          ot_discount,
          ot_discount_type,
          ot_amount,
          residency,
          tc,
        //   tcimg: filename6,
          report,
          adminbirthcertificate,
        //   bcimg: filename7,
          fourpphoto,
          admin_note,
        //   report_img: filename8,
        //   other_img: filename9,
          session,
        },
        student_id,
      ],
      (err, result) => {
        if (err) {
          res.json({ ok: false, message: err });
        } else {
          res.json({ ok: true, message: result });
        }
      }
    );

    
  } catch (error) {
    res.json({ ok: false, message: error });
  }
}

  postAttendence(req: any, res: any) {
  const { empID, empName, date, inTime, outTime, total_time } = req.body;

  // The query
  const insertQuery =
    "INSERT INTO attendance_device (empID, empName, date, inTime, outTime, total_time) VALUES (?, ?, ?, ?, ?, ?) " +
    "ON DUPLICATE KEY UPDATE empName = VALUES(empName), inTime = VALUES(inTime), outTime = VALUES(outTime), total_time = VALUES(total_time)";

  // Values to insert
  const values = [empID, empName, date, inTime, outTime, total_time];

  // Execute the query
  db.query(insertQuery, values, (err, result) => {
    if (err) {
      res.json({ message: err, ok: false });
    } else {
      res.json({ message: "Attendance data inserted/updated successfully.", ok: true });
    }
  });
}
}
