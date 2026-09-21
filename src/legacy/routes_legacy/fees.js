const express = require("express");
const router = express.Router();
const cors = require("cors");
const mysql = require("mysql");
const crypto = require('crypto');
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { sendNotification } = require("../notification");
const publicDirectory = path.join(__dirname, '../public');
const cron = require("node-cron");
const { SMS_API_URL,SMS_API_KEY,SMS_SECRET_KEY,SMS_CALLER_ID } = require("../secret");

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

function getMonthName(dateString) {
  const date = new Date(dateString + "-01");
  const options = { month: "long" };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

const processPayment = async (studentId, paymentAmount, mode, account_id,trxId) => {
    // Promise wrapper for db.query
    const query = (sql, params) => {
        return new Promise((resolve, reject) => {
            db.query(sql, params, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    };
    const currentDate=new Date().toISOString().slice(0, 10);
    const paymentId = Math.floor(1000000 + Math.random() * 9000000);
    try {
        const fees = await query('SELECT * FROM fees_collection WHERE student_id = ? ORDER BY due_date', [studentId]);

        if (!fees || fees.length === 0) {
            return { ok: false, message: "No fees found for the given student ID." };
        }

        let remainingPayment = paymentAmount;
        let paymentData = [];

         for (const fee of fees) {
            if (remainingPayment <= 0) break;

            // Calculate the payable amount considering the discount and fine
            const discountedAmount = +fee.amount - +fee.discount;
            const amountDue = discountedAmount + +fee.fine - +fee.paid;

            if (amountDue <= 0) continue; // Skip if this fee is already fully paid
            const trxId = uuidv4();
            let paymentData;

            if (remainingPayment >= amountDue) {
                // Pay off this fee completely
                remainingPayment -= amountDue;
                paymentData = {
                    payment_id: paymentId,
                    session: fee.session,
                    type: 'income',
                    ptype: 'fees collection',
                    fees_id: fee.id,
                    campus: 'YourCampus',
                    phead: fee.feesType,
                    payment_for: studentId,
                    note: fee.fees_info,
                    amount: amountDue,
                    mode: mode,
                    account_id: account_id,
                    status: '1',
                    status2: '1',
                    verified: '',
                    trxId,
                    date: currentDate,
                    compile: 'YourCompile'
                };
                await query('UPDATE fees_collection SET paid = ?, balance = ?, paymentStatus = ?, payment_id = ?, payment_date = ?,payment_mode=?,trxID = ? WHERE id = ?', [
                    +fee.paid + +amountDue,
                    0,
                    'fullPaid',
                    paymentId,
                    currentDate,
                    mode,
                    trxId,
                    fee.id
                ]);
            } else {
                // Partially pay this fee
                paymentData = {
                    payment_id: paymentId,
                    session: fee.session,
                    type: 'income',
                    ptype: 'fees collection',
                    campus: 'YourCampus',
                    phead: fee.feesType,
                    payment_for: studentId,
                    note: fee.fees_info,
                    amount: remainingPayment,
                    mode: mode,
                    account_id: account_id,
                    status: '1',
                    status2: '1',
                    verified: '',
                    trxId,
                    date: currentDate,
                    compile: 'YourCompile'
                };
                await query('UPDATE fees_collection SET paid = ?, balance = ?, paymentStatus = ?, payment_id = ?, payment_date = ?,payment_mode=?,trxID = ? WHERE id = ?', [
                    +fee.paid + +remainingPayment,
                    +amountDue - +remainingPayment,
                    'halfPaid',
                    paymentId,
                    currentDate,
                    mode,
                    trxId,
                    fee.id
                ]);
                remainingPayment = 0;
            }

            await query('INSERT INTO payment SET ?', paymentData);
        }

        return { ok: true, message: 'Payment processed successfully.' };
    } catch (error) {
        console.error(error);
        return { ok: false, message: 'An error occurred while processing the payment.', details: error.message };
    }
};

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


router.post("/send-due-report-sms", async (req, res) => {
  const { students } = req.body; // feesData array from frontend

  const query = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

  try {
    if (!students || students.length === 0) {
      return res.status(400).json({ ok: false, message: "No students provided" });
    }

   
    const studentDueMap = new Map();
    for (const row of students) {
      const sid = row.student_id;
      const amount = Number(row.section_due_amount) || 0;
      if (!studentDueMap.has(sid)) {
        studentDueMap.set(sid, {
          student_name: row.student_name,
          totalDue: 0,
        });
      }
      studentDueMap.get(sid).totalDue += amount;
    }

    const uniqueStudentIds = Array.from(studentDueMap.keys());

   
    const studentContacts = await query(
      `SELECT student_id, father_contact FROM student WHERE student_id IN (?)`,
      [uniqueStudentIds]
    );

    const contactMap = new Map(
      studentContacts.map((s) => [s.student_id, s.father_contact])
    );

    let sentCount = 0;

   
    for (const [studentId, info] of studentDueMap.entries()) {
      const contact = contactMap.get(studentId);
      if (!contact || info.totalDue <= 0) continue;

    const smsText = `Dear Guardian, total due fee for ${info.student_name} (${studentId}) is Tk ${info.totalDue}. Please pay as soon as possible. Thank you.`;

      try {
        sendFeesSms(contact, smsText);
        sentCount++;
      } catch (err) {
        console.warn("SMS failed for", studentId, err.message);
      }
    }

    res.json({ ok: true, message: "SMS sent", sentCount });
  } catch (error) {
    console.error("send-due-report-sms error:", error);
    res.status(500).json({ ok: false, message: "Failed to send SMS", error: error.message });
  }
});

router.post("/addFeesCollection", (req, res) => {
  const {
    student_id,
    fees_info,
    feesType,
    due_date,
    amount,
    payment_mode,
    accAccount,
    payment_date,
    discount,
    fine,
    paid,
    balance,
    paymentStatus,
    advancePayment,
    session,
    compile,
  } = req.body;

  const paymentId = Math.floor(1000000 + Math.random() * 9000000);

  if (!student_id || !fees_info || !feesType || !due_date || !amount || !payment_mode || !payment_date) {
    return res.status(400).json({ message: false, info: "Missing required fields" });
  }

  // Start a transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return res.status(500).json({ message: "Error occurred", details: err.message });
    }

    // Check for duplicate entry
    db.query(
      "SELECT * FROM fees_collection WHERE student_id = ? AND due_date = ? AND fees_info = ? AND feesType = ?",
      [student_id, due_date, fees_info, feesType],
      (err, existingEntries) => {
        if (err) {
          db.rollback(() => {
            console.error("Error querying fees_collection:", err);
            return res.status(500).json({ message: "Error occurred", details: err.message });
          });
        } else if (existingEntries.length > 0) {
          db.rollback(() => {
            return res.status(400).json({ message: false, info: "Duplicate entry" });
          });
        } else {
          // Insert new fees collection record
          db.query(
            "INSERT INTO fees_collection SET ?",
            {
              student_id,
              fees_info,
              feesType,
              due_date,
              amount,
              payment_id: paymentId,
              payment_mode,
              payment_date,
              discount,
              fine:0,
              paid,
              balance,
              paymentStatus,
              advancePayment,
              status2: 1,
              status3: 0,
              session,
              compile,
            },
            (err) => {
              if (err) {
                db.rollback(() => {
                  console.error("Error inserting into fees_collection:", err);
                  return res.status(500).json({ message: "Error occurred", details: err.message });
                });
              } else {
                // If payment is made, insert payment record
                if (parseFloat(paid) !== 0) {
                  const paymentData = {
                    payment_id: paymentId,
                    session,
                    type: "income",
                    ptype: "fees collection",
                    campus: "YourCampus", // Replace with actual campus if needed
                    phead: feesType,
                    payment_for: student_id,
                    note: fees_info,
                    amount: paid,
                    mode: payment_mode,
                    account_id: accAccount,
                    status: "1",
                    status2: "1",
                    verified: "", // Adjust if necessary
                    date: new Date().toISOString().slice(0, 10),
                    compile,
                  };

                  db.query("INSERT INTO payment SET ?", paymentData, (err) => {
                    if (err) {
                      db.rollback(() => {
                        console.error("Error inserting into payment:", err);
                        return res.status(500).json({ message: "Error occurred", details: err.message });
                      });
                    } else {
                      // Update student enrollment status
                      db.query(
                        "UPDATE student SET ? WHERE student_id = ?",
                        [{ isEnrolled: "true" }, student_id],
                        (err) => {
                          if (err) {
                            db.rollback(() => {
                              console.error("Error updating student enrollment:", err);
                              return res.status(500).json({ message: "Error occurred", details: err.message });
                            });
                          } else {
                            // Commit the transaction
                            db.commit((err) => {
                              if (err) {
                                db.rollback(() => {
                                  console.error("Error committing transaction:", err);
                                  return res.status(500).json({ message: "Error occurred", details: err.message });
                                });
                              } else {
                                res.json({ message: true, info: "Fees Forwarded!" });
                              }
                            });
                          }
                        }
                      );
                    }
                  });
                } else {
                  // No payment, just commit the fees_collection insertion
                  db.commit((err) => {
                    if (err) {
                      db.rollback(() => {
                        console.error("Error committing transaction:", err);
                        return res.status(500).json({ message: "Error occurred", details: err.message });
                      });
                    } else {
                      res.json({ message: true, info: "Fees Forwarded!" });
                    }
                  });
                }
              }
            }
          );
        }
      }
    );
  });
});

router.post("/addFeesCollectionForward", async (req, res) => {
  const {
    student_id,
    fees_info,
    feesType,
    due_date,
    feesMonth,
    amount,
    session,
    compile,
  } = req.body;

  // local function to wrap db.query in a Promise
  const query = (sql, params) => {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  };

  try {
    // First, get student details
    const studentDetails = await query(
      "SELECT student.*, pli.device FROM student LEFT JOIN parent_login_information as pli ON pli.student_id = student.student_id WHERE student.student_id = ?",
      [student_id]
    );

    if (studentDetails.length === 0) {
      return res.status(404).json({ message: false, info: "Student not found" });
    }

    const studentInfo = studentDetails[0];
    const studentName = studentInfo.student_first_name;
    const className = studentInfo.Class;
    const section = studentInfo.section;
    const device = studentInfo.device;

    // Then, get applicable discount details
    const discountDetails = await query(
      "SELECT * FROM assign_discount WHERE student_id = ? AND Class = ? AND session = ? AND applicableFor = ? AND status = 1",
      [student_id, className, session, feesType]
    );

    const discountInfo = discountDetails[0];
    const discount = discountInfo
      ? discountInfo.dType === "%"
        ? (discountInfo.amount / 100) * amount
        : discountInfo.amount
      : 0;

    // Check for duplicate entry
    const existingFees = await query(
      "SELECT * FROM fees_collection WHERE student_id = ? AND feesMonth = ? AND fees_info = ? AND feesType = ?",
      [student_id, feesMonth, fees_info, feesType]
    );

    if (existingFees.length > 0) {
      return res.status(409).json({ message: false, info: "Duplicate entry" });
    }

    // Insert into fees_collection
    const insertData = {
      student_id,
      fees_info,
      feesType,
      due_date,
      feesMonth,
      amount,
      discount,
      balance: +amount - +discount,
      session,
      compile,
    };

    const result = await query("INSERT INTO fees_collection SET ?", insertData);
    const insertedId = result.insertId;

    const infoMsg = `${feesType} Forwarded for ${studentName}`;

    // Send notification
    await sendNotification(
      device||null,
      `Fees Forwarded - ${feesType} (${feesMonth})`,
      `Due Date ${due_date}`,
      "http://test.com",
      "fees",
      insertedId,
      student_id
    );

    res.status(201).json({ message: true, info: infoMsg });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});




router.post("/addStudentExtraFacility", async (req, res) => {
  const {
    student_id,
    facility_1,
    facility_2,
    facility_3,
    status,
    session,
    recurring,
    created_by,
  } = req.body;

  const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };

  const normalizeFacility = (val) => {
    if (
      val === undefined ||
      val === null ||
      val === "" ||
      val === "0" ||
      val === 0
    ) {
      return null;
    }
    return val;
  };

  try {
    // Student Exists Check
    const studentInfo = await query(
      `SELECT student_id
       FROM student
       WHERE student_id = ?`,
      [student_id]
    );

    if (studentInfo.length === 0) {
      return res.status(404).json({
        message: false,
        info: "Student not found",
      });
    }

    const f1 = normalizeFacility(facility_1);
    const f2 = normalizeFacility(facility_2);
    const f3 = normalizeFacility(facility_3);

    // Duplicate Check
    const existing = await query(
      `SELECT id
       FROM student_extra_facilities
       WHERE student_id = ?`,
      [student_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: false,
        info: "Extra facility already assigned. Please use update.",
      });
    }

    // Insert New Record
    await query(
      `INSERT INTO student_extra_facilities
      (
        student_id,
        facility_1,
        facility_2,
        facility_3,
        status,
        session,
        recurring,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?,?)`,
      [
        student_id,
        f1,
        f2,
        f3,
        status,
        session,
        recurring,
        created_by,
      ]
    );

    return res.status(201).json({
      message: true,
      info: "Student extra facilities assigned successfully",
    });
  } catch (err) {
    console.error("Extra Facility Error:", err);

    return res.status(500).json({
      message: false,
      info: err.message,
    });
  }
});

