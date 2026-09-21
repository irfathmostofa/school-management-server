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
const SMS_API_URL = process.env.SMS_API_URL;
const SMS_API_KEY = process.env.SMS_API_KEY;
const SMS_SECRET_KEY = process.env.SMS_SECRET_KEY;
const SMS_CALLER_ID = process.env.SMS_CALLER_ID;

async function sendFeesSms(phone, messageContent) {
  if (!phone) {
    console.warn("SMS not sent: no phone number provided");
    return;
  }
  try {
    const params = new URLSearchParams({
      apikey: SMS_API_KEY,
      secretkey: SMS_SECRET_KEY,
      callerID: SMS_CALLER_ID,
      toUser: "88" + phone,
      messageContent,
    });

    const response = await fetch(`${SMS_API_URL}?${params.toString()}`, {
      method: "GET",
    });

    const data = await response.json();

    if (data.Status === "0") {
      console.log("SMS sent:", data.Message_ID);
    } else {
      console.error("SMS failed:", data.StatusDescription);
    }
  } catch (err) {
    console.error("SMS request error:", err.message);
  }
}












// router.post("/getAllEmployee", (req, res) => {
//   const { searchText } = req.body;
//   db.query(
//     "SELECT *FROM employee WHERE emp_fname LIKE ? OR emp_lname LIKE ? OR emp_id LIKE ?",
//     [`%${searchText}%`, `%${searchText}%`, `%${searchText}%`],
//     (err, result) => {
//       res.json({ message: result });
//     }
//   );
// });



// vistor books
// ComplainBox

// ComplainBox

// PostalDispatch
// PostalDispatch

//EventNews

// router.post("/addEventNews", (req, res) => {
//   const {
//     eventFor,
//     eventType,
//     selectedClass,
//     eventName,
//     des,
//     fromDate,
//     toDate,
//     campus,
//     session,
//   } = req.body;

//   let filename = "";

//   const uploadFile = (req, field, targetFilename) => {
//     if (req.files && req.files[field] !== undefined) {
//       const file = req.files[field];
//       const newFilename = uuidv4() + path.extname(file.name);
//       file.mv(publicDirectory + "/image/" + newFilename, (err) => {
//         if (err) {
//           console.error("File upload error:", err.message);
//         } else {
//           console.log("File uploaded:", newFilename);
//         }
//       });
//       return newFilename;
//     } else {
//       return targetFilename;
//     }
//   };

//   if (req.files) {
//     filename = uploadFile(req, "eventImage", filename);
//   }

//   const selectedClassesArray = selectedClass
//     ? selectedClass.split(',').map(cls => cls.trim())
//     : [];

//   db.query(
//     "INSERT INTO event_news SET ?",
//     {
//       event_for: eventFor,
//       event_type: eventType,
//       class: selectedClass,
//       name: eventName,
//       image: filename || "",
//       des: des,
//       fromDate: fromDate,
//       toDate: toDate,
//       campus: campus,
//       session: session,
//       createAt: new Date(),
//     },
//     (err, result) => {
//       if (err) {
//         console.error("Insert error:", err.message);
//         return res.json({ message: err });
//       } else {
//         const id = result.insertId || 0;

//         let tokenQuery = "";
//         let tokenParams = [];

//         if (eventType === 'Specific' && selectedClassesArray.length > 0) {
//           const placeholders = selectedClassesArray.map(() => '?').join(', ');

//           tokenQuery = `
//             SELECT device, MIN(student_id) AS student_id
//             FROM (
//               SELECT sli.device, sli.student_id
//               FROM student AS s
//               JOIN class_name AS cn ON cn.class_name = s.Class
//               JOIN student_login_information AS sli ON s.student_id = sli.student_id
//               WHERE cn.class_name IN (${placeholders})

//               UNION ALL

