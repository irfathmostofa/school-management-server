const { db } = require("../models");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const publicDirectory = path.join(__dirname, "../public");

exports.addHRISLetter = (req, res) => {
    const { emp_id, fileno, name, address, phone, designation, cdate, des,type } =req.body;
    db.query(
    "INSERT INTO hr_letter SET ?",{emp_id, fileno, name, address, phone, designation, cdate, des,type},(err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

exports.getHRISLetter = (req, res) => {
    const {type} =req.body;
    db.query("SELECT *FROM hr_letter WHERE type=?",[type], (err, result) => {
        res.json({ message: result });
    });
}


exports.updateHRISLetter = (req, res) => {
  const { id, cdate, des } = req.body;
  db.query(
    "UPDATE hr_letter SET ? WHERE id=?",
    [{ cdate: cdate, des: des }, id],
    (err, result) => {
      if (result.length < 0) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

exports.deleteHRISLetter = (req, res) => {
  const { id } = req.body;
  db.query("DELETE FROM hr_letter WHERE id=?",[id], (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
}

exports.addAppointmentletter = (req, res) => {
  const { emp_id, fileno, name, address, phone, designation, cdate, des } =
    req.body;
  db.query(
    "INSERT INTO appointment_letter SET ?",
    {
      emp_id,
      fileno,
      name,
      address,
      phone,
      designation,
      cdate,
      des,
      approvel: "",
      status: "",
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
exports.addExperienceCertificate = (req, res) => {
  const { emp_id, name, designation, cdate, des } = req.body;
  db.query(
    "INSERT INTO experience_certificate SET ?",
    {
      emp_id,
      name,
      designation,
      cdate,
      des,
      approvel: "",
      status: "",
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

exports.addNOCletter = (req, res) => {
  const {
    emp_id,
    name,
    designation,
    department,
    type,
    cdate,
    sdate,
    passport,
    travel,
    lsdate,
    ledate,
  } = req.body;

  if (type == "NOC Abroad") {
    db.query(
      "INSERT INTO noc_letter SET ?",
      {
        emp_id,
        name,
        designation,
        department,
        type,
        cdate,
        sdate,
        passport,
        travel,
        lsdate,
        ledate,
        status: "",
        approval: "",
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
      "INSERT INTO noc_letter SET ?",
      {
        emp_id,
        name,
        designation,
        department,
        type,
        cdate,
        sdate,
        passport: "",
        travel: "",
        lsdate: "",
        ledate: "",
        status: "",
        approval: "",
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

exports.UpdateAppointmentletter = (req, res) => {
  const { id, cdate, des } = req.body;
  db.query(
    "UPDATE appointment_letter SET ? WHERE id=?",
    [{ cdate: cdate, des: des }, id],
    (err, result) => {
      if (result.length < 0) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

exports.UpdateExperienceCertificate = (req, res) => {
  const { id, cdate, des } = req.body;
  db.query(
    "UPDATE experience_certificate SET ? WHERE id=?",
    [{ cdate, des }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

exports.UpdateNOCletter = (req, res) => {
  const { id, cdate, sdate, passport, travel, lsdate, ledate } = req.body;
  db.query(
    "UPDATE noc_letter SET ? WHERE id=?",
    [{ cdate, sdate, passport, travel, lsdate, ledate }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

exports.UpdateConfirmationletter = (req, res) => {
  const { id, cdate, des } = req.body;
  db.query(
    "UPDATE Confirmation_letter SET ? WHERE id=?",
    [{ cdate: cdate, des: des }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

exports.DeleteAppointmentletter = (req, res) => {
  const { id } = req.body;
  db.query("DELETE FROM appointment_letter WHERE id=?", [id], (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
}
exports.DeleteConfirmationletter = (req, res) => {
  const { id } = req.body;
  db.query(
    "DELETE FROM Confirmation_letter WHERE id=?",
    [id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}
exports.DeleteNOCletter = (req, res) => {
  const { id } = req.body;
  db.query("DELETE FROM noc_letter WHERE id=?", [id], (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
}

exports.addConfirmationletter = (req, res) => {
  const {
    emp_id,
    fileno,
    name,
    address,
    phone,
    designation,
    cdate,
    des,
    school,
    status,
    approvel,
  } = req.body;
  db.query(
    "INSERT INTO Confirmation_letter SET ?",
    {
      emp_id,
      fileno,
      name,
      address,
      phone,
      designation,
      cdate,
      des,
      school,
      approvel: "",
      status: "",
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

exports.adddepartment = (req, res) => {
  const { department, type } = req.body;
  db.query(
    "INSERT INTO department SET ?",
    {
      department,
      type,
      status: "",
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

exports.getdepartment = (req, res) => {
  db.query("SELECT *FROM department", (err, result) => {
    res.json({ message: result });
  });
}

exports.getappointmentLetter = (req, res) => {
  db.query("SELECT *FROM appointment_letter", (err, result) => {
    res.json({ message: result });
  });
}
exports.getConfirmationLetter = (req, res) => {
  db.query("SELECT *FROM Confirmation_letter", (err, result) => {
    res.json({ message: result });
  });
}

exports.getNOC = (req, res) => {
  db.query("SELECT *FROM noc_letter", (err, result) => {
    res.json({ message: result });
  });
}

exports.getExperienceCertificate = (req, res) => {
  db.query("SELECT *FROM experience_certificate", (err, result) => {
    res.json({ message: result });
  });
}

exports.getExperienceCertificateById = (req, res) => {
  const { id } = req.body;
  db.query(
    "SELECT *FROM experience_certificate WHERE id=?",
    id,
    (err, result) => {
      res.json({ message: result });
    }
  );
}

exports.getappointmentLetterById = (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM appointment_letter WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
}
exports.getNOCById = (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM noc_letter WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
}
exports.getConfirmationLetterById = (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM Confirmation_letter WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
}

exports.getdepartmentByID = (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM department WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
}

//designation

exports.addDesignation = (req, res) => {
  const { designation } = req.body;
  db.query(
    "INSERT INTO designation SET ?",
    {
      designation,
      status: "",
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

exports.getAllDesignation = (req, res) => {
  db.query("SELECT *FROM designation", (err, result) => {
    res.json({ message: result });
  });
}

exports.getAllTitle = (req, res) => {
  db.query("SELECT *FROM title", (err, result) => {
    res.json({ message: result });
  });
}

exports.addTitle = (req, res) => {
  const { title } = req.body;
  db.query(
    "INSERT INTO title SET ?",
    {
      title,
      status: "",
    },
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: "" });
      }
    }
  );
}

exports.editTitle = (req, res) => {
  const { title, id } = req.body;
  db.query(
    `UPDATE title SET title = ?  WHERE id = ?`,
    [title, id],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: "" });
      }
    }
  );
}

exports.deleteTitle = (req, res) => {
  const { id } = req.body;
  db.query(`DELETE  FROM title  WHERE id = ?`, [id], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: "" });
    }
  });
}

exports.getdesignationByID = (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM designation WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
}

exports.addEmployeeAttendancePeriod = (req, res) => {
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
    "INSERT INTO employee_attendance_salary SET ?",
    {
      emp_id,
      attendance_inTime,
      attendance_outTime,
      salary,
      increment_amount,
      t_yearly_leave,
      r_yearly_leave: t_yearly_leave,
      session,
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

exports.addEmployee = (req, res) => {
  const {
    emp_id,
    emp_type,
    campus,
    emp_title,
    emp_fileNo,
    emp_fname,
    emp_lname,
    designation,
    department,
    school,
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

  // First, check for duplicate emp_id or emp_fileNo
  db.query(
    "SELECT * FROM employee WHERE emp_id = ? OR emp_fileNo = ?",
    [emp_id, emp_fileNo],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (results.length > 0) {
        // Duplicate found
        return res.status(400).json({
          message: "Duplicate employee ID or File Number found. Please use unique values.",
        });
      }

      // Proceed to insert if no duplicate found
      var filename = "";
      if (req.files !== null && req.files !== undefined) {
        if (req.files.img !== undefined) {
          var file = req.files.img;
          filename = uuidv4() + file.name;
          file.mv(publicDirectory + "/image/" + filename, (err) => {
            if (err) {
              console.log("File not uploaded");
            } else {
              console.log("File uploaded");
            }
          });
        }
      }

      const prefix = emp_id;

      db.query(
        `SELECT emp_id
         FROM employee
         WHERE emp_id LIKE ?
         ORDER BY CAST(SUBSTRING_INDEX(emp_id,'-',-1) AS UNSIGNED) DESC
         LIMIT 1`,
        [`${prefix}-%`],
        (err, idResult) => {
          if (err) {
            return res.json({
              ok: false,
              message: err,
            });
          }

          let newEmployeeId;

          if (idResult.length === 0) {
            newEmployeeId = `${prefix}-001`;
          } else {
            const lastNumber = parseInt(idResult[0].emp_id.split("-")[1], 10);
            newEmployeeId = `${prefix}-` + String(lastNumber + 1).padStart(3, "0");
          }

          db.query(
            "INSERT INTO employee SET ?",
            {
              emp_id: newEmployeeId,
              emp_type,
              emp_title,
              emp_fileNo,
              emp_fname,
              emp_lname,
              designation,
              department,
              campus,
              school,
              assigned_subject,
              assigned_class,
              trainee_period,
              trainee_joining,
              trainee_end_joining,
              trainee_increment,
              joining_as_teacher,
              joining_as_permanent,
              img: filename,
              gender,
              phone,
              dob,
              email,
              blood,
              education,
              pAddress,
              perAddress,
              word_exp_form,
              previous_insti,
              special_achievement,
              special_time,
              role,
              status: "",
            },
            (err, result) => {
              if (err) {
                res.json({ message: err });
              } else {
                res.json({ message: true });
              }
            }
          ); // close INSERT db.query
        }
      ); // close prefix SELECT db.query
    }
  ); // close duplicate-check db.query
}

//Bulk Employee
// router.post("/addBulkEmployee", (req, res) => {
//   const { selectedCSVData } = req.body;

//   const query =
//     "INSERT INTO employee (emp_id, emp_type, emp_title, emp_fileNo, emp_fname, emp_lname, designation, department, campus, school, assigned_subject, assigned_class, trainee_period, trainee_joining, joining_as_teacher,joining_as_permanent,trainee_increment, gender, phone, dob, email, blood, education, pAddress, perAddress,nid_birth_number, guardian_name, guardian_nid, guardian_contact, word_exp_form, previous_insti, special_achievement, special_time, role) VALUES ? ON DUPLICATE KEY UPDATE `emp_id` = VALUES(`emp_id`), `emp_type` = VALUES(`emp_type`), `emp_title` = VALUES(`emp_title`), `emp_fileNo` = VALUES(`emp_fileNo`), `emp_fname` = VALUES(`emp_fname`), `emp_lname` = VALUES(`emp_lname`), `designation` = VALUES(`designation`), `department` = VALUES(`department`), `campus` = VALUES(`campus`),  `school` = VALUES(`school`), `assigned_subject` = VALUES(`assigned_subject`), `assigned_class` = VALUES(`assigned_class`), `trainee_period` = VALUES(`trainee_period`), `trainee_joining` = VALUES(`trainee_joining`), `joining_as_teacher` = VALUES(`joining_as_teacher`), `joining_as_permanent` = VALUES(`joining_as_permanent`), `trainee_increment` = VALUES(`trainee_increment`), `gender` = VALUES(`gender`), `phone` = VALUES(`phone`), `dob` = VALUES(`dob`), `email` = VALUES(`email`), `blood` = VALUES(`blood`), `education` = VALUES(`education`), `pAddress` = VALUES(`pAddress`), `perAddress` = VALUES(`perAddress`), `word_exp_form` = VALUES(`word_exp_form`), `previous_insti` = VALUES(`previous_insti`), `special_achievement` = VALUES(`special_achievement`), `special_time` = VALUES(`special_time`), `role` = VALUES(`role`)";

//   const values = selectedCSVData.map((employee) => [
//     employee.emp_id,
//     employee.emp_type,
//     employee.emp_title,
//     employee.emp_fileNo,
//     employee.emp_fname,
//     employee.emp_lname,
//     employee.designation,
//     employee.department,
//     employee.campus,
//     employee.school,
//     employee.assigned_subject,
//     employee.assigned_class,
//     employee.trainee_period,
//     employee.trainee_joining,
//     employee.joining_as_teacher,
//     employee.joining_as_permanent,
//     employee.increment_amount,
//     employee.gender,
//     employee.phone,
//     employee.dob,
//     employee.email,
//     employee.blood,
//     employee.education,
//     employee.pAddress,
//     employee.perAddress,
//     employee.nid_birth_number,
//     employee.guardian_name,
//     employee.guardian_nid,
//     employee.guardian_contact,
//     employee.word_exp_form,
//     employee.previous_insti,
//     employee.special_achievement,
//     employee.special_time,
//     employee.role,
//   ]);

//   const employeeIDs = selectedCSVData.map((employee) => [employee.emp_id]);

//   db.query(
//     "SELECT emp_id FROM employee WHERE emp_id IN (?)",
//     [employeeIDs],
//     (err, result1) => {
//       if (err) {
//         console.error(err);
//         res.json({ message: "no duplicate found", result: result1 });
//       } else {
//         const duplicatesID = result1;

//         db.query(query, [values], (err, result) => {
//           const values2 = selectedCSVData.map((employee) => [
//             employee.emp_id,
//             employee.attendance_inTime,
//             employee.attendance_outTime,
//             employee.salary,
//             employee.increment_amount,
//             employee.t_yearly_leave,
//             employee.r_yearly_leave,
//             employee.session,
//           ]);

//           db.query(
//             `
//   INSERT INTO employee_attendance_salary
//     (emp_id, attendance_inTime, attendance_outTime, salary, increment_amount, t_yearly_leave, r_yearly_leave, session)
//   VALUES ?
//   ON DUPLICATE KEY UPDATE
//     attendance_inTime = VALUES(attendance_inTime),
//     attendance_outTime = VALUES(attendance_outTime),
//     salary = VALUES(salary),
//     increment_amount = VALUES(increment_amount),
//     t_yearly_leave = VALUES(t_yearly_leave),
//     r_yearly_leave = VALUES(r_yearly_leave),
//     session = VALUES(session)
// `,
//             [values2],
//             (err, result5) => {
//               if (err) {
//                 res.json({ message: err });
//               } else {
//                 res.json({
//                   ok: true,
//                   message: "Employee Attendance Salary added",
//                 });
//               }
//             }
//           );

//           if (err) {
//             console.error(err);
//             res.json({
//               ok: false,
//               message: "Error occurred while adding bulk Employee",
//               results: err,
//             });
//           } else {
//             if (duplicatesID.length > 0) {
//               const dataInserted = selectedCSVData.length - duplicatesID.length;
//               const duplicateCSVdataList = selectedCSVData.filter((employee) =>
//                 duplicatesID.some(
//                   (duplicate) => duplicate.emp_id === employee.emp_id
//                 )
//               );
//               res.json({
//                 ok: true,
//                 message: `${dataInserted} Employee Added and ${duplicatesID.length} duplicate Employee found`,
//                 result: result,
//                 duplicates: duplicatesID,
//                 duplicateCSVdataList: duplicateCSVdataList,
//               });
//             } else {
//               res.json({
//                 ok: true,
//                 message: "All Employee Added",
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






// router.post("/addBulkEmployee", (req, res) => {
//   const { selectedCSVData, session } = req.body;

//   if (!selectedCSVData || selectedCSVData.length === 0) {
//     return res.json({
//       ok: false,
//       message: "No employee data found",
//     });
//   }


//   const employeeIDs = selectedCSVData.map(
//     (employee) => employee.emp_id
//   );


//   const employeeInsertQuery = `
//     INSERT INTO employee 
//     (
//       emp_id,
//       emp_type,
//       emp_title,
//       emp_fileNo,
//       emp_fname,
//       emp_lname,
//       designation,
//       department,
//       campus,
//       school,
//       assigned_subject,
//       assigned_class,
//       trainee_period,
//       trainee_joining,
//       joining_as_teacher,
//       joining_as_permanent,
//       trainee_increment,
//       gender,
//       phone,
//       dob,
//       email,
//       blood,
//       education,
//       pAddress,
//       perAddress,
//       nid_birth_number,
//       guardian_name,
//       guardian_nid,
//       guardian_contact,
//       word_exp_form,
//       previous_insti,
//       special_achievement,
//       special_time,
//       role
//     )
//     VALUES ?
//     ON DUPLICATE KEY UPDATE

//       emp_type = VALUES(emp_type),
//       emp_title = VALUES(emp_title),
//       emp_fileNo = VALUES(emp_fileNo),
//       emp_fname = VALUES(emp_fname),
//       emp_lname = VALUES(emp_lname),
//       designation = VALUES(designation),
//       department = VALUES(department),
//       campus = VALUES(campus),
//       school = VALUES(school),
//       assigned_subject = VALUES(assigned_subject),
//       assigned_class = VALUES(assigned_class),
//       trainee_period = VALUES(trainee_period),
//       trainee_joining = VALUES(trainee_joining),
//       joining_as_teacher = VALUES(joining_as_teacher),
//       joining_as_permanent = VALUES(joining_as_permanent),
//       trainee_increment = VALUES(trainee_increment),
//       gender = VALUES(gender),
//       phone = VALUES(phone),
//       dob = VALUES(dob),
//       email = VALUES(email),
//       blood = VALUES(blood),
//       education = VALUES(education),
//       pAddress = VALUES(pAddress),
//       perAddress = VALUES(perAddress),
//       nid_birth_number = VALUES(nid_birth_number),
//       guardian_name = VALUES(guardian_name),
//       guardian_nid = VALUES(guardian_nid),
//       guardian_contact = VALUES(guardian_contact),
//       word_exp_form = VALUES(word_exp_form),
//       previous_insti = VALUES(previous_insti),
//       special_achievement = VALUES(special_achievement),
//       special_time = VALUES(special_time),
//       role = VALUES(role)
//   `;



//   const employeeValues = selectedCSVData.map((employee)=>[

//     employee.emp_id || "",
//     employee.emp_type || "",
//     employee.emp_title || "",
//     employee.emp_fileNo || "",
//     employee.emp_fname || "",
//     employee.emp_lname || "",

//     employee.designation || "",
//     employee.department || "",
//     employee.campus || "",
//     employee.school || "",

//     employee.assigned_subject || "",

//     Array.isArray(employee.assigned_class)
//       ? employee.assigned_class.join(",")
//       : employee.assigned_class || "",

//     employee.trainee_period || "",
//     employee.trainee_joining || "",
//     employee.joining_as_teacher || "",
//     employee.joining_as_permanent || "",

//     employee.increment_amount || 0,

//     employee.gender || "",
//     employee.phone || "",
//     employee.dob || "",
//     employee.email || "",
//     employee.blood || "",

//     employee.education || "",
//     employee.pAddress || "",
//     employee.perAddress || "",

//     employee.nid_birth_number || "",
//     employee.guardian_name || "",
//     employee.guardian_nid || "",
//     employee.guardian_contact || "",

//     employee.word_exp_form || "",
//     employee.previous_insti || "",
//     employee.special_achievement || "",
//     employee.special_time || "",

//     employee.role || ""

//   ]);



//   db.query(
//     "SELECT emp_id FROM employee WHERE emp_id IN (?)",
//     [employeeIDs],
//     (err, duplicateResult)=>{


//       if(err){
//         return res.json({
//           ok:false,
//           message:err
//         });
//       }



//       db.query(
//         employeeInsertQuery,
//         [employeeValues],
//         (err,result)=>{


//           if(err){

//             return res.json({
//               ok:false,
//               message:err
//             });

//           }



//           // Attendance Salary Insert

//           const salaryValues = selectedCSVData.map((employee)=>[

//             employee.emp_id || "",

//             employee.attendance_inTime || "",
//             employee.attendance_outTime || "",

//             employee.salary || 0,

//             employee.increment_amount || 0,

//             employee.t_yearly_leave || 0,

//             employee.r_yearly_leave || 0,

//             session || ""

//           ]);




//           const salaryQuery = `

//           INSERT INTO employee_attendance_salary

//           (
//             emp_id,
//             attendance_inTime,
//             attendance_outTime,
//             salary,
//             increment_amount,
//             t_yearly_leave,
//             r_yearly_leave,
//             session
//           )

//           VALUES ?

//           ON DUPLICATE KEY UPDATE

//             attendance_inTime = VALUES(attendance_inTime),
//             attendance_outTime = VALUES(attendance_outTime),
//             salary = VALUES(salary),
//             increment_amount = VALUES(increment_amount),
//             t_yearly_leave = VALUES(t_yearly_leave),
//             r_yearly_leave = VALUES(r_yearly_leave),
//             session = VALUES(session)

//           `;



//           db.query(
//             salaryQuery,
//             [salaryValues],
//             (err,salaryResult)=>{


//               if(err){

//                 return res.json({
//                   ok:false,
//                   message:err
//                 });

//               }



//               const duplicateCSVdataList =
//               selectedCSVData.filter(emp=>
//                 duplicateResult.some(
//                   d=>d.emp_id===emp.emp_id
//                 )
//               );



//               return res.json({

//                 ok:true,

//                 message:
//                 `${selectedCSVData.length -
//                 duplicateCSVdataList.length}
//                 Employee Added`,

//                 duplicateCSVdataList

//               });



//             }
//           );



//         }
//       );


//     }
//   );

// });



exports.addBulkEmployee = async (req, res) => {
  const { selectedCSVData, session } = req.body;

  if (!Array.isArray(selectedCSVData) || selectedCSVData.length === 0) {
    return res.json({ ok: false, message: "No employee data found" });
  }

  // Promisified wrapper for generic db.query calls
  const runQuery = (sql, params) => {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  };

  // Helper: get last used serial number for a given emp_id prefix
  const getLastSerial = (prefix) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT emp_id
         FROM employee
         WHERE emp_id LIKE ?
         ORDER BY CAST(SUBSTRING_INDEX(emp_id,'-',-1) AS UNSIGNED) DESC
         LIMIT 1`,
        [`${prefix}-%`],
        (err, result) => {
          if (err) return reject(err);

          let lastSerial = 0;
          if (result.length > 0) {
            const parts = result[0].emp_id.split("-");
            const num = parseInt(parts[1], 10);
            lastSerial = isNaN(num) ? 0 : num;
          }
          resolve(lastSerial);
        }
      );
    });
  };

  try {
    // ------------------------
    // 1. Generate emp_id for each row based on its prefix
    //    (CSV's emp_id column holds the prefix, e.g. "TCH")
    // ------------------------
    const prefixCounters = {};

    const uniquePrefixes = [
      ...new Set(
        selectedCSVData
          .map((item) => (item.emp_id || "").toString().trim())
          .filter(Boolean)
      ),
    ];

    if (uniquePrefixes.length === 0) {
      return res.json({ ok: false, message: "emp_id (prefix) missing in CSV data" });
    }

    for (const prefix of uniquePrefixes) {
      prefixCounters[prefix] = await getLastSerial(prefix);
    }

    selectedCSVData.forEach((employee) => {
      const prefix = (employee.emp_id || "").toString().trim();
      prefixCounters[prefix]++;
      employee.emp_id = `${prefix}-` + String(prefixCounters[prefix]).padStart(3, "0");
    });

    const employeeIDs = selectedCSVData.map((employee) => employee.emp_id);

    // ------------------------
    // 2. Duplicate check (safety net; should normally be empty since IDs are freshly generated)
    // ------------------------
    const duplicateResult = await runQuery(
      "SELECT emp_id FROM employee WHERE emp_id IN (?)",
      [employeeIDs]
    );

    // ------------------------
    // 3. Insert employees
    // ------------------------
    const employeeInsertQuery = `
      INSERT INTO employee 
      (
        emp_id,
        emp_type,
        emp_title,
        emp_fileNo,
        emp_fname,
        emp_lname,
        designation,
        department,
        campus,
        school,
        assigned_subject,
        assigned_class,
        trainee_period,
        trainee_joining,
        joining_as_teacher,
        joining_as_permanent,
        trainee_increment,
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
        role
      )
      VALUES ?
      ON DUPLICATE KEY UPDATE
        emp_type = VALUES(emp_type),
        emp_title = VALUES(emp_title),
        emp_fileNo = VALUES(emp_fileNo),
        emp_fname = VALUES(emp_fname),
        emp_lname = VALUES(emp_lname),
        designation = VALUES(designation),
        department = VALUES(department),
        campus = VALUES(campus),
        school = VALUES(school),
        assigned_subject = VALUES(assigned_subject),
        assigned_class = VALUES(assigned_class),
        trainee_period = VALUES(trainee_period),
        trainee_joining = VALUES(trainee_joining),
        joining_as_teacher = VALUES(joining_as_teacher),
        joining_as_permanent = VALUES(joining_as_permanent),
        trainee_increment = VALUES(trainee_increment),
        gender = VALUES(gender),
        phone = VALUES(phone),
        dob = VALUES(dob),
        email = VALUES(email),
        blood = VALUES(blood),
        education = VALUES(education),
        pAddress = VALUES(pAddress),
        perAddress = VALUES(perAddress),
        nid_birth_number = VALUES(nid_birth_number),
        guardian_name = VALUES(guardian_name),
        guardian_nid = VALUES(guardian_nid),
        guardian_contact = VALUES(guardian_contact),
        word_exp_form = VALUES(word_exp_form),
        previous_insti = VALUES(previous_insti),
        special_achievement = VALUES(special_achievement),
        special_time = VALUES(special_time),
        role = VALUES(role)
    `;

    const employeeValues = selectedCSVData.map((employee) => [
      employee.emp_id || "",
      employee.emp_type || "",
      employee.emp_title || "",
      employee.emp_fileNo || "",
      employee.emp_fname || "",
      employee.emp_lname || "",
      employee.designation || "",
      employee.department || "",
      employee.campus || "",
      employee.school || "",
      employee.assigned_subject || "",
      Array.isArray(employee.assigned_class)
        ? employee.assigned_class.join(",")
        : employee.assigned_class || "",
      employee.trainee_period || "",
      employee.trainee_joining || "",
      employee.joining_as_teacher || "",
      employee.joining_as_permanent || "",
      employee.increment_amount || 0,
      employee.gender || "",
      employee.phone || "",
      employee.dob || "",
      employee.email || "",
      employee.blood || "",
      employee.education || "",
      employee.pAddress || "",
      employee.perAddress || "",
      employee.nid_birth_number || "",
      employee.guardian_name || "",
      employee.guardian_nid || "",
      employee.guardian_contact || "",
      employee.word_exp_form || "",
      employee.previous_insti || "",
      employee.special_achievement || "",
      employee.special_time || "",
      employee.role || "",
    ]);

    await runQuery(employeeInsertQuery, [employeeValues]);

    // ------------------------
    // 4. Insert attendance & salary
    // ------------------------
    const salaryValues = selectedCSVData.map((employee) => [
      employee.emp_id || "",
      employee.attendance_inTime || "",
      employee.attendance_outTime || "",
      employee.salary || 0,
      employee.increment_amount || 0,
      employee.t_yearly_leave || 0,
      employee.r_yearly_leave || 0,
      session || "",
    ]);

    const salaryQuery = `
      INSERT INTO employee_attendance_salary
      (
        emp_id,
        attendance_inTime,
        attendance_outTime,
        salary,
        increment_amount,
        t_yearly_leave,
        r_yearly_leave,
        session
      )
      VALUES ?
      ON DUPLICATE KEY UPDATE
        attendance_inTime = VALUES(attendance_inTime),
        attendance_outTime = VALUES(attendance_outTime),
        salary = VALUES(salary),
        increment_amount = VALUES(increment_amount),
        t_yearly_leave = VALUES(t_yearly_leave),
        r_yearly_leave = VALUES(r_yearly_leave),
        session = VALUES(session)
    `;

    await runQuery(salaryQuery, [salaryValues]);

    // ------------------------
    // 5. Response
    // ------------------------
    const duplicateCSVdataList = selectedCSVData.filter((emp) =>
      duplicateResult.some((d) => d.emp_id === emp.emp_id)
    );

    return res.json({
      ok: true,
      message: `${selectedCSVData.length} Employee Added`,
      generatedEmployeeIDs: employeeIDs,
      duplicateCSVdataList,
    });
  } catch (err) {
    console.error(err);
    return res.json({ ok: false, message: err.message || err });
  }
}


exports.addBulkSalary = (req, res) => {

  const { selectedCSVData } = req.body;


  if (!selectedCSVData || selectedCSVData.length === 0) {
    return res.json({
      ok: false,
      message: "No salary data found"
    });
  }



  const salaryValues = [];



  selectedCSVData.forEach((employee)=>{


    const salary = Number(employee.salary) || 0;
    const increment = Number(employee.increment_amount) || 0;


    const employeeName =
      `${employee.emp_fname || ""} ${employee.emp_lname || ""}`.trim();



    // Trainee / First Salary

    salaryValues.push([

      employee.emp_id || "",

      employeeName,

      employee.department || "",

      employee.designation || "",

      salary,

      0,

      salary,

      employee.trainee_joining || null,

      1

    ]);




    // Permanent / Increment Salary

    salaryValues.push([

      employee.emp_id || "",

      employeeName,

      employee.department || "",

      employee.designation || "",

      salary,

      increment,

      salary + increment,

      employee.joining_as_teacher || null,

      1

    ]);



  });




  const sql = `

    INSERT INTO employee_salary_management

    (
      emp_id,
      emp_name,
      emp_department,
      emp_designation,
      previousSalary,
      increament,
      new_salary,
      applicable_month,
      status
    )


    VALUES ?


    ON DUPLICATE KEY UPDATE


      emp_name = VALUES(emp_name),

      emp_department = VALUES(emp_department),

      emp_designation = VALUES(emp_designation),

      previousSalary = VALUES(previousSalary),

      increament = VALUES(increament),

      new_salary = VALUES(new_salary),

      applicable_month = VALUES(applicable_month),

      status = VALUES(status)

  `;



  db.query(
    sql,
    [salaryValues],
    (err,result)=>{


      if(err){

        console.log("Bulk salary error:",err);

        return res.json({

          ok:false,

          message:err

        });

      }



      return res.json({

        ok:true,

        message:"Bulk salary added successfully",

        result

      });



    }
  );

}







// router.post("/addBulkSalary", (req, res) => {
//   const { selectedCSVData } = req.body;

//   const values3 = selectedCSVData.map((employee) => [
//     employee.emp_id,
//     `${employee.emp_fname} ${employee.emp_lname}`,
//     employee.department,
//     employee.designation,
//     employee.salary,
//     0,
//     employee.salary,
//     employee.trainee_joining,
//     1,
//   ]);

//   const values4 = selectedCSVData.map((employee) => [
//     employee.emp_id,
//     `${employee.emp_fname} ${employee.emp_lname}`,
//     employee.department,
//     employee.designation,
//     employee.salary,
//     employee.increment_amount,
//     +employee.increment_amount + +employee.salary,
//     employee.joining_as_teacher,
//     1,
//   ]);

//   const sql = `
//             INSERT INTO employee_salary_management (emp_id, emp_name, emp_department, emp_designation, previousSalary, increament, new_salary, applicable_month, status)
//             VALUES ? ON DUPLICATE KEY UPDATE
//               emp_name = VALUES(emp_name),
//               emp_department = VALUES(emp_department),
//               emp_designation = VALUES(emp_designation),
//               previousSalary = VALUES(previousSalary),
//               increament = VALUES(increament),
//               new_salary = VALUES(new_salary),
//               applicable_month = VALUES(applicable_month),
//               status = VALUES(status)
//           `;

//   const combinedValues = [...values3, ...values4];

//   db.query(sql, [combinedValues], (err, result) => {
//     if (err) {
//       res.json({ ok: false, message: err });
//     } else {
//       res.json({ ok: true, message: "Data Added" });
//     }
//   });
// });

//Bulk Attendance
exports.addBulkAttendance = (req, res) => {
  const { selectedCSVData, reportedMonth } = req.body;

  // Early return if no data provided
  if (!selectedCSVData || selectedCSVData.length === 0) {
    return res.json({
      ok: false,
      message: "No attendance data provided",
    });
  }

  // Prepare batched query for efficiency
  const empDatePairs = selectedCSVData.map(({ empID, date }) => [empID, date]);
  
  // Check existing records in bulk
  const checkQuery = `
    SELECT empID, date 
    FROM attendance 
    WHERE (empID, date) IN (?)
  `;
  
  db.query(checkQuery, [empDatePairs], (err, existingRecords) => {
    if (err) {
      console.error(err);
      return res.json({
        ok: false,
        message: "Error occurred while checking for existing records",
        error: err,
      });
    }

    const existingSet = new Set(
      existingRecords.map((record) => `${record.empID}_${record.date}`)
    );

    // Filter out records already present
    const recordsToInsert = selectedCSVData.filter(
      ({ empID, date }) => !existingSet.has(`${empID}_${date}`)
    );

    if (recordsToInsert.length === 0) {
      return res.json({
        ok: true,
        message: "No new attendance records to insert",
      });
    }

    const insertQuery = `
      INSERT INTO attendance (
        empID,
        empName,
        date,
        inTime,
        outTime,
        lateTime,
        lateTimeStatus,
        overTime,
        overTimeStatus,
        reportedMonth,
        session,
        remark
      )
      VALUES ?
      ON DUPLICATE KEY UPDATE
        empName = VALUES(empName),
        date = VALUES(date),
        inTime = VALUES(inTime),
        outTime = VALUES(outTime),
        lateTime = VALUES(lateTime),
        lateTimeStatus = VALUES(lateTimeStatus),
        overTime = VALUES(overTime),
        overTimeStatus = VALUES(overTimeStatus),
        reportedMonth = VALUES(reportedMonth),
        session = VALUES(session),
        remark = VALUES(remark)
    `;

    const values = recordsToInsert.map((attendance) => [
      attendance.empID,
      attendance.empName,
      attendance.date,
      attendance.inTime,
      attendance.outTime,
      attendance.lateTime,
      attendance.lateTimeStatus,
      attendance.overTime,
      attendance.overTimeStatus,
      reportedMonth,
      session,
      attendance.remark || "", // Default empty string for null remarks
    ]);

    db.query(insertQuery, [values], (insertErr, result) => {
      if (insertErr) {
        console.error(insertErr);
        return res.json({
          ok: false,
          message: "Error occurred while adding bulk attendance",
          error: insertErr,
        });
      }

      res.json({
        ok: true,
        message: "All attendance records added successfully",
        result: result,
      });
    });
  });
}


exports.getAttendanceForEmployee = (req, res) => {
  const { empID, startDate, endDate } = req.body;
  db.query(
    `SELECT * FROM attendance_device WHERE empID=? AND date BETWEEN ? AND ?`, 
    [empID, startDate, endDate], 
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}
exports.getAttendanceSummaryForAllEmployee = (req, res) => {
  const { empID, startDate, endDate } = req.body;

  let query = `
    SELECT 
    attendance_device.empID,
    attendance_device.empName,
    COUNT(*) AS present,
    SUM(TIME(attendance_device.inTime) > '09:00') AS lateCount,
    SUM(TIME(attendance_device.outTime) < '17:00') AS earlyLeaveCount,
    SUM(TIME(attendance_device.outTime) > '17:00') AS overtimeDays,
    e.designation,
    SEC_TO_TIME(
        SUM(
            CASE 
                WHEN TIME(attendance_device.outTime) > '17:00' THEN 
                    TIME_TO_SEC(TIMEDIFF(TIME(attendance_device.outTime), '17:00'))
                ELSE 0
            END
        )
    ) AS totalOvertime
FROM attendance_device
JOIN employee as e ON attendance_device.empID=e.emp_id
WHERE attendance_device.date BETWEEN ? AND ?`;

  const params = [startDate, endDate];

  if (empID) {
    query += ` AND attendance_device.empID = ?`;
    params.push(empID);
  }


  query += ` GROUP BY attendance_device.empID`;

  db.query(query, params, (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  });
}


exports.getlateEmployeeList = (req, res) => {
  const { session, month } = req.body;

  // Base query
  let query = `
    SELECT 
      attendance.empID,
      attendance.empName,
      employee.designation,
      employee.department,
      attendance.session,
      attendance.reportedMonth,
      COUNT(*) AS late_days,
      CASE WHEN COUNT(*) >= 5 THEN 1 ELSE 0 END AS warning
    FROM 
      attendance
    JOIN 
      employee ON employee.emp_id = attendance.empID
    WHERE 
      attendance.lateTime > 0 AND attendance.session=?
  `;

  const params = [session];

  if (month) {
    query += " AND attendance.reportedMonth=?";
    params.push(month);
  }

  query += `
    GROUP BY 
      attendance.empID,
      attendance.empName,
      employee.designation,
      employee.department,
      attendance.session,
      attendance.reportedMonth
  `;

  query += ` HAVING late_days >= 5`;

  query += `
    ORDER BY 
      attendance.session, late_days DESC;
  `;

  // Execute the query
  db.query(query, params, (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  });
}




exports.getEmployee = (req, res) => {
  const {
    campus,
    title,
    department,
    designation,
    searchFilter,
    emp_type,
    page,
  } = req.body;

  db.query("SELECT COUNT(*) AS count FROM employee", (err, result) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      const totalDocuments = result[0].count;
      const pageSize = Math.ceil(totalDocuments / 15);
      const totalPages = Math.ceil(totalDocuments / pageSize);

      let sqlQuery = "SELECT * FROM employee WHERE 1=1";

      const queryParams = [];

      if (campus) {
        sqlQuery += " AND campus=?";
        queryParams.push(campus);
      }

      if (title) {
        sqlQuery += " AND emp_title=?";
        queryParams.push(title);
      }

      if (department) {
        sqlQuery += " AND department=?";
        queryParams.push(department);
      }

      if (designation) {
        sqlQuery += " AND designation=?";
        queryParams.push(designation);
      }

      if (emp_type) {
        sqlQuery += " AND emp_type=?";
        queryParams.push(emp_type);
      }

      if (searchFilter) {
        sqlQuery +=
          " AND (emp_fname LIKE ? OR emp_lname LIKE ? OR emp_id LIKE ?)";
        const searchPattern = `%${searchFilter}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern);
      }

      // Add pagination
      if (page) {
        sqlQuery += " LIMIT ? OFFSET ?";
        queryParams.push(
          parseInt(pageSize),
          (parseInt(page) - 1) * parseInt(pageSize)
        );
      }
      db.query(sqlQuery, queryParams, (err, result) => {
        if (err) {
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          res.json({ message: result, totalPages, pageSize });
        }
      });
    }
  });
}

exports.getAllEmployees = (req, res) => {
  const {
    campus,
    title,
    department,
    designation,
    searchFilter,
    emp_type,
    page,
  } = req.body;

  db.query("SELECT COUNT(*) AS count FROM employee", (err, result) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      const totalDocuments = result[0].count;
      const pageSize = Math.ceil(totalDocuments);
      const totalPages = Math.ceil(totalDocuments / pageSize);

      let sqlQuery = "SELECT employee.*, esm.new_salary AS salary FROM employee JOIN employee_salary_management AS esm ON employee.emp_id=esm.emp_id WHERE 1=1";

      const queryParams = [];

      if (campus) {
        sqlQuery += " AND employee.campus=?";
        queryParams.push(campus);
      }

      if (title) {
        sqlQuery += " AND employee.emp_title=?";
        queryParams.push(title);
      }

      if (department) {
        sqlQuery += " AND employee.department=?";
        queryParams.push(department);
      }

      if (designation) {
        sqlQuery += " AND employee.designation=?";
        queryParams.push(designation);
      }

      if (emp_type) {
        sqlQuery += " AND employee.emp_type=?";
        queryParams.push(emp_type);
      }

      if (searchFilter) {
        sqlQuery +=
          " AND (employee.emp_fname LIKE ? OR employee.emp_lname LIKE ? OR employee.emp_id LIKE ?)";
        const searchPattern = `%${searchFilter}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern);
      }

     sqlQuery += " GROUP BY employee.emp_id";
      db.query(sqlQuery, queryParams, (err, result) => {
        if (err) {
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          res.json({ message: result, totalPages, pageSize });
        }
      });
    }
  });
}

exports.updateovertimeeligibility = (req, res) => {
  const { emp_id, overTimeEligibility } = req.body;
  db.query(
    "UPDATE employee SET overTimeEligibility = ? WHERE emp_id = ?",
    [overTimeEligibility, emp_id],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: "Employee overtime status updated" });
      }
    }
  );
}

exports.updateEmployeeStatus = (req, res) => {
  const { emp_id,status } = req.body;
  db.query(
    "UPDATE employee SET status = ? WHERE emp_id = ?",[status, emp_id],(err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: "Employee status updated" });
      }
    });
}

exports.getAllAttendanceInOutTimeWithSalary = (req, res) => {
  db.query(
    "SELECT * FROM employee_attendance_salary , employee WHERE employee_attendance_salary.emp_id = employee.emp_id",
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: result });
      }
    }
  );
}

exports.getAllAttendance = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const offset = (page - 1) * pageSize;

  db.query(
    "SELECT * FROM attendance ORDER BY empID DESC LIMIT ? OFFSET ?",
    [pageSize, offset],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        db.query(
          "SELECT COUNT(*) as totalCount FROM attendance",
          (err, totalCountResult) => {
            if (err) {
              res.json({ message: err });
            } else {
              const totalCount = totalCountResult[0].totalCount;
              const totalPages = Math.ceil(totalCount / pageSize);
              res.json({ message: result, totalPages });
            }
          }
        );
      }
    }
  );
}

exports.getDailyAttendance = (req, res) => {
  const { date, search, status } = req.body;
  let queryStatus = "";
  if (status === "Late") {
    queryStatus = " AND lateTimeStatus = 1";
  } else if (status === "OverTime") {
    queryStatus = " AND overTimeStatus = 1";
  } else {
    queryStatus = "";
  }

  db.query(
    `SELECT * FROM attendance WHERE date = ? AND (empID LIKE ? OR empName LIKE ?)  ${queryStatus}`,
    [date, `%${search}%`, `%${search}%`],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

exports.getAllAttendanceByID = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const offset = (page - 1) * pageSize;
  const { empID, month } = req.body;
  const startOfMonth = `${month}-01`;
  const endOfMonth = `${month}-31`;
  db.query(
    "SELECT * FROM attendance WHERE empID = ? AND date BETWEEN ? AND ? ORDER BY date DESC LIMIT ? OFFSET ?",
    [empID, startOfMonth, endOfMonth, pageSize, offset],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        db.query(
          "SELECT COUNT(*) as totalCount FROM attendance  WHERE empID = ? ",
          empID,
          (err, totalCountResult) => {
            if (err) {
              res.json({ message: err });
            } else {
              const totalCount = totalCountResult[0].totalCount;
              const totalPages = Math.ceil(totalCount / pageSize);
              res.json({ message: result, totalPages });
            }
          }
        );
      }
    }
  );
}
exports.getAllAttendanceDeviceByID = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const offset = (page - 1) * pageSize;
  const { empID, month } = req.body;
  const startOfMonth = `${month}-01`;
  const endOfMonth = `${month}-31`;
  db.query(
    "SELECT * FROM attendance_device WHERE empID = ? AND date BETWEEN ? AND ? ORDER BY date DESC LIMIT ? OFFSET ?",
    [empID, startOfMonth, endOfMonth, pageSize, offset],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        db.query(
          "SELECT COUNT(*) as totalCount FROM attendance_device  WHERE empID = ? ",
          empID,
          (err, totalCountResult) => {
            if (err) {
              res.json({ message: err });
            } else {
              const totalCount = totalCountResult[0].totalCount;
              const totalPages = Math.ceil(totalCount / pageSize);
              res.json({ message: result, totalPages });
            }
          }
        );
      }
    }
  );
}

exports.getPrincipleData = (req, res) => {
  db.query(
    "SELECT *FROM employee WHERE designation='Principal' ",
    (err, result) => {
      res.json({ message: result });
    }
  );
}

exports.getTeacherAllData = (req, res) => {
  const { school, department, Class, campus } = req.body;
  let query = "SELECT * FROM employee WHERE emp_type = 'Academic'";
  let params = [];

  if (school) {
    query += " AND school = ?";
    params.push(school);
  }

  if (department) {
    query += " AND department = ?";
    params.push(department);
  }

  if (campus) {
    query += " AND campus = ?";
    params.push(campus);
  }
let query2 = "SELECT * FROM employee WHERE emp_type = 'Academic' AND campus = 'Boys & Girls Campus'";
  db.query(query, params, (err, result1) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    db.query(query2, [], (err, result2) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const combinedResult = [...result1, ...result2];
      res.json({ message: combinedResult });
    });
  });
}


exports.getTeacherAllDataByDepartment = (req, res) => {
  const { department } = req.body;

  db.query(
    "SELECT *FROM employee WHERE department= ? ",
    [department],
    (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ message: err });
      } else {
        res.json({ message: result });
      }
    }
  );
}

exports.getAHODAllDataByDepartment = (req, res) => {
  const { department } = req.body;

  db.query(
    "SELECT *FROM employee WHERE department= ? AND designation = 'Head of Department' ",
    [department],
    (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ message: err });
      } else {
        res.json({ message: result });
      }
    }
  );
}

exports.getACCODAllDataBySchool = (req, res) => {
  const { school } = req.body;

  db.query(
    "SELECT *FROM employee WHERE school= ? AND designation = 'Co-ordinator' ",
    [school],
    (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ message: err });
      } else {
        res.json({ message: result });
      }
    }
  );
}

exports.getTeacherAllDataBySchool = (req, res) => {
  const { school } = req.body;

  db.query(
    "SELECT *FROM employee WHERE school= ? ",
    [school],
    (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ message: err });
      } else {
        res.json({ message: result });
      }
    }
  );
}

exports.getAdminAllData = (req, res) => {
  db.query(
    "SELECT *FROM employee WHERE emp_type = 'Administrative' ",
    (err, result) => {
      res.json({ message: result });
    }
  );
}

exports.getEmployeeByID = (req, res) => {
  const { emp_id } = req.body;
  db.query("SELECT *FROM employee WHERE emp_id=?", emp_id, (err, result) => {
    db.query(
      "SELECT *FROM employee_attendance_salary WHERE emp_id=?",
      emp_id,
      (err, result2) => {
        res.json({ message: result, salery: result2 });
      }
    );
  });
}

exports.getEmployeeCount = (req, res) => {
  db.query(
    "SELECT COUNT(emp_id) as totalEmployee FROM employee",
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

// get all employee by searching by name or id



exports.getEmployeeByidd = (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM employee WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
}

exports.addRecruitmentApplicant = (req, res) => {
  const {
    adder_id,
    adder_name,
    applicant_name,
    department_name,
    apply_for,
    applicant_cv,
    date,
    care_of,
    recruitment_type,
    evolution_question,
    interview_section,
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
      adder_id,
      adder_name,
      applicant_name,
      department_name,
      apply_for,
      applicant_cv: applicant_cv_name,
      date,
      care_of,
      status: "Pending",
      feedback: "",
      evolutorID: "",
      evolutor_name: "",
      recruitment_type,
      evolution_question,
      interview_section,
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


exports.EmployeeAttendancePeriod = (req, res) => {
  const { pname, stime, etime, session } = req.body;
  db.query(
    "INSERT INTO employee_attendance_period SET ?",
    { pname, stime, etime, session },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

exports.getEmployeeAttendancePeriod = (req, res) => {
  db.query("SELECT *FROM employee_attendance_period", (err, result) => {
    res.json({ message: result });
  });
}

// router.post("/getEmployeeAttendanceDevice", (req, res) => {
//   const { date1, date2 } = req.body;

//   db.query(
//     `SELECT * FROM attendance_device WHERE date BETWEEN '${date1}' AND '${date2}'`,
//     (err, result) => {
//       if (err) {
//         res.json({ ok: false, message: err });
//       } else {
//         res.json({ ok: true, message: result });
//       }
//     }
//   );
// });



exports.getEmployeeAttendanceDevice = (req, res) => {
  const { date1, date2, page = 1, limit = 1000 } = req.body;


  const offset = (page - 1) * limit;

 
  db.query(
    `SELECT COUNT(*) as total FROM attendance_device WHERE date BETWEEN ? AND ?`,
    [date1, date2],
    (err, countResult) => {
      if (err) {
        return res.json({ ok: false, message: err });
      }

      const total = countResult[0].total;

     
      db.query(
        `SELECT * FROM attendance_device WHERE date BETWEEN ? AND ? ORDER BY date ASC LIMIT ? OFFSET ?`,
        [date1, date2, Number(limit), Number(offset)],
        (err, result) => {
          if (err) {
            res.json({ ok: false, message: err });
          } else {
            res.json({
              ok: true,
              message: {
                data: result,
                total, 
                page: Number(page),
                limit: Number(limit),
              },
            });
          }
        }
      );
    }
  );
}









exports.DeleteEmployeeAttendancePeriod = (req, res) => {
  const { id } = req.body;
  db.query(
    "DELETE FROM employee_attendance_period WHERE id=?",
    id,
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

exports.addTeacherEvaluation = (req, res) => {
  const {
    termName,
    department,
    teacherID,
    teacherName,
    className,
    section,
    session,
  } = req.body;

  let fileName = "";

  if (req.files !== null && req.files.attachFile !== undefined) {
    let file = req.files.attachFile;
    fileName = uuidv4() + file.name;
    file.mv(publicDirectory + "/teacherEvaluationFile/" + fileName, (err) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        db.query(
          `INSERT INTO teacher_evaluation SET ? ON DUPLICATE KEY UPDATE attachFile = VALUES(attachFile)`,
          {
            termName: termName,
            department: department,
            teacherID: teacherID,
            teacherName: teacherName,
            className: className,
            section: section,
            attachFile: fileName,
            session: session,
          },
          (err, result) => {
            if (err) {
              res.json({ ok: false, message: err });
            } else {
              res.json({ ok: true, message: result });
            }
          }
        );
      }
    });
  } else {
    res.json({ ok: false, message: "No file attached." });
  }
}

exports.getTeacherEvaluation = (req, res) => {
  const { session, termName, department } = req.body;

  let sql = "SELECT * FROM teacher_evaluation WHERE session = ?";
  let queryData = [session];

  if (termName !== "") {
    sql += " AND termName = ? ";
    queryData.push(termName);
  }

  if (department !== "") {
    sql += " AND department = ? ";
    queryData.push(department);
  }

  db.query(sql, queryData, (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  });
}

exports.getAdminEvaluationFormList = (req, res) => {
  const { designation } = req.body;
  db.query("SELECT * FROM admin_evaluation_form", (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: result });
    }
  });
}

exports.getEvaluator = (req, res) => {
  const { designation } = req.body;
  db.query(
    "SELECT emp_fname, emp_lname, emp_id FROM employee WHERE designation= ? ",
    designation,
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: result });
      }
    }
  );
}

exports.getCompletedEvolutionFor = (req, res) => {
  const { evaluation_type, ev_ID } = req.body;
  db.query(
    "SELECT evaluation_for_ID, evaluation_for_Name FROM evaluation_all_answer WHERE evaluation_type= ? AND  ev_ID = ? AND evaluated_by_ID = ?",
    [evaluation_type, ev_ID, evaluated_by_ID],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: result });
      }
    }
  );
}