router.post("/UpdateStudentExtraFacility", async (req, res) => {
  const {
    student_id,
    facility_1,
    facility_2,
    facility_3,
    status,
    recurring,
    session,
    updated_by
  } = req.body;

  const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };

  const normalizeFacility = (val) => {
    if (
      val === undefined ||
      val === null ||
      val === "" ||
      val === "0" ||
      val === 0
    ) {
      return null;
    }
    return val;
  };

  try {
    // Student Check
    const studentInfo = await query(
      `SELECT student_id FROM student WHERE student_id = ?`,
      [student_id]
    );

    if (studentInfo.length === 0) {
      return res.status(404).json({
        message: false,
        info: "Student not found",
      });
    }

    const f1 = normalizeFacility(facility_1);
    const f2 = normalizeFacility(facility_2);
    const f3 = normalizeFacility(facility_3);

    // Existing Record Check
    const existing = await query(
      `SELECT id FROM student_extra_facilities WHERE student_id = ?`,
      [student_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: false,
        info: "No facility record found for this student",
      });
    }

    // UPDATE
    await query(
      `UPDATE student_extra_facilities
       SET facility_1 = ?,
           facility_2 = ?,
           facility_3 = ?,
           status = ?,
           session = ?,
           recurring = ?,
           updated_by = ?,
           updated_at = NOW()
       WHERE student_id = ?`,
      [
        f1,
        f2,
        f3,
        status,
        session,
        recurring,
        updated_by,
        student_id,
      ]
    );

    return res.status(200).json({
      message: true,
      info: "Student extra facilities updated successfully",
    });
  } catch (err) {
    console.error("Update Extra Facility Error:", err);

    return res.status(500).json({
      message: false,
      info: err.message,
    });
  }
});

router.post("/fetchExtraFeeList", (req, res) => {
  const {
    Class,
    session,
    campus,
    searchField,
    page = 1,
    limit = 10000,
  } = req.body;

  if (!session || !campus) {
    return res.status(400).json({
      error: "Session and Campus are required.",
    });
  }

  let query = `
    SELECT
      sef.id,
      sef.student_id,

      ef1.facility_name AS facility_1,
      ef2.facility_name AS facility_2,
      ef3.facility_name AS facility_3,

      CASE
        WHEN sef.status = 1 THEN 'Active'
        ELSE 'Inactive'
      END AS status,

      s.student_first_name,
      s.student_last_name,
      s.Class,
      s.section,
      s.father_name,
      s.father_contact,
      s.mother_contact,
      s.student_picture,
      s.gender,
      s.dob

    FROM student_extra_facilities sef

    LEFT JOIN student s
      ON sef.student_id = s.student_id

    LEFT JOIN extra_facilities ef1
      ON sef.facility_1 = ef1.id

    LEFT JOIN extra_facilities ef2
      ON sef.facility_2 = ef2.id

    LEFT JOIN extra_facilities ef3
      ON sef.facility_3 = ef3.id

    WHERE s.session = ?
      AND s.campus = ?
  `;

  let countQuery = `
    SELECT COUNT(*) AS count

    FROM student_extra_facilities sef

    LEFT JOIN student s
      ON sef.student_id = s.student_id

    LEFT JOIN extra_facilities ef1
      ON sef.facility_1 = ef1.id

    LEFT JOIN extra_facilities ef2
      ON sef.facility_2 = ef2.id

    LEFT JOIN extra_facilities ef3
      ON sef.facility_3 = ef3.id

    WHERE s.session = ?
      AND s.campus = ?
  `;

  let params = [session, campus];
  let countParams = [session, campus];

  // Class Filter
  if (Class) {
    query += ` AND s.Class = ?`;
    countQuery += ` AND s.Class = ?`;

    params.push(Class);
    countParams.push(Class);
  }

  // Search Filter
  if (searchField && searchField.trim() !== "") {
    const tokens = searchField.trim().toLowerCase().split(/\s+/);

    const searchSQL = tokens
      .map(
        () => `
        (
          LOWER(s.student_first_name) LIKE ?
          OR LOWER(s.student_last_name) LIKE ?
          OR LOWER(CONCAT(s.student_first_name, ' ', s.student_last_name)) LIKE ?
          OR LOWER(s.student_id) LIKE ?
          OR LOWER(IFNULL(ef1.facility_name,'')) LIKE ?
          OR LOWER(IFNULL(ef2.facility_name,'')) LIKE ?
          OR LOWER(IFNULL(ef3.facility_name,'')) LIKE ?
        )
      `
      )
      .join(" AND ");

    query += ` AND (${searchSQL})`;
    countQuery += ` AND (${searchSQL})`;

    tokens.forEach((token) => {
      const val = `%${token}%`;

      params.push(
        val, // first name
        val, // last name
        val, // full name
        val, // student id
        val, // facility_1
        val, // facility_2
        val, // facility_3
      );

      countParams.push(
        val,
        val,
        val,
        val,
        val,
        val,
        val,
      );
    });
  }

  // Order By
  query += ` ORDER BY sef.id DESC`;

  // Pagination
  query += ` LIMIT ? OFFSET ?`;

  params.push(
    parseInt(limit),
    (parseInt(page) - 1) * parseInt(limit)
  );

  db.query(query, params, (err, result) => {
    if (err) {
      console.error("Fetch Error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: err.message,
      });
    }

    db.query(countQuery, countParams, (countErr, countResult) => {
      if (countErr) {
        console.error("Count Error:", countErr);
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: countErr.message,
        });
      }

      return res.status(200).json({
        success: true,
        count: countResult[0].count,
        page: parseInt(page),
        limit: parseInt(limit),
        message: result,
      });
    });
  });
});

router.post("/getStudentExtraFacility", (req, res) => {
  const { student_id } = req.body;

  if (!student_id) {
    return res.status(400).json({
      success: false,
      message: "Student ID is required",
    });
  }

  const query = `
    SELECT
      sef.id,
      sef.student_id,
      sef.facility_1,
      sef.facility_2,
      sef.facility_3,
      sef.status,
      sef.recurring,
      
      s.student_first_name,
      s.student_last_name,
      CONCAT(
        IFNULL(s.student_first_name,''),
        ' ',
        IFNULL(s.student_last_name,'')
      ) AS student_name,

      s.Class AS class_std,
      s.section,
      s.father_name,
      s.father_contact,
      s.mother_contact,
      s.student_picture,
      s.gender,
      s.dob

    FROM student_extra_facilities sef

    LEFT JOIN student s
      ON sef.student_id = s.student_id

    WHERE sef.student_id = ?

    LIMIT 1
  `;

  db.query(query, [student_id], (err, result) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result,
    });
  });
});

router.post("/fetchExtraFeeInfoApprovel", (req, res) => {
  db.query("SELECT *FROM extra_facilities WHERE pstatus = 0", (err, result) => {
    res.json({ message: result });
  });
});


