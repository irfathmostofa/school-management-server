const express = require("express");
const router = express.Router();
const cors = require("cors");
const mysql = require("mysql");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); 
const { sendNotification } = require("../notification");
const publicDirectory = path.join(__dirname, "../public");

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

const now = new Date();
const dhakaTime = new Date(now.getTime() + 6 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 19)
  .replace("T", " ");

// hifz_daily_progress
// router.post("/postHifzDailyProgress", (req, res) => {
//   const {
//     student_id,
//     campus,
//     session,
//     date,
//     dailyJuzz,
//     daily,
//     previousJuzz,
//     previous,
//     oldJuzz,
//     old,
//     shobina,
//     shobinaLessonJuzz,
//     shobinaLesson,
//     note,
//     halakah_id,
//     term,
//   } = req.body;
//   const sqlCheck =
//     "SELECT * FROM hifz_daily_progress WHERE student_id = ? AND date = ?";
//   db.query(sqlCheck, [student_id, date], (err, result) => {
//     if (result.length > 0) {
//       return res.json({
//         message: false,
//         info: "A student date already exists.",
//       });
//     } else {
//       const sqlInsert = "INSERT INTO hifz_daily_progress SET ?";
//       const newRecord = {
//         student_id,
//         campus,
//         session,
//         date: date,
//         dailyJuzz,
//         daily,
//         previousJuzz,
//         previous,
//         oldJuzz,
//         old,
//         shobina,
//         shobinaLessonJuzz,
//         shobinaLesson,
//         note,
//         halakah_id,
//         term: term,
//         createAt: dhakaTime,
//       };
//       db.query(sqlInsert, newRecord, (err, result) => {
//         if (err) {
//           return res.json({ message: err });
//         } else {
//           res.json({ ok: true, info: "Data Added" });
//         }
//       });
//     }
//   });
// });



router.post("/postHifzDailyProgress", (req, res) => {
  const {
    student_id,
    campus,
    session,
    date,
    dailyJuzz,
    daily,
    previousJuzz,
    previous,
    oldJuzz,
    old,
    shobina,
    shobinaLessonJuzz,
    shobinaLesson,
    note,
    halakah_id,
    term,
  } = req.body;

  const sqlCheck =
    "SELECT * FROM hifz_daily_progress WHERE student_id = ? AND date = ? AND halakah_id = ?";

  db.query(sqlCheck, [student_id, date, halakah_id], (err, result) => {
    if (err) {
      return res.json({ message: err });
    }

    if (result.length > 0) {
      return res.json({
        message: false,
        info: "This student already has progress for this halaqa on this date.",
      });
    } else {
      const sqlInsert = "INSERT INTO hifz_daily_progress SET ?";

      const newRecord = {
        student_id,
        campus,
        session,
        date,
        dailyJuzz,
        daily,
        previousJuzz,
        previous,
        oldJuzz,
        old,
        shobina,
        shobinaLessonJuzz,
        shobinaLesson,
        note,
        halakah_id,
        term,
        createAt: dhakaTime,
      };

      db.query(sqlInsert, newRecord, (err2, result2) => {
        if (err2) {
          return res.json({ message: err2 });
        } else {
          res.json({ ok: true, info: "Data Added" });
        }
      });
    }
  });
});


































// router.post("/updateHifzDailyProgress", (req, res) => {
//   const {
//     student_id,
//     campus,
//     session,
//     date,
//     dailyJuzz,
//     daily,
//     previousJuzz,
//     previous,
//     oldJuzz,
//     old,
//     shobina,
//     shobinaLessonJuzz,
//     shobinaLesson,
//     note,
//     halakah_id,
//     term,
//   } = req.body;

//   db.query(
//     `UPDATE hifz_daily_progress 
//      SET campus = ?, session = ?, date = ?, dailyJuzz = ?, daily = ?, previousJuzz = ?, previous = ?, oldJuzz = ?, old = ?, shobina = ?, shobinaLessonJuzz = ?, shobinaLesson = ?, note = ?, halakah_id = ?, term = ?, updateAt = ? 
//      WHERE student_id = ? AND date = ?`,
//     [
//       campus,
//       session,
//       date,
//       dailyJuzz,
//       daily,
//       previousJuzz,
//       previous,
//       oldJuzz,
//       old,
//       shobina,
//       shobinaLessonJuzz,
//       shobinaLesson,
//       note,
//       halakah_id,
//       term,
//       dhakaTime,
//       student_id,
//       date,
//     ],
//     (err, result) => {
//       if (err) {
//         console.error("Database query error:", err);
//         res
//           .status(500)
//           .json({
//             info: "An error occurred while updating the progress.",
//             ok: false,
//           });
//       } else {
//         res.json({ info: "Update successful", ok: true });
//       }
//     }
//   );
// });



