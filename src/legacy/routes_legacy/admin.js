const express = require("express");
const router = express.Router();
const cors = require("cors");
const mysql = require("mysql");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

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

// Add a New Event
router.post("/addAcadEvent", (req, res) => {
  const { title, start, end, event_Type,color, purpose,responsible, host_UserName,campus } = req.body;

  db.query(
    "INSERT INTO academic_calendar SET ?",
    { title, start, end, event_Type,color, purpose,responsible, host_UserName,campus },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/deleteAcadEvent/:event_ID", (req, res) => {
  const { event_ID } = req.params;

  db.query(
    "DELETE FROM academic_calendar WHERE event_ID = ?",
    [event_ID],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});


// Get All Events
router.post("/getAcademicEvent", (req, res) => {
//   const { user_type } = req.body;
  let sql = "SELECT ac.*, em.emp_fname, em.emp_lname, em.emp_id, em.emp_type, em.designation, em.department FROM academic_calendar ac JOIN employee em ON ac.responsible = em.emp_id";

//   if (user_type === "Academic") {
//     sql =
//       " SELECT * FROM academic_calendar  WHERE event_Type IN ('Academic', 'General', 'Hifz') ";
//   } else {
//     sql = " SELECT * FROM academic_calendar  WHERE 1=1";
//   }

  db.query(sql, (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.status(200).json(result);
    }
  });
});

//Calendar Section

// Add a New Event
router.post("/addtasks", async (req, res) => {
  const { eventData, taskFiles } = req.body;
  const {
    allDay,
    description,
    start,
    end,
    guest,
    host_UserName,
    priority,
    progress,
    task_Type,
    title,
  } = JSON.parse(eventData);

  var attached_File = "";
  if (req.files !== null) {
    if (req.files.taskFiles !== undefined) {
      var file = req.files.taskFiles;
      attached_File = uuidv4() + file.name;
      file.mv(publicDirectory + "/doTask/" + attached_File, (err) => {
        if (err) {
          res.json({ message: err });
        } else {
          console.log("file uploaded");
        }
      });
    } else {
      attached_File = taskFiles;
    }
  }

  const newTask = {
    title,
    description,
    start,
    end,
    task_Type,
    host_UserName,
    attached_File,
    priority,
    progress,
    allDay,
  };

  try {
    db.query("INSERT INTO calendar_task_list SET ?", newTask, (err, result) => {
      if (err) {
        console.error("Failed to insert event:", err);
        res.status(500).json({ error: "Failed to insert event" + err });
      } else {
        const taskId = result.insertId;
        // Check for previous tasks for each guest and insert into task_guest table
        guest.forEach((singleGuest) => {
          const { username, contribution } = singleGuest;

          // Check for previous tasks with status 'approved'
          db.query(
            'SELECT * FROM calendar_task_list tl JOIN calendar_task_guest tg ON tl.task_ID = tg.task_ID WHERE tl.start <= ? AND tl.end >= ? AND tg.username = ? AND tg.status = "Approved"',
            [end, start, username],
            (err, results) => {
              if (err) {
                console.error("Error checking previous tasks:", err);
                res
                  .status(500)
                  .json({ error: "Failed to check previous tasks." });
                return;
              }
              let status = results.length > 0 ? "Pending" : "Approved";

              // check host  approve power
              db.query(
                `SELECT calendar_approve_power FROM users WHERE username = '${host_UserName}'`,
                (err, result) => {
                  if (err) {
                    console.error("Error retrieving user:", err);
                    res.status(500).json({
                      error: "An error occurred while retrieving user",
                    });
                  } else {
                    if (result.length === 0) {
                      res.status(404).json({ error: "User not found" });
                    } else {
                      const approvePower = result[0].approve_power;
                      if (approvePower) status = "Approved";

                      // check guest approve power
                      db.query(
                        `SELECT calendar_approve_power FROM users WHERE username = '${username}'`,
                        (err, result) => {
                          if (err) {
                            console.error("Error retrieving user:", err);
                            res.status(500).json({
                              error: "An error occurred while retrieving user",
                            });
                          } else {
                            if (result.length === 0) {
                              res.status(404).json({ error: "User not found" });
                            } else {
                              const approvePower = result[0].approve_power;
                              if (approvePower) status = "Pending";
                            }
                          }
                        }
                      );

                      // Insert guest into task_guest table
                      db.query(
                        "INSERT INTO 	calendar_task_guest (task_ID, username, contribution, status) VALUES (?, ?, ?, ?)",
                        [taskId, username, contribution, status],
                        (err) => {
                          if (err) {
                            console.error("Error inserting guest:", err);
                            res
                              .status(500)
                              .json({ error: "Failed to insert guest." });
                            return;
                          }
                        }
                      );
                    }
                  }
                }
              );
            }
          );
        });
      }
    });
  } catch (err) {
    console.error("Failed to add a new event:", err);
    res.status(500).json({ error: "Failed to add a new event", err });
  }
});

// update a New Event
router.post("/edittasks/:task_ID", async (req, res) => {
  const { updateEventData, taskFiles } = req.body;
  const {
    allDay,
    description,
    start,
    end,
    guest,
    host_UserName,
    priority,
    progress,
    task_Type,
    title,
  } = JSON.parse(updateEventData);
  const { task_ID } = req.params;

  var attached_File = JSON.parse(updateEventData).attached_File;
  // save new file
  if (req.files !== null) {
    if (req.files.taskFiles !== undefined) {
      var file = req.files.taskFiles;
      attached_File = uuidv4() + file.name;
      file.mv(publicDirectory + "/doTask/" + attached_File);
      console.log("file uploaded");

      db.query(
        "SELECT attached_File FROM calendar_task_list WHERE task_ID=? ",
        task_ID,
        (err, result) => {
          if (err) {
            res.json({ message: err });
          } else {
            const attachedFile = result[0].attached_File;

            fs.unlink(publicDirectory + "/doTask/" + attachedFile, (err) => {
              if (err) {
                res.json({ message: err });
              } else {
                res.json({ message: "deleted" });
              }
            });
          }
        }
      );
    } else {
      attached_File = taskFiles;
    }
  }

  const UpdateTask = {
    title,
    description,
    start,
    end,
    task_Type,
    host_UserName,
    attached_File,
    priority,
    progress,
    allDay,
  };

  try {
    db.query(
      `UPDATE calendar_task_list SET ? WHERE task_ID = '${task_ID}' `,
      UpdateTask,
      (err, result) => {
        if (err) {
          console.error("Failed to insert event:", err);
          res.status(500).json({ error: "Failed to insert event" + err });
        } else {
          // Delete all previous guest into task_guest table
          db.query(
            "DELETE FROM 	calendar_task_guest WHERE task_ID = ?",
            [task_ID],
            (err) => {
              if (err) {
                console.error("Error deleting guest:", err);
                res.status(500).json({ error: "Failed to delete guest." });
                return;
              }
            }
          );
          guest.forEach((singleGuest) => {
            const { username, contribution, isComplete, status } = singleGuest;

            // Check for previous tasks with status 'approved'
            db.query(
              'SELECT * FROM calendar_task_list tl JOIN calendar_task_guest tg ON tl.task_ID = tg.task_ID WHERE tl.start <= ? AND tl.end >= ? AND tg.username = ? AND tg.status = "Approved"',
              [end, start, username],
              (err, results) => {
                if (err) {
                  console.error("Error checking previous tasks:", err);
                  res
                    .status(500)
                    .json({ error: "Failed to check previous tasks." });
                  return;
                }
                let statusCheck = results.length > 0 ? "Pending" : "Approved";

                // check host  approve power
                db.query(
                  `SELECT calendar_approve_power FROM users WHERE username = '${host_UserName}'`,
                  (err, result) => {
                    if (err) {
                      console.error("Error retrieving user:", err);
                      res.status(500).json({
                        error: "An error occurred while retrieving user",
                      });
                    } else {
                      if (result.length === 0) {
                        res.status(404).json({ error: "User not found" });
                      } else {
                        const approvePower = result[0].approve_power;
                        if (approvePower) statusCheck = "Approved";

                        // check guest approve power
                        db.query(
                          `SELECT calendar_approve_power FROM users WHERE username = '${username}'`,
                          (err, result) => {
                            if (err) {
                              console.error("Error retrieving user:", err);
                              res.status(500).json({
                                error:
                                  "An error occurred while retrieving user",
                              });
                            } else {
                              if (result.length === 0) {
                                res
                                  .status(404)
                                  .json({ error: "User not found" });
                              } else {
                                const approvePower = result[0].approve_power;
                                if (approvePower) statusCheck = "Pending";
                              }
                            }
                          }
                        );

                        if (status === "Approved") statusCheck = "Approved";

                        // Insert guest into task_guest table
                        db.query(
                          "INSERT INTO 	calendar_task_guest (task_ID, username, contribution, status, isComplete) VALUES (?, ?, ?, ?,?)",
                          [
                            task_ID,
                            username,
                            contribution,
                            statusCheck,
                            isComplete,
                          ],
                          (err) => {
                            if (err) {
                              console.error("Error inserting guest:", err);
                              res
                                .status(500)
                                .json({ error: "Failed to insert guest." });
                              return;
                            }
                          }
                        );
                      }
                    }
                  }
                );
              }
            );
          });
        }
      }
    );
  } catch (err) {
    console.error("Failed to update a new event:", err);
    res.status(500).json({ error: "Failed to update a new event", err });
  }
});

// Delete Task by task_ID
router.post("/deletetask", (req, res) => {
  const { taskId, userLoggedIn } = req.body;

  db.query(
    "SELECT attached_File FROM calendar_task_list WHERE task_ID=? AND host_UserName=?",
    [taskId, userLoggedIn],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        const attachedFile = result[0].attached_File;

        fs.unlink(publicDirectory + "/doTask/" + attachedFile, (err) => {
          if (err) {
            res.json({ message: err });
          } else {
            res.json({ message: "deleted" });
          }
        });

        // Delete the task from the database
        db.query(
          "DELETE FROM calendar_task_list WHERE task_ID=? AND host_UserName=?",
          [taskId, userLoggedIn],
          (err, result) => {
            if (err) {
              res.json({ message: err });
            } else {
              res.json({ message: result });
            }
          }
        );
      }
    }
  );
});