router.post("/UpdateExtraFeeInfoApprovel", (req, res) => {
  const { id, status } = req.body;

  db.query(
    "UPDATE extra_facilities SET ? WHERE id = ?",
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

// router.post("/feesCollectionById", (req, res) => {
//   const { student_id } = req.body;

//   const query = `
//     SELECT 
//       fc.*, 
//       p.amount AS paidAmount,
//       p.account_id
//     FROM fees_collection AS fc
//     LEFT JOIN payment AS p 
//       ON fc.payment_id = p.payment_id
//     WHERE fc.student_id = ?
//   `;

//   db.query(query, [student_id], (err, result) => {
//     if (err) {
//       console.error("MySQL error:", err); 
//       return res.status(500).json({ error: err.sqlMessage }); 
//     }
//     res.json({ message: result });
//   });
// });


// router.post("/feesCollectionById", (req, res) => {
//   const { student_id } = req.body;
//   db.query(
//     "SELECT *FROM fees_collection WHERE student_id = ?",
//     student_id,
//     (err, result) => {
//       res.json({ message: result });
//     }
//   );
// });

// router.post("/feesCollectionById", (req, res) => {
//   const { student_id } = req.body;

//   const query = `
//     SELECT 
//       fc.*, 
//       p.amount AS paidAmount,
//       p.account_id
//     FROM fees_collection AS fc
//     LEFT JOIN payment AS p 
//       ON fc.payment_id = p.payment_id
//       AND fc.student_id = p.payment_for
//     WHERE fc.student_id = ?
//   `;

//   db.query(query, [student_id], (err, result) => {
//     if (err) {
//       console.error("MySQL error:", err);
//       return res.status(500).json({ error: err.sqlMessage });
//     }
//     res.json({ message: result });
//   });
// });


router.post("/feesCollectionById", (req, res) => {
  const { student_id } = req.body;
  const query = `
    SELECT 
      fc.*, 
      p.amount AS paidAmount,
      p.account_id
    FROM fees_collection AS fc
    LEFT JOIN payment AS p 
      ON fc.id = p.fees_id
      AND p.id = (
        SELECT MAX(p2.id) 
        FROM payment AS p2 
        WHERE p2.fees_id = fc.id
      )
    WHERE fc.student_id = ?
  `;
  db.query(query, [student_id], (err, result) => {
    if (err) {
      console.error("MySQL error:", err);
      return res.status(500).json({ error: err.sqlMessage });
    }
    res.json({ message: result });
  });
});


router.post("/getAllCollectedfees", (req, res) => {
  const { Class, section, startDate, endDate, feestype, session, payment_mode } = req.body;

  let queryParams = [session];
  let query = `
    SELECT 
      student.id, 
      student.student_id, 
      student.student_first_name, 
      student.student_last_name, 
      student.Class, 
      student.section, 
      student.gender, 
      student.father_contact, 
      fees_collection.payment_date,
      fees_collection.payment_id,
      fees_collection.feesType,
      fees_collection.amount,
      fees_collection.paid,
      fees_collection.discount,
      fees_collection.fine,
      fees_collection.balance,
      fees_collection.due_date,
      fees_collection.feesMonth,
      fees_collection.payment_mode
    FROM 
      student 
    INNER JOIN 
      fees_collection 
    ON 
      student.student_id = fees_collection.student_id 
    WHERE 
      fees_collection.session = ? 
      AND fees_collection.paid != 0
  `;

  // Date filter
  if (startDate && endDate) {
    if (startDate === endDate) {
      query += " AND DATE(fees_collection.payment_date) = ?";
      queryParams.push(startDate);
    } else {
      query += " AND fees_collection.payment_date BETWEEN ? AND ?";
      queryParams.push(startDate, endDate);
    }
  }

  // Class filter
  if (Class && Class.trim() !== "") {
    query += " AND student.Class = ?";
    queryParams.push(Class);
  }

  // Section filter
  if (section && section.trim() !== "") {
    query += " AND student.section = ?";
    queryParams.push(section);
  }

  // Fee type filter
  if (feestype && feestype.trim() !== "") {
    query += " AND fees_collection.feesType = ?";
    queryParams.push(feestype);
  }

  // Payment mode filter
  if (payment_mode && payment_mode.trim() !== "") {
    query += " AND fees_collection.payment_mode = ?";
    queryParams.push(payment_mode); // <-- corrected here
  }

  // Order
  query += " ORDER BY fees_collection.payment_date ASC";

  db.query(query, queryParams, (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json({ message: result });
    }
  });
});



// router.post("/getAllCollectedfees", (req, res) => {
//   const { Class, section, startDate, endDate, feestype, session } = req.body;

//   let queryParams = [session];
//   let query = `
//     SELECT 
//       student.id, 
//       student.student_id, 
//       student.student_first_name, 
//       student.student_last_name, 
//       student.Class, 
//       student.section, 
//       student.gender, 
//       student.father_contact, 
//       fees_collection.payment_date,
//       fees_collection.payment_id,
//       fees_collection.feesType,
//       fees_collection.amount,
//       fees_collection.paid,
//       fees_collection.discount,
//       fees_collection.fine,
//       fees_collection.balance,
//       fees_collection.due_date,
//       fees_collection.payment_mode
//     FROM 
//       student 
//     INNER JOIN 
//       fees_collection 
//     ON 
//       student.student_id = fees_collection.student_id 
//     WHERE 
//       fees_collection.session = ? 
//       AND fees_collection.paid != 0`;

//   if (startDate === endDate) {
//     query += " AND DATE(fees_collection.payment_date) = ?";
//     queryParams.push(startDate);
//   } else {
//     query += " AND fees_collection.payment_date BETWEEN ? AND ?";
//     queryParams.push(startDate, endDate);
//   }

//   if (Class) {
//     query += " AND student.Class = ?";
//     queryParams.push(Class);
//   }

//   if (section) {
//     query += " AND student.section = ?";
//     queryParams.push(section);
//   }

//   if (feestype) {
//     query += " AND fees_collection.feesType = ?";
//     queryParams.push(feestype);
//   }
// query += " ORDER BY fees_collection.payment_date ASC";
//   db.query(query, queryParams, (err, result) => {
//     if (err) {
//       console.error("Error executing query:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//     } else {
//       res.json({ message: result });
//     }
//   });
// });



// router.post("/getAllfeesCollectioninfoWithStudent", (req, res) => {
//   const { Class, startDate, endDate, feestype, session,month,searchQuery } = req.body;
//   let queryParams = [session];
//   let query = `
//     SELECT 
//       student.id, student.student_id, student.student_first_name, 
//       student.student_last_name, student.Class, student.section, 
//       student.gender, student.father_contact, fees_collection.* 
//     FROM student 
//     INNER JOIN fees_collection ON student.student_id = fees_collection.student_id 
//     WHERE fees_collection.session = ?`;

//   if (Class) {
//     query += " AND student.Class = ?";
//     queryParams.push(Class);
//   }

//   if (startDate && endDate) {
//     query += " AND fees_collection.create_date BETWEEN ? AND ?";
//     queryParams.push(startDate, endDate);
//   }

//   if (feestype) {
//     query += " AND fees_collection.feesType = ?";
//     queryParams.push(feestype);
//   }
//   if (month) {
//     query += " AND fees_collection.feesMonth = ?";
//     queryParams.push(month);
//   }

//   if (searchQuery) {
//     query += " AND (student.student_id LIKE ? OR CONCAT(student.student_first_name, ' ', student.student_last_name) LIKE ?)";
//     const searchPattern = `%${searchQuery}%`;
//     queryParams.push(searchPattern, searchPattern);
//   }

//   db.query(query, queryParams, (err, result) => {
//     if (err) {
//       res.status(500).json({ error: "Internal Server Error" });
//     } else {
//       res.json({ message: result });
//     }
//   });
// });



router.post("/getAllfeesCollectioninfoWithStudent", (req, res) => {
  const { Class, startDate, endDate, feestype, session, searchQuery } = req.body;
  let queryParams = [session];

  // Base query
  let query = `
    SELECT 
      student.id, student.student_id, student.student_first_name, 
      student.student_last_name, student.Class, student.section, 
      student.gender, student.father_contact,
      fees_collection.*
    FROM student 
    INNER JOIN fees_collection ON student.student_id = fees_collection.student_id 
    WHERE fees_collection.session = ?`;

  // Apply Class filter if selected
  if (Class) {
    query += " AND student.Class = ?";
    queryParams.push(Class);
  }

  // Apply date range filter if both dates provided
  if (startDate && endDate) {
    query += " AND fees_collection.create_date BETWEEN ? AND ?";
    queryParams.push(startDate, endDate);
  }

  // Apply fees type filter if selected
  if (feestype) {
    query += " AND fees_collection.feesType = ?";
    queryParams.push(feestype);
  }

  // Apply search query if provided
  if (searchQuery) {
    query += " AND (student.student_id LIKE ? OR CONCAT(student.student_first_name, ' ', student.student_last_name) LIKE ?)";
    const searchPattern = `%${searchQuery}%`;
    queryParams.push(searchPattern, searchPattern);
  }

  db.query(query, queryParams, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json({ message: result });
    }
  });
});



router.post("/getFeesbymonth", (req, res) => {
  const { feesMonth, session } = req.body;

  if (!feesMonth) {
    return res
      .status(400)
      .json({ ok: false, message: "feesMonth is required" });
  }

  if (!session) {
    return res
      .status(400)
      .json({ ok: false, message: "session is required" });
  }

 
  const monthMap = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };

  const monthNum = monthMap[feesMonth];
  if (!monthNum) {
    return res
      .status(400)
      .json({ ok: false, message: "Invalid month name provided" });
  }
  
  const [startYear, endYear] = session.split("-");

  let year;
  
  if (["07", "08", "09", "10", "11", "12"].includes(monthNum)) {
   year = startYear;
   } 
  // January (01) to June (06) â†’ start year
  else {
   year = endYear;
  }

  const formattedMonth = `${year}-${monthNum}`;
//   console.log(formattedMonth);

  
//   const year = session.split("-")[0];
//   const formattedMonth = `${year}-${monthNum}`; 

  const feesTypes = ["Examination fee","Tuition Fee","After School Hifz","Meal (Full)","Meal (Half)","Transport (Drop & Pick)","Transport (Drop)","Transport (Pick)"];
  const placeholders = feesTypes.map(() => "?").join(",");

  const query = `
    SELECT 
      feesType,
      SUM(CASE WHEN paymentStatus = 'fullPaid' THEN 1 ELSE 0 END) AS paid,
      SUM(CASE WHEN paymentStatus = 'halfPaid' THEN 1 ELSE 0 END) AS partial_paid,
      SUM(CASE WHEN paymentStatus IS NULL OR paymentStatus = '' THEN 1 ELSE 0 END) AS unpaid,
      COUNT(*) AS total
    FROM fees_collection
    WHERE feesMonth = ? AND session = ?
      AND feesType IN (${placeholders})
    GROUP BY feesType
  `;


  db.query(query, [formattedMonth, session, ...feesTypes], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ ok: false, message: "DB error", error: err });
    }

    const finalResult = feesTypes.map((type) => {
      const row = result.find((r) => r.feesType === type);
      return (
        row || {
          feesType: type,
          paid: 0,
          partial_paid: 0,
          unpaid: 0,
          total: 0,
        }
      );
    });

    res.json({
      ok: true,
      message: "Fee summary fetched successfully",
      data: finalResult,
    });
  });
});


router.post("/getAllfeesCollectioninfo", (req, res) => {
  db.query("SELECT *FROM fees_collection", (err, result) => {
    res.json({ message: result });
  });
});

function advancePupdate() {
  db.query(
    "SELECT *FROM fees_collection WHERE advancePayment='1'",
    (err, result) => {
      var cdate = new Date().toLocaleString([], { timeZone: "Asia/Dhaka" });
      result.map((item) => {
        var ddate = new Date(item.due_date).toLocaleString([], {
          timeZone: "Asia/Dhaka",
        });
        var id = item.id;
        if (ddate < cdate) {
          db.query(
            "UPDATE fees_collection SET ? WHERE id = ?",
            [{ advancePayment: 0 }, id],
            (err, result) => {
              res.json({ message: true });
            }
          );
        } else {
          res.json({ message: id });
        }
      });
    }
  );
}

router.post("/testCalcFine", (req, res) => {
  const currentDate = new Date();

  db.query("SELECT *FROM fees_collection", (err, result) => {
    for (const paymentDetails of result) {
      const dueDate = new Date(paymentDetails.due_date).toLocaleString([], {
        timeZone: "Asia/Dhaka",
      });

      if (currentDate > dueDate && paymentDetails.paymentStatus === "") {
        const oneMonthLater = new Date(
          dueDate.getFullYear(),
          dueDate.getMonth() + 1,
          dueDate.getDate()
        );

        if (currentDate > dueDate) {
          db.query(
            "UPDATE fees_collection SET ? WHERE id=?",
            [{ fine: 1000 }, paymentDetails.id],
            (err, result) => {}
          );
        } else {
          db.query(
            "UPDATE fees_collection SET ? WHERE id=?",
            [{ fine: 500 }, paymentDetails.id],
            (err, result) => {}
          );
        }
      }
    }

    res.json({ message: result });
  });
});



setInterval(advancePupdate, 500000);

// router.post("/feesCollectionApproval", (req, res) => {
//   db.query(
//     `SELECT 
//     student.student_id,
//     student.student_first_name,
//     student.student_last_name,
//     fees_collection.*,
//     p.id as paymentId
// FROM student 
// JOIN fees_collection ON student.student_id = fees_collection.student_id AND fees_collection.status2 = 1
// JOIN payment AS p ON p.payment_id = fees_collection.payment_id`,
//     (err, result) => {
//       res.json({ message: result });
//     }
//   );
// });


router.post("/feesCollectionApproval", (req, res) => {
  const sql = `
    SELECT 
      s.student_id,
      s.student_first_name,
      s.student_last_name,
      fc.*,
      p.id AS paymentId,
      p.amount AS payment_amount
    FROM student s
    JOIN fees_collection fc ON s.student_id = fc.student_id AND fc.status2 = 1
    JOIN payment p ON p.payment_id = fc.payment_id
  `;
  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json({ message: result });
  });
});


// router.post('/process-payment', async (req, res) => {
//     const { studentId, paymentAmount, mode, account_id, paymentDate,compile } = req.body;
//     const query = (sql, params) => {
//         return new Promise((resolve, reject) => {
//             db.query(sql, params, (err, result) => {
//                 if (err) reject(err);
//                 else resolve(result);
//             });
//         });
//     };
//     const paymentId = Math.floor(1000000 + Math.random() * 9000000);
//     try {
//         const fees = await query('SELECT * FROM fees_collection WHERE student_id = ? ORDER BY create_date ASC', [studentId]);

//         if (!fees || fees.length === 0) {
//             return res.status(404).json({ ok: false, message: "No fees found for the given student ID." });
//         }

//         let remainingPayment = paymentAmount;

//         for (const fee of fees) {
//             if (remainingPayment <= 0) break;
             
//             // Calculate the payable amount considering the discount and fine
//             const discountedAmount = +fee.amount - +fee.discount;
//             const amountDue = discountedAmount + +fee.fine - +fee.paid;
//             if (amountDue <= 0) continue; // Skip if this fee is already fully paid

//             let paymentData;