router.post("/updateHifzDailyProgress", (req, res) => {
  const {
    student_id,
    campus,
    session,
    date,
    dailyJuzz,
    daily,
    previousJuzz,
    previous,
    oldJuzz,
    old,
    shobina,
    shobinaLessonJuzz,
    shobinaLesson,
    note,
    halakah_id,
    term,
  } = req.body;

  const sqlCheck =
    "SELECT id FROM hifz_daily_progress WHERE student_id = ? AND date = ?";

  db.query(sqlCheck, [student_id, date], (err, result) => {
    if (err) {
      return res.status(500).json({ ok: false, info: "DB error" });
    }

    // ================= UPDATE =================
    if (result.length > 0) {
      const sqlUpdate = `
        UPDATE hifz_daily_progress SET
          campus = ?,
          session = ?,
          dailyJuzz = ?,
          daily = ?,
          previousJuzz = ?,
          previous = ?,
          oldJuzz = ?,
          old = ?,
          shobina = ?,
          shobinaLessonJuzz = ?,
          shobinaLesson = ?,
          note = ?,
          halakah_id = ?,
          term = ?,
          updateAt = ?
        WHERE student_id = ? AND date = ?
      `;

      const updateValues = [
        campus,
        session,
        dailyJuzz,
        daily,
        previousJuzz,
        previous,
        oldJuzz,
        old,
        shobina,
        shobinaLessonJuzz,
        shobinaLesson,
        note,
        halakah_id,
        term,
        dhakaTime,
        student_id,
        date,
      ];

      return db.query(sqlUpdate, updateValues, (err) => {
        if (err) {
          return res
            .status(500)
            .json({ ok: false, info: "Update failed" });
        }

        res.json({ ok: true, info: "Data updated" });
      });
    }

    // ================= INSERT =================
    const sqlInsert = `
      INSERT INTO hifz_daily_progress (
        student_id, campus, session, date,
        dailyJuzz, daily,
        previousJuzz, previous,
        oldJuzz, old,
        shobina, shobinaLessonJuzz, shobinaLesson,
        note, halakah_id, term,
        createAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertValues = [
      student_id,
      campus,
      session,
      date,
      dailyJuzz,
      daily,
      previousJuzz,
      previous,
      oldJuzz,
      old,
      shobina,
      shobinaLessonJuzz,
      shobinaLesson,
      note,
      halakah_id,
      term,
      dhakaTime,
    ];

    db.query(sqlInsert, insertValues, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ ok: false, info: "Insert failed" });
      }

      res.json({ ok: true, info: "Data inserted" });
    });
  });
});



router.post("/getHifzDailyProgressByStudentId", (req, res) => {
  const { session, campus, halakah_id, studentId, startDate, endDate } =
    req.body;

  // Query the database for records within the provided date range
  db.query(
    "SELECT * FROM hifz_daily_progress WHERE session = ? AND campus = ? AND halakah_id = ? AND student_id = ? AND date BETWEEN ? AND ? ORDER BY date ASC",
    [session, campus, halakah_id, studentId, startDate, endDate],
    (err, result) => {
      if (err) {
        return res.json({ message: "Error", error: err });
      }

      // Helper function to generate date range in YYYY-MM-DD format
      const getDateRange = (start, end) => {
        const dateArray = [];
        let currentDate = new Date(start);

        while (currentDate <= new Date(end)) {
          dateArray.push(currentDate.toISOString().split("T")[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }

        return dateArray;
      };

      // Generate the date range from the given start and end dates
      const dateRange = getDateRange(startDate, endDate);

      // Map the query result by date for easy lookup
      const resultMap = {};
      result.forEach((item) => {
        const dateKey = new Date(item.date).toISOString().split("T")[0];
        resultMap[dateKey] = item;
      });

      // Construct the output, ensuring each date in the range is covered
      const output = dateRange.map((date, index) => {
        if (resultMap[date]) {
          // If data exists for the date, use it
          return { ...resultMap[date], id: (index + 1).toString() };
        } else {
          // If no data exists, create a default placeholder entry
          return {
            id: (index + 1).toString(),
            student_id: studentId,
            campus,
            session,
            date,
            dailyJuzz: "",
            daily: "",
            previousJuzz: "",
            previous: "",
            oldJuzz: "",
            old: "",
            shobina: "0",
            shobinaLessonJuzz: "",
            shobinaLesson: "",
            note: "",
            createAt: "",
            updateAt: "",
            halakah_id,
            term: "",
          };
        }
      });

      // Respond with the constructed data
      res.json({ message: output });
    }
  );
});

router.post("/getHifzDailyProgressByStudentIdMonth", (req, res) => {
  const { session, campus, halakah_id, studentId, month } = req.body;

  // Helper function to check if a year is a leap year
  const isLeapYear = (year) =>
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

  // Helper function to get the number of days in a month
  const getDaysInMonth = (year, month) => {
    const monthDays = {
      1: 31, // January
      2: isLeapYear(year) ? 29 : 28, // February
      3: 31, // March
      4: 30, // April
      5: 31, // May
      6: 30, // June
      7: 31, // July
      8: 31, // August
      9: 30, // September
      10: 31, // October
      11: 30, // November
      12: 31, // December
    };
    return monthDays[month] || 0;
  };

  // Helper function to get the first and last day of the given month in Dhaka time zone
  const getStartAndEndDate = (month) => {
    const [year, monthNum] = month.split("-");
    const yearNumber = parseInt(year, 10);
    const monthNumber = parseInt(monthNum, 10);

    // Create the first day of the month in UTC
    let startDate = new Date(Date.UTC(yearNumber, monthNumber - 1, 1));
    // Adjust for Dhaka time zone (UTC+6)
    startDate.setUTCHours(6, 0, 0, 0);

    // Calculate the last day of the month
    const lastDay = getDaysInMonth(yearNumber, monthNumber);
    let endDate = new Date(
      Date.UTC(yearNumber, monthNumber - 1, lastDay, 23, 59, 59, 999)
    );
    // Adjust for Dhaka time zone (UTC+6)
    endDate.setUTCHours(23, 59, 59, 999);

    // Format dates as YYYY-MM-DD
    const formattedStartDate = startDate.toISOString().split("T")[0];
    const formattedEndDate = endDate.toISOString().split("T")[0];

    return { formattedStartDate, formattedEndDate };
  };

  // Get start and end dates based on the provided month
  const { formattedStartDate: startDate, formattedEndDate: endDate } =
    getStartAndEndDate(month);

  // Query the database for records within the provided date range
  db.query(
    "SELECT * FROM hifz_daily_progress WHERE session = ? AND campus = ? AND halakah_id = ? AND student_id = ? AND date BETWEEN ? AND ? ORDER BY date ASC",
    [session, campus, halakah_id, studentId, startDate, endDate],
    (err, result) => {
      if (err) {
        return res.json({ message: "Error", error: err });
      }

      // Helper function to generate date range in YYYY-MM-DD format
      const getDateRange = (start, end) => {
        const dateArray = [];
        let currentDate = new Date(start);

        while (currentDate <= new Date(end)) {
          dateArray.push(currentDate.toISOString().split("T")[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }

        return dateArray;
      };

      // Generate the date range from the given start and end dates
      const dateRange = getDateRange(startDate, endDate);

      // Map the query result by date for easy lookup
      const resultMap = {};
      result.forEach((item) => {
        const dateKey = new Date(item.date).toISOString().split("T")[0];
        resultMap[dateKey] = item;
      });

      // Construct the output, ensuring each date in the range is covered
      const output = dateRange.map((date, index) => {
        if (resultMap[date]) {
          // If data exists for the date, use it
          return { ...resultMap[date], id: (index + 1).toString() };
        } else {
          // If no data exists, create a default placeholder entry
          return {
            id: (index + 1).toString(),
            student_id: studentId,
            campus,
            session,
            date,
            dailyJuzz: "",
            daily: "",
            previousJuzz: "",
            previous: "",
            oldJuzz: "",
            old: "",
            shobina: "0",
            shobinaLessonJuzz: "",
            shobinaLesson: "",
            note: "",
            createAt: "",
            updateAt: "",
            halakah_id,
            term: "",
          };
        }
      });

      // Respond with the constructed data and total days in the month
      res.json({
        message: output,
        totalDays: dateRange.length, // Provide the total number of days in the month
      });
    }
  );
});

router.post("/getHifzDailyProgress", (req, res) => {
  const { session, campus, halakah_id } = req.body;
  db.query(
    "SELECT * FROM hifz_daily_progress WHERE session = ? AND campus= ? AND halakah_id=? ORDER BY id DESC",
    [session, campus, halakah_id],
    (err, result) => {
      if (err) {
        res.json({ message: "Error", error: err });
      } else {
        res.json({ message: result });
      }
    }
  );
});

router.post("/getHifzDailyProgressInDate", (req, res) => {
  const { session, campus, halakah_id, date, term } = req.body;
  db.query(
    "SELECT * FROM hifz_daily_progress WHERE session = ? AND campus= ? AND halakah_id=? AND date=? AND term=?",
    [session, campus, halakah_id, date, term],
    (err, result) => {
      if (err) {
        res.json({ message: "Error", error: err });
      } else {
        res.json({ message: result });
      }
    }
  );
});

router.post("/deleteHifzDailyProgress", (req, res) => {
  const { id } = req.body;
  db.query(
    "DELETE FROM hifz_daily_progress WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        res.json({ message: false, error: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});
// hifz_daily_progress

// HifzTermTargetSetup
router.post("/postHifzTermTargetSetup", (req, res) => {
  const { student_id, campus, session, halakah, term, type, month, lesson } =
    req.body;

  let checkQuery;
  let queryParams;

  // Check for duplicate entry based on type
  if (type === "term") {
    checkQuery = `
      SELECT * FROM hifz_term_target_setup 
      WHERE student_id = ? AND campus = ? AND session = ? AND halakah = ? 
      AND term = ? AND type = ?
    `;
    queryParams = [student_id, campus, session, halakah, term, type]; // Use 'term' for 'term' type
  } else {
    checkQuery = `
      SELECT * FROM hifz_term_target_setup 
      WHERE student_id = ? AND campus = ? AND session = ? AND halakah = ? 
      AND month = ? AND type = ?
    `;
    queryParams = [student_id, campus, session, halakah, month, type]; // Use 'month' for other types
  }

  db.query(checkQuery, queryParams, (err, results) => {
    if (err) {
      return res.json({ info: err });
    }

    if (results.length > 0) {
      // Duplicate found
      return res.json({
        message: false,
        info: "Duplicate entry exists for the given parameters.",
      });
    } else {
      // No duplicate, proceed with insertion
      const insertData = {
        student_id,
        campus,
        session,
        halakah,
        type,
        lesson,
        createAt: dhakaTime,
      };

      // Add 'term' or 'month' depending on the type
      if (type === "term") {
        insertData.term = term;
      } else {
        insertData.month = month;
      }

      const insertQuery = `
        INSERT INTO hifz_term_target_setup 
        SET ?
      `;

      db.query(insertQuery, insertData, (err, result) => {
        if (err) {
          return res.json({ info: err });
        }
        return res.json({ message: true, info: "Data Added Successfully" });
      });
    }
  });
});

router.post("/updateHifzTermTargetSetup", (req, res) => {
  const { student_id, campus, session, halakah, term, type, month, lesson } =
    req.body;

  let updateQuery;
  let queryParams;

  // Conditionally build the update query based on the type
  if (type === "term") {
    updateQuery = `
      UPDATE hifz_term_target_setup 
      SET ? 
      WHERE student_id = ? AND campus = ? AND session = ? AND halakah = ? AND term = ?
    `;
    queryParams = [
      {
        student_id,
        campus,
        session,
        halakah,
        term,
        type,
        lesson,
        updateAt: dhakaTime,
      },
      student_id,
      campus,
      session,
      halakah,
      term,
    ];
  } else {
    updateQuery = `
      UPDATE hifz_term_target_setup 
      SET ? 
      WHERE student_id = ? AND campus = ? AND session = ? AND halakah = ? AND month = ?
    `;
    queryParams = [
      {
        student_id,
        campus,
        session,
        halakah,
        month,
        type,
        lesson,
        updateAt: dhakaTime,
      },
      student_id,
      campus,
      session,
      halakah,
      month,
    ];
  }

  db.query(updateQuery, queryParams, (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true, info: "Data Updated Successfully" });
    }
  });
});

router.post("/getHifzTermTargetSetup", (req, res) => {
  const { session, campus, term, halakah } = req.body;

  const query = `
    SELECT * 
    FROM hifz_term_target_setup 
    WHERE session = ? 
    AND campus = ? 
    AND term = ? 
    AND halakah = ? 
  `;

  db.query(query, [session, campus, term, halakah], (err, result) => {
    if (err) {
      return res.json({ message: false, error: err });
    }
    if (result.length > 0) {
      res.json({ message: true, data: result });
    } else {
      res.json({
        message: false,
        info: "No students found for the given criteria",
      });
    }
  });
});

router.post("/getHifzTermTargetSetupMonth", (req, res) => {
  const { session, campus, month, halakah } = req.body;

  const query = `
    SELECT * 
    FROM hifz_term_target_setup 
    WHERE session = ? 
    AND campus = ? 
    AND month = ? 
    AND halakah = ? 
  `;

  db.query(query, [session, campus, month, halakah], (err, result) => {
    if (err) {
      return res.json({ message: false, error: err });
    }
    if (result.length > 0) {
      res.json({ message: true, data: result });
    } else {
      res.json({
        message: false,
        info: "No students found for the given criteria",
      });
    }
  });
});

router.post("/getHifzSprhalaka", (req, res) => {
  const { session, campus, halaqaNumber } = req.body;
  db.query(
    "SELECT *FROM hifz_spr WHERE session=? AND campus=? AND halaqaNumber=?",
    [session, campus, halaqaNumber],
    (err, result) => {
      res.json({ message: result });
    }
  );
});

router.post("/deleteHifzTermTargetSetup", (req, res) => {
  const { id } = req.body;
  db.query(
    "DELETE FROM hifz_term_target_setup WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        res.json({ message: false, error: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/getHifzSprTargetByStudentId", (req, res) => {
  const { session, campus, halakah, studentId } = req.body;
  const query = `SELECT * FROM hifz_term_target_setup WHERE session = ? AND campus = ? AND halakah = ? AND student_id= ?`;
  db.query(query, [session, campus, halakah, studentId], (err, result) => {
    if (err) {
      return res.json({ message: false, error: err });
    }
    if (result.length > 0) {
      res.json({ message: true, data: result });
    } else {
      res.json({
        message: false,
        info: "No students found for the given criteria",
      });
    }
  });
});
// HifzTermTargetSetup
router.post("/postIncidentReport", async (req, res) => {
  const {
    student_id,
    submitDate,
    dateOfOccurrence,
    eventDetails,
    media,
    courseOfAction,
    counselorName,
    session,
    campus,
    parents,
  } = req.body;


  const uploadFile = (req, field) => {
    return new Promise((resolve, reject) => {
      if (req.files && req.files[field]) {
        const file = req.files[field];
        const newFilename = uuidv4() + path.extname(file.name);
        file.mv(publicDirectory + "/image/" + newFilename, (err) => {
          if (err) {
            reject(err);
          } else {
            console.log("File uploaded:", newFilename);
            resolve(newFilename);
          }
        });
      } else {
        resolve(null);
      }
    });
  };

  try {
    const uploadedFilename = await uploadFile(req, "media");
    const finalMedia = uploadedFilename || media || null;

    db.query(
      "INSERT INTO incidentReport SET ?",
      {
        student_id,
        submitDate,
        dateOfOccurrence,
        eventDetails,
        media: finalMedia,
        courseOfAction,
        counselorName,
        session,
        campus,
        createAt: dhakaTime,
        parents,
      },
      async (err, result) => {
        if (err) {
          return res.status(500).json({ message: err });
        }

        const id = result.insertId;

       
          db.query(
            "SELECT * FROM parent_login_information WHERE student_id = ?",
            [student_id],
            async (err, parentResult) => {
             
              
                const device = parentResult[0].device||null;
                if (parents === "1") {
                  await sendNotification(
                    device,
                    "Incident Report",
                    eventDetails,
                    "http://test.com",
                    "incidentReport",
                    id,
                    student_id
                  );
                }
              
            }
          );
        

        res.status(200).json({ message: "Incident report submitted successfully" });
      }
    );
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ message: "File upload failed", error: err.message });
  }
});

router.post("/updateIncidentReport", async (req, res) => {
  const { id, dateOfOccurrence, eventDetails, courseOfAction, counselorName, media, parents } = req.body;
  
  let filename = media || ""; // Use existing media if available

  // Function to handle file upload
  const uploadFile = async (req, field) => {
    if (req.files && req.files[field]) {
      const file = req.files[field];
      const newFilename = uuidv4() + path.extname(file.name); // Keep original file extension
      try {
        await file.mv(publicDirectory + "/image/" + newFilename);
        console.log("File uploaded:", newFilename);
        return newFilename;
      } catch (err) {
        throw err;
      }
    }
    return null; // Return null if no file uploaded
  };

  try {
    // Handle file upload
    if (req.files) {
      const uploadedFilename = await uploadFile(req, "media");
      if (uploadedFilename) {
        filename = uploadedFilename;
      }
    }

    // Database update
    db.query(
      "UPDATE incidentReport SET ? WHERE id = ?",
      [
        {
          dateOfOccurrence: dateOfOccurrence,
          eventDetails: eventDetails,
          courseOfAction: courseOfAction,
          counselorName: counselorName,
          media: filename, // Update media if a new file is uploaded
          updateAt: dhakaTime,
          parents: parents
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
  } catch (err) {
    res.json({ message: "Error during file upload", error: err });
  }
});


router.post("/getIncidentReport", (req, res) => {
  const { session, campus, startDate, endDate, studentId } = req.body;

  let query = `
    SELECT incidentReport.*, 
           student.student_first_name, 
           student.student_last_name, 
           student.Class, 
           student.section 
    FROM incidentReport 
    JOIN student ON incidentReport.student_id = student.student_id
    WHERE incidentReport.session = ? 
    AND incidentReport.campus = ? 
  `;
  
  const queryParams = [session, campus];

  if (startDate && endDate) {
    query += ` AND incidentReport.dateOfOccurrence BETWEEN ? AND ? `;
    queryParams.push(startDate, endDate);
  }

  if (studentId) {
    query += ` AND incidentReport.student_id = ? `;
    queryParams.push(studentId);
  }

  query += `ORDER BY incidentReport.id DESC`;

  db.query(query, queryParams, (err, result) => {
    if (err) {
      return res.json({ message: "Error", error: err });
    }
    res.json({ message: result });
  });
});


router.post("/deleteIncidentReport", (req, res) => {
  const { id } = req.body;
  db.query("DELETE FROM incidentReport WHERE id = ?", [id], (err, result) => {
    if (err) {
      res.json({ message: false, error: err });
    } else {
      res.json({ message: true });
    }
  });
});

router.post("/postSoldForm", (req, res) => {
  const {
    form_number,
    campus,
    sold_date,
    first_name,
    last_name,
    applyed_class,
    dob,
    gender,
    father_contact,
    mother_contact,
    price, 
    mode,
    accNumber,
    session,
    compile,
  } = req.body;

  const formData = {
    form_number: form_number,
    campus: campus,
    sold_date: sold_date,
    first_name: first_name, 
    last_name: last_name,
    applyed_class: applyed_class,
    dob: dob,
    gender: gender,
    father_contact: father_contact,
    mother_contact: mother_contact,
    price: price, 
    session: session
  };

  db.query("INSERT INTO `sold_form` SET ?", formData, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error inserting form data", error: err });
    }

    const paymentId = Math.floor(1000000 + Math.random() * 9000000);

  
    const paymentData = {
      payment_id: paymentId,
      session: session,
      type: "income",
      ptype: "student",
      campus: campus,
      phead: "Form Sold",
      payment_for: form_number,
      note: `Form Sold for ${first_name}`, 
      amount: price,
      mode: mode,
      account_id: accNumber,
      status: "1",
      status2: "1",
      verified: "",
      date: new Date().toISOString().slice(0, 10),
      compile: compile
    };

    db.query("INSERT INTO `payment` SET ?", paymentData, (err, paymentResult) => {
      if (err) {
        return res.status(500).json({ message: "Error inserting payment data", error: err });
      }

      return res.json({ message: "Form and payment data inserted successfully" });
    });
  });
});




// router.post("/getHifzSprHalakahStudents", (req, res) => {
//   const { session,campus,halaqaNumber,date } = req.body;
//   db.query("SELECT * FROM hifz_spr_students WHERE session = ? AND campus= ? AND halaqaNumber=? AND startDate=? ORDER BY id DESC", [session,campus,halaqaNumber,date], (err, result) => {
//     if (err) {
//       res.json({ message: "Error", error: err });
//     } else {
//       res.json({ message: result });
//     }
//   });
// });

router.post("/getHifzSprHalakahStudents", (req, res) => {
  const { campus, session, halaqaNumber } = req.body;

  if (!campus || !session) {
    return res.json({
      message: false,
      info: "Campus and session are required",
    });
  }

//   const query = `
//     SELECT 
//       s.*,h.*
//     FROM 
//       hifz_spr h 
//     LEFT JOIN 
//       hifz_spr_students s 
//     ON 
//       h.halaqaNumber = s.halaqaNumber 
//     WHERE 
//       s.campus = ? 
//       AND s.session = ? 
//       AND s.halaqaNumber = ?
//     ORDER BY s.id DESC`;



 const query = `
  SELECT 
    s.*, h.*, sa.*
  FROM 
    hifz_spr h
  INNER JOIN 
    hifz_spr_students s 
      ON h.halaqaNumber = s.halaqaNumber
  INNER JOIN 
    student sa 
      ON sa.student_id = s.student_id
  WHERE 
    s.campus = ?
    AND s.session = ?
    AND s.halaqaNumber = ?
  ORDER BY s.id DESC
`;



  db.query(query, [campus, session, halaqaNumber], (err, results) => {
    if (err) {
      return res.json({ message: false, error: err });
    }

    if (results.length > 0) {
      res.json({ message: true, data: results });
    } else {
      res.json({
        message: false,
        info: "No students found for the given criteria",
      });
    }
  });
});

router.post("/getSoldForm", (req, res) => {
  const { session, campus } = req.body;
  db.query(
    `SELECT sold_form.*,p.payment_id,p.amount,p.note,p.phead,p.mode FROM sold_form
    JOIN payment as p ON p.payment_for=sold_form.form_number
    WHERE sold_form.session = ? AND sold_form.campus= ? GROUP BY sold_form.form_number ORDER BY sold_form.id DESC `,
    [session, campus],
    (err, result) => {
      if (err) {
        res.json({ message: "Error", error: err });
      } else {
        res.json({ message: result });
      }
    }
  );
});

router.post("/getSoldFormForDashboard", (req, res) => {
  const { className, session,campus } = req.body;

  db.query(
    `SELECT 
      COUNT(form_number) AS total_form,
      IFNULL(SUM(price), 0) AS totalPrice,
      COUNT(CASE WHEN applyed_class = ? THEN 1 END) AS filterClass
    FROM 
      sold_form
    WHERE 
      session = ? AND campus=?`,
    [className, session,campus],
    (err, result) => {
      if (err) {
        res.json({ message: "Error", error: err });
      } else {
        res.json({ message: result[0] });
      }
    }
  );
});

router.post("/getAdmissionForDashboard", (req, res) => {
  const { className, session,campus, eligible_status } = req.body;

  let query = `
    SELECT 
      COUNT(form_number) AS total_form,
      COUNT(CASE WHEN applyforclass = ? THEN 1 END) AS filterClass
    FROM 
      admission
    WHERE 
      session = ? AND campus=?`;

  const params = [className, session,campus];

  if (eligible_status) {
    query += ` AND eligible_status = ?`;
    params.push(eligible_status);
  }

  db.query(query, params, (err, result) => {
    if (err) {
      res.json({ message: "Error", error: err });
    } else {
      res.json({ message: result[0] });
    }
  });
});




router.post("/deleteSoldForm", (req, res) => {
  const { form_number } = req.body;

  db.query("DELETE FROM sold_form WHERE form_number = ?", [form_number], (err, result1) => {
    if (err) {
      return res.json({ message: "Error deleting from sold_form", error: err });
    }

    db.query("DELETE FROM payment WHERE payment_for = ? AND phead='Form Sold'", [form_number], (err, result2) => {
      if (err) {
        return res.json({ message: "Error deleting from payment", error: err });
      }

      res.json({ message: true });
    });
  });
});


router.post("/admission", (req, res) => {
  const {
    admission_id,
    student_name,
    apply_class,
    age,
    dob,
    pob,
    gender,
    nationality,
    religion,
    birth_certificate,
    contact_number,
    form_status,
  } = req.body;
  db.query(
    "INSERT INTO online_admission SET ?",
    {
      admission_id,
      student_name,
      apply_class,
      age,
      dob,
      pob,
      gender,
      nationality,
      religion,
      birth_certificate,
      contact_number,
      form_status,
    },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/getadmissioninfo", (req, res) => {
  db.query("SELECT *FROM online_admission", (err, result) => {
    res.json({ message: result });
  });
});

router.post("/getAllSiblingData", (req, res) => {
  db.query(
    "SELECT id,student_id,student_first_name,student_last_name,Class,section,dob,gender,nationality,religion,father_contact FROM student WHERE sibling1 != 0 OR sibling2 != 0 OR sibling3 != 0 OR sibling4 != 0 OR sibling5 != 0",
    (err, students) => {
      res.json({ message: students });
    }
  );
});

router.post("/getSiblingData", (req, res) => {
  const { student_id, session } = req.body;
  db.query(
    "SELECT *FROM student WHERE student_id = ? AND session = ?",
    [student_id, session],
    (err, result) => {
      res.json({ message: result });
    }
  );
});

router.post("/fetchApplicants", (req, res) => {
  db.query("SELECT a.*,at.selectedClass FROM admission as a left join admission_test as at on at.form_number=a.form_number WHERE a.eligible_status=1", (err, result) => {
    res.json({ message: result });
  });
});

router.post("/fetchApplicantsAlldata", (req, res) => {
  const { status, search,campus,session } = req.body;

  let query = `SELECT * FROM admission WHERE session = ?`;
  const params = [session];

  if (status) {
    query += ` AND eligible_status = ?`;
    params.push(status);
  }
  if (campus) {
    query += ` AND campus = ?`;
    params.push(campus);
  }

  if (search) {
    query += ` AND (
      form_number LIKE ? OR 
      student_first_name LIKE ? OR 
      student_last_name LIKE ? OR 
      father_contact LIKE ?
    )`;
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  db.query(query, params, (err, result) => {
    if (err) {
      res.json({ message: "Error", error: err });
    } else {
      res.json({ message: result });
    }
  });
});


router.post("/fetchApplicantsAdmissionTest", (req, res) => {
  db.query("SELECT *FROM admission WHERE eligible_status=''", (err, result) => {
    res.json({ message: result });
  });
});

router.post("/fetchApplicantsAdmitCard", (req, res) => {
  const { session, className, campus } = req.body;

  const query = `
    SELECT * 
    FROM admission 
    WHERE admitCard = 1 
      AND campus = ? 
      AND applyforclass = ? 
      AND session = ?
  `;

  db.query(query, [campus, className, session], (err, result) => {
    if (err) {
      console.error("Error fetching applicants for admit card:", err);
      return res.status(500).json({ error: "Database query failed" });
    }

    res.json({ message: result });
  });
});


router.post("/generateAdmissionAdmitCard", (req, res) => {
  const { form_number } = req.body;

  if (!form_number) {
    return res.status(400).json({ message: "Form number is required" });
  }

  db.query(
    "UPDATE admission SET admitCard = 1 WHERE form_number = ?",[form_number],(err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Form number not found" });
      }
      res.json({ message: "Admit card generated successfully" });
    }
  );
});

router.post("/fetchApplicantsbyID", (req, res) => {
  const { id } = req.body;
  db.query(
    "SELECT *FROM admission WHERE eligible_status=1 AND id=?",
    id,
    (err, result) => {
      res.json({ message: result });
    }
  );
});

router.post("/deleteApplicantById", (req, res) => {
  const { id } = req.body;
  db.query("DELETE FROM admission WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
});

router.post("/fetchApplicantsbyFormNo", (req, res) => {
  const { form_number } = req.body;
  db.query(
    "SELECT *FROM admission WHERE form_number=?",
    form_number,
    (err, result) => {
      res.json({ message: result });
    }
  );
});

// fetchAdmittedStudents API

router.post("/fetchAllAdmittedStudents", (req, res) => {
  db.query(
    "SELECT student_first_name, student_last_name, Class, section, sibling_info, id,student_id,father_name FROM student",
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: "Error occurred" });
      } else {
        res.json({ message: result });
      }
    }
  );
});