exports.evaluationQuestionsForm = (req, res) => {
  const {
    ev_ID,
    evaluator,
    department,
    evaluation_for_ID,
    evaluation_for_Name,
    evaluation_type,
    evaluation_question,
    total_points,
    session,
  } = req.body;
  db.query(
    "INSERT INTO evaluation_all_questions SET ?",
    {
      ev_ID,
      department,
      evaluation_for_ID,
      evaluation_for_Name,
      evaluation_type,
      evaluation_question,
      total_points,
      session,
    },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        const evaluatorObj = JSON.parse(evaluator);

        if (evaluatorObj.length > 0) {
          const values = evaluatorObj.map((evaluator) => {
            const { emp_id, emp_fname, emp_lname } = evaluator;
            return [ev_ID, emp_id, emp_fname + " " + emp_lname];
          });

          db.query(
            "INSERT INTO evaluation_all_by (ev_ID, evaluator_ID, evaluator_Name) VALUES ?",
            [values],
            (err, result) => {
              if (err) {
                res.json({ message: err });
              } else {
                res.json({ ok: true, message: "Form added" });
              }
            }
          );
        } else {
          res.json({ ok: true, message: "Form added" });
        }
      }
    }
  );
}

exports.updateEvaluationQuestionsForm = (req, res) => {
  const {
    ev_ID,
    evaluator,
    department,
    evaluation_for_ID,
    evaluation_for_Name,
    evaluation_type,
    evaluation_question,
    total_points,
  } = req.body;
  db.query(
    "UPDATE evaluation_all_questions SET ? WHERE ev_ID = ?",
    [
      {
        department,
        evaluation_for_ID,
        evaluation_for_Name,
        evaluation_type,
        evaluation_question,
        total_points,
      },
      ev_ID,
    ],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        const evaluatorObj = JSON.parse(evaluator);

        if (evaluatorObj.length > 0) {
          db.query(
            "DELETE FROM evaluation_all_by WHERE ev_ID = ?",
            [ev_ID],
            (err, result) => {
              if (err) {
                res.json({ message: err });
              } else {
                const values = evaluatorObj.map((evaluator) => {
                  const { emp_id, emp_fname, emp_lname } = evaluator;
                  return [ev_ID, emp_id, emp_fname + " " + emp_lname];
                });

                db.query(
                  "INSERT INTO evaluation_all_by (ev_ID, evaluator_ID, evaluator_Name) VALUES ?",
                  [values],
                  (err, result) => {
                    if (err) {
                      res.json({ message: err });
                    } else {
                      res.json({ ok: true, message: "Form added" });
                    }
                  }
                );
              }
            }
          );
        } else {
          res.json({ ok: true, message: "Form added" });
        }
      }
    }
  );
}