//             if (remainingPayment >= amountDue) {
//                 // Pay off this fee completely
//                 remainingPayment -= amountDue;
//                 paymentData = {
//                     payment_id: paymentId,
//                     session: fee.session,
//                     type: 'income',
//                     ptype: 'fees collection',
//                     campus: 'YourCampus',
//                     fees_id : fee.id,
//                     phead: fee.feesType,
//                     payment_for: studentId,
//                     note: fee.fees_info+" of "+getMonthName(fee.feesMonth),
//                     amount: amountDue,
//                     mode: mode,
//                     account_id: account_id,
//                     status: '1',
//                     status2: '1',
//                     verified: '',
//                     date: paymentDate,
//                     compile: compile
//                 };
//                 await query('UPDATE fees_collection SET paid = ?, balance = ?, paymentStatus = ?, payment_id = ?, payment_date = ?,status2=?,payment_mode=? WHERE id = ?', [
//                     +fee.paid + +amountDue,
//                     0,
//                     'fullPaid',
//                     paymentId,
//                     paymentDate,
//                     1,
//                     mode,
//                     fee.id
//                 ]);
//             } else {
//                 // Partially pay this fee
//                 paymentData = {
//                     payment_id: paymentId,
//                     session: fee.session,
//                     type: 'income',
//                     ptype: 'fees collection',
//                     campus: 'YourCampus',
//                     fees_id : fee.id,
//                     phead: fee.feesType,
//                     payment_for: studentId,
//                     note: fee.fees_info+" of "+getMonthName(fee.feesMonth),
//                     amount: remainingPayment,
//                     mode: mode,
//                     account_id: account_id,
//                     status: '1',
//                     status2: '1',
//                     verified: '',
//                     date: paymentDate,
//                     compile: compile
//                 };
//                 await query('UPDATE fees_collection SET paid = ?, balance = ?, paymentStatus = ?, payment_id = ?, payment_date = ?,status2=?,payment_mode=? WHERE id = ?', [
//                     +fee.paid + +remainingPayment,
//                     +amountDue - +remainingPayment,
//                     'halfPaid',
//                     paymentId,
//                     paymentDate,
//                     1,
//                     mode,
//                     fee.id
//                 ]);
//                 remainingPayment = 0;
//             }

//             await query('INSERT INTO payment SET ?', paymentData);
//         }

//         res.status(200).json({ ok: true, message: 'Payment processed successfully.' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'An error occurred while processing the payment.', details: error.message });
//     }
// });







router.post('/process-payment', async (req, res) => {
    const { studentId, paymentAmount, mode, account_id, paymentDate, compile } = req.body;
    const query = (sql, params) => {
        return new Promise((resolve, reject) => {
            db.query(sql, params, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    };
    const paymentId = Math.floor(1000000 + Math.random() * 9000000);
    try {
        const fees = await query('SELECT * FROM fees_collection WHERE student_id = ? ORDER BY create_date ASC', [studentId]);

        if (!fees || fees.length === 0) {
            return res.status(404).json({ ok: false, message: "No fees found for the given student ID." });
        }

        let remainingPayment = paymentAmount;
        let appliedAmount = 0;
        let monthsCollected = [];

        for (const fee of fees) {
            if (remainingPayment <= 0) break;

            const discountedAmount = +fee.amount - +fee.discount;
            const amountDue = discountedAmount + +fee.fine - +fee.paid;
            if (amountDue <= 0) continue;

            let paymentData;

            if (remainingPayment >= amountDue) {
                remainingPayment -= amountDue;
                appliedAmount += amountDue;
                monthsCollected.push(getMonthName(fee.feesMonth));

                paymentData = {
                    payment_id: paymentId,
                    session: fee.session,
                    type: 'income',
                    ptype: 'fees collection',
                    campus: 'YourCampus',
                    fees_id: fee.id,
                    phead: fee.feesType,
                    payment_for: studentId,
                    note: fee.fees_info + " of " + getMonthName(fee.feesMonth),
                    amount: amountDue,
                    mode: mode,
                    account_id: account_id,
                    status: '1',
                    status2: '1',
                    verified: '',
                    date: paymentDate,
                    compile: compile
                };
                await query('UPDATE fees_collection SET paid = ?, balance = ?, paymentStatus = ?, payment_id = ?, payment_date = ?,status2=?,payment_mode=? WHERE id = ?', [
                    +fee.paid + +amountDue,
                    0,
                    'fullPaid',
                    paymentId,
                    paymentDate,
                    1,
                    mode,
                    fee.id
                ]);
            } else {
                appliedAmount += remainingPayment;
                monthsCollected.push(getMonthName(fee.feesMonth));

                paymentData = {
                    payment_id: paymentId,
                    session: fee.session,
                    type: 'income',
                    ptype: 'fees collection',
                    campus: 'YourCampus',
                    fees_id: fee.id,
                    phead: fee.feesType,
                    payment_for: studentId,
                    note: fee.fees_info + " of " + getMonthName(fee.feesMonth),
                    amount: remainingPayment,
                    mode: mode,
                    account_id: account_id,
                    status: '1',
                    status2: '1',
                    verified: '',
                    date: paymentDate,
                    compile: compile
                };
                await query('UPDATE fees_collection SET paid = ?, balance = ?, paymentStatus = ?, payment_id = ?, payment_date = ?,status2=?,payment_mode=? WHERE id = ?', [
                    +fee.paid + +remainingPayment,
                    +amountDue - +remainingPayment,
                    'halfPaid',
                    paymentId,
                    paymentDate,
                    1,
                    mode,
                    fee.id
                ]);
                remainingPayment = 0;
            }

            await query('INSERT INTO payment SET ?', paymentData);
        }

        const remainingFeesRows = await query(
            'SELECT COALESCE(SUM(GREATEST((amount - discount) + fine - paid, 0)), 0) AS totalBalance FROM fees_collection WHERE student_id = ?',
            [studentId]
        );
        const totalBalance = remainingFeesRows[0]?.totalBalance || 0;

       
        if (appliedAmount > 0) {
            const studentResult = await query(
                'SELECT father_contact, student_first_name, student_last_name FROM student WHERE student_id = ?',
                [studentId]
            );

            if (studentResult.length > 0) {
                const { father_contact, student_first_name, student_last_name } = studentResult[0];
                const smsText = `Dear Guardian, ${appliedAmount} Tk fees payment received for ${student_first_name} ${student_last_name} (${monthsCollected.join(", ")}). Balance: ${totalBalance} Tk. Thank you.`;
                sendFeesSms(father_contact, smsText);
            }
        }

        res.status(200).json({ ok: true, message: 'Payment processed successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while processing the payment.', details: error.message });
    }
});

















router.post("/feesCollectionDueBalance", (req, res) => {
  const { Class, section, search } = req.body;

  // Basic query for class and section
  let query = "SELECT * FROM student WHERE Class = ? AND section = ?";
  let queryParams = [Class, section];

  // Add search filter if provided (search by student name or student ID)
  if (search) {
    query += " AND (student_first_name LIKE ? OR student_last_name LIKE ? OR student_id = ?)";
    queryParams.push(`%${search}%`, `%${search}%`, search);
  }

  db.query(query, queryParams, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const promises = result.map((item) => {
      const student_id = item.student_id;
      return new Promise((resolve, reject) => {
        db.query(
          "SELECT SUM(balance) AS total FROM fees_collection WHERE student_id = ?",
          student_id,
          (err, due) => {
            if (err) {
              return reject(err);
            }

            const allData = {
              id: item.student_id,
              sname: item.student_first_name + " " + item.student_last_name,
              class: item.Class,
              section: item.section,
              gender: item.gender,
              fname: item.father_name,
              due: Number(due[0]?.total || 0),
            };

            resolve(allData);
          }
        );
      });
    });

    Promise.all(promises)
      .then((elist) => {
        res.json({ message: elist });
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });
});

router.post("/getAdvanceFeesStatus", (req, res) => {
  const { student_id } = req.body;
  db.query(
    "SELECT *FROM fees_collection WHERE student_id=? AND advancePayment='1'",
    student_id,
    (err, result) => {
      if (result.length === 0) {
        res.json({ message: false });
      } else {
        res.json({ message: true });
      }
    }
  );
});

// Endpoint 1
router.post("/updateFeesCollection", (req, res) => {
  const {
    id,
    payment_mode,
    payment_date,
    paymentStatus,
    advancePayment,
    paid,
    balance,
    session,
    student_id,
    account_id,
    type
  } = req.body;
  const ran = Math.floor(100000 + Math.random() * 900000);
  const trxId = uuidv4();
  db.query(
    "UPDATE fees_collection SET ? WHERE id = ?",
    [
      {
        
        payment_id:ran,
        payment_mode,
        payment_date,
        paymentStatus,
        advancePayment,
        paid,
        balance,
        status2: 1,
        trxID:trxId,
      },
      id,
    ],
    (err, updateResult) => {
      if (err) {
        return res.json({ message: err });
      }
      
      db.query(
        "INSERT INTO payment SET ?",
        {
          payment_id: ran,
          session: session,
          type: "income",
          ptype: "fees collection",
          campus: "",
          phead: type,
          payment_for: student_id,
          note: type,
          amount: paid,
          mode: payment_mode,
          account_id: account_id,
          status: 1,
          status2: 1,
          verified: "",
          trxId,
          date: payment_date,
        },
        (err, insertResult) => {
          if (err) {
            return res.json({ message: err });
          } 
          
          res.json({ message: true, date: payment_date });
        }
      );
    }
  );
});

// Endpoint 2
// router.post("/updateFeesCollectionNew", (req, res) => {
//   const {
//     id,
//     studentId,
//     payment_mode,
//     account_id,
//     payment_date,
//     amount,
//     compile
//   } = req.body;

//   // Ensure amount is treated as an integer
//   const amountInt = parseInt(amount, 10);

//   const paymentId = Math.floor(1000000 + Math.random() * 9000000);
//     const trxId = uuidv4();
//   db.query("SELECT * FROM fees_collection WHERE id = ?", [id], (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: "Database query error", error: err });
//     }

//     if (result.length === 0) {
//       return res.status(404).json({ message: "No record found for the given ID" });
//     }

//     const existingData = result[0];

//     const paymentData = {
//       payment_id: paymentId,
//       session: existingData.session,
//       type: 'income',
//       ptype: 'fees collection',
//       campus: 'YourCampus',
//       phead: existingData.feesType,
//       fees_id : existingData.id,
//       payment_for: studentId,
//       note: existingData.fees_info+" of "+existingData.feesMonth,
//       amount: amountInt,
//       mode: payment_mode,
//       account_id: account_id,
//       status: '1',
//       status2: '1',
//       verified: '',
//       trxId,
//       date: payment_date,
//       compile: compile
//     };

//     // Insert payment data into the payment table
//     db.query("INSERT INTO payment SET ?", paymentData, (err, paymentResult) => {
//   if (err) {
//     return res.status(500).json({ message: "Failed to insert payment data", error: err });
//   }

//   // After inserting payment, fetch the current paid amount
//   db.query("SELECT * FROM fees_collection WHERE id = ?", [id], (err, feeResult) => {
//     if (err) {
//       return res.status(500).json({ message: "Failed to fetch fee collection data", error: err });
//     }

//     if (feeResult.length === 0) {
//       return res.status(404).json({ message: "Fee collection record not found" });
//     }

//     const previousPaid = feeResult[0].paid || 0;
//     const amountInt = parseInt(paymentData.amount, 10) || 0;
//     const previousPaidAmount = previousPaid + amountInt;

//     // Update the fees_collection table after getting previous paid amount
//     db.query(
//       "UPDATE fees_collection SET ? WHERE id = ?",
//       [
//         {
//           payment_id: paymentId,
//           payment_mode: payment_mode,
//           payment_date: payment_date,
//           paymentStatus: 'fullPaid',
//           paid: previousPaidAmount,
//           balance: 0,
//           status2: 1,
//           trxID: trxId,
//         },
//         id,
//       ],
//       (err, updateResult) => {
//         if (err) {
//           return res.status(500).json({ message: "Failed to update fees collection", error: err });
//         }

//         res.json({ message: true });
//       }
//     );
//   });
// });

//   });
// });

router.post("/updateFeesCollectionNew", (req, res) => {
  const {
    ids, 
    studentId,
    payment_mode,
    account_id,
    payment_date,
    compile
  } = req.body;

  let feeIds;
  try {
    feeIds = Array.isArray(ids) ? ids : JSON.parse(ids);
  } catch (e) {
    return res.status(400).json({ message: "Invalid ids" });
  }

  if (!feeIds || feeIds.length === 0) {
    return res.status(400).json({ message: "No fee ids provided" });
  }

  let totalAmount = 0;
  let monthsCollected = [];
  let index = 0;

  const processNext = () => {
    
    if (index >= feeIds.length) {
      db.query(
        "SELECT father_contact, student_first_name, student_last_name FROM student WHERE student_id = ?",
        [studentId],
        (err, studentResult) => {
          if (!err && studentResult.length > 0) {
            const { father_contact, student_first_name, student_last_name } = studentResult[0];
            const smsText = `Dear Guardian, Tk ${totalAmount} Tk fees payment received for ${student_first_name} ${student_last_name} (${monthsCollected.join(", ")}). Thank you.`;
            sendFeesSms(father_contact, smsText);
          } else if (err) {
            console.error("Could not fetch student for SMS:", err);
          }
          return res.json({ message: true });
        }
      );
      return;
    }

    const id = feeIds[index];

    db.query("SELECT * FROM fees_collection WHERE id = ?", [id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database query error", error: err });
      }
      if (result.length === 0) {
        index++;
        return processNext();
      }

      const existingData = result[0];
      const amountInt = parseInt(existingData.balance, 10) || 0;
      const paymentId = Math.floor(1000000 + Math.random() * 9000000);
      const trxId = uuidv4();

      const paymentData = {
        payment_id: paymentId,
        session: existingData.session,
        type: 'income',
        ptype: 'fees collection',
        campus: 'YourCampus',
        phead: existingData.feesType,
        fees_id: existingData.id,
        payment_for: studentId,
        note: existingData.fees_info + " of " + existingData.feesMonth,
        amount: amountInt,
        mode: payment_mode,
        account_id: account_id,
        status: '1',
        status2: '1',
        verified: '',
        trxId,
        date: payment_date,
        compile: compile
      };

      db.query("INSERT INTO payment SET ?", paymentData, (err, paymentResult) => {
        if (err) {
          return res.status(500).json({ message: "Failed to insert payment data", error: err });
        }

        db.query("SELECT * FROM fees_collection WHERE id = ?", [id], (err, feeResult) => {
          if (err) {
            return res.status(500).json({ message: "Failed to fetch fee collection data", error: err });
          }
          if (feeResult.length === 0) {
            return res.status(404).json({ message: "Fee collection record not found" });
          }

          const previousPaid = feeResult[0].paid || 0;
          const previousPaidAmount = previousPaid + amountInt;

          db.query(
            "UPDATE fees_collection SET ? WHERE id = ?",
            [
              {
                payment_id: paymentId,
                payment_mode: payment_mode,
                payment_date: payment_date,
                paymentStatus: 'fullPaid',
                paid: previousPaidAmount,
                balance: 0,
                status2: 1,
                trxID: trxId,
              },
              id,
            ],
            (err, updateResult) => {
              if (err) {
                return res.status(500).json({ message: "Failed to update fees collection", error: err });
              }

              totalAmount += amountInt;
              monthsCollected.push(existingData.feesMonth);

              index++;
              processNext(); 
            }
          );
        });
      });
    });
  };

  processNext();
});

// Endpoint 3
// router.post("/updateFeesCollectionSingle", (req, res) => {
//   const {
//     id,
//     studentId,
//     payment_mode,
//     account_id,
//     payment_date,
//     paymentStatus,
//     discountAmount = 0,
//     amount,
//     compile,
//   } = req.body;

//   const amountInt = parseInt(amount, 10) || 0; // Ensure amount is a valid number
//   const discountAmountInt = parseInt(discountAmount, 10) || 0; // Ensure discountAmount is a valid number

//   if (!id || !studentId || !amountInt) {
//     return res.status(400).json({ message: "Missing required fields" });
//   }

//   const paymentId = Math.floor(1000000 + Math.random() * 9000000);
//   const trxId = uuidv4();

//   // Fetch the existing fees collection record
//   db.query("SELECT * FROM fees_collection WHERE id = ?", [id], (err, result) => {
//     if (err) {
//       console.error("Error fetching fees collection:", err);
//       return res.status(500).json({ message: "Database query error", error: err });
//     }

//     if (result.length === 0) {
//       return res.status(404).json({ message: "No record found for the given ID" });
//     }

//     const existingData = result[0];
//     const paidAmountInt = parseInt(existingData.paid, 10) || 0; // Ensure paid is a number
//     const totalAmountInt = parseInt(existingData.amount, 10) || 0; // Ensure total amount is a number
//     const totalFine = parseInt(existingData.fine, 10) || 0; // Ensure fine is a number
//     const existingDiscountInt = parseInt(existingData.discount, 10) || 0; // Ensure discount is a number

//     const newDiscountAmount = existingDiscountInt + discountAmountInt;
//     const newPaidAmount = paidAmountInt + amountInt;

//     // Calculate the new balance
//     const newBalance = totalAmountInt + totalFine - newDiscountAmount - newPaidAmount;

//     const paymentData = {
//       payment_id: paymentId,
//       session: existingData.session,
//       type: "income",
//       ptype: "fees collection",
//       campus: "YourCampus",
//       phead: existingData.feesType,
//       fees_id : existingData.id,
//       payment_for: studentId,
//       note: `${existingData.fees_info} of ${existingData.feesMonth}`,
//       amount: amountInt,
//       mode: payment_mode,
//       account_id: account_id,
//       status: "1",
//       status2: "1",
//       verified: "",
//       trxId,
//       date: payment_date,
//       compile: compile,
//     };

//     // Insert the payment record
//     db.query("INSERT INTO payment SET ?", paymentData, (err, paymentResult) => {
//       if (err) {
//         console.error("Error inserting payment data:", err);
//         return res.status(500).json({ message: "Failed to insert payment data", error: err });
//       }

//       // Update the fees collection record
//       db.query(
//         "UPDATE fees_collection SET payment_id = ?, payment_mode = ?, payment_date = ?, paymentStatus = ?, discount = ?, paid = ?, balance = ?, status2 = ?, trxID = ? WHERE id = ?",
//         [
//           paymentId,
//           payment_mode,
//           payment_date,
//           paymentStatus,
//           newDiscountAmount,
//           newPaidAmount,
//           newBalance,
//           1,
//           trxId,
//           id,
//         ],
//         (err, updateResult) => {
//           if (err) {
//             console.error("Error updating fees collection:", err);
//             return res.status(500).json({ message: "Failed to update fees collection", error: err });
//           }
//           res.json({ message: true, info: updateResult });
//         }
//       );
//     });
//   });
// });




router.post("/updateFeesCollectionSingle", (req, res) => {
  const {
    id,
    studentId,
    payment_mode,
    account_id,
    payment_date,
    paymentStatus,
    discountAmount = 0,
    amount,
    compile,
  } = req.body;

  const amountInt = parseInt(amount, 10) || 0;
  const discountAmountInt = parseInt(discountAmount, 10) || 0;

  if (!id || !studentId || !amountInt) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const paymentId = Math.floor(1000000 + Math.random() * 9000000);
  const trxId = uuidv4();

  db.query("SELECT * FROM fees_collection WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error fetching fees collection:", err);
      return res.status(500).json({ message: "Database query error", error: err });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "No record found for the given ID" });
    }

    const existingData = result[0];
    const paidAmountInt = parseInt(existingData.paid, 10) || 0;
    const totalAmountInt = parseInt(existingData.amount, 10) || 0;
    const totalFine = parseInt(existingData.fine, 10) || 0;
    const existingDiscountInt = parseInt(existingData.discount, 10) || 0;
    const newDiscountAmount = existingDiscountInt + discountAmountInt;
    const newPaidAmount = paidAmountInt + amountInt;
    const newBalance = totalAmountInt + totalFine - newDiscountAmount - newPaidAmount;

    const paymentData = {
      payment_id: paymentId,
      session: existingData.session,
      type: "income",
      ptype: "fees collection",
      campus: "YourCampus",
      phead: existingData.feesType,
      fees_id: existingData.id,
      payment_for: studentId,
      note: `${existingData.fees_info} of ${existingData.feesMonth}`,
      amount: amountInt,
      mode: payment_mode,
      account_id: account_id,
      status: "1",
      status2: "1",
      verified: "",
      trxId,
      date: payment_date,
      compile: compile,
    };

    db.query("INSERT INTO payment SET ?", paymentData, (err, paymentResult) => {
      if (err) {
        console.error("Error inserting payment data:", err);
        return res.status(500).json({ message: "Failed to insert payment data", error: err });
      }

      db.query(
        "UPDATE fees_collection SET payment_id = ?, payment_mode = ?, payment_date = ?, paymentStatus = ?, discount = ?, paid = ?, balance = ?, status2 = ?, trxID = ? WHERE id = ?",
        [
          paymentId,
          payment_mode,
          payment_date,
          paymentStatus,
          newDiscountAmount,
          newPaidAmount,
          newBalance,
          1,
          trxId,
          id,
        ],
        (err, updateResult) => {
          if (err) {
            console.error("Error updating fees collection:", err);
            return res.status(500).json({ message: "Failed to update fees collection", error: err });
          }

          
          db.query(
            "SELECT father_contact, student_first_name,student_last_name FROM student WHERE student_id = ?",
            [studentId],
            (err, studentResult) => {
              if (!err && studentResult.length > 0) {
                const { father_contact, student_first_name, student_last_name } = studentResult[0];
                const smsText = `Dear Guardian, Tk ${amountInt} fees payment received for ${student_first_name} ${student_last_name} (${existingData.feesMonth}). Balance: Tk ${newBalance}. Thank you.`;
                sendFeesSms(father_contact, smsText); 
              } else if (err) {
                console.error("Could not fetch student for SMS:", err);
              }

              
              res.json({ message: true, info: updateResult });
            }
          );
        }
      );
    });
  });
});