// router.post("/fetchAdmittedStudentsForFeesForward", (req, res) => {
//   const { Class, section, session, campus, searchField } = req.body;

//   // Validate required fields
//   if (!session || !campus || !Class) {
//     return res.status(400).json({ error: "Session, campus, and class are required." });
//   }

//   // Base query
//   let query = `
//     SELECT 
//       student_first_name,
//       student_last_name,
//       Class,
//       section,
//       campus,
//       sibling_info,
//       id,
//       student_id,
//       dob,
//       gender,
//       nationality,
//       religion,
//       father_contact,
//       father_name,
//       mother_name,
//       mother_contact,
//       student_picture 
//     FROM 
//       student 
//     WHERE 
//       session = ? 
//       AND campus = ?`;

//   let params = [session, campus];

//   // Filter by class
//   if (Class) {
//     query += " AND Class = ?";
//     params.push(Class);
//   }

//   // Filter by section
//   if (section) {
//     query += " AND section = ?";
//     params.push(section);
//   }

//   // Filter by searchField
//   if (searchField) {
//     query += `
//       AND (student_id LIKE ? 
//       OR LOWER(student_first_name) LIKE LOWER(?) 
//       OR LOWER(student_last_name) LIKE LOWER(?))`;
//     const searchParam = `%${searchField}%`;
//     params.push(searchParam, searchParam, searchParam);
//   }

//   // Execute query
//   db.query(query, params, (err, result) => {
//     if (err) {
//       console.error("Error executing query:", err);
//       return res.status(500).json({ message: "An error occurred while fetching students." });
//     }
//     res.json({ message: result });
//   });
// });





router.post("/fetchAdmittedStudentsForFeesForward", (req, res) => {
  const { Class, section, session, campus, searchField,  limit = 10000, page = 1 } = req.body;

  // Validate required fields
  if (!session || !campus || !Class) {
    return res.status(400).json({ error: "Session, campus, and class are required." });
  }

  // Base query (count query for total records)
  let countQuery = `
    SELECT COUNT(*) AS total 
    FROM student 
    WHERE session = ? AND campus = ?`;

  // Base query (data query)
  let query = `
    SELECT 
      student_first_name,
      student_last_name,
      Class,
      section,
      campus,
      sibling_info,
      id,
      student_id,
      dob,
      gender,
      nationality,
      religion,
      father_contact,
      father_name,
      mother_name,
      mother_contact,
      student_picture 
    FROM student 
    WHERE session = ? AND campus = ?`;

  let params = [session, campus];
  let countParams = [session, campus];

  // Filter by class
  if (Class) {
    query += " AND Class = ?";
    countQuery += " AND Class = ?";
    params.push(Class);
    countParams.push(Class);
  }

  // Filter by section
  if (section) {
    query += " AND section = ?";
    countQuery += " AND section = ?";
    params.push(section);
    countParams.push(section);
  }

  // Filter by searchField
  if (searchField) {
    query += `
      AND (student_id LIKE ? 
      OR LOWER(student_first_name) LIKE LOWER(?) 
      OR LOWER(student_last_name) LIKE LOWER(?))`;
    countQuery += `
      AND (student_id LIKE ? 
      OR LOWER(student_first_name) LIKE LOWER(?) 
      OR LOWER(student_last_name) LIKE LOWER(?))`;
    const searchParam = `%${searchField}%`;
    params.push(searchParam, searchParam, searchParam);
    countParams.push(searchParam, searchParam, searchParam);
  }

  // Pagination (LIMIT & OFFSET)
  const offset = (page - 1) * limit;
  query += " LIMIT ? OFFSET ?";
  params.push(Number(limit), Number(offset));

  // Execute count query first
  db.query(countQuery, countParams, (err, countResult) => {
    if (err) {
      console.error("Error executing count query:", err);
      return res.status(500).json({ message: "An error occurred while counting students." });
    }

    const totalRecords = countResult[0].total;

    // Execute main query
    db.query(query, params, (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ message: "An error occurred while fetching students." });
      }

      res.json({
        data: result,
        pagination: {
          totalRecords,
          currentPage: Number(page),
          totalPages: Math.ceil(totalRecords / limit),
          limit: Number(limit),
        },
      });
    });
  });
});





















// router.post("/fetchAdmittedStudents", (req, res) => {
//   const {
//     Class,
//     section,
//     session,
//     campus,
//     searchField,
//     page = 1,
//     limit = 10000,
//   } = req.body;

//   if (!session) {
//     return res.status(400).json({ error: "Session is required." });
//   }

//   let query =
//     "SELECT student_first_name,student_last_name,Class,section,sibling_info,id,student_id,dob,gender,nationality,religion,father_contact,student_picture,father_name FROM student WHERE session = ? AND campus=?";
//   let countQuery = "SELECT COUNT(*) as count FROM student WHERE session = ? AND campus=?";
//   let params = [session, campus];
//   let countParams = [session, campus];

//   if (Class) {
//     query += " AND Class = ?";
//     countQuery += " AND Class = ?";
//     params.push(Class);
//     countParams.push(Class);
//   }

//   if (section) {
//     query += " AND section = ?";
//     countQuery += " AND section = ?";
//     params.push(section);
//     countParams.push(section);
//   }

//   if (searchField) {
//     query +=
//       " AND (student_id LIKE ? OR LOWER(student_first_name) LIKE LOWER(?) OR LOWER(student_last_name) LIKE LOWER(?))";
//     countQuery +=
//       " AND (student_id LIKE ? OR LOWER(student_first_name) LIKE LOWER(?) OR LOWER(student_last_name) LIKE LOWER(?))";
//     params.push(
//       "%" + searchField + "%",
//       "%" + searchField + "%",
//       "%" + searchField + "%"
//     );
//     countParams.push(
//       "%" + searchField + "%",
//       "%" + searchField + "%",
//       "%" + searchField + "%"
//     );
//   }

//   query += " LIMIT ? OFFSET ?";
//   params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

//   db.query(query, params, (err, result) => {
//     if (err) {
//       console.log(err);
//       res.json({ message: "Error occurred" });
//     } else {
//       db.query(countQuery, countParams, (err, result2) => {
//         if (err) {
//           console.log(err);
//           res.json({ message: "Error occurred" });
//         } else {
//           res.json({ count: result2[0].count, message: result });
//         }
//       });
//     }
//   });
// });



router.post("/fetchAdmittedStudents", (req, res) => {
  const {
    Class,
    section,
    session,
    campus,
    searchField,
    page = 1,
    limit = 10000,
  } = req.body;

  if (!session) {
    return res.status(400).json({ error: "Session is required." });
  }

  let query =
    `SELECT student_first_name, student_last_name, Class, section, sibling_info, id, student_id, dob, gender, nationality, religion, father_contact,mother_contact, student_picture, father_name 
     FROM student 
     WHERE session = ? AND campus = ?`;
  let countQuery = `SELECT COUNT(*) as count FROM student WHERE session = ? AND campus = ?`;

  let params = [session, campus];
  let countParams = [session, campus];

  if (Class) {
    query += " AND Class = ?";
    countQuery += " AND Class = ?";
    params.push(Class);
    countParams.push(Class);
  }

  if (section) {
    query += " AND section = ?";
    countQuery += " AND section = ?";
    params.push(section);
    countParams.push(section);
  }

  if (searchField) {
    // Tokenize search for multi-word matching
    const tokens = searchField.trim().toLowerCase().split(/\s+/);

    // Build SQL for each token
    const searchSQL = tokens
      .map(() => 
        `(LOWER(student_first_name) LIKE ? OR LOWER(student_last_name) LIKE ? OR LOWER(CONCAT(student_first_name, ' ', student_last_name)) LIKE ? OR student_id LIKE ?)`
      )
      .join(" AND ");

    query += ` AND (${searchSQL})`;
    countQuery += ` AND (${searchSQL})`;

    tokens.forEach((token) => {
      const val = `%${token}%`;
      params.push(val, val, val, val);       // first_name, last_name, full_name, student_id
      countParams.push(val, val, val, val);
    });
  }

  query += " LIMIT ? OFFSET ?";
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

  db.query(query, params, (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ message: "Error occurred" });
    }
    db.query(countQuery, countParams, (err, countResult) => {
      if (err) {
        console.log(err);
        return res.json({ message: "Error occurred" });
      }
      res.json({ count: countResult[0].count, message: result });
    });
  });
});


