exports.evaluationFormStatus = (req, res) => {
  const { status, ev_ID } = req.body;
  db.query(
    "UPDATE evaluation_all_questions SET ? WHERE ev_ID = ?",
    [{ status }, ev_ID],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({
          ok: true,
          message: `successfully status updated into ${status}`,
        });
      }
    }
  );
}

exports.getEvaluationAnswerListByID = (req, res) => {
  const { ev_ID } = req.body;
  db.query(
    "SELECT * FROM evaluation_all_answer WHERE ev_ID = ?",
    [ev_ID],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: result });
      }
    }
  );
}

exports.evaluationAnsweForm = (req, res) => {
  const {
    ev_ID,
    evaluated_by_ID,
    evaluated_by_Name,
    evaluation_for_ID,
    evaluation_for_Name,
    evaluation_type,
    total_points,
    answers,
    given_points,
    session,
    evaluation_month,
  } = req.body;
  db.query(
    "INSERT INTO evaluation_all_answer SET ?",
    {
      ev_ID,
      evaluated_by_ID,
      evaluated_by_Name,
      evaluation_for_ID,
      evaluation_for_Name,
      evaluation_type,
      total_points,
      answers,
      given_points,
      session,
      evaluation_month,
    },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({
          ok: true,
          message: `Answer submitted for ${evaluation_for_Name}`,
        });
      }
    }
  );
}