router.post("/approveFeesCollection", (req, res) => {
  const { id } = req.body;
  db.query(
    "UPDATE fees_collection SET ? WHERE id = ?",
    [{ status2: 0 }, id],
    (err, result) => {
      res.json({ message: true });
    }
  );
});

router.post('/deleteFeesCollection', (req, res) => {
   const { id } = req.body;
  db.query('DELETE FROM fees_collection WHERE id = ?', [id], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (result.affectedRows > 0) {
        res.json({ message: true });
      } else {
        res.status(404).json({ error: 'Fees collection record not found' });
      }
    }
  });
});

// router.post('/deleteCollectedFees', (req, res) => {
//   const { payment_id } = req.body;

//   if (!payment_id) {
//     return res.status(400).json({ error: 'payment_id is required' });
//   }

//   db.query("SELECT * FROM fees_collection WHERE payment_id = ?", [payment_id], (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: 'Error fetching fee data' });
//     }
    
//     if (result.length === 0) {
//       return res.status(404).json({ error: 'Payment not found' });
//     }

//     const data = result[0];
//     const balance = data.amount + data.fine - data.paid - data.discount;

//     db.query("UPDATE fees_collection SET balance = ?,paymentStatus='' WHERE payment_id = ?", [balance, payment_id], (err) => {
//       if (err) {
//         return res.status(500).json({ error: 'Error updating balance' });
//       }

//       db.query('DELETE FROM payment WHERE payment_id = ?', [payment_id], (err2) => {
//         if (err2) {
//           return res.status(500).json({ error: 'Error deleting payment' });
//         }