router.post("/fetchNotEnrolledStudents", (req, res) => {
  const {
    Class,
    section,
    session,
    campus,
    searchField,
    page = 1,
    limit = 10000,
  } = req.body;

  // Base queries
  let query = `
    SELECT * FROM student 
    WHERE isEnrolled='false' AND principal_approve='Approved' 
    AND campus = ? 
    AND session = ?`;
  
  let countQuery = `
    SELECT COUNT(*) as count FROM student 
    WHERE isEnrolled='false' AND principal_approve='Approved' 
    AND campus = ? 
    AND session = ?`;

  // Parameters for the queries
  let params = [campus, session];
  let countParams = [campus, session];

  // Adding filters based on provided data
  if (Class) {
    query += " AND Class = ?";
    countQuery += " AND Class = ?";
    params.push(Class);
    countParams.push(Class);
  }

  if (section) {
    query += " AND section = ?";
    countQuery += " AND section = ?";
    params.push(section);
    countParams.push(section);
  }

  if (searchField) {
    const searchParam = `%${searchField}%`;
    query += `
      AND (student_id LIKE ? 
      OR LOWER(student_first_name) LIKE LOWER(?) 
      OR LOWER(student_last_name) LIKE LOWER(?))`;
    countQuery += `
      AND (student_id LIKE ? 
      OR LOWER(student_first_name) LIKE LOWER(?) 
      OR LOWER(student_last_name) LIKE LOWER(?))`;
    params.push(searchParam, searchParam, searchParam);
    countParams.push(searchParam, searchParam, searchParam);
  }

  // Pagination
  query += " LIMIT ? OFFSET ?";
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

  // Execute the main query
  db.query(query, params, (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ message: "Error occurred" });
    }

    // Execute the count query
    db.query(countQuery, countParams, (err, result2) => {
      if (err) {
        console.error("Error executing count query:", err);
        return res.status(500).json({ message: "Error occurred" });
      }

      // Send the response
      res.json({ count: result2[0].count, students: result });
    });
  });
});


router.post("/fetchEligibleStudents", (req, res) => {
     const {Class,section} = req.body;
  db.query("SELECT *FROM Eligible_admit_card WHERE Class=? AND section=?",[Class,section], (err, result) => {
    res.json({ message: result });
  });
});

router.post("/getAdmittedlaststudent", (req, res) => {
  db.query(
    "SELECT *FROM online_admission GROUP BY student_name HAVING COUNT(*) > 0 ORDER BY id DESC",
    (err, result) => {
      if (result.length > 0) {
        var id = result[0].id;
        res.json({ message: result, lastid: id });
      } else {
        res.json({ message: [], lastid: 1 });
      }
    }
  );
});

router.post("/getSiblingData", (req, res) => {
  const { student_id, session } = req.body;
  db.query(
    "SELECT *FROM student WHERE student_id = ? AND session = ?",
    [student_id, session],
    (err, result) => {
      res.json({ message: result });
    }
  );
});

// router.post("/addstudent", (req, res) => {
//   const {
//     student_id,
//     student_first_name,
//     student_last_name,
//     campus,
//     admission_date,
//     Class,
//     section,
//     category,
//     dob,
//     age,
//     gender,
//     pob,
//     nationality,
//     religion,
//     birthCertificate,
//     passnumber,
//     house,
//     student_picture,
//     current_school,
//     csdate,
//     cgrade,
//     cfdate,
//     cfgrade,
//     clanguage,
//     previous_school1,
//     psdate1,
//     psgrade1,
//     pfdate1,
//     pfgrade1,
//     planguage1,
//     previous_school2,
//     psdate2,
//     psgrade2,
//     pfdate2,
//     pfgrade2,
//     planguage2,
//     previous_school3,
//     psdate3,
//     psgrade3,
//     pfdate3,
//     pfgrade3,
//     planguage3,
//     physical_disability,
//     partially_signted,
//     hearing_imparment,
//     mobility_difficulties,
//     mental_health,
//     blood_group,
//     other,
//     remarks,
//     father_name,
//     father_occ,
//     father_edu,
//     father_nid_pass,
//     father_tin,
//     mother_name,
//     mother_occ,
//     mother_edu,
//     mother_nid_pass,
//     mother_tin,
//     guardian_name1,
//     grealtion1,
//     guardian_name2,
//     grealtion2,
//     sibling_info,
//     father_img,
//     mother_img,
//     guardianimg1,
//     guardianimg2,
//     present_address,
//     permanent_address,
//     lpresentdist,
//     lpresentcity,
//     lpresentstreet,
//     lperdist,
//     lpercity,
//     lperstreet,
//     father_contact,
//     father_email,
//     mother_contact,
//     mother_email,
//     guardianContact1,
//     guardianContact2,
//     emergency_con1,
//     erelation1,
//     esms1,
//     emergency_con2,
//     erelation2,
//     esms2,
//     whowillpay,
//     pay_relation,
//     designation,
//     sibling1,
//     sibling2,
//     sibling3,
//     sibling4,
//     sibling5,
//     note,
//     financial_aid_type,
//     admission_fee,
//     admission_discount,
//     admission_amount,
//     tuition_fee,
//     tuition_discount,
//     tuition_amount,
//     annual_fee,
//     annual_discount,
//     annual_amount,
//     ot_discount,
//     ot_discount_type,
//     ot_amount,
//     residency,
//     tc,
//     tcimg,
//     report,
//     adminbirthcertificate,
//     bcimg,
//     fourpphoto,
//     admin_note,
//     report_img,
//     other_img,
//     session,
//   } = req.body;

//   let filename = "";
//   let filename2 = "";
//   let filename3 = "";
//   let filename4 = "";
//   let filename5 = "";
//   let filename6 = "";
//   let filename7 = "";
//   let filename8 = "";
//   let filename9 = "";

//   //UPLOADS

//   const uploadFile = (req, field, targetFilename) => {
//     if (req.files[field] !== undefined) {
//       const file = req.files[field];
//       const newFilename = uuidv4() + file.name;
//       file.mv(publicDirectory + "/image/" + newFilename, (err) => {
//         if (err) {
//           res.json({ message: err });
//         } else {
//           console.log("File uploaded:", newFilename);
//           return newFilename;
//         }
//       });
//       return newFilename;
//     } else {
//       return targetFilename;
//     }
//   };

//   if (req.files !== null) {
//     filename = uploadFile(req, "student_picture", filename);
//     filename2 = uploadFile(req, "father_img", filename2);
//     filename3 = uploadFile(req, "mother_img", filename3);
//     filename4 = uploadFile(req, "guardianimg1", filename4);
//     filename5 = uploadFile(req, "guardianimg2", filename5);
//     filename6 = uploadFile(req, "tcimg", filename6);
//     filename7 = uploadFile(req, "bcimg", filename7);
//     filename8 = uploadFile(req, "report_img", filename8);
//     filename9 = uploadFile(req, "other_img", filename9);
//   }

//   db.query(
//     "INSERT INTO student SET ?",
//     {
//       student_id,
//       student_first_name,
//       student_last_name,
//       campus,
//       admission_date,
//       Class,
//       section,
//       category,
//       dob,
//       age,
//       gender,
//       pob,
//       nationality,
//       religion,
//       birthCertificate,
//       passnumber,
//       house,
//       student_picture: filename !== "" ? filename : student_picture,
//       current_school,
//       csdate,
//       cgrade,
//       cfdate,
//       cfgrade,
//       clanguage,
//       previous_school1,
//       psdate1,
//       psgrade1,
//       pfdate1,
//       pfdate1,
//       pfgrade1,
//       planguage1,
//       previous_school2,
//       psdate2,
//       psgrade2,
//       pfdate2,
//       pfgrade2,
//       planguage2,
//       previous_school3,
//       psdate3,
//       psgrade3,
//       pfdate3,
//       pfgrade3,
//       planguage3,
//       physical_disability,
//       partially_signted,
//       hearing_imparment,
//       mobility_difficulties,
//       mental_health,
//       blood_group,
//       other,
//       remarks,
//       father_name,
//       father_occ,
//       father_edu,
//       father_nid_pass,
//       father_tin,
//       mother_name,
//       mother_occ,
//       mother_edu,
//       mother_nid_pass,
//       mother_tin,
//       guardian_name1,
//       grealtion1,
//       guardian_name2,
//       grealtion2,
//       sibling_info,
//       father_img: filename2 !== "" ? filename2 : father_img,
//       mother_img: filename3 !== "" ? filename3 : mother_img,
//       guardianimg1: filename4 !== "" ? filename4 : guardianimg1,
//       guardianimg2: filename5 !== "" ? filename5 : guardianimg2,
//       present_address,
//       permanent_address,
//       lpresentdist,
//       lpresentcity,
//       lpresentstreet,
//       lperdist,
//       lpercity,
//       lperstreet,
//       father_contact,
//       father_email,
//       mother_contact,
//       mother_email,
//       emergency_con1,
//       erelation1,
//       esms1,
//       emergency_con2,
//       erelation2,
//       esms2,
//       whowillpay,
//       pay_relation,
//       designation,
//       sibling1,
//       sibling2,
//       sibling3,
//       sibling4,
//       sibling5,
//       note,
//       financial_aid_type,
//       admission_fee,
//       admission_discount,
//       admission_amount,
//       tuition_fee,
//       tuition_discount,
//       tuition_amount,
//       annual_fee,
//       annual_discount,
//       annual_amount,
//       ot_discount,
//       ot_discount_type,
//       ot_amount,
//       eligible: "",
//       status2: "",
//       status3: "",
//       student_status: "",
//       residency,
//       tc,
//       tcimg: filename6 !== "" ? filename6 : tcimg,
//       report,
//       adminbirthcertificate,
//       bcimg: filename7 !== "" ? filename7 : bcimg,
//       fourpphoto,
//       admin_note,
//       report_img: filename8 !== "" ? filename8 : report_img,
//       other_img: filename9 !== "" ? filename9 : other_img,
//       principal_approve: "",
//       principal_note: "",
//       session: session,
//     },
//     (err, result) => {
//       if (err) {
//         res.json({ ok: false, message: err });
//       } else {
//         res.json({ ok: true, message: true });
//       }
//     }
//   );
// });