//               SELECT pli.device, pli.student_id
//               FROM student AS s
//               JOIN class_name AS cn ON cn.class_name = s.Class
//               JOIN parent_login_information AS pli ON s.student_id = pli.student_id
//               WHERE cn.class_name IN (${placeholders})
//             ) AS all_devices
//             GROUP BY student_id
//           `;
//           tokenParams = [...selectedClassesArray, ...selectedClassesArray];
//         } else {
//           tokenQuery = `
//             SELECT device, MIN(student_id) AS student_id
//             FROM (
//               SELECT sli.device, sli.student_id
//               FROM student AS s
//               JOIN class_name AS cn ON cn.class_name = s.Class
//               JOIN student_login_information AS sli ON s.student_id = sli.student_id

//               UNION ALL

//               SELECT pli.device, pli.student_id
//               FROM student AS s
//               JOIN class_name AS cn ON cn.class_name = s.Class
//               JOIN parent_login_information AS pli ON s.student_id = pli.student_id
//             ) AS all_devices
//             GROUP BY student_id
//           `;
//           tokenParams = [];
//         }

//         db.query(tokenQuery, tokenParams, async (tokenErr, tokens) => {
//           if (tokenErr) {
//             console.error("Token query error:", tokenErr.message);
//           } else {
//             for (const row of tokens) {
//               try {
//                 await sendNotification(
//                   row.device||null,
//                   eventName,
//                   des,
//                   "http://test.com",
//                   "Event",
//                   id,
//                   row.student_id
//                 );
//               } catch (notifyErr) {
//                 console.warn("Notification sending error:", notifyErr.message);
//               }
//             }
//           }
//         });

//         return res.json({ message: true });
//       }
//     }
//   );
// });








// router.post("/addEventNews", async (req, res) => {
//   const {
//     eventFor,
//     eventType,
//     selectedClass,
//     eventName,
//     des,
//     fromDate,
//     toDate,
//     campus,
//     sms,
//     session,
//   } = req.body;

//   const query = (sql, params = []) =>
//     new Promise((resolve, reject) => {
//       db.query(sql, params, (err, result) => {
//         if (err) reject(err);
//         else resolve(result);
//       });
//     });

//   try {
//     let filename = "";

//     // 1️⃣ FILE UPLOAD
//     if (req.files && req.files.eventImage) {
//       const file = req.files.eventImage;
//       filename = uuidv4() + path.extname(file.name);
//       await file.mv(publicDirectory + "/image/" + filename);
//     }

//     // 2️⃣ INSERT EVENT
//     const insertResult = await query(
//       "INSERT INTO event_news SET ?",
//       {
//         event_for: eventFor,
//         event_type: eventType,
//         class: selectedClass || "",
//         name: eventName,
//         image: filename,
//         des,
//         fromDate,
//         toDate,
//         campus,
//         sms,
//         session,
//         createAt: new Date(),
//       }
//     );

//     const eventId = insertResult.insertId ?? 0;

//     // ===============================
//     // 3️⃣ FETCH STUDENTS
//     // ===============================
//     let students = [];

//     if (eventType === "Specific" && selectedClass) {
//       const classArray = selectedClass.split(",").map(c => c.trim());

//       students = await query(
//         `
//         SELECT student_id
//         FROM student
//         WHERE Class IN (?)
//         `,
//         [classArray]
//       );
//     } else {
//       students = await query(
//         `
//         SELECT student_id
//         FROM student
//         `,
//         []
//       );
//     }

//     if (!students.length) {
//       return res.json({ ok: true, message: "Event added (no students found)" });
//     }

//     const studentIds = students.map(s => s.student_id);

//     // ===============================
//     // 4️⃣ STUDENT TOKENS
//     // ===============================
//     const studentTokens = await query(
//       `
//       SELECT student_id, device
//       FROM student_login_information
//       WHERE student_id IN (?)
//       AND device IS NOT NULL
//       `,
//       [studentIds]
//     );

//     // ===============================
//     // 5️⃣ PARENT TOKENS
//     // ===============================
//     const parentTokens = await query(
//       `
//       SELECT student_id, device
//       FROM parent_login_information
//       WHERE student_id IN (?)
//       AND device IS NOT NULL
//       `,
//       [studentIds]
//     );

//     // ===============================
//     // 6️⃣ MERGE TOKENS
//     // ===============================
//     const allTokens = [...studentTokens, ...parentTokens];