exports.addadminevaluationForm = (req, res) => {
  const {
    Form_ID,
    Employee_Name,
    Employee_ID,
    Employee_Designation,
    Employee_Department,
    Evaluation_Month,
    Create_Date,
    Share_Date,
    CRITERIA,
    Evaluated_By_ID,
    Evaluated_By_Name,
    Evaluated_By_Designation,
  } = req.body;
  db.query(
    "INSERT INTO admin_evaluation_form SET ?",
    {
      Form_ID,
      Employee_Name,
      Employee_ID,
      Employee_Designation,
      Employee_Department,
      Evaluation_Month,
      Create_Date,
      Share_Date,
      CRITERIA,
      Evaluated_By_ID,
      Evaluated_By_Name,
      Evaluated_By_Designation,
    },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ ok: true, message: "Form added" });
      }
    }
  );
}

exports.updateadminevaluationForm = (req, res) => {
  const { Form_ID, CRITERIA } = req.body;
  db.query(
    "UPDATE admin_evaluation_form SET ? WHERE Form_ID = ?",
    [{ CRITERIA }, Form_ID],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ ok: true, message: "Form updated" });
      }
    }
  );
}

exports.updatePrincipalApproval = (req, res) => {
  const { Form_ID, approval } = req.body;
  db.query(
    "UPDATE admin_evaluation_form SET Principal_Approval = ? WHERE Form_ID = ?",
    [approval, Form_ID],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ ok: true, message: "Form updated" });
      }
    }
  );
}