router.post("/addstudent", (req, res) => {
  const {
    student_id,
    student_first_name,
    student_last_name,
    campus,
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

  let filename = "";
  let filename2 = "";
  let filename3 = "";
  let filename4 = "";
  let filename5 = "";
  let filename6 = "";
  let filename7 = "";
  let filename8 = "";
  let filename9 = "";

  //UPLOADS

  const uploadFile = (req, field, targetFilename) => {
    if (req.files[field] !== undefined) {
      const file = req.files[field];
      const newFilename = uuidv4() + file.name;
      file.mv(publicDirectory + "/image/" + newFilename, (err) => {
        if (err) {
          res.json({ message: err });
        } else {
          console.log("File uploaded:", newFilename);
          return newFilename;
        }
      });
      return newFilename;
    } else {
      return targetFilename;
    }
  };

  if (req.files !== null) {
    filename = uploadFile(req, "student_picture", filename);
    filename2 = uploadFile(req, "father_img", filename2);
    filename3 = uploadFile(req, "mother_img", filename3);
    filename4 = uploadFile(req, "guardianimg1", filename4);
    filename5 = uploadFile(req, "guardianimg2", filename5);
    filename6 = uploadFile(req, "tcimg", filename6);
    filename7 = uploadFile(req, "bcimg", filename7);
    filename8 = uploadFile(req, "report_img", filename8);
    filename9 = uploadFile(req, "other_img", filename9);
  }


  const prefix = student_id;

  db.query(
    `SELECT student_id
   FROM student
   WHERE student_id LIKE ?
   ORDER BY CAST(SUBSTRING_INDEX(student_id,'-',-1) AS UNSIGNED) DESC
   LIMIT 1`,
    [`${prefix}-%`],
    (err, idResult) => {
      if (err) {
        return res.json({
          ok: false,
          message: err,
        });
      }

      let newStudentId;

      if (idResult.length === 0) {
        newStudentId = `${prefix}-24353`;
      } else {
        const lastNumber = parseInt(
          idResult[0].student_id.split("-")[1],
          10
        );

        newStudentId =
          `${prefix}-` + String(lastNumber + 1).padStart(3, "0");
      }

      db.query(
        "INSERT INTO student SET ?",
        {
          student_id: newStudentId,
          student_first_name,
          student_last_name,
          campus,
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
          student_picture: filename !== "" ? filename : student_picture,
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
          father_img: filename2 !== "" ? filename2 : father_img,
          mother_img: filename3 !== "" ? filename3 : mother_img,
          guardianimg1: filename4 !== "" ? filename4 : guardianimg1,
          guardianimg2: filename5 !== "" ? filename5 : guardianimg2,
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
          eligible: "",
          status2: "",
          status3: "",
          student_status: "",
          residency,
          tc,
          tcimg: filename6 !== "" ? filename6 : tcimg,
          report,
          adminbirthcertificate,
          bcimg: filename7 !== "" ? filename7 : bcimg,
          fourpphoto,
          admin_note,
          report_img: filename8 !== "" ? filename8 : report_img,
          other_img: filename9 !== "" ? filename9 : other_img,
          principal_approve: "",
          principal_note: "",
          session: session,
        },
        (err, result) => {
          if (err) {
            res.json({ ok: false, message: err });
          } else {
            res.json({ ok: true, message: true });
          }
        }
      );
    });
})









//Bulk Student

router.post("/addBulkStudent", async (req, res) => {
  const { selectedCSVData } = req.body;

  if (!Array.isArray(selectedCSVData) || selectedCSVData.length === 0) {
    return res.json({ ok: false, message: "No data received" });
  }

  // ------------------------
  // Helper: get last serial number used for a given prefix
  // ------------------------
  const getLastSerial = (prefix) => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT student_id
        FROM student
        WHERE student_id LIKE ?
        ORDER BY CAST(REPLACE(student_id, ?, '') AS UNSIGNED) DESC
        LIMIT 1
        `,
        [`${prefix}%`, prefix],
        (err, result) => {
          if (err) return reject(err);

          let lastSerial = 0;
          if (result.length > 0) {
            const lastId = result[0].student_id;
            lastSerial = parseInt(lastId.replace(prefix, ""), 10) || 0;
          }
          resolve(lastSerial);
        }
      );
    });
  };

  // Promisified wrapper for generic db.query calls
  const runQuery = (sql, params) => {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  };

  try {
    // ------------------------
    // 1. Generate Student IDs based on prefix
    // ------------------------
    const prefixCounters = {};
    const generatedStudentIDs = [];

    // unique prefixes coming from the CSV (student_id column holds the prefix here)
    const uniquePrefixes = [
      ...new Set(selectedCSVData.map((item) => item.student_id.trim())),
    ];

    // load last used serial for each prefix
    for (const prefix of uniquePrefixes) {
      prefixCounters[prefix] = await getLastSerial(prefix);
    }

    // assign a new, incremented student_id to every row
    selectedCSVData.forEach((student) => {
      const prefix = student.student_id.trim();

      prefixCounters[prefix]++;

      const generatedID = prefix + String(prefixCounters[prefix]).padStart(3, "0");

      student.student_id = generatedID;
      generatedStudentIDs.push(generatedID);
    });

    // ------------------------
    // 2. Duplicate check (safety net, should normally be empty)
    // ------------------------
    const duplicatesID = await runQuery(
      "SELECT student_id FROM student WHERE student_id IN (?)",
      [generatedStudentIDs]
    );

    const duplicateIdSet = new Set(duplicatesID.map((d) => d.student_id));

    // rows that are NOT duplicates -> these are the ones we actually insert
    const rowsToInsert = selectedCSVData.filter(
      (student) => !duplicateIdSet.has(student.student_id)
    );

    if (rowsToInsert.length === 0) {
      return res.json({
        ok: true,
        message: `0 student added, ${duplicatesID.length} duplicate student found`,
        duplicates: duplicatesID,
        duplicateCSVdataList: selectedCSVData.filter((student) =>
          duplicateIdSet.has(student.student_id)
        ),
      });
    }

    // ------------------------
    // 3. Insert query
    // ------------------------
    const query =
      "INSERT INTO student (`student_id`, `student_first_name`, `student_last_name`,`campus`,`admission_date`, `Class`, `section`, `category`, `dob`, `age`, `gender`, `pob`, `nationality`, `religion`, `birthCertificate`, `passnumber`, `house`, `student_picture`, `current_school`, `csdate`, `cgrade`, `cfdate`, `cfgrade`, `clanguage`, `previous_school1`, `psdate1`, `psgrade1`, `pfdate1`, `pfgrade1`, `planguage1`, `previous_school2`, `psdate2`, `psgrade2`, `pfdate2`, `pfgrade2`, `planguage2`, `previous_school3`, `psdate3`, `psgrade3`, `pfdate3`, `pfgrade3`, `planguage3`, `physical_disability`, `partially_signted`, `hearing_imparment`, `mobility_difficulties`, `mental_health`, `blood_group`, `other`, `remarks`, `father_name`, `father_occ`, `father_edu`, `father_nid_pass`, `father_tin`, `mother_name`, `mother_occ`, `mother_edu`, `mother_nid_pass`, `mother_tin`, `guardian_name1`, `grealtion1`, `guardian_name2`, `grealtion2`, `sibling_info`, `father_img`, `mother_img`, `guardianimg1`, `guardianimg2`, `present_address`, `permanent_address`, `lpresentdist`, `lpresentcity`, `lpresentstreet`, `lperdist`, `lpercity`, `lperstreet`, `father_contact`, `father_email`, `mother_contact`, `mother_email`,`guardianContact1`,`guardianContact2`, `emergency_con1`, `erelation1`, `esms1`, `emergency_con2`, `erelation2`, `esms2`, `whowillpay`, `pay_relation`, `designation`, `sibling1`, `sibling2`, `sibling3`, `sibling4`, `sibling5`, `note`, `financial_aid_type`, `admission_fee`, `admission_discount`, `admission_amount`, `tuition_fee`, `tuition_discount`, `tuition_amount`, `annual_fee`, `annual_discount`, `annual_amount`, `ot_discount`, `ot_discount_type`, `ot_amount`, `eligible`, `status2`, `status3`, `student_status`, `residency`, `tc`, `tcimg`, `report`, `adminbirthcertificate`, `bcimg`, `fourpphoto`, `admin_note`, `report_img`, `other_img`, `principal_approve`, `principal_note`, `session`) VALUES ?";

    const values = rowsToInsert.map((student) => [
      student.student_id,
      student.student_first_name,
      student.student_last_name,
      student.campus,
      student.admission_date,
      student.Class,
      student.section,
      student.category,
      student.dob,
      student.age,
      student.gender,
      student.pob,
      student.nationality,
      student.religion,
      student.birthCertificate,
      student.passnumber,
      student.house,
      " ",
      student.current_school,
      student.csdate,
      student.cgrade,
      student.cfdate,
      student.cfgrade,
      student.clanguage,
      student.previous_school1,
      student.psdate1,
      student.psgrade1,
      student.pfdate1,
      student.pfgrade1,
      student.planguage1,
      student.previous_school2,
      student.psdate2,
      student.psgrade2,
      student.pfdate2,
      student.pfgrade2,
      student.planguage2,
      student.previous_school3,
      student.psdate3,
      student.psgrade3,
      student.pfdate3,
      student.pfgrade3,
      student.planguage3,
      student.physical_disability,
      student.partially_signted,
      student.hearing_imparment,
      student.mobility_difficulties,
      student.mental_health,
      student.blood_group,
      student.other,
      student.remarks,
      student.father_name,
      student.father_occ,
      student.father_edu,
      student.father_nid_pass,
      student.father_tin,
      student.mother_name,
      student.mother_occ,
      student.mother_edu,
      student.mother_nid_pass,
      student.mother_tin,
      student.guardian_name1,
      student.grealtion1,
      student.guardian_name2,
      student.grealtion2,
      student.sibling_info,
      " ",
      " ",
      " ",
      " ",
      student.present_address,
      student.permanent_address,
      student.lpresentdist,
      student.lpresentcity,
      student.lpresentstreet,
      student.lperdist,
      student.lpercity,
      student.lperstreet,
      student.father_contact,
      student.father_email,
      student.mother_contact,
      student.mother_email,
      student.guardianContact1,
      student.guardianContact2,
      student.emergency_con1,
      student.erelation1,
      student.esms1,
      student.emergency_con2,
      student.erelation2,
      student.esms2,
      student.whowillpay,
      student.pay_relation,
      student.designation,
      student.sibling1,
      student.sibling2,
      student.sibling3,
      student.sibling4,
      student.sibling5,
      student.note,
      student.financial_aid_type,
      student.admission_fee,
      student.admission_discount,
      student.admission_amount,
      student.tuition_fee,
      student.tuition_discount,
      student.tuition_amount,
      student.annual_fee,
      student.annual_discount,
      student.annual_amount,
      student.ot_discount,
      student.ot_discount_type,
      student.ot_amount,
      " ",
      " ",
      " ",
      " ",
      student.residency,
      student.tc,
      " ",
      student.report,
      student.adminbirthcertificate,
      " ",
      student.fourpphoto,
      student.admin_note,
      " ",
      " ",
      " ",
      " ",
      student.session,
    ]);

    // ------------------------
    // 4. Insert & respond
    // ------------------------
    const result = await runQuery(query, [values]);

    return res.json({
      ok: true,
      message:
        duplicatesID.length > 0
          ? `${rowsToInsert.length} student added and ${duplicatesID.length} duplicate student found`
          : "All student added",
      result,
      duplicates: duplicatesID,
      duplicateCSVdataList: selectedCSVData.filter((student) =>
        duplicateIdSet.has(student.student_id)
      ),
    });
  } catch (err) {
    console.error(err);
    return res.json({
      ok: false,
      message: "Error occurred while adding bulk students",
      error: err.message,
    });
  }
});

// router.post("/addBulkStudent", (req, res) => {
//   const { selectedCSVData } = req.body;

//   const query =
//     "INSERT INTO student (`student_id`, `student_first_name`, `student_last_name`,`campus`,`admission_date`, `Class`, `section`, `category`, `dob`, `age`, `gender`, `pob`, `nationality`, `religion`, `birthCertificate`, `passnumber`, `house`, `student_picture`, `current_school`, `csdate`, `cgrade`, `cfdate`, `cfgrade`, `clanguage`, `previous_school1`, `psdate1`, `psgrade1`, `pfdate1`, `pfgrade1`, `planguage1`, `previous_school2`, `psdate2`, `psgrade2`, `pfdate2`, `pfgrade2`, `planguage2`, `previous_school3`, `psdate3`, `psgrade3`, `pfdate3`, `pfgrade3`, `planguage3`, `physical_disability`, `partially_signted`, `hearing_imparment`, `mobility_difficulties`, `mental_health`, `blood_group`, `other`, `remarks`, `father_name`, `father_occ`, `father_edu`, `father_nid_pass`, `father_tin`, `mother_name`, `mother_occ`, `mother_edu`, `mother_nid_pass`, `mother_tin`, `guardian_name1`, `grealtion1`, `guardian_name2`, `grealtion2`, `sibling_info`, `father_img`, `mother_img`, `guardianimg1`, `guardianimg2`, `present_address`, `permanent_address`, `lpresentdist`, `lpresentcity`, `lpresentstreet`, `lperdist`, `lpercity`, `lperstreet`, `father_contact`, `father_email`, `mother_contact`, `mother_email`,`guardianContact1`,`guardianContact2`, `emergency_con1`, `erelation1`, `esms1`, `emergency_con2`, `erelation2`, `esms2`, `whowillpay`, `pay_relation`, `designation`, `sibling1`, `sibling2`, `sibling3`, `sibling4`, `sibling5`, `note`, `financial_aid_type`, `admission_fee`, `admission_discount`, `admission_amount`, `tuition_fee`, `tuition_discount`, `tuition_amount`, `annual_fee`, `annual_discount`, `annual_amount`, `ot_discount`, `ot_discount_type`, `ot_amount`, `eligible`, `status2`, `status3`, `student_status`, `residency`, `tc`, `tcimg`, `report`, `adminbirthcertificate`, `bcimg`, `fourpphoto`, `admin_note`, `report_img`, `other_img`, `principal_approve`, `principal_note`, `session`) VALUES ? ON DUPLICATE KEY UPDATE `student_id` = VALUES(`student_id`)";

//   const values = selectedCSVData.map((student) => [
//     student.student_id,
//     student.student_first_name,
//     student.student_last_name,
//     student.campus,
//     student.admission_date,
//     student.Class,
//     student.section,
//     student.category,
//     student.dob,
//     student.age,
//     student.gender,
//     student.pob,
//     student.nationality,
//     student.religion,
//     student.birthCertificate,
//     student.passnumber,
//     student.house,
//     " ",
//     student.current_school,
//     student.csdate,
//     student.cgrade,
//     student.cfdate,
//     student.cfgrade,
//     student.clanguage,
//     student.previous_school1,
//     student.psdate1,
//     student.psgrade1,
//     student.pfdate1,
//     student.pfgrade1,
//     student.planguage1,
//     student.previous_school2,
//     student.psdate2,
//     student.psgrade2,
//     student.pfdate2,
//     student.pfgrade2,
//     student.planguage2,
//     student.previous_school3,
//     student.psdate3,
//     student.psgrade3,
//     student.pfdate3,
//     student.pfgrade3,
//     student.planguage3,
//     student.physical_disability,
//     student.partially_signted,
//     student.hearing_imparment,
//     student.mobility_difficulties,
//     student.mental_health,
//     student.blood_group,
//     student.other,
//     student.remarks,
//     student.father_name,
//     student.father_occ,
//     student.father_edu,
//     student.father_nid_pass,
//     student.father_tin,
//     student.mother_name,
//     student.mother_occ,
//     student.mother_edu,
//     student.mother_nid_pass,
//     student.mother_tin,
//     student.guardian_name1,
//     student.grealtion1,
//     student.guardian_name2,
//     student.grealtion2,
//     student.sibling_info,
//     " ",
//     " ",
//     " ",
//     " ",
//     student.present_address,
//     student.permanent_address,
//     student.lpresentdist,
//     student.lpresentcity,
//     student.lpresentstreet,
//     student.lperdist,
//     student.lpercity,
//     student.lperstreet,
//     student.father_contact,
//     student.father_email,
//     student.mother_contact,
//     student.mother_email,
//     student.guardianContact1,
//     student.guardianContact2,
//     student.emergency_con1,
//     student.erelation1,
//     student.esms1,
//     student.emergency_con2,
//     student.erelation2,
//     student.esms2,
//     student.whowillpay,
//     student.pay_relation,
//     student.designation,
//     student.sibling1,
//     student.sibling2,
//     student.sibling3,
//     student.sibling4,
//     student.sibling5,
//     student.note,
//     student.financial_aid_type,
//     student.admission_fee,
//     student.admission_discount,
//     student.admission_amount,
//     student.tuition_fee,
//     student.tuition_discount,
//     student.tuition_amount,
//     student.annual_fee,
//     student.annual_discount,
//     student.annual_amount,
//     student.ot_discount,
//     student.ot_discount_type,
//     student.ot_amount,
//     " ",
//     " ",
//     " ",
//     " ",
//     student.residency,
//     student.tc,
//     " ",
//     student.report,
//     student.adminbirthcertificate,
//     " ",
//     student.fourpphoto,
//     student.admin_note,
//     " ",
//     " ",
//     " ",
//     " ",
//     student.session,
//   ]);

//   const studentIDs = selectedCSVData.map((student) => [student.student_id]);

//   db.query(
//     "SELECT student_id FROM student WHERE student_id IN (?)",
//     [studentIDs],
//     (err, result1) => {
//       if (err) {
//         console.error(err);
//         res.json({ message: "no duplicate found", result: result1 });
//       } else {
//         const duplicatesID = result1;

//         db.query(query, [values], (err, result) => {
//           if (err) {
//             console.error(err);
//             res.json({
//               ok: false,
//               message: "Error occurred while adding bulk students",
//               result: result,
//             });
//           } else {
//             if (duplicatesID.length > 0) {
//               const dataInserted = selectedCSVData.length - duplicatesID.length;
//               const duplicateCSVdataList = selectedCSVData.filter((student) =>
//                 duplicatesID.some(
//                   (duplicate) => duplicate.student_id === student.student_id
//                 )
//               );
//               res.json({
//                 ok: true,
//                 message: `${dataInserted} student Added and ${duplicatesID.length} duplicate student found`,
//                 result: result,
//                 duplicates: duplicatesID,
//                 duplicateCSVdataList: duplicateCSVdataList,
//               });
//             } else {
//               res.json({
//                 ok: true,
//                 message: "All student Added",
//                 result: result,
//                 duplicates: duplicatesID,
//               });
//             }
//           }
//         });
//       }
//     }
//   );
// });

router.post("/UpdateStudentAid", (req, res) => {
  const {
    id,
    admission_discount,
    admission_amount,
    tuition_discount,
    tuition_amount,
    annual_discount,
    annual_amount,
  } = req.body;
  db.query(
    "UPDATE student SET ? WHERE id=?",
    [
      {
        admission_discount,
        admission_amount,
        tuition_discount,
        tuition_amount,
        annual_discount,
        annual_amount,
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
});

router.post("/admissionformsubmit", async (req, res) => {
  const {
    session,
    form_number,
    campus,
    submission_date,
    student_first_name,
    student_last_name,
    applyforclass,
    age,
    dob,
    gender,
    pob,
    nationality,
    religion,
    birthCertificate,
    passport_number,
    student_picture,
    currentschool,
    sdate,
    sgrade,
    fdate,
    fgrade,
    language,
    previousSchool,
    psdate,
    psgrade,
    pfdate,
    pfgrade,
    planguage,
    previousSchool1,
    psdate1,
    psgrade1,
    pfdate1,
    pfgrade1,
    planguage1,
    previousSchool2,
    psdate2,
    psgrade2,
    pfdate2,
    pfgrade2,
    planguage2,
    physical_disability,
    partially_signted,
    hearing_imparment,
    mobility_difficulties,
    mental_health,
    blood_group,
    others,
    mremarks,
    father_name,
    father_occupation,
    father_education,
    father_nidPass,
    father_tin,
    mother_name,
    mother_occupation,
    mother_education,
    mother_nidPass,
    mother_tin,
    guardianName1,
    grelation1,
    gcontact1,
    guardianName2,
    grelation2,
    gcontact2,
    father_img,
    mother_img,
    gurdian1_img,
    gurdian2_img,
    present_address,
    permanent_address,
    presentcity,
    presentdistrict,
    presentstreet,
    permanentdistrict,
    permanentcity,
    permanentstreet,
    father_contact,
    father_email,
    mother_contact,
    mother_email,
    emergency_contact1,
    sms_contact1,
    relation1,
    emergency_contact2,
    relation2,
    sms_contact2,
    who_will_pay,
    pay_relation,
    employee_student,
    sibling1,
    sibling2,
    sibling3,
    sibling4,
    sibling5,
    note,
  } = req.body;

  var filename = "";
  var filename2 = "";
  var filename3 = "";
  var filename4 = "";
  var filename5 = "";

   if (req.files) {
      if (req.files.student_picture) {
        const file = req.files.student_picture;
        filename = uuidv4() + file.name;
        await file.mv(publicDirectory + "/image/" + filename);
      }

      if (req.files.father_img) {
        const file = req.files.father_img;
        filename2 = uuidv4() + file.name;
        await file.mv(publicDirectory + "/image/" + filename2);
      }

      if (req.files.mother_img) {
        const file = req.files.mother_img;
        filename3 = uuidv4() + file.name;
        await file.mv(publicDirectory + "/image/" + filename3);
      }

      if (req.files.gurdian1_img) {
        const file = req.files.gurdian1_img;
        filename4 = uuidv4() + file.name;
        await file.mv(publicDirectory + "/image/" + filename4);
      }

      if (req.files.gurdian2_img) {
        const file = req.files.gurdian2_img;
        filename5 = uuidv4() + file.name;
        await file.mv(publicDirectory + "/image/" + filename5);
      }
    }

    db.query(
      "INSERT INTO admission SET ?",
      {
        ...req.body,
        student_picture: filename,
        father_img: filename2,
        mother_img: filename3,
        gurdian1_img: filename4,
        gurdian2_img: filename5,
        eligible_status: "",
        status2: 1,
        status3: 1,
        principal_approvel: "",
        pdnote: "",
      },
      (err, result) => {
        if (err) {
          return res.json({ ok: false, message: err.sqlMessage });
        }
        return res.json({ ok: true, message: "New Applicant Added" });
      }
    );;
});

router.post("/admissionformUpdate", (req, res) => {
  const { form_number, ...rest } = req.body;

  const dataToUpdate = {
    ...rest,
 
  };

  db.query(
    "UPDATE admission SET ? WHERE form_number = ?",
    [dataToUpdate, form_number],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/updateAdmissionPrincipalApprove", (req, res) => {
  const { id, principal_approvel, pdnote, form_number } = req.body;

  if (principal_approvel === "approved") {
    db.query(
      "UPDATE admission SET ? WHERE id = ?",
      [
        {
          eligible_status: 1,
          principal_approvel: principal_approvel,
          pdnote: pdnote,
        },
        id,
      ],
      (err, result) => {
        res.json({ message: true });
      }
    );

    db.query(
      "UPDATE admission_test SET ? WHERE form_number = ?",
      [{ status1: 0 }, form_number],
      (err, result) => {
        res.json({ message: true });
      }
    );
  }

  if (principal_approvel === "disapproved") {
    db.query(
      "UPDATE admission SET ? WHERE id = ?",
      [
        {
          eligible_status: 0,
          principal_approvel: principal_approvel,
          pdnote: pdnote,
        },
        id,
      ],
      (err, result) => {
        res.json({ message: true });
      }
    );

    db.query(
      "UPDATE admission_test SET ? WHERE form_number = ?",
      [{ status1: 1 }, form_number],
      (err, result) => {
        res.json({ message: true });
      }
    );
  }
});

router.post("/updateadmissionform", (req, res) => {
  const {
    id,
    form_number,
    submission_date,
    student_name,
    applyforclass,
    age,
    dob,
    gender,
    pob,
    nationality,
    religion,
    birthCertificate,
    passport_number,
    student_picture,
    currentschool,
    sdate,
    sgrade,
    fdate,
    fgrade,
    language,
    previousSchool,
    psdate,
    psgrade,
    pfdate,
    pfgrade,
    planguage,
    previousSchool1,
    psdate1,
    psgrade1,
    pfdate1,
    pfgrade1,
    planguage1,
    previousSchool2,
    psdate2,
    psgrade2,
    pfdate2,
    pfgrade2,
    planguage2,
    physical_disability,
    partially_signted,
    hearing_imparment,
    mobility_difficulties,
    mental_health,
    blood_group,
    others,
    mremarks,
    father_name,
    father_occupation,
    father_education,
    father_nidPass,
    father_tin,
    mother_name,
    mother_occupation,
    mother_education,
    mother_nidPass,
    mother_tin,
    guardianName1,
    grelation1,
    guardianName2,
    grelation2,
    father_img,
    mother_img,
    gurdian1_img,
    gurdian2_img,
    present_address,
    permanent_address,
    father_contact,
    father_email,
    mother_contact,
    mother_email,
    emergency_contact1,
    sms_contact1,
    relation1,
    emergency_contact2,
    relation2,
    sms_contact2,
    who_will_pay,
    pay_relation,
    employee_student,
    sibling1,
    sibling2,
    sibling3,
    note,
  } = req.body;

  if (req.files !== null) {
    if (req.files.student_picture !== undefined) {
      var file = req.files.student_picture;
      var filename = uuidv4() + file.name;
      file.mv(publicDirectory + "/image/" + filename, (err) => {
        if (err) {
          res.json({ message: err });
        } else {
          res.json({ message: true });
        }
      });
    }

    if (req.files.father_img !== undefined) {
      var file = req.files.father_img;
      var filename2 = uuidv4() + file.name;
      file.mv(publicDirectory + "/image/" + filename2, (err) => {
        if (err) {
          res.json({ message: err });
        } else {
          res.json({ message: true });
        }
      });
    }
    if (req.files.mother_img !== undefined) {
      var file = req.files.mother_img;
      var filename3 = uuidv4() + file.name;
      file.mv(publicDirectory + "/image/" + filename3, (err) => {
        if (err) {
          res.json({ message: err });
        } else {
          res.json({ message: true });
        }
      });
    }
    if (req.files.gurdian1_img !== undefined) {
      var file = req.files.gurdian1_img;
      var filename4 = uuidv4() + file.name;
      file.mv(publicDirectory + "/image/" + filename4, (err) => {
        if (err) {
          res.json({ message: err });
        } else {
          res.json({ message: true });
        }
      });
    }
    if (req.files.gurdian2_img !== undefined) {
      var file = req.files.gurdian2_img;
      var filename5 = uuidv4() + file.name;
      file.mv(publicDirectory + "/image/" + filename5, (err) => {
        if (err) {
          res.json({ message: err });
        } else {
          res.json({ message: true });
        }
      });
    }
  }

  db.query(
    "UPDATE admission SET ? WHERE id = ?",
    [
      {
        form_number,
        submission_date,
        student_name,
        applyforclass,
        age,
        dob,
        gender,
        pob,
        nationality,
        religion,
        birthCertificate,
        passport_number,
        student_picture: filename,
        currentschool,
        sdate,
        sgrade,
        fdate,
        fgrade,
        language,
        previousSchool,
        psdate,
        psgrade,
        pfdate,
        pfgrade,
        planguage,
        previousSchool1,
        psdate1,
        psgrade1,
        pfdate1,
        pfgrade1,
        planguage1,
        previousSchool2,
        psdate2,
        psgrade2,
        pfdate2,
        pfgrade2,
        planguage2,
        physical_disability,
        partially_signted,
        hearing_imparment,
        mobility_difficulties,
        mental_health,
        blood_group,
        others,
        mremarks,
        father_name,
        father_occupation,
        father_education,
        father_nidPass,
        father_tin,
        mother_name,
        mother_occupation,
        mother_education,
        mother_nidPass,
        mother_tin,
        guardianName1,
        grelation1,
        guardianName2,
        grelation2,
        father_img: filename2,
        mother_img: filename3,
        gurdian1_img: filename4,
        gurdian2_img: filename5,
        present_address,
        permanent_address,
        father_contact,
        father_email,
        mother_contact,
        mother_email,
        emergency_contact1,
        sms_contact1,
        relation1,
        emergency_contact2,
        relation2,
        sms_contact2,
        who_will_pay,
        pay_relation,
        employee_student,
        sibling1,
        sibling2,
        sibling3,
        note,
      },
      id,
    ],
    (err, result) => {
      if (result.length == 0) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/admissiontestresult", (req, res) => {
  const {
    session,
    test_date,
    form_number,
    student_first_name,
    student_last_name,
    apply_class,
    selectedClass,
    age,
    testsheet,
    testsheetPDF,
    teacher_comment,
    teacher_comment_arabic,
    stad_feedback,
    subjectData
  } = req.body;
  const parseData = JSON.parse(subjectData);

  if (
    !test_date ||
    !form_number ||
    !student_first_name ||
    !student_last_name ||
    !apply_class ||
    !age
  ) {
    return res.status(400).json({ message: "All fields are mandatory." });
  }

  let filename = null;
  let filename2 = null;

  // File handling
  if (req.files !== null) {
    if (req.files.testsheet !== undefined) {
      const file = req.files.testsheet;
      filename = uuidv4() + file.name;
      file.mv(publicDirectory + "/image/" + filename, (err) => {
        if (err) {
          return res.status(500).json({ message: err });
        }
      });
    }

    if (req.files.testsheetPDF !== undefined) {
      const file = req.files.testsheetPDF;
      filename2 = uuidv4() + file.name;
      file.mv(publicDirectory + "/image/" + filename2, (err) => {
        if (err) {
          return res.status(500).json({ message: err });
        }
      });
    }
  }

  // Insert the main admission test record
  db.query(
    "INSERT INTO admission_test SET ?",
    {
      session,
      test_date,
      form_number,
      student_first_name,
      student_last_name,
      apply_class,
      selectedClass,
      age,
      testsheet: filename,
      testsheetPDF: filename2,
      teacher_comment,
      teacher_comment_arabic,
      stad_feedback,
      status1: 1,
      status2: 1,
      status3: 1,
    },
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: err });
      }

      const admissionTestId = result.insertId;

      // Prepare values for inserting subjects
      const values = parseData.map((item) => [
        admissionTestId, // Link to admission_test table
        item.subject,
        item.obtain,
        item.marks
      ]);

      // Insert subject data for the admission test
      db.query(
        "INSERT INTO admission_test_subjects (admission_test_id, subject, obtained_marks, total_marks) VALUES ?",
        [values],
        (err2) => {
          if (err2) {
            return res.status(500).json({ message: err2 });
          }

          res.json({ message: true });
        }
      );
    }
  );
});


router.post("/getAdmissionTestResult", (req, res) => {
  db.query(`
    SELECT 
      at.*,
      a.gender,
      SUM(ats.obtained_marks) as marks
    FROM admission_test as at 
    JOIN admission_test_subjects as ats 
      ON ats.admission_test_id = at.id 
    JOIN admission as a 
      ON a.form_number = at.form_number
    GROUP BY at.id
  `, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json({ message: result });
  });
});


router.post("/getAdmissionTestResultEligible", (req, res) => {
  db.query("SELECT *FROM admission_test WHERE status1=1", (err, result) => {
    res.json({ message: result });
  });
});

// router.post("/getAdmissionTestResultByid", (req, res) => {
//   const { id } = req.body;
//   db.query(`
//   SELECT at.*,a.principal_approvel,a.pdnote FROM admission_test as at
//   join admission_test_subjects as ats on ats.admission_test_id=at.id
// JOIN admission AS a on a.form_number=at.form_number
// where at.id=?
//   `, id, (err, result) => {
//     res.json({ message: result });
//   });
// });
router.post("/getAdmissionTestResultByid", (req, res) => {
  const { id } = req.body;

  db.query(`
    SELECT at.*, a.principal_approvel, a.pdnote, ats.subject, ats.obtained_marks, ats.total_marks 
    FROM admission_test AS at
    JOIN admission_test_subjects AS ats ON ats.admission_test_id = at.id
    JOIN admission AS a ON a.form_number = at.form_number
    WHERE at.id = ?
  `, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: err });
    }

    // If the result is empty, return a proper response
    if (result.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    // Structure the response with admission test and subjects
    const admissionTestResult = {
      admissionTest: result[0], // the main admission test data
      subjects: result.map((row) => ({
        subject: row.subject,
        obtained_marks: row.obtained_marks,
        total_marks: row.total_marks,
      }))
    };

    res.json({ message: admissionTestResult });
  });
});