// Delete stickynote by sticky_ID
router.post("/deletenote", (req, res) => {
  const { id } = req.body;

  db.query(
    "SELECT attached_File FROM calendar_stickynote WHERE sticky_ID=?",
    id,
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        const attachedFile = result[0].attached_File;
        fs.unlink(publicDirectory + "/doTask/" + attachedFile, (err) => {
          if (err) {
            res.json({ message: err });
          } else {
            res.json({ message: "deleted" });
          }
        });
        // Delete the note from the database
        db.query(
          "DELETE FROM calendar_stickynote WHERE  sticky_ID=? ",
          [id],
          (err, result) => {
            res.json({ message: result });
          }
        );
      }
    }
  );
});

// Add a New Comment
router.post("/comments", async (req, res) => {
  const { task_ID, username, comment_Text } = req.body;
  try {
    db.query(
      "INSERT INTO calendar_task_comment  (`task_ID`, `username`, `comment_Text`) VALUES (?, ?, ?)",
      [task_ID, username, comment_Text],
      (err) => {
        if (err) {
          console.error("Failed to insert comment:", err);
          res.status(500).json({ error: "Failed to insert comment" });
        } else {
          res.status(200).json({ message: true });
        }
      }
    );
  } catch (err) {
    console.error("Failed to add a comment", err);
    res.status(500).json({ error: "Failed to add a comment" });
  }
});