exports.getEvaluationFormList = (req, res) => {
  const { type } = req.body;
  db.query(
    `SELECT
    EQ.*,
    GROUP_CONCAT(CONCAT('(', EB.evaluator_ID, ') - ', EB.evaluator_Name)
    ORDER BY EB.evaluator_ID ASC SEPARATOR ', ') AS EvaluatorList
FROM
    evaluation_all_questions EQ
LEFT JOIN
    evaluation_all_by EB
ON
    EQ.ev_ID = EB.ev_ID
WHERE
    EQ.evaluation_type = ?
GROUP BY
    EQ.ev_ID;
`,
    type,
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: result });
      }
    }
  );
}

exports.getSalaryByAccount = async (req, res) => {
  const { selectedMonth } = req.body;

  const selectedDate = new Date(selectedMonth);

  // const lastDayOfMonth = new Date(
  //   selectedDate.getFullYear(),
  //   selectedDate.getMonth() + 1,
  //   0
  // );
  // const formattedLastDateOfMonth = lastDayOfMonth.toISOString().split('T')[0];

  // const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  // const formattedFirstDateOfMonth = firstDayOfMonth.toISOString().split('T')[0];

  // const firstDayOfYear = new Date(selectedDate.getFullYear(), 0, 1);
  // const formattedFirstDateOfYear = firstDayOfYear.toISOString().split('T')[0];

  // const lastDayOfYear = new Date(selectedDate.getFullYear(), 11, 31);
  // const formattedLastDateOfYear = lastDayOfYear.toISOString().split('T')[0];

  const formatedLastDateOfMonth = `${selectedMonth}-31`;
  const formatedFirstDateOfMonth = `${selectedMonth}-01`;
  const formatedFirstDateOfYear = `${selectedMonth.split("-")[0]}-01-01`;
  const formatedLastDateOfYear = `${selectedMonth.split("-")[0]}-12-31`;

  const sql = `
   SELECT 
    salary_report_by_HR.*,
    CASE
        WHEN class_teacher.emp_id IS NOT NULL THEN 1
        ELSE 0
    END AS class_teacher,
    CASE
        WHEN class_coordinator.emp_id IS NOT NULL THEN 1
        ELSE 0
    END AS class_coordinator,
    CASE
        WHEN karz_request.pstatus = 'Approved' 
             AND karz_request.mstatus = 'Approved' 
             AND karz_request.hrstatus = 'Approved' 
             AND karz_request.remaining_payment > '0' 
             AND '${formatedLastDateOfMonth}' <= karz_request.last_day_return 
             AND '${formatedLastDateOfMonth}' >= karz_request.approve_date 
        THEN LEAST(karz_request.mreturn, karz_request.remaining_payment)
        ELSE 0
    END AS karz,
    emp_salary.increament,
    emp_salary.new_salary,
    emp_salary.previousSalary,
    employee.gender,
    employee.trainee_end_joining,
    employee.trainee_increment,
    employee.trainee_joining,
    employee.trainee_period,
    employee.joining_as_permanent,
    employee.emp_type,
    IFNULL( employee_allowance.amount, 0) AS allowance_amount
FROM
    salary_report_by_HR
LEFT JOIN
    class_teacher ON salary_report_by_HR.emp_id = class_teacher.emp_id
LEFT JOIN
employee_allowance ON salary_report_by_HR.emp_id = employee_allowance.emp_id
LEFT JOIN
    class_coordinator ON salary_report_by_HR.emp_id = class_coordinator.emp_id
LEFT JOIN
    employee ON salary_report_by_HR.emp_id = employee.emp_id
LEFT JOIN
    karz_request ON salary_report_by_HR.emp_id = karz_request.emp_id
LEFT JOIN (
    SELECT emp_id, increament, new_salary, previousSalary, applicable_month
    FROM (
        SELECT *,
               ROW_NUMBER() OVER (PARTITION BY emp_id ORDER BY applicable_month DESC) AS rn
        FROM employee_salary_management
        WHERE applicable_month <= '${formatedLastDateOfMonth}'
    ) AS subquery
    WHERE rn = 1
) AS emp_salary ON salary_report_by_HR.emp_id = emp_salary.emp_id
 WHERE salary_report_by_HR.report_month =  '${selectedMonth}'
GROUP BY salary_report_by_HR.emp_id;

  `;

  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({ ok: false, message: err.message });
    } else {
      res.status(200).json({ ok: true, message: result });
    }
  });
}