//         res.json({ message: true });
//       });
//     });
//   });
// });
router.post('/deleteCollectedFees', (req, res) => {
  const { payment_id } = req.body;

  if (!payment_id) {
    return res.status(400).json({ error: 'payment_id is required' });
  }

  // Fetch the payment data using the provided payment_id
  db.query("SELECT * FROM payment WHERE id = ?", [payment_id], (err, paymentResult) => {
    if (err) {
      console.error("Error fetching payment data:", err);
      return res.status(500).json({ error: err });
    }

    if (paymentResult.length === 0) {
      return res.json({ error: 'Payment not found' });
    }

    const deleteAmount = paymentResult[0].amount;
    const feesPaymentId = paymentResult[0].trxId;

    // Fetch the fees_collection entry linked to the payment
    db.query("SELECT * FROM fees_collection WHERE trxID = ?", [feesPaymentId], (err, feeResult) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching fee data' });
      }

      if (feeResult.length === 0) {
        return res.json({ info: 'This payment History is Menual deletable' });
      }

      const data = feeResult[0];
      const updatedPaid = data.paid - deleteAmount;
      const updatedBalance = data.amount + data.fine - updatedPaid - data.discount;

      // Update the fees_collection record
      db.query(
        "UPDATE fees_collection SET paid = ?, balance = ?, paymentStatus = '' WHERE trxID = ?",
        [updatedPaid, updatedBalance, feesPaymentId],
        (err) => {
          if (err) {
            console.error("Error updating fees_collection:", err);
            return res.status(500).json({ error: 'Error updating fees_collection' });
          }

          // Delete the payment record
          db.query("DELETE FROM payment WHERE id = ?", [payment_id], (err2) => {
            if (err2) {
              console.error("Error deleting payment:", err2);
              return res.status(500).json({ error: 'Error deleting payment' });
            }

            res.json({ message: true,info:"Payment Deleted" });
          });
        }
      );
    });
  });
});


// router.post("/approveSingleFeesCollection", (req, res) => {
//   const { id, paid, balance } = req.body;
//   db.query(
//     "UPDATE fees_collection SET ? WHERE id = ?",
//     [{ paid, balance, status2: 0 }, id],
//     (err, result) => {
//       res.json({ message: true });
//     }
//   );
// });




router.post("/approveSingleFeesCollection", (req, res) => {
  const { id, paid, balance, payment_mode, account_id, newAmount } = req.body;

  db.query(
    "UPDATE fees_collection SET paid = ?, balance = ?, status2 = 0 WHERE id = ?",
    [paid, balance, id],
    (err, result) => {
      if (err) {
        console.error("Error updating fees_collection:", err);
        return res.status(500).json({ message: false, error: "Failed to update fees_collection" });
      }

      db.query(
        "SELECT payment_id FROM fees_collection WHERE id = ?",
        [id],
        (err2, result2) => {
          if (err2) {
            console.error("Error fetching payment_id:", err2);
            return res.status(500).json({ message: false, error: "Failed to get payment_id" });
          }
          if (!result2.length) {
            return res.status(404).json({ message: false, error: "No payment record found" });
          }

          const paymentId = result2[0].payment_id;

          db.query(
            "UPDATE payment SET amount = ?, mode = ?, account_id = ? WHERE payment_id = ?",
            [newAmount, payment_mode, account_id, paymentId],
            (err3, result3) => {
              if (err3) {
                console.error("Error updating payment:", err3);
                return res.status(500).json({ message: false, error: "Failed to update payment" });
              }

              res.json({ message: true });
            }
          );
        }
      );
    }
  );
});












router.post("/addFeeType", (req, res) => {
  const { feeType } = req.body;
  db.query(
    "INSERT INTO feesType SET ?",
    { feeType, pstatus: "" },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/UpdateFeeTypeById", (req, res) => {
  const { id, name } = req.body;
  db.query(
    "UPDATE feesType SET ? WHERE id = ?",
    [{ feeType: name }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});
router.post("/ApprovedFeeTypeById", (req, res) => {
  const { id, status } = req.body;
  db.query(
    "UPDATE feesType SET ? WHERE id = ?",
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

// router.post("/paymentRepicts", (req, res) => {
//   const { student_id, start_date, end_date } = req.body;
//   const currentDate = new Date().toISOString().split('T')[0];
//   const start = start_date || currentDate;
//   const end = end_date || currentDate;

//   let query = `
//     SELECT 
//         payment.payment_id,
//       payment.phead,
//       payment.payment_for,
//       payment.note,
//       payment.amount,
//       payment.mode,
//       payment.account_id,
//       payment.date,
//       payment.ptype,
//       payment.type,
//       payment.compile,
//       student.student_id,
//       student.student_first_name,
//       student.student_last_name,
//       student.Class,
//       student.section,
//       student.gender,
//       student.father_contact
//     FROM payment
//     INNER JOIN student ON  payment.payment_for =student.student_id
//     WHERE payment.ptype = 'fees collection'
//   `;
  
//   let queryParams = [];

//   if (student_id) {
//     query += " AND payment.payment_for = ?";
//     queryParams.push(student_id);
//   }

//   if (start_date && end_date) {
//     query += " AND payment.date BETWEEN ? AND ?";
//     queryParams.push(start, end);
//   } else {
//     query += " AND payment.date = ?";
//     queryParams.push(currentDate);
//   }

//   query += " ORDER BY payment.date ASC";

//   // Execute the query
//   db.query(query, queryParams, (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: "Database query failed", error: err });
//     }

//     // Group the results by payment_id
//     const groupedData = result.reduce((acc, curr) => {
//       if (!acc[curr.payment_id]) {
//         acc[curr.payment_id] = {
//           payment_id: curr.payment_id,
//           payment_for: curr.payment_for,
//           student_name: `${curr.student_first_name} ${curr.student_last_name}`,
//           Cls: curr.Class,
//           section: curr.section,
//           date: curr.date,
//           total: 0,
//           data: []
//         };
//       }
//       acc[curr.payment_id].total += curr.amount;
//       acc[curr.payment_id].data.push(curr);
//       return acc;
//     }, {});

//     const responseData = Object.values(groupedData);

//     res.json({ data: responseData });
//   });
// });




router.post("/paymentRepicts", (req, res) => {
  const { student_id, start_date, end_date } = req.body;
  const currentDate = new Date().toISOString().split("T")[0];
  const start = start_date || currentDate;
  const end = end_date || currentDate;

  const query = `
    SELECT
      p.payment_id,
      p.phead,
      p.payment_for,
      p.note,
      p.mode,
      p.account_id,
      p.date,
      p.ptype,
      p.type,
      p.compile,
      s.student_id,
      s.student_first_name,
      s.student_last_name,
      CONCAT(s.student_first_name, ' ', s.student_last_name) AS student_name,
      s.Class AS Cls,
      s.section,
      s.gender,
      s.father_contact,
      SUM(p.amount) AS total
    FROM payment p
    INNER JOIN student s ON p.payment_for = s.student_id
    WHERE p.ptype = 'fees collection'
      AND (p.payment_for = ? OR ? IS NULL)
      AND (p.date BETWEEN ? AND ?)
    GROUP BY p.payment_id, p.phead, p.payment_for, p.note, p.mode, p.account_id, p.date, p.ptype, p.type, p.compile,
             s.student_id, s.student_first_name, s.student_last_name, s.Class, s.section, s.gender, s.father_contact
    ORDER BY p.date ASC
  `;

  const params = [student_id || null, student_id || null, start, end];

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database query failed", error: err });
    }
    res.json({ data: results });
  });
});






router.post('/v1/getFeeInfo', async (req, res) => {
    const { userId, password, operation, iid, referenceId,random } = req.body;
    const pass = '33klm535a2bb431155';
    const cSaltedPassword = pass +random+referenceId;
    const cHash = crypto.createHash('sha512').update(cSaltedPassword).digest('hex');
    const userDB = [
        {
            userId: 'mtb_hasanain',
            hash: cHash,
            random: random
        } 
    ];

  const user = userDB.find(u => u.userId === userId);
  console.log(user)
    if (!user) {
        return res.status(404).json({
                referenceId: "",
                dateTime: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }),
                responseCode: "90",
                responseMsg: "Data not found",
                feeDetails: {
                    studentId: null,
                    instituteName: null,
                    branchName: null,
                    shift: null,
                    className: null,
                    sectionName: null,
                    invoiceNo: null,
                    studentName: null,
                    fatherName: null,
                    month: null,
                    academicYear: null,
                    fee: null,
                    waiver: null,
                    totalDue: null
                }
            });
    }
    // const saltedPassword = password + user.random+referenceId;
    // const hash = crypto.createHash('sha512').update(saltedPassword).digest('hex');

  if (password === user.hash && operation === "FEE_INFO" && iid === "hasanain") {
      

    const query = (sql, params) => {
        return new Promise((resolve, reject) => {
            db.query(sql, params, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    };

    try {
        
        const [studentInfo] = await query('SELECT * FROM student WHERE student_id = ?', [referenceId]);
        
        if (!studentInfo) {
            return res.status(404).json({
                referenceId: "",
                dateTime: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }),
                responseCode: "90",
                responseMsg: "Data not found",
                feeDetails: {
                    studentId: null,
                    instituteName: null,
                    branchName: null,
                    shift: null,
                    className: null,
                    sectionName: null,
                    invoiceNo: null,
                    studentName: null,
                    fatherName: null,
                    month: null,
                    academicYear: null,
                    fee: null,
                    waiver: null,
                    totalDue: null
                }
            });
        }


        const feeCollections = await query('SELECT * FROM fees_collection WHERE student_id = ?', [referenceId]);
        
        const student = studentInfo;
        const randomInvoiceNo = Math.floor(100000 + Math.random() * 900000);

        const feeDetails = {
            studentId: student.student_id,
            instituteName: "Alhasanain International School",
            branchName: "",
            shift: student.shift || null, 
            className: student.Class || null,
            sectionName: student.section || null,
            invoiceNo: `INV${randomInvoiceNo}${student.student_id}`,
            studentName: student.student_first_name + " " + student.student_last_name,
            fatherName: student.father_name,
            month: null,
            academicYear: student.session,
            fee: null,
            waiver: null,
            totalDue: null
        };
        
        // ibbl_bill_list

        // Calculate total due
        let totalDue = 0;
        let fee = 0;
        feeCollections.forEach(fee => {
            totalDue += fee.amount - (fee.paid+fee.discount || 0);
        });

        // Populate total due in feeDetails
        feeDetails.totalDue = totalDue;
        feeDetails.fee = totalDue;

        const response = {
            referenceId: student.student_id,
            dateTime: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }),
            responseCode: "00",
            responseMsg: "SUCCESS",
            feeDetails: feeDetails
        };
        
        const insertData={
         student_id:student.student_id,
         invoiceId:feeDetails.invoiceNo,
         due_amount:feeDetails.totalDue,
         status:0,
         date_time:new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }),   
        };
        await query('INSERT INTO mtb_bill_list SET ?',insertData);

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the student info.', details: error.message });
    }
    } else {
         return res.status(400).json({
                referenceId: "rr",
                dateTime: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }),
                responseCode: "90",
                responseMsg: "Data not found",
                feeDetails: {
                    studentId: null,
                    instituteName: null,
                    branchName: null,
                    shift: null,
                    className: null,
                    sectionName: null,
                    invoiceNo: null,
                    studentName: null,
                    fatherName: null,
                    month: null,
                    academicYear: null,
                    fee: null,
                    waiver: null,
                    totalDue: null
                }
            });
    }

});





router.post("/v1/payment", async (req, res) => {
  const {
    userId,
    iid,
    invoiceNo,
    password,
    trId,
    cr_amount
  } = req.body;

  const pass = "33klm535a2bb431155";
  const cSaltedPassword = pass + trId + invoiceNo;
  const cHash = crypto
    .createHash("sha512")
    .update(cSaltedPassword)
    .digest("hex");

  const userDB = [
    {
      userId: "mtb_hasanain",
      hash: cHash,
    },
  ];

  console.log(userDB)

  const user = userDB.find((u) => u.userId === userId);
  if (!user) {
    return res.json({
      responseCode: "90",
      responseMsg: "Failed"
    });
  }

  // const saltedPassword = password + trId + invoiceNo;
  // const hash = crypto.createHash('sha512').update(saltedPassword).digest('hex');

  if (password === user.hash && iid === "hasanain") {
    const query = (sql, params) => {
      return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    };

    try {
      const fees = await query(
        "SELECT * FROM mtb_bill_list WHERE invoiceId = ? AND status=?",
        [invoiceNo, 0],
      );
      if (!fees || fees.length === 0) {
        return res.json({
          responseCode: "90",
          responseMsg: "Failed"
        });
      } else {
        const studentID = fees[0].student_id;
        await processPayment(studentID, cr_amount, "Bank", "1", trId);
        await query(
          "UPDATE mtb_bill_list SET paid_amount =?, trx_id=?, status=? WHERE invoiceId = ?",
          [cr_amount, trId, 1, invoiceNo],
        );
        return res.json({
          responseCode: "00",
          responseMsg: "Success",
          studentId: studentID,
        });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({
          responseCode: "90",
          responseMsg: "Failed",
          details: error.message,
        });
    }
  } else {
    return res.json({
      responseCode: "90",
      responseMsg: "Failed",
      studentId: studentID,
    });
  }
});









router.post("/fetchFeeTypes", (req, res) => {
  db.query("SELECT *FROM feesType", (err, result) => {
    res.json({ message: result });
  });
});
router.post("/fetchFeeTypesforApprovel", (req, res) => {
  db.query("SELECT *FROM feesType WHERE pstatus=''", (err, result) => {
    res.json({ message: result });
  });
});

router.post("/fetchFeeTypesById", (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM feesType WHERE id = ?", id, (err, result) => {
    res.json({ message: result });
  });
});