//     // Optional: remove duplicate device tokens
//     const uniqueTokens = Array.from(
//       new Map(allTokens.map(i => [i.device, i])).values()
//     );

//     // ===============================
//     // 7️⃣ SEND NOTIFICATIONS
//     // ===============================
//     for (const row of uniqueTokens) {
//       try {
//         await sendNotification(
//           row.device,
//           eventName,
//           des,
//           "http://test.com",
//           "Event",
//           eventId,
//           row.student_id
//         );
//       } catch (err) {
//         console.warn("Notification failed:", err.message);
//       }
//     }

//     res.json({
//       ok: true,
//       message: "Event added & notifications sent successfully",
//     });
//   } catch (error) {
//     console.error("addEventNews error:", error);
//     res.status(500).json({
//       ok: false,
//       message: "Failed to add event",
//       error: error.message,
//     });
//   }
// });



// deleteEventNews

@Injectable()
export class FrontOfficeService {
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

  getAllEmployee(req: any, res: any) {
  const { searchText , campus } = req.body;

  let query = `
    SELECT * FROM employee 
    WHERE (emp_fname LIKE ? OR emp_lname LIKE ? OR emp_id LIKE ?)
  `;
  const params = [`%${searchText}%`, `%${searchText}%`, `%${searchText}%`];

 
  if (campus && campus !== "Boys & Girls Campus") {
    query += " AND campus = ?";
    params.push(campus);
  }

  db.query(query, params, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json({ message: result });
  });
}

  addEmployeeContact(req: any, res: any) {
  const { session, emp_type, emp_name, designation, phone, phone2 } = req.body;

  db.query(
    "INSERT INTO employee_contact SET ?",
    { session, emp_type, emp_name, designation, phone, phone2, status: "" },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  getEmployeeContactData(req: any, res: any) {
  db.query("SELECT *FROM employee_contact ", (err, result) => {
    res.json({ message: result });
  });
}

  getEmployeeContactDataById(req: any, res: any) {
  const { id } = req.body;
  db.query("SELECT *FROM employee_contact WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
}

  UpdateEmployeeContact(req: any, res: any) {
  const { id, session, emp_type, emp_name, designation, phone, phone2 } =
    req.body;

  db.query(
    "UPDATE employee_contact SET ? WHERE id=?",
    [
      { session, emp_type, emp_name, designation, phone, phone2, status: "" },
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
}

  addVisitorBook(req: any, res: any) {
  const {v_date,name,purpose,phone,in_Time,out_Time,session} = req.body;

  db.query(
    "INSERT INTO vistor_book SET ?",
    {v_date,name,purpose,phone,in_Time,out_Time,session},
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  updateVisitorBook(req: any, res: any) {
  const {id,v_date,name,purpose,phone,in_Time,out_Time} = req.body;

  db.query(
    "UPDATE vistor_book SET ? WHERE id=?",
    [{v_date,name,purpose,phone,in_Time,out_Time}, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  getVisitorBook(req: any, res: any) {
  db.query("SELECT *FROM vistor_book ", (err, result) => {
    res.json({ message: result });
  });
}

  DeleteVisitorBook(req: any, res: any) {
  const { id } = req.body;
  db.query("DELETE FROM vistor_book WHERE id = ?", id, (err, result) => {
    if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
  });
}

  addComplainBox(req: any, res: any) {
  const {
    session,
    complain_type,
    complainBy,
    phone,
    complain_des,
    img,
    compile,
  } = req.body;

  if (req.files !== null) {
    if (req.files.img !== undefined) {
      var file = req.files.img;
      var filename = uuidv4() + file.name;
      file.mv(publicDirectory + "/image/" + filename, (err) => {
        if (err) {
          res.json({ message: err });
        } else {
          console.log("file uploaded");
        }
        
      });
    }
  }

  db.query(
    "INSERT INTO complain_box SET ?",
    {
      session,
      complain_type,
      complainBy,
      phone,
      complain_des,
      img: filename||"",
      status: "",
      compile,
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

  getComplainBoxData(req: any, res: any) {
  db.query("SELECT *FROM complain_box ", (err, result) => {
    res.json({ message: result });
  });
}

  getComplainBoxDataByUser(req: any, res: any) {
  const { phone } = req.body;
  db.query("SELECT *FROM complain_box where phone=?",[phone], (err, result) => {
    res.json({ message: result });
  });
}

  DeleteComplainBoxDataById(req: any, res: any) {
  const { id } = req.body;
  db.query("DELETE FROM complain_box WHERE id = ?", id, (err, result) => {
    res.json({ message: result });
  });
}

  getComplainBoxDataById(req: any, res: any) {
  const { id } = req.body;
  db.query("SELECT *FROM complain_box WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
}

  UpdateComplainBox(req: any, res: any) {
  const {id,date,complain_type,complainBy,phone,complain_des} =req.body;
  db.query(
    "UPDATE complain_box SET ? WHERE id=?",
    [{date,complain_type,complainBy,phone,complain_des}, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  addPostalDispatch(req: any, res: any) {
  const {
    session,
    post_to,
    ref_no,
    address,
    note,
    post_from,
    img,
    date,
    compile,
  } = req.body;

  if (req.files !== null) {
    if (req.files.img !== undefined) {
      var file = req.files.img;
      var filename = uuidv4() + file.name;
      file.mv(publicDirectory + "/image/" + filename, (err) => {
        if (err) {
          res.json({ message: err });
        } else {
          console.log("file uploaded");
        }
      });
    }
  }

  db.query(
    "INSERT INTO postal_dispatch SET ?",
    {
      session,
      post_to,
      ref_no,
      address,
      note,
      post_from,
      img: filename||"",
      status: "",
      date,
      compile,
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

  getPostalDispatchData(req: any, res: any) {
    db.query("SELECT *FROM postal_dispatch", (err, result) => {
    res.json({ message: result });
  });
    
}

  getPostalDispatchDataById(req: any, res: any) {
    const{id}=req.body;
    db.query("SELECT *FROM postal_dispatch WHERE id=?",id, (err, result) => {
    res.json({ message: result });
  });
}

  deletePostalDispatchDataById(req: any, res: any) {
    const{id}=req.body;
    db.query("DELETE FROM postal_dispatch WHERE id=?",id, (err, result) => {
    res.json({ message: result });
  });
}

  deletePostalReceiveDataById(req: any, res: any) {
    const{id}=req.body;
    db.query("DELETE FROM postal_receive WHERE id=?",id, (err, result) => {
        if(err){
           res.json({ message: err }); 
        }else{
          res.json({ message: true });  
        }
    
  });
}

  getPostalReceiveData(req: any, res: any) {
    db.query("SELECT *FROM postal_receive", (err, result) => {
    res.json({ message: result });
  });
    
}

  getPostalReceiveDataById(req: any, res: any) {
    const{id}=req.body;
    db.query("SELECT *FROM postal_receive WHERE id=?",id, (err, result) => {
    res.json({ message: result });
  });
    
}

  UpdatePostalDispatch(req: any, res: any) {
  const { id, session,date, post_to, ref_no, address, note, post_from } = req.body;

  db.query(
    "UPDATE postal_dispatch SET ? WHERE id=?",
    [{ session,date, post_to, ref_no, address, note, post_from }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  addPostalReceive(req: any, res: any) {
  const { session, post_from, ref_no, address, note, post_to, img, date } =
    req.body;

  if (req.files !== null) {
    if (req.files.img !== undefined) {
      var file = req.files.img;
      var filename = uuidv4() + file.name;
      file.mv(publicDirectory + "/image/" + filename, (err) => {
        if (err) {
          res.json({ message: err });
        } else {
          console.log("file uploaded");
        }
      });
    }
  }

  db.query(
    "INSERT INTO postal_receive SET ?",
    {
      session,
      post_from,
      ref_no,
      address,
      note,
      post_to,
      img: filename||"",
      status: "",
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

  UpdatePostalReceive(req: any, res: any) {
  const { id,date, session, post_from, ref_no, address, note, post_to } = req.body;

  db.query(
    "UPDATE postal_receive SET ? WHERE id=?",
    [{ date,session, post_from, ref_no, address, note, post_to }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  getEventNews(req: any, res: any) {
  let { page, limit } = req.body;
  page = parseInt(page);
  limit = parseInt(limit);
  const offset = (page - 1) * limit;
  db.query(
    "SELECT * FROM event_news ORDER BY id DESC LIMIT ?, ?",
    [offset, limit],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: result });
      }
    }
  );
}

  async addEventNews(req: any, res: any) {
  const {
    eventFor,
    eventType,
    selectedClass,
    eventName,
    des,
    fromDate,
    toDate,
    campus,
    sms,
    session,
  } = req.body;
  const query = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  try {
    let filename = "";
    // 1️⃣ FILE UPLOAD
    if (req.files && req.files.eventImage) {
      const file = req.files.eventImage;
      filename = uuidv4() + path.extname(file.name);
      await file.mv(publicDirectory + "/image/" + filename);
    }
    // 2️⃣ INSERT EVENT
    const insertResult = await query(
      "INSERT INTO event_news SET ?",
      {
        event_for: eventFor,
        event_type: eventType,
        class: selectedClass || "",
        name: eventName,
        image: filename,
        des,
        fromDate,
        toDate,
        campus,
        sms,
        session,
        createAt: new Date(),
      }
    );
    const eventId = insertResult.insertId ?? 0;
    // ===============================
    // 3️⃣ FETCH STUDENTS
    // ===============================
    let students = [];
    if (eventType === "Specific" && selectedClass) {
      const classArray = selectedClass.split(",").map(c => c.trim());
      students = await query(
        `
        SELECT student_id, father_contact
        FROM student
        WHERE Class IN (?)
        `,
        [classArray]
      );
    } else {
      students = await query(
        `
        SELECT student_id, father_contact
        FROM student
        `,
        []
      );
    }
    if (!students.length) {
      return res.json({ ok: true, message: "Event added (no students found)" });
    }
    const studentIds = students.map(s => s.student_id);

    // ===============================
    // 3.5️⃣ SEND SMS — শুধু sms === "yes" হলে
    // ===============================
    if (sms === "yes") {
      const smsText = `${eventName}: ${des}`;
      for (const student of students) {
        if (!student.father_contact) continue;
        try {
          sendFeesSms(student.father_contact, smsText);
        } catch (err) {
          console.warn("SMS failed for", student.student_id, err.message);
        }
      }
    }

    // ===============================
    // 4️⃣ STUDENT TOKENS
    // ===============================
    const studentTokens = await query(
      `
      SELECT student_id, device
      FROM student_login_information
      WHERE student_id IN (?)
      AND device IS NOT NULL
      `,
      [studentIds]
    );
    // ===============================
    // 5️⃣ PARENT TOKENS
    // ===============================
    const parentTokens = await query(
      `
      SELECT student_id, device
      FROM parent_login_information
      WHERE student_id IN (?)
      AND device IS NOT NULL
      `,
      [studentIds]
    );
    // ===============================
    // 6️⃣ MERGE TOKENS
    // ===============================
    const allTokens = [...studentTokens, ...parentTokens];
    // Optional: remove duplicate device tokens
    const uniqueTokens = Array.from(
      new Map(allTokens.map(i => [i.device, i])).values()
    );
    // ===============================
    // 7️⃣ SEND NOTIFICATIONS — sms yes/no নির্বিশেষে সবসময় যাবে
    // ===============================
    for (const row of uniqueTokens) {
      try {
        await sendNotification(
          row.device,
          eventName,
          des,
          "http://test.com",
          "Event",
          eventId,
          row.student_id
        );
      } catch (err) {
        console.warn("Notification failed:", err.message);
      }
    }
    res.json({
      ok: true,
      message: "Event added & notifications sent successfully",
    });
  } catch (error) {
    console.error("addEventNews error:", error);
    res.status(500).json({
      ok: false,
      message: "Failed to add event",
      error: error.message,
    });
  }
}

  deleteEventNews(req: any, res: any) {
  const { id } = req.body;
  db.query("DELETE FROM event_news WHERE id=?", id, (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
}

  frontOfficeTest(req: any, res: any) {
  res.send("Front Office");
}
}