// Add a New Note
router.post("/addnote", async (req, res) => {
  const { newNoteData, noteFiles } = req.body;
  const { guest, host_UserName, note, note_Type, note_color } =
    JSON.parse(newNoteData);

  var attached_File = "";
  // save new file
  if (req.files !== null) {
    if (req.files.noteFiles !== undefined) {
      var file = req.files.noteFiles;
      attached_File = uuidv4() + file.name;
      file.mv(publicDirectory + "/doTask/" + attached_File);
      console.log("file uploaded");
    } else {
      attached_File = noteFiles;
    }
  }

  try {
    db.query(
      "INSERT INTO calendar_stickynote (`host_UserName`, `note`,`note_Type`,`attached_File`,`note_color`) VALUES (?, ?,?,?,?)",
      [host_UserName, note, note_Type, attached_File, note_color],
      (err, result) => {
        if (err) {
          console.error("Failed to insert comment:", err);
          res.status(500).json({ error: "Failed to insert comment", err });
        } else {
          const sticky_ID = result.insertId;
          guest.forEach((singleGuest, index) => {
            db.query(
              "INSERT INTO calendar_assigned_user_note (`sticky_ID`, `assigned_UserName`) VALUES (?, ?)",
              [sticky_ID, singleGuest],
              (err) => {
                if (err) {
                  console.error("Failed to insert comment:", err);
                  if (index === guest.length - 1) {
                    res
                      .status(500)
                      .json({ error: "Failed to insert comment", err });
                  }
                } else {
                  if (index === guest.length - 1) {
                    res.status(200).json({
                      message: "Note and assigned user inserted successfully.",
                    });
                  }
                }
              }
            );
          });
          if (guest.length === 0) {
            res.status(200).json({ message: "Note inserted successfully." });
          }
        }
      }
    );
  } catch (err) {
    console.error("Failed to add a comment", err);
    res.status(500).json({ error: "Failed to add a comment" });
  }
});