exports.getSalaryReportByHR = async (req, res) => {
  const { selectedMonth } = req.body;

  // 2023-12
  const selectedDate = new Date(selectedMonth);

  const lastDayOfMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0
  );
  const formatedLastDateOfMonth = lastDayOfMonth.toISOString().split("T")[0];

  const firstDayOfMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1
  );
  const formatedFirstDateOfMonth = firstDayOfMonth.toISOString().split("T")[0];

  const firstDayOfYear = new Date(selectedDate.getFullYear(), 0, 1);
  const formatedFirstDateOfYear = firstDayOfYear.toISOString().split("T")[0];

  const lastDayOfYear = new Date(selectedDate.getFullYear(), 11, 31);
  const formatedLastDateOfYear = lastDayOfYear.toISOString().split("T")[0];

  // const formatedLastDateOfMonth = `${selectedMonth}-31`;
  // const formatedFirstDateOfMonth = `${selectedMonth}-01`;
  // const formatedFirstDateOfYear = `${selectedMonth.split('-')[0]}-01-01`;
  // const formatedLastDateOfYear = `${selectedMonth.split('-')[0]}-12-31`;

  const sql = `
      SELECT 
        e.emp_id,
        e.school as campus,
        e.emp_fname,
        e.emp_lname,
        e.emp_type,
        e.designation,
        e.department,
        e.trainee_joining,
        e.overTimeEligibility,
        IFNULL(a.presentCount, 0) AS presentCount,
        IFNULL(pl.previous_enjoyed_extra_leave, 0) AS previous_enjoyed_extra_leave,
        IFNULL(ol.halfDay, 0) AS halfDay,
        IFNULL(plv.payableLeave, 0) AS payableLeave,
        IFNULL(sl.ShortLeaveTime, 0) AS ShortLeaveTime,
IFNULL(lm.applicantLeaveMonthTotalDays, 0) AS applicantLeaveMonthTotalDays,
IFNULL(lm.applicantLeaveYearTotalDays, 0) AS applicantLeaveYearTotalDays,
IFNULL(a.lateCount, 0) AS lateCount,
        IFNULL(a.totalOverTime, 0) AS totalOverTime,
        IFNULL(a.overTimeCount, 0) AS overTimeCount,
        IFNULL(s.applicantLeaveYearDefaultTotalDays, 0) AS applicantLeaveYearDefaultTotalDays
      FROM employee e
      LEFT JOIN (
        SELECT 
          applicantIdNo,
          SUM(CASE 
            WHEN applicantLeaveFrom <= '${formatedLastDateOfMonth}' AND applicantLeaveTo >= '${formatedFirstDateOfMonth}' THEN applicantLeaveTotalDays 
            ELSE 0 
          END) AS applicantLeaveMonthTotalDays,
          SUM(CASE 
            WHEN applicantLeaveFrom <= '${formatedLastDateOfYear}' AND applicantLeaveTo >= '${formatedFirstDateOfYear}' THEN applicantLeaveTotalDays 
            ELSE 0 
          END) AS applicantLeaveYearTotalDays
        FROM leave_application 
        WHERE s1 = 'approved'
          AND s2 = 'approved'
          AND s3 = 'approved'
          AND   leaveType = 'Annual'
        GROUP BY applicantIdNo
      ) lm ON e.emp_id = lm.applicantIdNo

      LEFT JOIN (
        SELECT 
          applicantIdNo,
         SUM(CASE 
            WHEN applicantLeaveFrom <= '${formatedLastDateOfMonth}' AND applicantLeaveTo >= '${formatedFirstDateOfMonth}' 
         THEN checkInTime - checkOutTime
            ELSE 0 
          END) AS ShortLeaveTime 
         
        FROM leave_application 
        WHERE s1 = 'approved'
          AND s2 = 'approved'
          AND s3 = 'approved'
          AND   leaveType = 'Short'
        GROUP BY applicantIdNo
      ) sl ON e.emp_id = sl.applicantIdNo

      LEFT JOIN (
        SELECT 
        applicantIdNo,
        COUNT(applicantIdNo) AS halfDay
        FROM leave_application 
        WHERE  leaveType = 'Early'
          AND s1 = 'approved'
           AND s2 = 'approved'
          AND s3 = 'approved'
       AND   applicantLeaveFrom <= '${formatedLastDateOfMonth}' AND applicantLeaveFrom >= '${formatedFirstDateOfMonth}'
        GROUP BY applicantIdNo
      ) ol ON e.emp_id = ol.applicantIdNo

      LEFT JOIN (
        SELECT 
        applicantIdNo,
        COUNT(applicantIdNo) AS payableLeave
        FROM leave_application 
        WHERE  leaveType = 'Special'
          AND s1 = 'approved'
           AND s2 = 'approved'
          AND s3 = 'approved'
       AND   applicantLeaveFrom <= '${formatedLastDateOfMonth}' AND applicantLeaveFrom >= '${formatedFirstDateOfMonth}'
        GROUP BY applicantIdNo
      ) plv ON e.emp_id = plv.applicantIdNo

      LEFT JOIN (
        SELECT empID AS emp_id, SUM(lateTimeStatus) AS lateCount,
        SUM(overTime)   AS totalOverTime,
        SUM(overTimeStatus) AS overTimeCount, COUNT(empID) as presentCount
        FROM attendance
        WHERE reportedMonth = '${selectedMonth}'
        GROUP BY empID
      ) a ON e.emp_id = a.emp_id
     
      LEFT JOIN (
        SELECT emp_id, t_yearly_leave AS applicantLeaveYearDefaultTotalDays
        FROM employee_attendance_salary
      ) s ON e.emp_id = s.emp_id
      LEFT JOIN (
        SELECT emp_id, SUM(enjoyed_extra_leave) AS previous_enjoyed_extra_leave
        FROM salary_report_by_HR  WHERE report_month < ${selectedMonth}
      ) pl ON e.emp_id = pl.emp_id
      WHERE e.status = ''
      ;
    `;
  db.query(sql, (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  });
}