router.post("/deleteAdmissionTestResultByid", (req, res) => {
  const { id } = req.body;
  db.query("DELETE FROM admission_test WHERE id = ?", id, (err, result) => {
    res.json({ message: true });
  });
});
router.post("/getApplientViewByid", (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM admission WHERE id = ?", id, (err, result) => {
    res.json({ message: result });
  });
});

router.post("/addHouse", (req, res) => {
  const { house, session } = req.body;
  db.query(
    "INSERT INTO house SET ?",
    { housename: house, session, pstatus: "" },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/getHouse", (req, res) => {
  db.query("SELECT *FROM house", (err, result) => {
    res.json({ message: result });
  });
});
router.post("/getApprovedHouse", (req, res) => {
  db.query("SELECT *FROM house WHERE pstatus=1", (err, result) => {
    res.json({ message: result });
  });
});
router.post("/getHouseforapprovel", (req, res) => {
  db.query("SELECT *FROM house WHERE pstatus=''", (err, result) => {
    res.json({ message: result });
  });
});
router.post("/getHouseById", (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM house WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
});
router.post("/UpdateHouseById", (req, res) => {
  const { id, housename, session } = req.body;
  db.query(
    "UPDATE house SET ? WHERE id = ?",
    [{ housename: housename, session: session }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});
router.post("/approveHouseById", (req, res) => {
  const { id, status } = req.body;
  db.query(
    "UPDATE house SET ? WHERE id = ?",
    [{ pstatus: status }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/addCategory", (req, res) => {
  const { catname } = req.body;
  db.query(
    "INSERT INTO student_category SET ?",
    { category_name: catname, pstatus: "" },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/getCategory", (req, res) => {
  db.query("SELECT *FROM student_category", (err, result) => {
    res.json({ message: result });
  });
});

router.post("/getCategoryforprincipal", (req, res) => {
  db.query("SELECT *FROM student_category WHERE pstatus=''", (err, result) => {
    res.json({ message: result });
  });
});

router.post("/getCategoryById", (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM student_category WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
});

router.post("/UpdateCategoryById", (req, res) => {
  const { id, catname } = req.body;
  db.query(
    "UPDATE student_category SET ? WHERE id = ?",
    [{ category_name: catname }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});
router.post("/CategoryApprove", (req, res) => {
  const { id, status } = req.body;
  db.query(
    "UPDATE student_category SET ? WHERE id = ?",
    [{ pstatus: status }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/getEligiblestudent", (req, res) => {
  const { session } = req.body;

  const query = `
    SELECT 
      a.*, 
      cn.class_name AS approvedclass 
    FROM 
      admission AS a 
      LEFT JOIN admission_test AS at ON at.form_number = a.form_number 
      LEFT JOIN class_name AS cn ON cn.id = at.selectedClass 
    WHERE 
      a.eligible_status = 1 
      AND a.session = ?
  `;

  db.query(query, [session], (err, result) => {
    if (err) {
      console.error("Error fetching eligible students:", err);
      return res.status(500).json({ error: "Database query failed" });
    }

    res.json({ message: result });
  });
});



router.post("/getPendingStudent", (req, res) => {
  db.query("SELECT * FROM `student` WHERE principal_approve != 'Approved' AND isEnrolled = 'false' ", (err, result) => {
    res.json({ message: result });
  });
});


router.post("/addHalaqa", (req, res) => {
  const { ostad, halaqaNumber, roomNo, startDate, session, campus } = req.body;

  // Check for missing fields
  if (!ostad || !halaqaNumber || !roomNo || !startDate || !session || !campus) {
    return res.json({ message: req.body, info: "All fields are required" });
  }

  db.query(
    "SELECT * FROM hifz_spr WHERE halaqaNumber = ?",
    [halaqaNumber],
    (err, results) => {
      if (err) {
        return res.json({
          message: false,
          info: `Error checking duplicate: ${err.message}`,
        });
      }

      if (results.length > 0) {
        return res.json({ message: false, info: "Duplicate entry" });
      }

      const halaqaData = {
        ostad,
        halaqaNumber,
        roomNo,
        startDate,
        session,
        campus,
        create_date: dhakaTime,
      };

      db.query("INSERT INTO hifz_spr SET ?", halaqaData, (err, result) => {
        if (err) {
          return res.json({
            message: false,
            info: `Error inserting data: ${err.message}`,
          });
        }
        return res.json({ message: true, info: "Data Added Successfully" });
      });
    }
  );
});

router.post("/deleteHifzSpr", (req, res) => {
  const { id } = req.body;
  db.query("DELETE FROM hifz_spr WHERE id = ?", [id], (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
});

// router.post("/updateHifzSpr", (req, res) => {
//   const { id, ostad, halaqaNumber, roomNo, startDate } = req.body;
//   db.query(
//     "UPDATE hifz_spr SET ? WHERE id = ?",
//     [{ ostad, halaqaNumber, roomNo, startDate, update_date: dhakaTime }, id],
//     (err, result) => {
//       if (err) {
//         res.json({ message: err });
//       } else {
//         res.json({ message: true });
//       }
//     }
//   );
// });



// router.post("/updateHifzSpr", (req, res) => {
//   const { id, ostad, halaqaNumber, roomNo, startDate } = req.body;
  
//   db.query("SELECT halaqaNumber FROM hifz_spr WHERE id = ?", [id], (err, rows) => {
//     if (err) return res.json({ message: err });

//     if (rows.length === 0) {
//       return res.json({ message: "No record found" });
//     }

//     const oldHalaqaNumber = rows[0].halaqaNumber;

//     db.query(
//       "UPDATE hifz_spr_students SET halaqaNumber = ? WHERE halaqaNumber = ?",
//       [halaqaNumber, oldHalaqaNumber],
//       (err2, result2) => {
//         if (err2) return res.json({ message: err2 });
  
//         db.query(
//           "UPDATE hifz_spr SET ? WHERE id = ?",
//           [{ ostad, halaqaNumber, roomNo, startDate, update_date: dhakaTime }, id],
//           (err3, result3) => {
//             if (err3) {
//               return res.json({ message: err3 });
//             }
//             res.json({ message: true });
//           }
//         );
//       }
//     );
//   });
// });



router.post("/updateHifzSpr", (req, res) => {
  const { id, ostad, halaqaNumber, roomNo, startDate } = req.body;
  
  db.query("SELECT halaqaNumber FROM hifz_spr WHERE id = ?", [id], (err, rows) => {
    if (err) return res.json({ message: err });

    if (rows.length === 0) {
      return res.json({ message: "No record found" });
    }

    const oldHalaqaNumber = rows[0].halaqaNumber;

db.query(
  "UPDATE hifz_spr_students SET halaqaNumber = ? WHERE halaqaNumber = ?",
  [halaqaNumber, oldHalaqaNumber],
  (err2, result2) => {
    if (err2) return res.json({ message: err2 });

    // ✅ Update hifz_daily_progress table
    db.query(
      "UPDATE hifz_daily_progress SET halakah_id = ? WHERE halakah_id = ?",
      [halaqaNumber, oldHalaqaNumber],
      (errDP, resultDP) => {
        if (errDP) return res.json({ message: errDP });

        // ✅ Finally update main table
        db.query(
          "UPDATE hifz_spr SET ? WHERE id = ?",
          [{ ostad, halaqaNumber, roomNo, startDate, update_date: dhakaTime }, id],
          (err3, result3) => {
            if (err3) {
              return res.json({ message: err3 });
            }
            res.json({ message: true });
          }
        );
      }
    );
  }
);
  });
});


router.post("/getHifzSpr", (req, res) => {
  const { campus, session } = req.body;

  if (!campus || !session) {
    return res.json({
      message: false,
      info: "Campus and session are required",
    });
  }

  const query = `
    SELECT 
      h.*, 
      COUNT(s.id) AS student_count 
    FROM 
      hifz_spr h 
    LEFT JOIN 
      hifz_spr_students s 
    ON 
      h.halaqaNumber = s.halaqaNumber 
    WHERE 
      h.campus = ? 
      AND h.session = ? 
    GROUP BY 
      h.id
  `;

  db.query(query, [campus, session], (err, results) => {
    if (err) {
      return res.json({
        message: false,
        info: `Error fetching data: ${err.message}`,
      });
    }

    res.json({ message: results });
  });
});

router.post("/HifzSprApprove", (req, res) => {
  const { id, status, note } = req.body;
  db.query(
    "UPDATE hifz_spr SET ? WHERE id = ?",
    [{ pstatus: status, pnote: note }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});


router.post("/addHifzSprStudent", (req, res) => {
  const {
    halaqaNumber,
    student_name,
    student_id,
    className,
    section,
    session,
    campus,
  } = req.body;


  db.query(
    "SELECT * FROM hifz_spr_students WHERE student_id = ? AND session = ?",
    [student_id, session],
    (err, results) => {
      if (err) {
        res.json({ message: err });
      } else {
        if (results.length > 0) {
          res.json({ message: false, info: "Duplicate entry for same session" });
        } else {
          db.query(
            "INSERT INTO hifz_spr_students SET ?",
            {
              halaqaNumber,
              student_name,
              student_id,
              className,
              section,
              session,
              campus,
              create_date: dhakaTime,
            },
            (err, result) => {
              if (err) {
                res.json({ message: err });
              } else {
                db.query(
                  "UPDATE student SET ? WHERE student_id = ?",
                  [{ hifzStatus: 1 }, student_id],
                  (err, result2) => {
                    if (err) {
                      res.json({ message: err });
                    } else {
                      res.json({
                        message: true,
                        info: "Data Added Successfully",
                      });
                    }
                  }
                );
              }
            }
          );
        }
      }
    }
  );
});


router.post("/transferHalakahStudents", (req, res) => {
  const { data, transferId } = req.body;

  try {
    const parseData = JSON.parse(data);

    if (!Array.isArray(parseData) || parseData.length === 0) {
      return res.status(400).json({ message: "Invalid student data." });
    }

    const queries = parseData.map((student) => {
      return new Promise((resolve, reject) => {
        db.query(
          "UPDATE hifz_spr_students SET halaqaNumber = ? WHERE student_id = ?",
          [transferId, student.id],
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });
    });

    Promise.all(queries)
      .then(() => res.json({ message: true }))
      .catch((error) => res.status(500).json({ message: error.message }));
  } catch (error) {
    res.status(500).json({ message: "Error parsing student data." });
  }
});

router.post("/getHifzSPRStudent", (req, res) => {
  const { session, campus } = req.body;
  db.query(
    "SELECT *FROM hifz_spr_students WHERE session=? AND campus=?",
    [session, campus],
    (err, result) => {
      res.json({ message: result });
    }
  );
});

router.post("/HifzSprStudentApprove", (req, res) => {
  const { id, status, note } = req.body;
  db.query(
    "UPDATE hifz_spr_students SET ? WHERE id = ?",
    [{ pstatus: status, pnote: note }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/HifzSprStudentStatus", (req, res) => {
  const { id, status} = req.body;
  db.query(
    "UPDATE hifz_spr_students SET ? WHERE student_id = ?",
    [{ status:status }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/addHifzStudent", (req, res) => {
  const { student_name, student_id, Class, session, section } = req.body;

  db.query(
    "SELECT * FROM hifz_student WHERE student_id = ?",
    [student_id],
    (err, results) => {
      if (err) {
        res.json({ message: err });
      } else {
        if (results.length > 0) {
          res.json({ message: false, info: "Duplicate entry" });
        } else {
          db.query(
            "INSERT INTO hifz_student SET ?",
            {
              student_name,
              student_id,
              Class,
              session,
              section,
              pstatus: "",
              pnote: "",
              status2: "",
            },
            (err, result) => {
              if (err) {
                res.json({ message: err });
              } else {
                db.query(
                  "UPDATE student SET ? WHERE student_id=?",
                  [{ status3: "true" }, student_id],
                  (err, result2) => {
                    if (err) {
                      res.json({ message: err });
                    } else {
                      res.json({
                        message: true,
                        info: "Data Added Successfully",
                      });
                    }
                  }
                );
              }
            }
          );
        }
      }
    }
  );
});

router.post("/deleteStudentClub", (req, res) => {
  const { id } = req.body;
  db.query(
    "DELETE FROM club_student WHERE student_id = ?",
    [id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/getStudentHifz", (req, res) => {
  db.query("SELECT *FROM hifz_student", (err, result) => {
    res.json({ message: result });
  });
});
router.post("/deleteHifzStudent", (req, res) => {
  const { id } = req.body;
  db.query(
    "DELETE FROM hifz_student WHERE student_id = ?",
    [id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/getStudentHifzApprovel", (req, res) => {
  db.query("SELECT *FROM hifz_student WHERE pstatus=''", (err, result) => {
    res.json({ message: result });
  });
});

router.post("/StudentHifzApprove", (req, res) => {
  const { id, status, note } = req.body;
  db.query(
    "UPDATE hifz_student SET ? WHERE id = ?",
    [{ pstatus: status, pnote: note }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/getStudentViewByid", (req, res) => {
  const { id, type } = req.body;

  if (!id || !type) {
    return res.status(400).json({ error: 'Missing id or type in request body.' });
  }

  if (type !== 'regular' && type !== 'alumni') {
    return res.status(400).json({ error: 'Invalid type provided.' });
  }

  const tableName = type === 'regular' ? 'student' : 'alumni_student';

  db.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }

    res.status(200).json({ message: result });
  });
});


router.post("/getStudentViewByidAdmincard", (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM student WHERE student_id = ?", id, (err, result) => {
    res.json({ message: result });
  });
});

router.post("/getStudentForPrincipalAprrovel", (req, res) => {
  db.query(
    "SELECT *FROM student WHERE principal_approve = ''",
    (err, result) => {
      res.json({ message: result });
    }
  );
});

router.post("/ApprovePrincipalApproveStudent", (req, res) => {
  const { id, principal_approve, note } = req.body;
  db.query(
    "UPDATE student SET ? WHERE id = ?",
    [{ principal_approve: principal_approve, principal_note: note }, id],
    (err, result) => {
      res.json({ message: "submitted" });
    }
  );
});

router.post("/getStudentIDCardViewByid", (req, res) => {
  const { student_id } = req.body;
  db.query(
    "SELECT *FROM student WHERE student_id = ?",
    student_id,
    (err, result) => {
      res.json({ message: result });
    }
  );
});
router.post("/getEligibleStudentIDCardViewByid", (req, res) => {
  const { student_id } = req.body;
  db.query("SELECT *FROM Eligible_admit_card WHERE student_id = ?",student_id,(err, result) => {
      res.json({ message: result });
    });
});

router.post("/getEligibleStudentViewByid", (req, res) => {
  const { id } = req.body;
  db.query(
    "SELECT *FROM student WHERE id = ? AND eligible=1",
    id,
    (err, result) => {
      res.json({ message: result });
    }
  );
});
router.post("/getAllEligibleStudent", (req, res) => {
  db.query(
    "SELECT *FROM student WHERE id = ? AND eligible=1",
    id,
    (err, result) => {
      res.json({ message: result });
    }
  );
});

router.post("/addClub", (req, res) => {
  const { session, club_name } = req.body;
  db.query(
    "INSERT INTO club SET ?",
    { session, club_name, status: "" },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/getClub", (req, res) => {
  db.query("SELECT *FROM club", (err, result) => {
    res.json({ message: result });
  });
});

router.post("/getClubApprovel", (req, res) => {
  db.query("SELECT *FROM club WHERE status=''", (err, result) => {
    res.json({ message: result });
  });
});

router.post("/approveClubById", (req, res) => {
  const { id, status } = req.body;
  db.query(
    "UPDATE club SET ? WHERE id = ?",
    [{ status: status }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/addStudentClub", (req, res) => {
  const { club_name, student_id, student_name, class_std, section, session } =
    req.body;
  db.query(
    "INSERT INTO club_student SET ?",
    {
      club_name,
      student_id,
      student_name,
      class_std,
      section,
      session,
      status1: 0,
      status2: 0,
    },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        db.query(
          "UPDATE student SET ? WHERE student_id=?",
          [{ status2: "true" }, student_id],
          (err, result2) => {
            res.json({ message: true });
          }
        );
      }
    }
  );
});

// router.post("/getStudentClub", (req, res) => {
//   db.query("SELECT *FROM club_student", (err, result) => {
//     res.json({ message: result });
//   });
// });






router.post("/getStudentClub", (req, res) => {
  const query = `
    SELECT 
      h.*, 
      sa.*
    FROM 
      club_student h
    INNER JOIN 
      student sa 
        ON sa.student_id = h.student_id
    ORDER BY 
      h.id DESC
  `;

  db.query(query, (err, result) => {
    if (err) {
      return res.json({ message: false, error: err });
    }

    res.json({
      message: true,
      data: result,
    });
  });
});















router.post("/fetchStudentByid", (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM student WHERE id = ?", id, (err, result) => {
    res.json({ message: result });
  });
});

router.post("/fetchStudentBySTid", (req, res) => {
  const { student_id } = req.body;
  db.query(
    "SELECT *FROM student WHERE student_id = ?",
    student_id,
    (err, result) => {
      res.json({ message: result });
    }
  );
});

//exam
router.post("/deleteAdmitCard", (req, res) => {
     const { student_id } = req.body;
    db.query("DELETE FROM Eligible_admit_card WHERE student_id = ?",[student_id],(err, result) => {
       if (err) {
        res.json({ message: err });
       } else {
        res.json({ message: true });
       }
    });
});

router.post("/addEligibleStudentForExam", (req, res) => {
  const { student_id, status,note, session, compile } = req.body;

  db.query(
    "SELECT *FROM student WHERE student_id=?",
    student_id,
    (err, result) => {
      var sname =
        result[0].student_first_name + " " + result[0].student_last_name;
      var c = result[0].Class;
      var s = result[0].section;
      var g = result[0].gender;
      var fc = result[0].father_contact;
      var pic = result[0].student_picture;

      db.query(
        "INSERT INTO Eligible_admit_card SET ?",
        {
          sname: sname,
          Class: c,
          section: s,
          gender: g,
          fcontact: fc,
          pic: pic,
          student_id: student_id,
          status: status,
          note: note,
          session: session,
          compile: compile,
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
  );
});
//exam

//tmp pass

router.post("/addtmpPass", (req, res) => {
  const {
    student_id,
    sname,
    Class,
    term,
    section,
    ename,
    pstart,
    pend,
    session,
    compile,
  } = req.body;
  db.query(
    "INSERT INTO temporary_pass SET ?",
    {
      student_id,
      sname,
      Class,
      term,
      section,
      ename,
      pstart,
      pend,
      session,
      status: "",
      pnote: "",
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
});
router.post("/gettmpPassdata", (req, res) => {
  db.query("SELECT *FROM temporary_pass", (err, result) => {
    res.json({ message: result });
  });
});

router.post("/gettmpPassdataforApprovel", (req, res) => {
  db.query("SELECT *FROM temporary_pass WHERE status=''", (err, result) => {
    res.json({ message: result });
  });
});

router.post("/UpdatetmpPassdataApprovel", (req, res) => {
  const { id, status, note } = req.body;
  db.query(
    "UPDATE temporary_pass SET ? WHERE id = ?",
    [{ status: status, pnote: note }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/gettmpPassByID", (req, res) => {
  const { student_id } = req.body;
  db.query(
    "SELECT *FROM temporary_pass WHERE student_id=?",
    student_id,
    (err, result) => {
      res.json({ message: result });
    }
  );
});

// router.post("/AddTC", (req, res) => {
//   const {
//     sname,
//     Class,
//     student_id,
//     section,
//     sibling_info,
//     reason,
//     feedback,
//     status,
//     pstatus,
//     compile,
//   } = req.body;
//   db.query(
//     "INSERT INTO TCapplication SET ?",
//     {
//       sname,
//       Class,
//       student_id,
//       section,
//       sibling_info,
//       reason,
//       feedback,
//       status,
//       pstatus,
//       compile,
//     },
//     (err, result) => {
//       if (err) {
//         res.json({ message: err });
//       } else {
//         res.json({ message: true });
//       }
//     }
//   );
// });



router.post("/AddTC", (req, res) => {
  const {
    sname,
    Class,
    student_id,
    section,
    sibling_info,
    reason,
    exit_date,
    feedback,
    status,
    pstatus,
    compile,
  } = req.body;
  db.query(
    "INSERT INTO TCapplication SET ?",
    {
      sname,
      Class,
      student_id,
      section,
      sibling_info,
      reason,
      exit_date,
      feedback,
      status,
      pstatus,
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
});



router.post("/getTC", (req, res) => {
  db.query("SELECT *FROM TCapplication", (err, result) => {
    res.json({ message: result });
  });
});

router.post("/getTCById", (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM TCapplication WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
});

// router.post("/TCprincipalApprove", (req, res) => {
//   const { id } = req.body;
//   db.query(
//     "UPDATE TCapplication SET ? WHERE student_id = ?",
//     [{ pstatus: "Approved" }, id],
//     (err, result) => {
//       if (err) {
//         res.json({ message: err });
//       } else {
//         db.query(
//           "SELECT * FROM student WHERE student_id = ?",
//           [id],
//           (err, result) => {
//             if (err) {
//               res.json({ message: err });
//             } else {
//               const studentData = result[0];
//               db.query(
//                 "INSERT INTO alumni_student SET ?",
//                 [studentData],
//                 (err, result) => {
//                   if (err) {
//                     res.json({ message: err });
//                   } else {
//                     db.query(
//                       "DELETE FROM student WHERE student_id = ?",
//                       [id],
//                       (err, result) => {
//                         if (err) {
//                           res.json({ message: err });
//                         } else {
//                           res.json({ message: true });
//                         }
//                       }
//                     );
//                   }
//                 }
//               );
//             }
//           }
//         );
//       }
//     }
//   );
// });
router.post("/TCprincipalApprove", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Student ID is required" });
  }

  // Update TC application status
  db.query("UPDATE TCapplication SET pstatus = ? WHERE student_id = ?", ["Approved", id], (err) => {
    if (err) {
      console.error("Update Error:", err);
      return res.status(500).json({ message: err.message });
    }

    // Fetch student data
    db.query("SELECT * FROM student WHERE student_id = ?", [id], (err, studentResult) => {
      if (err) {
        console.error("Fetch Error:", err);
        return res.status(500).json({ message: err.message });
      }

      if (!studentResult.length) {
        return res.status(404).json({ message: "Student not found" });
      }

      let studentData = studentResult[0];

      // Remove `id` field before inserting into `alumni_student`
      const { id: _, ...insertData } = studentData;

      // Construct insert query dynamically
      const columns = Object.keys(insertData).join(", ");
      const values = Object.values(insertData);
      const placeholders = values.map(() => "?").join(", ");

      const insertQuery = `INSERT INTO alumni_student (${columns}) VALUES (${placeholders})`;

      db.query(insertQuery, values, (err) => {
        if (err) {
          console.error("Insert Error:", err);
          return res.status(500).json({ok:false, message: err.message });
        }

        // Delete student from `student` table
        db.query("DELETE FROM student WHERE student_id = ?", [id], (err) => {
          if (err) {
            console.error("Delete Error:", err);
            return res.status(500).json({ok:false, message: err.message });
          }

          res.json({ ok:true, message: "Student Exit completed" });
        });
      });
    });
  });
});

router.post("/TCreturnStudent", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Student ID is required" });
  }

  // Fetch alumni student data
  db.query("SELECT * FROM alumni_student WHERE student_id = ?", [id], (err, alumniResult) => {
    if (err) {
      console.error("Fetch Alumni Error:", err);
      return res.status(500).json({ message: err.message });
    }

    if (!alumniResult.length) {
      return res.status(404).json({ message: "Alumni student not found" });
    }

    const alumniData = alumniResult[0];

    // Remove `id` field if exists (auto-increment primary key)
    const { id: _, ...insertData } = alumniData;

    const columns = Object.keys(insertData).join(", ");
    const values = Object.values(insertData);
    const placeholders = values.map(() => "?").join(", ");

    const insertQuery = `INSERT INTO student (${columns}) VALUES (${placeholders})`;

    // Insert back into student table
    db.query(insertQuery, values, (err) => {
      if (err) {
        console.error("Reinsert Error:", err);
        return res.status(500).json({ ok: false, message: err.message });
      }

    //   Delete from alumni_student table
      db.query("DELETE FROM alumni_student WHERE student_id = ?", [id], (err) => {
        if (err) {
          console.error("Delete Alumni Error:", err);
          return res.status(500).json({ ok: false, message: err.message });
        }
      res.json({ ok: true, message: "Student returned to active list" });
        
      });

    });
  });
});



// TC alumni studtent

router.post("/getAlumni", (req, res) => {
  const { campus } = req.body;
  
  db.query("SELECT * FROM alumni_student WHERE campus = ?", [campus], (err, result) => {
    res.json({ message: result });
  });
});

router.get("/stadTest", (req, res) => {
  res.send("stad");
});

module.exports = router;



//server.roohschool.edu.bd
// 7qcqZQ7FTm46TWA?