// Update Progress and Task Status
router.post("/tasks/:taskID/:username", (req, res) => {
  const { taskID, username } = req.params;

  const updateGuestQuery = `UPDATE 	calendar_task_guest AS g JOIN calendar_task_list AS tl ON g.task_ID = tl.task_ID SET g.isComplete = 1, tl.progress = LEAST(tl.progress + g.contribution, 100) WHERE g.username = '${username}' AND tl.task_ID = '${taskID}' AND g.isComplete = 0`;

  const updateTaskQuery = `UPDATE calendar_task_list SET task_Status = 'Completed', progress = 100 WHERE host_UserName = '${username}' AND task_ID = '${taskID}';`;

  db.query(updateGuestQuery, (err, result) => {
    if (err) {
      console.error("Error updating calendar_task_guest:", err);
      res.status(500).json({ error: "Failed to update 	calendar_task_guest." });
      return;
    }

    db.query(updateTaskQuery, (err, result) => {
      if (err) {
        console.error("Error updating calendar_task_list:", err);
        res.status(500).json({ error: "Failed to update calendar_task_list." });
        return;
      }

      res.status(200).json({ message: "Task marked as done successfully." });
    });
  });
});

// Update Comment Activity
router.post("/comments/:taskID/:isComment", (req, res) => {
  const { taskID, isComment } = req.params;

  const updateCommentActivityQuery = `UPDATE calendar_task_list SET isComment= '${isComment}' WHERE task_ID='${taskID}'`;

  db.query(updateCommentActivityQuery, (err, result) => {
    if (err) {
      console.error("Error updating Comment Activity:", err);
      res.status(500).json({ error: "Failed to update  Comment Activity." });
      return;
    } else
      res
        .status(200)
        .json({ message: " Comment Activity update successfully." });
  });
});

// Update Note Text by hostname
router.post("/editnote/:stickyID/", (req, res) => {
  const { stickyID } = req.params;
  const { noteText, noteFiles, oldFile, note_color } = req.body;

  var attached_File = oldFile;
  // save new file
  if (req.files !== null) {
    if (req.files.noteFiles !== undefined) {
      var file = req.files.noteFiles;
      attached_File = uuidv4() + file.name;
      file.mv(publicDirectory + "/doTask/" + attached_File);
      console.log("file uploaded");

      db.query(
        "SELECT attached_File FROM calendar_stickynote WHERE sticky_ID=? ",
        stickyID,
        (err, result) => {
          if (err) {
            res.json({ message: err });
          } else {
            const attachedFile = result[0].attached_File;

            fs.unlink(publicDirectory + "/doTask/" + attachedFile, (err) => {
              if (err) {
                res.json({ message: err });
              } else {
                res.json({ message: "deleted" });
              }
            });
          }
        }
      );
    } else {
      attached_File = noteFiles;
    }
  }

  const updateNoteText = `UPDATE calendar_stickynote SET note= '${noteText}' , attached_File = '${attached_File}', note_color = '${note_color}' WHERE sticky_ID='${stickyID}' `;

  db.query(updateNoteText, (err, result) => {
    if (err) {
      console.error("Error  updateNoteText :", err);
      res.status(500).json({ error: "Failed to updateNoteText." });
      return;
    } else res.status(200).json({ message: " updateNoteText successfully." });
  });
});