exports.getOverTimeReportByHR = async (req, res) => {
  const { selectedMonth } = req.body;

  const sql = `
      SELECT 
        e.emp_id,
        e.emp_fname,
        e.emp_lname,
        e.emp_type,
        e.campus,
        e.school,
        e.designation,
        e.department,
        e.overTimeEligibility,
          emp_salary.new_salary,
        IFNULL(a.totalOverTime, 0) AS totalOverTime,
        IFNULL(a.overTimeCount, 0) AS overTimeCount
      FROM employee e

      LEFT JOIN (
        SELECT empID AS emp_id,
        SUM(overTime)   AS totalOverTime,
        SUM(overTimeStatus) AS overTimeCount
        FROM attendance
        WHERE reportedMonth = '${selectedMonth}'
        GROUP BY empID
      ) a ON e.emp_id = a.emp_id

    LEFT JOIN (
    SELECT emp_id, increament, new_salary, previousSalary, applicable_month
    FROM (
        SELECT *,
               ROW_NUMBER() OVER (PARTITION BY emp_id ORDER BY applicable_month DESC) AS rn
        FROM employee_salary_management
        WHERE applicable_month <= '${selectedMonth}-30'
    ) AS subquery
    WHERE rn = 1
) AS emp_salary ON e.emp_id = emp_salary.emp_id
     
      WHERE e.status = '' 
      ;
    `;
  db.query(sql, (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  });
}

exports.fetchPreviousSalaryReportByHR = async (req, res) => {
  const { selectedMonth } = req.body;

  const sql = `
  SELECT * FROM salary_report_by_HR WHERE report_month = '${selectedMonth}';
  `;
  db.query(sql, (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  });
}

exports.addFinalSalarySheet = (req, res) => {
  const {
    employeeDataList,
    creator_ID,
    creator_Name,
    c_date,
    report_month,
    session,
  } = req.body;

  const selectedDate = new Date(report_month);

  // const lastDayOfMonth = new Date(
  //   selectedDate.getFullYear(),
  //   selectedDate.getMonth() + 1,
  //   0
  // );
  // const formattedLastDateOfMonth = lastDayOfMonth.toISOString().split('T')[0];

  // const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  // const formattedFirstDateOfMonth = firstDayOfMonth.toISOString().split('T')[0];

  // const firstDayOfYear = new Date(selectedDate.getFullYear(), 0, 1);
  // const formattedFirstDateOfYear = firstDayOfYear.toISOString().split('T')[0];

  // const lastDayOfYear = new Date(selectedDate.getFullYear(), 11, 31);
  // const formattedLastDateOfYear = lastDayOfYear.toISOString().split('T')[0];

  const formatedLastDateOfMonth = `${report_month}-31`;
  const formatedFirstDateOfMonth = `${report_month}-01`;
  const formatedFirstDateOfYear = `${report_month.split("-")[0]}-01-01`;
  const formatedLastDateOfYear = `${report_month.split("-")[0]}-12-31`;

  const salaryReportData = [];
  const loanData = [];
  const parsedEmployeeDataList = JSON.parse(employeeDataList);

  parsedEmployeeDataList.forEach((employeeData) => {
    const {
      emp_id,

      emp_name,
      emp_type,
      department,
      designation,
      joining_date,
      working_days,
      probation_day,
      new_joining,
      absent,
      lateCount,
      payable,
      basic_salary,
      probation_to,
      training_to,
      last_increment,
      gross_salary,
      per_day_salary,
      others,

      allowance_amount,
      halfDay,
      unAuthorized,
      payableLeave,
      ShortLeaveTime,

      total_earning,
      absent_deducation,
      salary_deducation,
      lunch_payment,
      loan_adjustment,
      total_deduction,
      ait,
      ovetime_payment,
      ovetime_payable,
      festival_bonus,
      class_co_payment,
      class_teacher_payment,
      hifz_payment,
      support_sat_payment,
      net_payable_amount,
      remarks,
    } = employeeData;

    const data = {
      emp_id,
      emp_name,
      emp_type,
      department,
      designation,
      joining_date,
      working_days,
      probation_day,
      new_joining,
      absent,
      lateCount,

      allowance_amount,
      halfDay,
      unAuthorized,
      payableLeave,
      ShortLeaveTime,

      payable,
      basic_salary,
      probation_to,
      training_to,
      last_increment,
      gross_salary,
      per_day_salary,
      others,
      total_earning,
      absent_deducation,
      salary_deducation,
      lunch_payment,
      loan_adjustment,
      total_deduction,
      ait,
      ovetime_payment,
      ovetime_payable,
      festival_bonus,
      class_co_payment,
      class_teacher_payment,
      hifz_payment,
      support_sat_payment,
      net_payable_amount,
      remarks,
      report_month,
      c_date,
      new_joining,
      session,
      creator_ID,
      creator_Name,
    };

    salaryReportData.push(data);
    loanData.push([loan_adjustment.toString(), emp_id]);
  });

  const mappedData = salaryReportData.map((data) => Object.values(data));
  const mappedLoanData = loanData.map((data) => Object.values(data));

  const sql = `
    INSERT INTO final_salary_sheet
    (
      emp_id, emp_name,  emp_type, department, designation, joining_date, working_days, probation_day, new_joining, absent, lateCount,  allowance_amount, halfDay, unAuthorized,  payableLeave, ShortLeaveTime, payable, basic_salary, probation_to, training_to, last_increment, gross_salary, per_day_salary, others, total_earning, absent_deducation, salary_deducation, lunch_payment, loan_adjustment, total_deduction, ait, ovetime_payment, ovetime_payable, festival_bonus, class_co_payment, class_teacher_payment, hifz_payment, support_sat_payment, net_payable_amount, remarks, report_month, c_date, session,
      creator_ID, creator_Name
    )
    VALUES ?
    ON DUPLICATE KEY UPDATE
      emp_name = VALUES(emp_name),
      emp_type = VALUES( emp_type),
      department = VALUES(department),
      designation = VALUES(designation),
      joining_date = VALUES(joining_date),
      working_days = VALUES(working_days),
      probation_day = VALUES(probation_day),
      new_joining = VALUES(new_joining),
      absent = VALUES(absent),
      lateCount = VALUES(lateCount),
      allowance_amount = VALUES(allowance_amount),
      halfDay = VALUES(halfDay),
      unAuthorized = VALUES(unAuthorized),
      payableLeave = VALUES(payableLeave),
      ShortLeaveTime = VALUES(ShortLeaveTime),
      payable = VALUES(payable),
      basic_salary = VALUES(basic_salary),
      probation_to = VALUES(probation_to),
      training_to = VALUES(training_to),
      last_increment = VALUES(last_increment),
      gross_salary = VALUES(gross_salary),
      per_day_salary = VALUES(per_day_salary),
      others = VALUES(others),
      total_earning = VALUES(total_earning),
      absent_deducation = VALUES(absent_deducation),
      salary_deducation = VALUES(salary_deducation),
      lunch_payment = VALUES(lunch_payment),
      loan_adjustment = VALUES(loan_adjustment),
      total_deduction = VALUES(total_deduction),
      ait = VALUES(ait),
      ovetime_payment = VALUES(ovetime_payment),
      ovetime_payable = VALUES(ovetime_payable),
      festival_bonus = VALUES(festival_bonus),
      class_co_payment = VALUES(class_co_payment),
      class_teacher_payment = VALUES(class_teacher_payment),
      hifz_payment = VALUES(hifz_payment),
      support_sat_payment = VALUES(support_sat_payment),
      net_payable_amount = VALUES(net_payable_amount),
      remarks = VALUES(remarks),
      report_month = VALUES(report_month),
      c_date = VALUES(c_date),
      session = VALUES(session),
      creator_ID = VALUES(creator_ID),
      creator_Name = VALUES(creator_Name)
  `;

  db.query(sql, [mappedData], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      const sql2 = `
  UPDATE karz_request
  SET remaining_payment = remaining_payment - ?
  WHERE emp_id = ? AND '${formatedLastDateOfMonth}' <= last_day_return 
             AND '${formatedLastDateOfMonth}' >= approve_date AND pstatus = 'Approved'  
 AND mstatus = 'Approved' 
             AND hrstatus = 'Approved' 
`;

      const values2 = loanData;

      function executeQuery(amount, emp_id) {
        return new Promise((resolve, reject) => {
          db.query(sql2, [amount, emp_id], (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
      }

      (async () => {
        try {
          const queryPromises = values2.map(([amount, emp_id]) =>
            executeQuery(amount, emp_id)
          );

          const results = await Promise.all(queryPromises);

          res.json({
            ok: true,
            message: "Data submitted successfully",
            results,
          });
        } catch (err) {
          console.error(err);
          res.status(500).json({ ok: false, message: "An error occurred" });
        }
      })();

      const insertValues = parsedEmployeeDataList.map((employeeData) => {
        const { emp_id, emp_name, gross_salary, ait } = employeeData;
        return [emp_id, emp_name, gross_salary, ait, report_month, session];
      });

      const insertSQL = `INSERT INTO AIT_Report (emp_id, emp_name, gross_salary, amount, month, session) VALUES ?`;

      db.query(insertSQL, [insertValues], (err, result) => {
        if (err) {
          res.json({ ok: false, message: err });
        } else {
          res.json({ ok: true, message: "submit" });
        }
      });
    }
  });
}

exports.addSalaryReportByHR = (req, res) => {
  const {
    employeeDataList,
    creator_ID,
    creator_Name,
    // working_days,
    c_date,
    report_month,
    session,
  } = req.body;

  const salaryReportData = [];
  const parsedEmployeeDataList = JSON.parse(employeeDataList);

  parsedEmployeeDataList.forEach((employeeData) => {
    const {
      halfDay,
      ShortLeaveTime,
      campus,
      unAuthorized,
      absent,
      applicantLeaveMonthTotalDays,
      applicantLeaveYearDefaultTotalDays,
      applicantLeaveYearTotalDays,
      department,
      designation,
      emp_fname,
      emp_id,
      emp_lname,
      emp_type,
      job_status,
      working_days,
      vacation_days,
      lateCount,
      new_joining,
      outOfLimit,
      ovetime_payable,
      payable,
      remarks,
      trainee_joining,
      hifz_count,
      support_sat_count,
      payableLeave,
    } = employeeData;

    const data = {
      emp_id,
      emp_name: `${emp_fname} ${emp_lname}`,
      emp_type: emp_type,
      campus,
      department,
      designation,
      joining_date: trainee_joining,
      job_status,
      working_days,
      vacation_days,
      enjoyed_leave: applicantLeaveMonthTotalDays,
      enjoyed_extra_leave: outOfLimit,
      payableLeave,
      absent,
      halfDay,
      ShortLeaveTime,
      unAuthorized,
      lateCount,
      ovetime_payable,
      payable,
      hifz_count,
      support_sat_count,
      remarks,
      report_month,
      c_date,
      new_joining,
      session,
      creator_ID,
      creator_Name,
    };

    salaryReportData.push(data);
  });

  const mappedData = salaryReportData.map((data) => Object.values(data));

  const sql = `
  INSERT INTO salary_report_by_HR
  (emp_id, emp_name, emp_type, campus, department, designation, joining_date, job_status, working_days, vacation_days, enjoyed_leave, enjoyed_extra_leave, payableLeave, absent, halfDay, ShortLeaveTime,   unAuthorized, lateCount, ovetime_payable, payable, hifz_count, support_sat_count, remarks, report_month, c_date, new_joining, session, creator_ID, creator_Name)
  VALUES ?
  ON DUPLICATE KEY UPDATE
    emp_name = VALUES(emp_name),
    campus = VALUES(campus),
    emp_type = VALUES(emp_type),
    department = VALUES(department),
    designation = VALUES(designation),
    joining_date = VALUES(joining_date),
    job_status = VALUES(job_status),
    working_days = VALUES(working_days),
    vacation_days = VALUES(vacation_days),
    enjoyed_leave = VALUES(enjoyed_leave),
    enjoyed_extra_leave = VALUES(enjoyed_extra_leave),
    payableLeave = VALUES(payableLeave),
    absent = VALUES(absent),
    halfDay = VALUES(halfDay),
    ShortLeaveTime = VALUES(ShortLeaveTime),
    unAuthorized = VALUES(unAuthorized),
    lateCount = VALUES(lateCount),
    ovetime_payable = VALUES(ovetime_payable),
    payable = VALUES(payable),
    hifz_count = VALUES(hifz_count),
    support_sat_count = VALUES(support_sat_count),
    remarks = VALUES(remarks),
    c_date = VALUES(c_date),
    new_joining = VALUES(new_joining),
    creator_ID = VALUES(creator_ID),
    creator_Name = VALUES(creator_Name)
`;

  db.query(sql, [mappedData], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: "Data submitted successfully" });
    }
  });
}