// Deleting a fee type
router.post("/deleteFeeTypes", (req, res) => {
  const { id } = req.body;
  db.query("DELETE FROM feesType WHERE id = ?", [id], (err, result) => {
    if (err) {
      res.status(500).json({ message: err });
    } else {
      res.status(200).json({ message: true });
    }
  });
});

// Deleting fee info
router.post("/deleteFeeInfo", (req, res) => {
  const { id } = req.body;
  db.query("DELETE FROM feeInfo WHERE id = ?", [id], (err, result) => {
    if (err) {
      res.status(500).json({ message: err });
    } else {
      res.status(200).json({ message: true });
    }
  });
});



router.post("/deleteExtraFeeInfo", (req, res) => {
  const { id } = req.body;
  db.query("DELETE FROM extra_facilities WHERE id = ?", [id], (err, result) => {
    if (err) {
      res.status(500).json({ message: err });
    } else {
      res.status(200).json({ message: true });
    }
  });
});

router.post("/deleteExtraFeeInfoList", (req, res) => {
  const { id } = req.body;
  db.query("DELETE FROM student_extra_facilities WHERE id = ?", [id], (err, result) => {
    if (err) {
      res.status(500).json({ message: err });
    } else {
      res.status(200).json({ message: true });
    }
  });
});

// Deleting a discount type
router.post("/deleteDiscountType", (req, res) => {
  const { id } = req.body;
  db.query("DELETE FROM discount_type WHERE id = ?", [id], (err, result) => {
    if (err) {
      res.status(500).json({ message: err });
    } else {
      res.status(200).json({ message: true });
    }
  });
});




router.post("/fetchFeeInfo", (req, res) => {
    const { campus } = req.body;
  db.query("SELECT *FROM feeInfo WHERE campus=?",campus, (err, result) => {
    res.json({ message: result });
  });
});



router.post("/fetchExtraFeeInfo", (req, res) => {
    const { campus } = req.body;
  db.query("SELECT *FROM extra_facilities WHERE campus=?",campus, (err, result) => {
    res.json({ message: result });
  });
});