// Update task status Activity
router.post("/taskstatus/:taskID/:userName", (req, res) => {
  const { taskID, userName } = req.params;

  // Update the task_guest table
  const updatetaskstatusQuery = `
    UPDATE 	calendar_task_guest SET status= 'Approved' WHERE task_ID='${taskID}'  AND username='${userName}'
    `;
  db.query(updatetaskstatusQuery, (err, result) => {
    if (err) {
      res
        .status(500)
        .json({ error: "Failed to update  updatetaskstatusQuery Activity." });
      return;
    } else
      res.status(200).json({
        message: " updatetaskstatusQuery Activity update successfully.",
      });
  });
});

// Get all users
router.post("/users", (req, res) => {
  const query = "SELECT * FROM users";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving task list:", err);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving events" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Get all user Details by userName
router.post("/users/:userName", (req, res) => {
  const { userName } = req.params;
  const query = `SELECT * FROM users WHERE username= '${userName}' `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving task list:", err);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving events" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Get all Tasks by userName
router.post("/tasks/:userName", (req, res) => {
  const { userName } = req.params;

  const query = `SELECT * FROM calendar_task_list WHERE host_UserName = '${userName}' OR task_ID IN ( SELECT task_ID FROM calendar_task_guest WHERE username = '${userName}' ) `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving tasks:", err);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving tasks" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Get all note by userName
router.post("/stickynotes/:userName", (req, res) => {
  const { userName } = req.params;

  const query = `SELECT 
    cs.sticky_ID,
    cs.host_UserName,
    cs.note,
    cs.note_Type,
    cs.attached_File,
    cs.note_color,
    cs.noteDate,
    (SELECT GROUP_CONCAT(assigned_UserName ORDER BY assigned_UserName ASC SEPARATOR ',')
     FROM calendar_assigned_user_note
     WHERE sticky_ID = cs.sticky_ID) AS assigned_UserNames
FROM
    calendar_stickynote cs
LEFT JOIN
    calendar_assigned_user_note can ON cs.sticky_ID = can.sticky_ID
WHERE
    cs.host_UserName = '${userName}' OR can.assigned_UserName = '${userName}'
GROUP BY
    cs.sticky_ID,
    cs.host_UserName,
    cs.note,
    cs.note_Type,
    cs.attached_File,
    cs.note_color,
    cs.noteDate
 ORDER BY noteDate DESC`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving notes:", err);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving notes" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Get Single task information by TaskID and Username
router.post("/singletask/:taskID/:userName", (req, res) => {
  const { taskID, userName } = req.params;

  const query = `SELECT * FROM 	calendar_task_guest WHERE task_ID=${taskID} AND username='${userName}'`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving task information", err);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving information" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Get all Guest by Task ID
router.post("/guests/:task_ID", (req, res) => {
  const { task_ID } = req.params;

  const query = `
        SELECT * FROM calendar_task_guest WHERE task_ID = '${task_ID}'`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving tasks:", err);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving tasks" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Get all Guest by sticky_ID for Note
router.post("/noteguests", (req, res) => {
  const { id } = req.body;

  const query = `
        SELECT * FROM calendar_assigned_user_note WHERE sticky_ID = '${id}'`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving guest:", err);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving guest" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Get all comments by Task ID
router.post("/comments/:taskID", (req, res) => {
  const { taskID } = req.params;

  const query = `SELECT * FROM calendar_task_comment WHERE task_ID = '${taskID}' ORDER BY comment_Date DESC`;

  db.query(query, (err, result1) => {
    if (err) {
      console.error("Error retrieving tasks:", err);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving tasks" });
    } else {
      const query2 = `
            SELECT isComment
            FROM calendar_task_list
            WHERE task_ID = '${taskID}'`;

      db.query(query2, (err, result2) => {
        if (err) {
          console.error("Error retrieving tasks:", err);
          res
            .status(500)
            .json({ error: "An error occurred while retrieving tasks" });
        } else {
          const combinedResults = {
            commentList: result1,
            isComment: result2[0].isComment,
          };

          res.status(200).json(combinedResults);
        }
      });
    }
  });
});

router.post("/addEvents", (req, res) => {
  const { event_id, ename, sdate, edate, elocation, epurpose } = req.body;
  db.query("SELECT *FROM events WHERE event_id=?", event_id, (err, result) => {
    if (result.length > 0) {
      res.json({ message: false, alart: "Invalid Event ID" });
    } else {
      db.query(
        "INSERT INTO events SET ?",
        { event_id, ename, sdate, edate, elocation, epurpose, status: "" },
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

router.post("/getEvents", (req, res) => {
  db.query("SELECT * FROM events", (err, eventsResult) => {
    if (err) {
      console.error("Error fetching events:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    const eventTasksPromises = eventsResult.map((event) => {
      return new Promise((resolve, reject) => {
        db.query(
          "SELECT emp_id FROM event_task WHERE event_id = ?",
          event.event_id,
          (err, eventTaskResult) => {
            if (err) {
              reject(err);
              return;
            }

            // Extracting only the emp_id from the result
            const empIds = eventTaskResult.map((task) =>
              JSON.parse(task.emp_id)
            );

            resolve(empIds);
          }
        );
      });
    });

    Promise.all(eventTasksPromises)
      .then((eventTasksEmpIds) => {
        const mergedData = eventsResult.map((event, index) => {
          return {
            id: event.id,
            event_id: event.event_id,
            ename: event.ename,
            sdate: event.sdate,
            edate: event.edate,
            elocation: event.elocation,
            epurpose: event.epurpose,
            status: event.status,
            event_tasks_emp_ids: eventTasksEmpIds[index], // Merged emp_id data
          };
        });

        res.json({ message: mergedData });
      })
      .catch((error) => {
        console.error("Error fetching event tasks:", error);
        res.status(500).json({ error: "Internal server error" });
      });
  });
});

router.post("/addEventsTask", (req, res) => {
  const { event_id, particular, date, emp_id, assigned_location } = req.body;
  db.query(
    "INSERT INTO event_task SET ?",
    { event_id, particular, date, emp_id, assigned_location },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/getEventsInfoById", (req, res) => {
  const { event_id } = req.body;
  db.query("SELECT *FROM events WHERE event_id=?", event_id, (err, result) => {
    db.query(
      "SELECT *FROM event_task WHERE event_id=?",
      event_id,
      (err, result2) => {
        res.json({ message: result, task: result2 });
      }
    );
  });
});

router.post("/getEventsTaskById", (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM event_task WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
});

router.post("/UpdateEventsTask", (req, res) => {
  const { id, particular, date, emp_id, assigned_location } = req.body;
  const selectedEmployeeData = JSON.parse(emp_id).map((item) => item.code);
  const updatedData = {
    particular: particular,
    date: date,
    emp_id: JSON.stringify(selectedEmployeeData),
    assigned_location: assigned_location, // Stringify the array
  };

  db.query(
    "UPDATE event_task SET ? WHERE id = ?",
    [updatedData, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});


//daily task
router.post("/addDailytask", (req, res) => {
  const { emp_id, name, designation, task, remark } = req.body;
  db.query(
    "INSERT INTO daily_task SET ?",
    { emp_id, name, designation, task, remark, status: "" },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/getDailyTaskUser", (req, res) => {
  const { emp_id } = req.body;

  db.query(
    "SELECT * FROM daily_task WHERE emp_id = ?",
    emp_id,
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching daily tasks" });
      } else {
        const tasksByDate = {};
        result.forEach((task) => {
          const taskDate = task.date.toISOString().split("T")[0];
          if (!tasksByDate[taskDate]) {
            tasksByDate[taskDate] = [];
          }
          tasksByDate[taskDate].push(task);
        });
        const individualData = [];
        for (const date in tasksByDate) {
          individualData.push({
            date: date,
            tasks: tasksByDate[date],
          });
        }
        res.json({ individualData });
      }
    }
  );
});

router.post("/getDailyTaskAllUser", (req, res) => {
  const { emp_id, date } = req.body;

  const query = "SELECT * FROM daily_task WHERE emp_id = ? AND DATE(date) = ?";
  db.query(query, [emp_id, date], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error fetching data from the database" });
    }

    res.json({ message: result });
  });
});

router.post("/getDailyTaskByDate", (req, res) => {
  const { date } = req.body;
  db.query(
    "SELECT * FROM daily_task WHERE DATE(date) = ?",
    date,
    (err, result) => {
      res.json({ message: result });
    }
  );
});

router.post("/UpdateDailyTaskStatus", (req, res) => {
  const { id, status } = req.body;
  db.query(
    "UPDATE daily_task SET ? WHERE id = ?",
    [{ status: status }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: id });
      }
    }
  );
});
//daily task

router.post("/addRoute", (req, res) => {
  const { route_name, checkPoint } = req.body;
  db.query(
    "INSERT INTO transport_route SET ?",
    { route_name, checkPoint, status: "" },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/getRoute", (req, res) => {
  db.query("SELECT * FROM transport_route", (err, result) => {
    res.json({ message: result });
  });
});

router.post("/getRouteById", (req, res) => {
  const { id } = req.body;
  db.query("SELECT * FROM transport_route WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
});
router.post("/DeleteRouteById", (req, res) => {
  const { id } = req.body;
  db.query("DELETE FROM transport_route WHERE id=?", id, (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
});

router.post("/AssignRouteEmployee", (req, res) => {
  const { emp_id, route_id } = req.body;
  db.query(
    "INSERT INTO assign_route SET ?",
    { emp_id, route_id, status: "" },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});
router.post("/geAssignRouteEmployee", (req, res) => {
  db.query(
    "SELECT employee.emp_id,employee.emp_fname,employee.emp_lname,employee.designation, transport_route.checkPoint,transport_route.route_name, assign_route.* FROM employee INNER JOIN assign_route ON employee.emp_id = assign_route.emp_id INNER JOIN transport_route ON assign_route.route_id = transport_route.id",
    (err, result) => {
      res.json({ message: result });
    }
  );
});


router.post("/getApproveCount", (req, res) => {
  db.query(
    `
    SELECT SUM(empty_count) AS total_empty_status_count
    FROM (
  SELECT COUNT(*) AS empty_count FROM student_category WHERE pstatus = ''
  UNION ALL
  SELECT COUNT(*) FROM house WHERE pstatus = ''
  UNION ALL
  SELECT COUNT(*) FROM class_name WHERE pstatus = ''
  UNION ALL
  SELECT COUNT(*) FROM section WHERE pstatus = ''
  UNION ALL
  SELECT COUNT(*) FROM subject_list WHERE pstatus = ''
  UNION ALL
  SELECT COUNT(*) FROM temporary_pass WHERE status = ''
  UNION ALL
  SELECT COUNT(*) FROM club WHERE status = ''
  UNION ALL
  SELECT COUNT(*) FROM hifz_student WHERE pstatus = ''
  UNION ALL
  SELECT COUNT(*) FROM hifz_spr WHERE pstatus = ''
  UNION ALL
  SELECT COUNT(*) FROM hifz_spr_students WHERE pstatus IS NULL
  UNION ALL
  SELECT COUNT(*) FROM expense_head WHERE status = ''
  UNION ALL
  SELECT COUNT(*) FROM income_head WHERE status = ''
  UNION ALL
  SELECT COUNT(*) FROM feesType WHERE pstatus = ''
  UNION ALL
  SELECT COUNT(*) FROM feeInfo WHERE pstatus = ''
  UNION ALL
  SELECT COUNT(*) FROM assign_discount WHERE status = ''
) AS sub
    `
    ,
    (err, result) => {
      res.json({ message: result });
    }
  );
});

module.exports = router;