exports.addOverTimeReportByHR = (req, res) => {
  const {
    employeeDataList,
    creator_ID,
    creator_Name,
    c_date,
    report_month,
    session,
  } = req.body;

  const salaryReportData = [];
  const parsedEmployeeDataList = JSON.parse(employeeDataList);

  parsedEmployeeDataList.forEach((employeeData) => {
    const {
      emp_id,
      emp_fname,
      emp_lname,
      designation,
      department,
      campus,
      school,
      details,
      totalOverTime,
      overTimeCount,
      working_days,
      ovetime_payable,
      gross_salary,
      basic_salary,
      per_day_salary,
      overTimePayableAmount,
      overTimeAdjustment,
      overTimeNetPayable,
      remarks,
    } = employeeData;

    const data = {
      emp_id,
      emp_fname,
      emp_lname,
      designation,
      department,
      campus,
      school,
      details,
      totalOverTime,
      overTimeCount,
      working_days,
      ovetime_payable,
      gross_salary,
      basic_salary,
      per_day_salary,
      overTimePayableAmount,
      overTimeAdjustment,
      overTimeNetPayable,
      remarks,
      report_month,
      session,
      c_date,
      creator_ID,
      creator_Name,
    };

    salaryReportData.push(data);
  });

  const mappedData = salaryReportData.map((data) => Object.values(data));

  const sql = `
  INSERT INTO overTime_payroll 
  (emp_id, emp_fname, emp_lname, designation, department, campus, school, details, totalOverTime, overTimeCount, working_days, ovetime_payable, gross_salary, basic_salary, per_day_salary, overTimePayableAmount, overTimeAdjustment, overTimeNetPayable, remarks, report_month,session, c_date, creator_ID, creator_Name) 
  VALUES ?
  ON DUPLICATE KEY UPDATE
    emp_fname = VALUES(emp_fname),
    emp_lname = VALUES(emp_lname),
    designation = VALUES(designation),
    department = VALUES(department),
    campus = VALUES(campus),
    school = VALUES(school),
    details= VALUES (details),
    totalOverTime = VALUES(totalOverTime),
    overTimeCount = VALUES(overTimeCount),
    working_days = VALUES(working_days),
    ovetime_payable = VALUES(ovetime_payable),
    gross_salary = VALUES(gross_salary),
    basic_salary = VALUES(basic_salary),
    per_day_salary = VALUES(per_day_salary),
    overTimePayableAmount = VALUES(overTimePayableAmount),
    overTimeAdjustment = VALUES(overTimeAdjustment),
    overTimeNetPayable = VALUES(overTimeNetPayable),
    remarks = VALUES(remarks),
    session = VALUES(session),
    c_date = VALUES(c_date),
    creator_ID = VALUES(creator_ID),
    creator_Name = VALUES(creator_Name)
`;

  db.query(sql, [mappedData], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: "Data submitted successfully" });
    }
  });
}

exports.fetchPreviousOverTimeReportByHR = (req, res) => {
  const { selectedMonth } = req.body;

  const sql = `
  SELECT * FROM overTime_payroll WHERE report_month = '${selectedMonth}';
  `;
  db.query(sql, (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  });
}

exports.addSalaryIncreament = (req, res) => {
  const {
    emp_id,
    emp_name,
    emp_department,
    emp_designation,
    previousSalary,
    increament,
    applicable_month,
    new_salary,
    status,
  } = req.body;

  const employeeData = {
    emp_id,
    emp_name,
    emp_department,
    emp_designation,
    previousSalary,
    applicable_month,
    increament,
    new_salary,
    status: status !== undefined ? status : 0,
  };

  const sql = `
    INSERT INTO employee_salary_management
    SET ?
    ON DUPLICATE KEY UPDATE
      emp_name = VALUES(emp_name),
      emp_department = VALUES(emp_department),
      emp_designation = VALUES(emp_designation),
      previousSalary = VALUES(previousSalary),
      applicable_month = VALUES(applicable_month),
      increament = VALUES(increament),
      new_salary = VALUES(new_salary),
      status = VALUES(status)
  `;

  db.query(sql, employeeData, (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: "Data Added" });
    }
  });
}

exports.getAllSalaryHistory = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const offset = (page - 1) * pageSize;

  db.query(
    "SELECT * FROM employee_salary_management ORDER BY emp_id DESC LIMIT ? OFFSET ?",
    [pageSize, offset],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        db.query(
          "SELECT COUNT(*) as totalCount FROM employee_salary_management",
          (err, totalCountResult) => {
            if (err) {
              res.json({ message: err });
            } else {
              const totalCount = totalCountResult[0].totalCount;
              const totalPages = Math.ceil(totalCount / pageSize);
              res.json({ message: result, totalPages });
            }
          }
        );
      }
    }
  );
}

exports.updateSalaryIncreament = (req, res) => {
  const { id, status, ammount, emp_id, session } = req.body;
  db.query(
    "UPDATE employee_salary_management SET ? WHERE id=?",
    [{ status }, id],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        db.query(
          "UPDATE employee_attendance_salary SET salary = ?  WHERE emp_id=? AND session = ?",
          [ammount, emp_id, session],
          (err, result) => {
            if (err) {
              res.json({ ok: false, message: err });
            } else {
              res.json({ ok: true, message: "updated" });
            }
          }
        );
      }
    }
  );
}

exports.addaitparameter = (req, res) => {
  const { percentage, minValue, gender, aitAmmount, session } = req.body;

  const query = `
    INSERT INTO AIT_parameter (percentage,	minValue,	gender,	aitAmmount,	session)
    VALUES (?, ?, ?, ?, ?) 
    ON DUPLICATE KEY UPDATE
      percentage = VALUES(percentage),
      aitAmmount = VALUES(aitAmmount)
  `;

  db.query(
    query,
    [percentage, minValue, gender, aitAmmount, session],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: "Records has been successfully added." });
      }
    }
  );
}

exports.getaitparameter = (req, res) => {
  const { session } = req.body;

  const query = ` SELECT * FROM AIT_parameter WHERE session = ? `;

  db.query(query, [session], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  });
}

exports.addallowance = (req, res) => {
  const { emp_id, emp_name, allowance_for, amount } = req.body;

  const query = `
    INSERT INTO employee_allowance (emp_id, emp_name, allowance_for, amount)
    VALUES (?, ?, ?, ?) 
    ON DUPLICATE KEY UPDATE
    allowance_for = VALUES(allowance_for),
    amount = VALUES(amount)
  `;

  db.query(query, [emp_id, emp_name, allowance_for, amount], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: "Records has been successfully added." });
    }
  });
}

exports.getallowance = (req, res) => {
  const query = ` SELECT * FROM employee_allowance `;

  db.query(query, (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  });
}

exports.deleteallowance = (req, res) => {
  const { emp_id } = req.body;

  const query = ` DELETE FROM employee_allowance WHERE emp_id = ? `;
  db.query(query, [emp_id], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: "Records has been successfully deleted." });
    }
  });
}

exports.getaitreport = (req, res) => {
  const { session } = req.body;

  const query = ` SELECT * FROM AIT_Report WHERE session = ? `;

  db.query(query, [session], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  });
}

//////////////////////// user id prefix ///////////////////////

exports.addUserIdPrefix = (req, res) => {
  const {
    id_prefix,
    type,
    session,
  } = req.body;

  db.query(
    "INSERT INTO user_id_prefix SET ?",
    {
      id_prefix,
      type,
      session,
    },
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          error: true,
          message: "Failed to add user ID prefix.",
        });
      }

      return res.json({
        success: true,
        message: "User ID prefix added successfully.",
        result,
      });
    }
  );
}





exports.getallprefix = (req, res) => {
  db.query("SELECT *FROM user_id_prefix", (err, result) => {
    res.json({ message: result });
  });
}



exports.generateStudentId = (req, res) => {
  const { prefix } = req.body;

  if (!prefix) {
    return res.json({
      success: false,
      message: "Prefix is required",
    });
  }

  db.query(
    `
    SELECT student_id
    FROM student
    WHERE student_id LIKE ?
    ORDER BY CAST(SUBSTRING_INDEX(student_id,'-',-1) AS UNSIGNED) DESC
    LIMIT 1
    `,
    [`${prefix}-%`],
    (err, result) => {
      if (err) {
        return res.json({
          success: false,
          message: err,
        });
      }

      let studentId;

      if (result.length === 0) {
        studentId = `${prefix}-24353`;
      } else {
        const lastNumber = parseInt(
          result[0].student_id.split("-")[1],
          10
        );

        studentId =
          `${prefix}-` + String(lastNumber + 1).padStart(3, "0");
      }

      res.json({
        success: true,
        studentId,
      });
    }
  );
}


exports.generateEmpId = (req, res) => {
  const { prefix } = req.body;

  if (!prefix) {
    return res.json({
      ok: false,
      message: "Prefix is required",
    });
  }

  db.query(
    `SELECT emp_id
     FROM employee
     WHERE emp_id LIKE ?
     ORDER BY CAST(SUBSTRING_INDEX(emp_id,'-',-1) AS UNSIGNED) DESC
     LIMIT 1`,
    [`${prefix}-%`],
    (err, result) => {
      if (err) {
        return res.json({
          ok: false,
          message: err,
        });
      }

      let newEmpId;

      if (result.length === 0) {
        newEmpId = `${prefix}-001`;
      } else {
        const lastNumber = parseInt(result[0].emp_id.split("-")[1], 10);
        newEmpId = `${prefix}-` + String(lastNumber + 1).padStart(3, "0");
      }

      res.json({
        ok: true,
        newEmpId,
      });
    }
  );
}

exports.deleteUserIdPrefix = (req, res) => {
  const { id } = req.body;
  const sql = `DELETE FROM user_id_prefix WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: "User has been successfully deleted." });
    }
  });
}

exports.get = (req, res) => {
  res.send("Management");
}