router.post("/UpdateExtraFeeInfo", (req, res) => {
  const { id, facility_name, recurring, status, facility_fee,campus } = req.body;
  db.query(
    "UPDATE extra_facilities SET ? WHERE id= ? ",
    [{ facility_name, recurring, status, facility_fee,campus }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});




router.post("/fetchFeeInfoApprovel", (req, res) => {
  db.query("SELECT *FROM feeInfo WHERE pstatus=''", (err, result) => {
    res.json({ message: result });
  });
});

router.post("/UpdateFeeInfoApprovel", (req, res) => {
  const { id, status, note } = req.body;
  db.query(
    "UPDATE feeInfo SET ? WHERE id= ?",
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

router.post("/fetchFeeInfoById", (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM feeInfo WHERE id = ?", id, (err, result) => {
    res.json({ message: result });
  });
});

router.post("/addFeeInfo", (req, res) => {
  const { feeType, session,campus,feeClass, feeDesc,recurring, amount } =
  req.body;
  db.query(
    "INSERT INTO feeInfo SET ?",
    {
      feeType,
      session,
      campus,
      feeClass,
      feeDesc,
      recurring,
      amount,
      pstatus: "",
      pstatus: "",
      pnote: "",
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

router.post("/addExtraFeeInfo", (req, res) => {
  const {
    facility_name,
    facility_fee,
    recurring,
    campus,
    status,
    session
  } = req.body;

  db.query(
    "INSERT INTO extra_facilities SET ?",
    {
      facility_name,
      facility_fee,
      recurring,
      campus,
      status,
      pstatus: "0",
      session
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


router.post("/fetchFeeInfoByName", (req, res) => {
  const { feeType } = req.body;
  db.query("SELECT *FROM feeInfo WHERE feeType = ?", feeType, (err, result) => {
    res.json({ message: result });
  });
});

router.post("/UpdateFeeInfo", (req, res) => {
  const { id, feeType, feeClass, feeDesc, amount,campus,recurring } = req.body;
  db.query(
    "UPDATE feeInfo SET ? WHERE id= ? ",
    [{ feeType, feeClass, feeDesc, amount,campus,recurring }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/addDiscountType", (req, res) => {
  const { discountType, session } = req.body;
  db.query(
    "INSERT INTO discount_type SET ?",
    { discountType, session },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/UpdateDiscountType", (req, res) => {
  const { id, discountType, session } = req.body;
  db.query(
    "UPDATE discount_type SET ? WHERE id=?",
    [{ discountType: discountType, session: session }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/getDiscountType", (req, res) => {
  db.query("SELECT *FROM discount_type ", (err, result) => {
    res.json({ message: result });
  });
});

router.post("/getDiscountTypeById", (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM discount_type WHERE id = ?", id, (err, result) => {
    res.json({ message: result });
  });
});

router.post("/addDiscountStudent", (req, res) => {
  const {
    student_id,
    discountType,
    discount,
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
    session,
    compile,
  } = req.body;

  db.query(
    "INSERT INTO discount SET ?",
    {
      student_id,
      discountType: "",
      discount: "",
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
      session,
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

router.post("/getDiscountDataByStudentId", (req, res) => {
  const { student_id } = req.body;
  db.query(
    "SELECT *FROM discount WHERE student_id = ?",
    student_id,
    (err, result) => {
      res.json({ message: result });
    }
  );
});

router.post("/assignDiscount", (req, res) => {
  const {
    student_id,
    Class,
    section,
    session,
    discount_type,
    applicableFor,
    dType,
    amount,
    compile,
  } = req.body;
  
  db.query("SELECT * FROM assign_discount WHERE student_id = ? AND discount_type = ? AND applicableFor = ?",[student_id, discount_type, applicableFor],(err, selectResult) => {
        if(selectResult.length > 0){
            res.json({ error: "Duplicate entry detected" });
        }else{
           db.query(
            "INSERT INTO assign_discount SET ?",
            {
              student_id,
              Class,
              section,
              session,
              discount_type,
              applicableFor,
              dType,
              amount,
              status: "",
              pnote: "",
              compile,
            },
            (err, insertResult) => {
              if (err) {
                res.json({ error: "Internal Server Error" });
              } else {
                res.json({ message: "Discount assigned successfully" });
              }
            }
          ); 
        }

    }
  );
});



router.post("/getassignDiscount", (req, res) => {
  db.query("SELECT *FROM assign_discount", (err, result) => {
    res.json({ message: result });
  });
});

router.post("/getassignDiscountApprove", (req, res) => {
  db.query("SELECT *FROM assign_discount WHERE status=''", (err, result) => {
    res.json({ message: result });
  });
});

router.post("/UpdateAssignDiscountApprove", (req, res) => {
  const { id, status, note } = req.body;
  db.query(
    "UPDATE assign_discount SET ? WHERE id= ? ",
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

router.post("/getassignDiscountforUpdate", (req, res) => {
  const { search } = req.body;

  let query = `
    SELECT 
      student.student_id,
      student.student_first_name,
      student.student_last_name,
      assign_discount.*
    FROM student 
    INNER JOIN assign_discount 
    ON student.student_id = assign_discount.student_id
  `;

  let queryParams = [];

  if (search) {
    query += `
      WHERE student.student_id = ? 
      OR student.student_first_name LIKE ? 
      OR student.student_last_name LIKE ?
    `;
    queryParams.push(search, `%${search}%`, `%${search}%`);
  }

  db.query(query, queryParams, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database query failed", error: err });
    }

    res.json({ message: result });
  });
});


router.post("/getassignDiscounttById", (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM assign_discount WHERE id=? ", id, (err, result) => {
    res.json({ message: result });
  });
});

router.post("/getassignDiscounttByStudentId", (req, res) => {
  const { student_id } = req.body;
  db.query(
    "SELECT *FROM assign_discount WHERE student_id=?",
    student_id,
    (err, result) => {
      res.json({ message: result });
    }
  );
});

router.post("/getAllStudentDiscount", (req, res) => {
  const { className, section, session, applicableFor } = req.body;
  db.query(
    "SELECT *FROM assign_discount WHERE Class= ? AND section= ? AND session = ? AND applicableFor = ?",
    [className, section, session, applicableFor],
    (err, result) => {
      res.json({ ok: true, message: result });
    }
  );
});

router.post('/deleteAssignDiscount', (req, res) => {
   const { id } = req.body;
  db.query('DELETE FROM assign_discount WHERE id = ?', [id], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (result.affectedRows > 0) {
        res.json({ message: true });
      } else {
        res.status(404).json({ error: 'Fees Discount record not found' });
      }
    }
  });
});

router.post("/UpdateAssignDiscount", (req, res) => {
  const {
    id,
    student_id,
    discount_type,
    applicableFor,
    dType,
    amount,
    status,
  } = req.body;
  db.query(
    "UPDATE assign_discount SET ? WHERE id= ? ",
    [{ student_id, discount_type, applicableFor, dType, amount, status }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

// router.post('/student-fees-due-report', (req, res) => {
//     const { feesMonth, Class, section, campus } = req.body;

//     let query;
//     let queryParams = [Class, section, campus];

//     if (feesMonth) {
//         query = `SELECT * FROM student_due_Report_vw 
//                  WHERE Class = ? AND section = ? AND campus = ? AND feesMonth = ?`;
//         queryParams.push(feesMonth);
//     } else {
//         query = `SELECT student_id, student_name, 
//                  Class, section, SUM(section_due_amount) AS section_due_amount, MAX(last_payment_date) AS last_payment_date,campus 
//                  FROM student_due_Report_vw 
//                  WHERE Class = ? AND section = ? AND campus = ?
//                  GROUP BY student_id, student_name, Class, section,campus`;
//     }
    
//     db.query(query, queryParams, (err, results) => {
//         if (err) {
//             return res.status(500).json({ ok: false, message: `Database error: ${err.message}` });
//         }

//         if (results.length === 0) {
//             return res.status(404).json({ ok: false, message: 'No fees due report found for the given criteria.' });
//         }

//         res.json({ ok: true, message: results });
//     });
// });





router.post('/student-fees-due-report', (req, res) => {
  const { startMonth, endMonth, Class, section, campus } = req.body;

  let queryParams = [];
  let whereClauses = [];

  if (Class) {
    whereClauses.push("Class = ?");
    queryParams.push(Class);
  }

  if (section) {
    whereClauses.push("section = ?");
    queryParams.push(section);
  }

  if (campus) {
    whereClauses.push("campus = ?");
    queryParams.push(campus);
  }

  // ðŸ”¹ Month range filter
  if (startMonth && endMonth) {
    whereClauses.push("feesMonth BETWEEN ? AND ?");
    queryParams.push(startMonth, endMonth);
  }

  let whereSQL = whereClauses.length
    ? "WHERE " + whereClauses.join(" AND ")
    : "";

  let query;

  // ðŸ”¹ If month range exists â†’ detailed rows
  if (startMonth && endMonth) {
    query = `
      SELECT *
      FROM student_due_Report_vw
      ${whereSQL}
      ORDER BY student_name ASC
    `;
  } 
  // ðŸ”¹ No month range â†’ grouped summary
  else {
    query = `
      SELECT 
        student_id,
        student_name,
        Class,
        section,
        feesMonth,
        SUM(section_due_amount) AS section_due_amount,
        MAX(last_payment_date) AS last_payment_date,
        campus
      FROM student_due_Report_vw
      ${whereSQL}
      GROUP BY student_id, student_name, Class, section, campus
      ORDER BY student_name ASC
    `;
  }

  db.query(query, queryParams, (err, results) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message: `Database error: ${err.message}`,
      });
    }

    if (!results.length) {
      return res.status(404).json({
        ok: false,
        message: "No fees due report found for the given criteria.",
      });
    }

    res.json({ ok: true, message: results });
  });
});







// router.post('/student-fees-due-report', (req, res) => {
//   const { feesMonth, Class, section, campus } = req.body;

//   let queryParams = [];
//   let whereClauses = [];
  
//   // Add filters dynamically if they exist
//   if (Class) {
//     whereClauses.push("Class = ?");
//     queryParams.push(Class);
//   }
//   if (section) {
//     whereClauses.push("section = ?");
//     queryParams.push(section);
//   }
//   if (campus) {
//     whereClauses.push("campus = ?");
//     queryParams.push(campus);
//   }
//   if (feesMonth) {
//     whereClauses.push("feesMonth = ?");
//     queryParams.push(feesMonth);
//   }

//   let whereSQL = "";
//   if (whereClauses.length > 0) {
//     whereSQL = "WHERE " + whereClauses.join(" AND ");
//   }

//   let query;

//   if (feesMonth) {
//     // When feesMonth filter exists, show detailed data (no grouping)
//     query = `
//       SELECT * 
//       FROM student_due_Report_vw
//       ${whereSQL}
//       ORDER BY student_name ASC
//     `;
//   } else {
//     // Group data by student etc.
//     // For grouping, feesMonth can't be in WHERE clause so exclude it
//     // So remove feesMonth filter from whereClauses and queryParams for this query
//     let groupWhereClauses = whereClauses.filter(c => !c.startsWith("feesMonth"));
//     let groupQueryParams = queryParams.filter((_, i) => !whereClauses[i].startsWith("feesMonth"));
//     let groupWhereSQL = "";
//     if (groupWhereClauses.length > 0) {
//       groupWhereSQL = "WHERE " + groupWhereClauses.join(" AND ");
//     }

//     query = `
//       SELECT student_id, 
//           student_name, 
//              Class, 
//              section, 
//              feesMonth,
//              SUM(section_due_amount) AS section_due_amount, 
//              MAX(last_payment_date) AS last_payment_date,
//              campus 
//       FROM student_due_Report_vw
//       ${groupWhereSQL}
//       GROUP BY student_id, student_name, Class, section, campus
//       ORDER BY student_name ASC
//     `;

//     // Override queryParams for grouping query
//     queryParams = groupQueryParams;
//   }

//   db.query(query, queryParams, (err, results) => {
//     if (err) {
//       return res.status(500).json({ ok: false, message: `Database error: ${err.message}` });
//     }
//     if (results.length === 0) {
//       return res.status(404).json({ ok: false, message: 'No fees due report found for the given criteria.' });
//     }
//     res.json({ ok: true, message: results });
//   });
// });





router.post("/getStudentDueBalance", (req, res) => {
  const { student_id } = req.body;

  const query = `
    SELECT 
      fc.id,
      fc.student_id,
      s.Class,
      s.section,
      fc.fees_info,
      fc.feesType,
      fc.due_date,
      fc.amount,
      fc.balance,
      fc.paymentStatus
    FROM 
      fees_collection fc
    LEFT JOIN 
      student s ON s.student_id = fc.student_id
    WHERE 
      fc.student_id = ? 
      AND fc.paymentStatus IN ('', 'halfPaid') 
      AND fc.balance > 0
  `;

  db.query(query, [student_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error", details: err });
    }

    const totalDue = results.reduce((sum, row) => sum + (row.balance || 0), 0);
    const studentClass = results[0]?.Class || null;
    const section = results[0]?.section || null;

    res.json({
      totalDue,
      student_id,
      Class: studentClass,
      section,
      dueFees: results
    });
  });
});



/////////////////////// auto recurrring fees //////////////////////


let isFeeForwardRunning = false;

const autoRecurringFeesForward = async () => {
  if (isFeeForwardRunning) {
    console.log("Previous recurring fee forwarding still running – skipping");
    return;
  }

  isFeeForwardRunning = true;

  const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };

  try {
    let totalInserted = 0;

    // Active Session
    const sessionInfo = await query(`
      SELECT session
      FROM session
      WHERE status = 1
      LIMIT 1
    `);

    if (sessionInfo.length === 0) {
      console.log("Active session not found");
      return;
    }

    const currentSession = sessionInfo[0].session;

    // Next Month
   // Current Month
const today = new Date();

const feesMonth = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, "0")}`;

const due_date = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, "0")}-10`;

    // Recurring Facilities
    const facilities = await query(`
      SELECT *
      FROM extra_facilities
      WHERE recurring='Yes'
      AND pstatus='1'
    `);

    for (const facility of facilities) {
      // Students assigned to this facility
      const students = await query(
        `
        SELECT s.*
        FROM student s
        INNER JOIN student_extra_facilities sef
          ON s.student_id = sef.student_id
        WHERE
          sef.session = ?
          AND (
            sef.facility_1 = ?
            OR sef.facility_2 = ?
            OR sef.facility_3 = ?
          )
        `,
        [
          currentSession,
          facility.id,
          facility.id,
          facility.id,
        ]
      );

      for (const student of students) {
        // Duplicate Check
        const duplicate = await query(
          `
          SELECT id
          FROM fees_collection
          WHERE student_id = ?
          AND feesMonth = ?
          AND fees_info = ?
          LIMIT 1
          `,
          [
            student.student_id,
            feesMonth,
            facility.id,
          ]
        );

        if (duplicate.length > 0) continue;

        // Discount Check
        let discount = 0;

        const discountInfo = await query(
          `
          SELECT *
          FROM assign_discount
          WHERE student_id = ?
          AND Class = ?
          AND session = ?
          AND applicableFor = ?
          AND status = 1
          LIMIT 1
          `,
          [
            student.student_id,
            student.Class,
            currentSession,
            facility.facility_name,
          ]
        );

        if (discountInfo.length > 0) {
          const d = discountInfo[0];

          discount =
            d.dType === "%"
              ? (Number(d.amount) / 100) *
                Number(facility.facility_fee)
              : Number(d.amount);
        }

        const feeAmount = Number(facility.facility_fee);
        const balance = feeAmount - discount;

        await query(
          `
          INSERT INTO fees_collection
          (
            student_id,
            fees_info,
            feesType,
            due_date,
            feesMonth,
            amount,
            discount,
            balance,
            session,
            compile
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            student.student_id,
            facility.id,
            facility.facility_name,
            due_date,
            feesMonth,
            feeAmount,
            discount,
            balance,
            currentSession,
            0,
          ]
        );

        totalInserted++;
      }
    }

    console.log(
      `${totalInserted} recurring fees forwarded successfully for ${feesMonth}`
    );
  } catch (err) {
    console.error("Auto Forward Error:", err);
  } finally {
    isFeeForwardRunning = false;
  }
};

// const startRecurringFees = () => {
//   setInterval(() => {
//     autoRecurringFeesForward();
//   }, 60000);
// };

// startRecurringFees();








let isClassFeeForwardRunning = false;

const autoRecurringClassFeesForward = async () => {
  if (isClassFeeForwardRunning) {
    console.log(
      "Previous recurring class fee forwarding still running – skipping"
    );
    return;
  }

  isClassFeeForwardRunning = true;

  const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };

  try {
    let totalInserted = 0;

    // Active Session
    const sessionInfo = await query(
      `
      SELECT session
      FROM session
      WHERE status = 1
      LIMIT 1
    `
    );

    if (sessionInfo.length === 0) {
      console.log("Active session not found");
      return;
    }

    const currentSession = sessionInfo[0].session;

    // Next Month
    // Current Month
const today = new Date();

const feesMonth = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, "0")}`;

const due_date = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, "0")}-10`;

    // Recurring Fees
    const feeList = await query(
      `
      SELECT *
      FROM feeInfo
      WHERE recurring='Yes'
      AND pstatus=1
      `
    );

    for (const fee of feeList) {
      let students = [];

      
      if (
        fee.feeClass &&
        fee.feeClass.trim() !== "" &&
        fee.feeClass.toLowerCase() !== "null"
      ) {
        students = await query(
          `
          SELECT *
          FROM student
          WHERE session = ?
          AND Class = ?
          `,
          [currentSession, fee.feeClass]
        );
      } else {
        
        students = await query(
          `
          SELECT *
          FROM student
          WHERE session = ?
          `,
          [currentSession]
        );
      }

      for (const student of students) {
        // Duplicate Check
        const duplicate = await query(
          `
          SELECT id
          FROM fees_collection
          WHERE student_id = ?
          AND feesMonth = ?
          AND fees_info = ?
          LIMIT 1
          `,
          [student.student_id, feesMonth, fee.id]
        );

        if (duplicate.length > 0) {
          continue;
        }

        // Discount Check
        let discount = 0;

        const discountInfo = await query(
          `
          SELECT *
          FROM assign_discount
          WHERE student_id = ?
          AND Class = ?
          AND session = ?
          AND applicableFor = ?
          AND status = 1
          LIMIT 1
          `,
          [
            student.student_id,
            student.Class,
            currentSession,
            fee.feeType,
          ]
        );

        if (discountInfo.length > 0) {
          const d = discountInfo[0];

          discount =
            d.dType === "%"
              ? (Number(d.amount) / 100) * Number(fee.amount)
              : Number(d.amount);
        }

        const feeAmount = Number(fee.amount);
        const balance = feeAmount - discount;

        await query(
          `
          INSERT INTO fees_collection
          (
            student_id,
            fees_info,
            feesType,
            due_date,
            feesMonth,
            amount,
            discount,
            balance,
            session,
            compile
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            student.student_id,
            fee.id,
            fee.feeType,
            due_date,
            feesMonth,
            feeAmount,
            discount,
            balance,
            currentSession,
            0,
          ]
        );

        totalInserted++;
      }
    }

    console.log(
      `${totalInserted} recurring class fees forwarded successfully for ${feesMonth}`
    );
  } catch (err) {
    console.error(
      "Auto Recurring Class Fee Forward Error:",
      err
    );
  } finally {
    isClassFeeForwardRunning = false;
  }
};



cron.schedule("0 0 1-5 * *", async () => {
  console.log("Running Monthly Fee Forward Check...");

  try {
    await autoRecurringFeesForward();
    await autoRecurringClassFeesForward();

    console.log("Monthly Fee Forward Check Completed");
  } catch (err) {
    console.error("Monthly Fee Forward Error:", err);
  }
});







router.post("/manualClassFeesForward", async (req, res) => {
  if (isClassFeeForwardRunning) {
    return res.json({
      success: false,
      message: "Fee forwarding is already running, please wait.",
    });
  }

  try {
    await autoRecurringClassFeesForward();
    res.json({
      success: true,
      message: "Recurring class fees forwarded successfully.",
    });
  } catch (err) {
    console.error("Manual Class Fee Forward Error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while forwarding fees.",
    });
  }
});



// cron.schedule("0 0 28-31 * *", async () => {
//   const today = new Date();
//   const tomorrow = new Date(today);

//   tomorrow.setDate(today.getDate() + 1);

 
//   if (tomorrow.getDate() === 1) {
//     console.log("Running Monthly Fee Forward...");

//     try {
//       await autoRecurringFeesForward();
//       await autoRecurringClassFeesForward();
      
//       console.log("Monthly Fee Forward Completed");
//     } catch (err) {
//       console.error("Monthly Fee Forward Error:", err);
//     }
//   }
// });


router.get("/FeesTest", (req, res) => {
  res.send("Fees");
});

module.exports = router;
