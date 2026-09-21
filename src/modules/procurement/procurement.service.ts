// @ts-nocheck
import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { UploadService } from "../../common/upload/upload.service";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";

let db: any;
let publicDirectory: string;

// router.post("/", (req, res) => {
//   const { id, status } = req.body;
//   db.query(
//     "UPDATE requisition_item SET ? WHERE id= ? ",
//     [{ stocknote: status }, id],
//     (err, result) => {
//       if (err) {
//         res.json({ message: err });
//       } else {
//         res.json({ message: true });
//       }
//     }
//   );
// });


//unused
//unused

//supplier
//po
// requision

//fr
//fr
//sp item

@Injectable()
export class ProcurementService {
  constructor(
    private readonly database: DatabaseService,
    private readonly upload: UploadService
  ) {
    db = this.database;
    publicDirectory = this.upload.publicDirectory;
  
  }

  getrequisionItemById(req: any, res: any) {
  const { requisition_id } = req.body;

  db.query("SELECT * FROM requisition_item WHERE requisition_id = ?", [requisition_id], (err, result1) => {
    if (err) return res.status(500).json({ error: "Error fetching requisition_item", details: err });

    db.query("SELECT * FROM requisition WHERE requisition_id = ?", [requisition_id], (err, result2) => {
      if (err) return res.status(500).json({ error: "Error fetching requisition", details: err });

      db.query("SELECT rt.*,e.emp_fname,e.emp_lname FROM requisition_timeline as rt JOIN employee as e on e.emp_id=rt.userId WHERE rt.requisition_id=?", [requisition_id], (err, result3) => {
        if (err) return res.status(500).json({ error: "Error fetching requisition_timeline", details: err });

        db.query("SELECT * FROM requisition_cs WHERE requisition_id = ?", [requisition_id], (err, result4) => {
          if (err) return res.status(500).json({ error: "Error fetching requisition_cs", details: err });

          db.query("SELECT * FROM requisition_approve WHERE requisition_id = ?", [requisition_id], (err, result5) => {
            if (err) return res.status(500).json({ error: "Error fetching requisition_approve", details: err });

            res.json({
              message5: result5,
              message4: result4,
              message3: result3,
              message2: result1,
              message: result2
            });
          });
        });
      });
    });
  });
}

  getrequisionItemByIdList(req: any, res: any) {
  const { requisition_id } = req.body;
  db.query(
    "SELECT *FROM requisition_item WHERE requisition_id=? AND status='approved'",
    requisition_id,
    (err, result) => {
      res.json({ message: result });
    }
  );
}

  getrequisionItemApprovelChk(req: any, res: any) {
  const { requisition_id } = req.body;
  db.query(
    "SELECT *FROM requisition_item WHERE requisition_id=? AND status=''",
    requisition_id,
    (err, result) => {
      res.json({ message: result.length });
    }
  );
}

  DeleteRequisionFullApproved(req: any, res: any) {
  const { requisition_id } = req.body;
  db.query(
    "DELETE FROM requisition_timeline WHERE requisition_id=? AND approve_status='Full Approved'",
    [requisition_id], // Wrap requisition_id in an array
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  DeleteRequisionApproval(req: any, res: any) {
  const { requisition_id, user } = req.body;
  db.query(
    "DELETE FROM requisition_timeline WHERE requisition_id=? AND user=?",
    [requisition_id, user], // Wrap requisition_id in an array
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  getrequisionFullApprovedChk(req: any, res: any) {
  const { requisition_id } = req.body;
  db.query(
    "SELECT *FROM requisition_timeline WHERE requisition_id=? AND approve_status='Full Approved'",
    requisition_id,
    (err, result) => {
      res.json({ message: result.length });
    }
  );
}

  getrequisionApprovedChk(req: any, res: any) {
  const { requisition_id } = req.body;
  db.query(
    "SELECT * FROM requisition_timeline WHERE requisition_id=? AND user='Manager'",
    requisition_id,
    (err, manager) => {
      db.query(
        "SELECT * FROM requisition_timeline WHERE requisition_id=? AND user='Principal'",
        requisition_id,
        (err, principal) => {
          db.query(
            "SELECT * FROM requisition_timeline WHERE requisition_id=? AND user='Chairman'",
            requisition_id,
            (err, chairman) => {
              db.query(
                "SELECT * FROM requisition_timeline WHERE requisition_id=? AND user='co-ordinator'",
                requisition_id,
                (err, Cordinator) => {
                  db.query(
                    "SELECT * FROM requisition_timeline WHERE requisition_id=? AND user='Maintenance'",
                    requisition_id,
                    (err, maintenance) => {
                      db.query(
                        "SELECT * FROM requisition_timeline WHERE requisition_id=? AND user='Procurement'",
                        requisition_id,
                        (err, procurement) => {
                          db.query(
                            "SELECT * FROM requisition_timeline WHERE requisition_id=? AND user='Store'",
                            requisition_id,
                            (err, store) => {
                              db.query(
                                "SELECT * FROM requisition_timeline WHERE requisition_id=? AND user='Vice Principal'",
                                requisition_id,
                                (err, VicePrincipal) => {
                                  db.query(
                                    "SELECT * FROM requisition_timeline WHERE requisition_id=? AND user='Academic Supervisor'",
                                    requisition_id,
                                    (err, AcademicSupervisor) => {
                                      res.json({
                                        manager: manager.length,
                                        principal: principal.length,
                                        chairman: chairman.length,
                                        coOrdinator: Cordinator.length,
                                        maintenance: maintenance.length,
                                        procurement: procurement.length,
                                        store: store.length,
                                        vicePrincipal: VicePrincipal.length,
                                        academicSupervisor:
                                          AcademicSupervisor.length,
                                      });
                                    }
                                  );
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
}

  getitemsByCsRequId(req: any, res: any) {
  const { cs_id, requisition_id } = req.body;
  db.query(
    "SELECT *FROM requisition_cs WHERE cs_id=? AND requisition_id=?",
    [cs_id, requisition_id],
    (err, result) => {
      res.json({ message: result });
    }
  );
}

  getrequisionBycsId(req: any, res: any) {
  const { cs_id } = req.body;
  db.query(
    "SELECT *FROM requisition_cs WHERE cs_id=?",
    cs_id,
    (err, result) => {
      res.json({ message: result });
    }
  );
}

  getrequisioncsByID(req: any, res: any) {
  const { id } = req.body;
  db.query("SELECT *FROM requisition_cs WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
}

  submitrequisionCSRemark(req: any, res: any) {
  const { id, chosen_supplier, amount, remark } = req.body;
  db.query(
    "UPDATE requisition_cs SET ? WHERE id=?",
    [{ remark: remark, chosen_supplier: chosen_supplier, amount: amount }, id],
    (err, result) => {
      res.json({ message: true });
    }
  );
}

  DeleteRequisionItemById(req: any, res: any) {
  const { id } = req.body;
  db.query("DELETE FROM requisition_item WHERE  id=?", id, (err, result) => {
    res.json({ message: result });
  });
}

  getrequisionData(req: any, res: any) {
  const { user } = req.body;

  if (user == "Procurement") {
    db.query(
      "SELECT *FROM requisition WHERE pro_status='1' ORDER BY requisition.id DESC",
      (err, result) => {
        res.json({ message: result });
      }
    );
  } else if (user == "Maintenance") {
    db.query(
      "SELECT *FROM requisition WHERE maintenance='1' ORDER BY requisition.id DESC",
      (err, result) => {
        res.json({ message: result });
      }
    );
  } else {
    db.query(
      "SELECT *FROM requisition ORDER BY requisition.id DESC",
      (err, result) => {
        res.json({ message: result });
      }
    );
  }
}

  getrequisionCSData(req: any, res: any) {
  db.query("SELECT *FROM requisition_cs ", (err, result) => {
    res.json({ message: result });
  });
}

  getCSDataById(req: any, res: any) {
  const { id } = req.body;
  db.query("SELECT *FROM requisition_cs WHERE cs_id=?", id, (err, result) => {
    res.json({ message: result });
  });
}

  getrequisitionItemId(req: any, res: any) {
  const { id } = req.body;
  db.query("SELECT *FROM requisition_item WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
}

  requisitionItemSubmit(req: any, res: any) {
  const { requisition_id, itemName, note, qty, priority } = req.body;
  db.query(
    "INSERT INTO requisition_item SET ?",
    {
      requisition_id,
      itemName,
      note,
      qty,
      priority,
      status: "",
      status2: "",
      status3: "",
      stocknote: "",
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

  requisitionCSitemsubmit(req: any, res: any) {
  const {
    requisition_id,
    cs_id,
    item_id,
    item,
    des,
    qty,
    unit,
    supply_name,
    brand,
    quoted_price,
    delivery_time,
    supply_name1,
    brand1,
    quoted_price1,
    delivery_time1,
    supply_name2,
    brand2,
    quoted_price2,
    delivery_time2,
    compile,
    date,
  } = req.body;
  db.query(
    "INSERT INTO requisition_cs SET ?",
    {
      requisition_id,
      cs_id,
      item_id,
      item,
      des,
      qty,
      unit,
      supply_name,
      brand,
      quoted_price,
      delivery_time,
      supply_name1,
      brand1,
      quoted_price1,
      delivery_time1,
      supply_name2,
      brand2,
      quoted_price2,
      delivery_time2,
      compile: compile,
      remark: "",
      mstatus: "",
      pstatus: "",
      chosen_supplier: "",
      amount: "",
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

  deleteRequisitionTimeline(req: any, res: any) {
  const { id, note, type, requisition_id } = req.body;
  const match = note.match(/\((\d+)\)/);
const itemId = match ? parseInt(match[1]) : null;

  db.query("DELETE FROM requisition_timeline WHERE id = ?", [id], (err, result) => {
    if (err) return res.json({ message: err });

    const queries = [];

    // If itemId found and type is 'Store-Item', clear stocknote
    if (itemId && type === 'Store-Item') {
      queries.push(new Promise((resolve, reject) => {
        db.query(
          "UPDATE requisition_item SET stocknote = '' WHERE id = ?",
          [itemId],
          (err) => (err ? reject(err) : resolve())
        );
      }));
    }

    // If Acknowledge type, reset the Acknowledge field
    if (type === "Acknowledge") {
      queries.push(new Promise((resolve, reject) => {
        db.query(
          "UPDATE requisition SET Acknowledge = NULL WHERE requisition_id = ?",
          [requisition_id],
          (err) => (err ? reject(err) : resolve())
        );
      }));
    }
    if (type === "Principal") {
      queries.push(new Promise((resolve, reject) => {
        db.query(
          "UPDATE requisition SET Principal = NULL WHERE requisition_id = ?",
          [requisition_id],
          (err) => (err ? reject(err) : resolve())
        );
      }));
    }

    Promise.all(queries)
      .then(() => res.json({ message: true }))
      .catch((err) => res.json({ message: err }));
  });
}

  UpdaterequisitionCSApproveUpdate(req: any, res: any) {
  const { cs_id, status, user } = req.body;

  if (user == "Principal") {
    db.query(
      "UPDATE requisition_cs SET ? WHERE cs_id= ? ",
      [{ pstatus: status }, cs_id],
      (err, result) => {
        if (err) {
          res.json({ message: err });
        } else {
          res.json({ message: true });
        }
      }
    );
  }

  if (user == "Manager") {
    db.query(
      "UPDATE requisition_cs SET ? WHERE cs_id= ? ",
      [{ mstatus: status }, cs_id],
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

  UpdaterequisitionItemUpdate(req: any, res: any) {
  const { id, status } = req.body;
  db.query(
    "UPDATE requisition_item SET ? WHERE id= ? ",
    [{ status: status }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  UpdateStoreRequisitionItemUpdate(req: any, res: any) {
  const { id,item, status, requisition_id, user, userId, note } = req.body;

  db.query(
    "UPDATE requisition_item SET ? WHERE id = ?",
    [{ stocknote: status }, id],
    (err, result) => {
      if (err) {
        return res.json({ message: err });
      }

      if (note !== null && note !== undefined && note.trim() !== "") {
        const timelineData = {
          requisition_id,
          type: 'Store-Item',
          user,
          userId,
          note: `Item : ${item} (${id}), ${note}`,
          approve_status: status,
          status: 0,
        };

        const query = `
          INSERT INTO requisition_timeline 
          SET ? 
          ON DUPLICATE KEY UPDATE 
            note = VALUES(note),
            approve_status = VALUES(approve_status)
        `;

        db.query(query, timelineData, (err2, result2) => {
          if (err2) {
            return res.json({ message: err2 });
          }
          return res.json({ message: true });
        });
      } else {
        return res.json({ message: true });
      }
    }
  );
}

  csubmit(req: any, res: any) {
  const { requisition_id, note } = req.body;
  db.query(
    "UPDATE requisition SET ? WHERE requisition_id= ? ",
    [{ m_status: 1, m_note: note }, requisition_id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  StoreSubmit(req: any, res: any) {
  const { requisition_id, note } = req.body;
  var date = new Date().toLocaleString([], { timeZone: "Asia/Dhaka" });
  db.query(
    "UPDATE requisition SET ? WHERE requisition_id= ? ",
    [{ sstatus: 1, snote: note, stime: date }, requisition_id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  removePermission(req: any, res: any) {
  const { requisition_id, status } = req.body;
  var s = status;
  if (s == "p") {
    db.query(
      "UPDATE requisition SET ? WHERE requisition_id= ? ",
      [{ p_status: "" }, requisition_id],
      (err, result) => {
        if (err) {
          res.json({ message: err });
        } else {
          res.json({ message: true });
        }
      }
    );
  }
  if (s == "c") {
    db.query(
      "UPDATE requisition SET ? WHERE requisition_id= ? ",
      [{ ch_status: "" }, requisition_id],
      (err, result) => {
        if (err) {
          res.json({ message: err });
        } else {
          res.json({ message: true });
        }
      }
    );
  }
  if (s == "vp") {
    db.query(
      "UPDATE requisition SET ? WHERE requisition_id= ? ",
      [{ vp_status: "" }, requisition_id],
      (err, result) => {
        if (err) {
          res.json({ message: err });
        } else {
          res.json({ message: true });
        }
      }
    );
  }
  if (s == "as") {
    db.query(
      "UPDATE requisition SET ? WHERE requisition_id= ? ",
      [{ as_status: "" }, requisition_id],
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

  CoSubmit(req: any, res: any) {
  const { requisition_id, user, userId, note, approve_status } = req.body;
  const date = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

  const sta = approve_status === "Acknowledge" ? 1 : 0;

  const updateQuery = `
    UPDATE requisition 
    SET Acknowledge = ?
    WHERE requisition_id = ?
  `;

  db.query(updateQuery, [sta,requisition_id], (err, result) => {
    if (err) return res.json({ message: err });

    const timelineQuery = `
      INSERT INTO requisition_timeline 
        (requisition_id, type, user, userId, note, approve_status, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        note = VALUES(note),
        approve_status = VALUES(approve_status)
    `;

    const values = [
      requisition_id,
      "Acknowledge",
      user,
      userId,
      note,
      approve_status,
      0,
    ];

    db.query(timelineQuery, values, (err2, result2) => {
      if (err2) return res.json({ message: err2 });
      return res.json({ message: true });
    });
  });
}

  managersubmit(req: any, res: any) {
  const { requisition_id, store, procurement, managerNote } = req.body;
  var date = new Date().toLocaleString([], { timeZone: "Asia/Dhaka" });
  db.query(
    "UPDATE requisition SET ? WHERE requisition_id= ? ",
    [
      {
        m_s_status: store,
        m_p_status: procurement,
        m_feedback: managerNote,
        m_time: date,
      },
      requisition_id,
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

  requisitionStatus(req: any, res: any) {
  const { requisition_id, status, note, maintenance, procurement } = req.body;
  var s = status;
  var date = new Date().toLocaleString([], { timeZone: "Asia/Dhaka" });
  if (s == "reject") {
    db.query(
      "UPDATE requisition SET ? WHERE requisition_id= ? ",
      [
        {
          pro_status: procurement,
          maintenance: maintenance,
          approve_status: "reject",
          approvel_note: note,
          approve_time: date,
        },
        requisition_id,
      ],
      (err, result) => {
        if (err) {
          res.json({ message: err });
        } else {
          db.query(
            "INSERT INTO requisition_timeline SET ?",
            {
              requisition_id: requisition_id,
              user: "Manager",
              note: note,
              approve_status: "reject",
              status: 0,
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
    );
  }
  if (s == "Approved") {
    db.query(
      "UPDATE requisition SET ? WHERE requisition_id= ? ",
      [
        {
          pro_status: procurement,
          maintenance: maintenance,
          approve_status: "approved",
          approvel_note: note,
          approve_time: date,
        },
        requisition_id,
      ],
      (err, result) => {
        if (err) {
          res.json({ message: err });
        } else {
          db.query(
            "INSERT INTO requisition_timeline SET ?",
            {
              requisition_id: requisition_id,
              user: "Manager",
              note: note,
              approve_status: "approved",
              status: 0,
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
    );
  }
  if (s == "Full Approved") {
    db.query(
      "UPDATE requisition SET ? WHERE requisition_id= ? ",
      [
        {
          pro_status: procurement,
          maintenance: maintenance,
          approve_status: "Full Approved",
          approvel_note: note,
          approve_time: date,
        },
        requisition_id,
      ],
      (err, result) => {
        if (err) {
          res.json({ message: err });
        } else {
          db.query(
            "INSERT INTO requisition_timeline SET ?",
            {
              requisition_id: requisition_id,
              user: "Manager",
              note: note,
              approve_status: "Full Approved",
              status: 0,
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
    );
  }
  if (s == "hold") {
    db.query(
      "UPDATE requisition SET ? WHERE requisition_id= ? ",
      [
        {
          pro_status: procurement,
          maintenance: maintenance,
          approve_status: "hold",
          approvel_note: note,
          approve_time: date,
        },
        requisition_id,
      ],
      (err, result) => {
        if (err) {
          res.json({ message: err });
        } else {
          db.query(
            "INSERT INTO requisition_timeline SET ?",
            {
              requisition_id: requisition_id,
              user: "Manager",
              note: note,
              approve_status: "hold",
              status: 0,
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
    );
  }
}

  requisitionApproveCHP(req: any, res: any) {
  const { requisition_id, status, note, user, userId } = req.body;

  const approvalColumns = {
    "Principal": "Principal",
    "Super Admin": "Principal"
  };

  const column = approvalColumns[user];

  if (!column || !["Approved", "Not Approve", "Hold"].includes(status)) {
    return res.status(400).json({ message: "Invalid user or status" });
  }

  db.query(
    `UPDATE requisition SET ?? = ? WHERE requisition_id = ?`,
    [column, status, requisition_id],
    (err, result) => {
      if (err) return res.json({ message: err });

      const timelineData = [
        requisition_id,
        "Principal",
        user,
        userId,
        note,
        status,
        0,
      ];

      const timelineQuery = `
        INSERT INTO requisition_timeline 
          (requisition_id, type, user, userId, note, approve_status, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          note = VALUES(note),
          approve_status = VALUES(approve_status)
      `;

      db.query(timelineQuery, timelineData, (err2, result2) => {
        if (err2) return res.json({ message: err2 });
        res.json({ message: "Note submitted" });
      });
    }
  );
}

  UpdaterequisitionApprovelUpdate(req: any, res: any) {
  const { requisition_id, approve } = req.body;

  var status = approve;

  if (status == "Principal") {
    db.query(
      "UPDATE requisition SET ? WHERE requisition_id= ? ",
      [{ p_status: 0 }, requisition_id],
      (err, result) => {
        if (err) {
          res.json({ message: err });
        } else {
          res.json({ message: true });
        }
      }
    );
  }
  if (status == "Chairman") {
    db.query(
      "UPDATE requisition SET ? WHERE requisition_id= ? ",
      [{ ch_status: 0 }, requisition_id],
      (err, result) => {
        if (err) {
          res.json({ message: err });
        } else {
          res.json({ message: true });
        }
      }
    );
  }
  if (status == "Vice Principal") {
    db.query(
      "UPDATE requisition SET ? WHERE requisition_id= ? ",
      [{ vp_status: 0 }, requisition_id],
      (err, result) => {
        if (err) {
          res.json({ message: err });
        } else {
          res.json({ message: true });
        }
      }
    );
  }
  if (status == "Academic Supervisor") {
    db.query(
      "UPDATE requisition SET ? WHERE requisition_id= ? ",
      [{ as_status: 0 }, requisition_id],
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

  requisitionSubmit(req: any, res: any) {
  const {
    name,
    session,
    requisition_id,
    type,
    designation,
    campus,
    location,
    expected_date,
    img1,
    img2,
    img3,
    img4,
    img5,
    compile,
  } = req.body;

  if (img1 == "") {
    var filename = "";
  }
  if (img2 == "") {
    var filename2 = "";
  }
  if (img3 == "") {
    var filename3 = "";
  }
  if (img4 == "") {
    var filename4 = "";
  }
  if (img5 == "") {
    var filename5 = "";
  }

  if (req.files !== null) {
    if (req.files.img1 !== undefined) {
      var file = req.files.img1;
      var filename = uuidv4() + file.name;
      file.mv(publicDirectory + "/image/" + filename, (err) => {
        if (err) {
          res.json({ message: err });
        } else {
          console.log("file uploaded");
        }
      });
    }
    if (req.files.img2 !== undefined) {
      var file = req.files.img2;
      var filename2 = uuidv4() + file.name;
      file.mv(publicDirectory + "/image/" + filename2, (err) => {
        if (err) {
          res.json({ message: err });
        } else {
          console.log("file uploaded");
        }
      });
    }
    if (req.files.img3 !== undefined) {
      var file = req.files.img3;
      var filename3 = uuidv4() + file.name;
      file.mv(publicDirectory + "/image/" + filename3, (err) => {
        if (err) {
          res.json({ message: err });
        } else {
          console.log("file uploaded");
        }
      });
    }
    if (req.files.img4 !== undefined) {
      var file = req.files.img4;
      var filename4 = uuidv4() + file.name;
      file.mv(publicDirectory + "/image/" + filename4, (err) => {
        if (err) {
          res.json({ message: err });
        } else {
          console.log("file uploaded");
        }
      });
    }
    if (req.files.img5 !== undefined) {
      var file = req.files.img5;
      var filename5 = uuidv4() + file.name;
      file.mv(publicDirectory + "/image/" + filename5, (err) => {
        if (err) {
          res.json({ message: err });
        } else {
          console.log("file uploaded");
        }
      });
    }
  }
  db.query(
    "SELECT *FROM requisition WHERE requisition_id=?",
    requisition_id,
    (err, idchk) => {
      if (idchk.length > 0) {
        res.json({ alert: "Something Is wrong", message: err });
      } else {
        db.query(
          "INSERT INTO requisition SET ?",
          {
            session,
            requisition_id,
            type,
            name,
            designation,
            campus,
            location,
            expected_date,
            img1: filename,
            img2: filename2,
            img3: filename3,
            img4: filename4,
            img5: filename5,
            compile,
          },
          (err, results) => {
            if (err) {
              res.json({ message: err });
            } else {

              res.json({ message: results.insertId });
            }
          }
        );
      }
    }
  );
}

  supplierSubmit(req: any, res: any) {
  const { name, email, phone, location, poc, poc_phone, cat } = req.body;
  db.query(
    "INSERT INTO supplier SET ?",
    { name, email, phone, location, poc, poc_phone, cat, status: "" },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  getsupplier(req: any, res: any) {
  db.query("SELECT *FROM supplier", (err, result) => {
    res.json({ message: result });
  });
}

  getsupplierByID(req: any, res: any) {
  const { id } = req.body;
  db.query("SELECT *FROM supplier WHERE id = ?", id, (err, result) => {
    res.json({ message: result });
  });
}

  UpdateSupplierByID(req: any, res: any) {
  const { id, name, email, phone, location, poc, poc_phone, cat } = req.body;

  db.query(
    "UPDATE supplier SET ? WHERE id=?",
    [{ name, email, phone, location, poc, poc_phone, cat }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  PoSubmit(req: any, res: any) {
  const {
    poType,
    cs_id,
    req_id,
    po_id,
    spoc,
    tandc,
    tamount,
    tvat,
    ait,
    gtotal,
    exp_sdate,
    exp_edate,
    sname,
    slocation,
    scontact,
    mstatus,
    mnote,
    pstatus,
    pnote,
    podate,
    session,
    compile,
  } = req.body;

  db.query(
    "INSERT INTO po SET ?",
    {
      poType,
      spoc,
      cs_id,
      req_id,
      po_id,
      tandc,
      tamount,
      tvat,
      ait,
      gtotal,
      exp_sdate,
      exp_edate,
      sname,
      slocation,
      scontact,
      mstatus,
      mnote,
      pstatus,
      pnote,
      status: "",
      podate,
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
}

  UpdateApprovelPO(req: any, res: any) {
  const { po_id, des, status, note } = req.body;

  if (des == "Principal") {
    db.query(
      "UPDATE po SET ? WHERE po_id=?",
      [{ pstatus: status, pnote: note }, po_id],
      (err, result) => {
        if (err) {
          res.json({ message: err });
        } else {
          res.json({ message: true });
        }
      }
    );
  }
  if (des == "Manager") {
    db.query(
      "UPDATE po SET ? WHERE po_id=?",
      [{ mstatus: status, mnote: note }, po_id],
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

  UpdateApprovelforPrincipal(req: any, res: any) {
  const { po_id } = req.body;
  db.query(
    "UPDATE po SET ? WHERE po_id=?",
    [{ pstatus: 1 }, po_id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  PoItemSubmit(req: any, res: any) {
  const {
    po_id,
    cs_id,
    req_id,
    item,
    des,
    brand,
    qty,
    price,
    vat,
    tax,
    sname,
    slocation,
    scontact,
  } = req.body;
  db.query(
    "INSERT INTO po_item SET ?",
    {
      po_id,
      cs_id,
      req_id,
      item,
      des,
      brand,
      qty,
      price,
      vat,
      tax,
      sname,
      slocation,
      scontact,
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

  getpolist(req: any, res: any) {
  db.query("SELECT *FROM po", (err, result) => {
    res.json({ message: result });
  });
}

  getpoItemallinfo(req: any, res: any) {
  const { po_id } = req.body;
  db.query("SELECT *FROM po WHERE po_id=?", po_id, (err, result) => {
    db.query("SELECT *FROM po_item WHERE po_id=?", po_id, (err, result2) => {
      res.json({ message: result, message2: result2 });
    });
  });
}

  addFundRequest(req: any, res: any) {
  const { fr_id, gdate, exp_date, amount, session, compile } = req.body;

  db.query(
    "SELECT *FROM fund_request WHERE fr_id = ?",
    fr_id,
    (err, result) => {
      if (result.length > 0) {
        res.json({ message: false });
      } else {
        db.query(
          "INSERT INTO fund_request SET ?",
          {
            fr_id,
            gdate,
            exp_date,
            amount,
            mstatus: "",
            pstatus: "",
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
      }
    }
  );
}

  getFundRequest(req: any, res: any) {
  db.query("SELECT *FROM fund_request", (err, result) => {
    res.json({ message: result });
  });
}

  getFundRequestById(req: any, res: any) {
  const { id } = req.body;
  db.query("SELECT *FROM fund_request WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
}

  UpdateFundRequestApprovel(req: any, res: any) {
  const { id, user, status } = req.body;

  if (user == "Manager") {
    db.query(
      "UPDATE fund_request SET ? WHERE fr_id= ? ",
      [{ mstatus: status }, id],
      (err, result) => {
        if (err) {
          res.json({ message: err });
        } else {
          res.json({ message: true });
        }
      }
    );
  }
  if (user == "Principal") {
    db.query(
      "UPDATE fund_request SET ? WHERE fr_id= ? ",
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
}

  UpdateSPApprovel(req: any, res: any) {
  const { id, user, status } = req.body;

  if (user == "Manager") {
    db.query(
      "UPDATE supply_payment SET ? WHERE sp_id= ? ",
      [{ mstatus: status }, id],
      (err, result) => {
        if (err) {
          res.json({ message: err });
        } else {
          res.json({ message: true });
        }
      }
    );
  }
  if (user == "Principal") {
    db.query(
      "UPDATE supply_payment SET ? WHERE sp_id= ? ",
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
}

  UpdateFundRequest(req: any, res: any) {
  const { id, fr_id, gdate, exp_date, amount } = req.body;
  db.query(
    "UPDATE fund_request SET ? WHERE id= ? ",
    [{ fr_id, gdate, exp_date, amount }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  addSupplyPaymentItem(req: any, res: any) {
  const { sp_id, r_id, campus, item, vendor, mop, amount } = req.body;
  db.query(
    "INSERT INTO fp_sp_item SET ?",
    { sp_id, r_id, campus, item, vendor, mop, amount },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  getSupplyPaymentItem(req: any, res: any) {
  db.query("SELECT *FROM fp_sp_item", (err, result) => {
    res.json({ message: result });
  });
}

  getSupplyPaymentItemById(req: any, res: any) {
  const { sp_id } = req.body;
  db.query("SELECT *FROM fp_sp_item WHERE sp_id=?", sp_id, (err, result) => {
    db.query(
      "SELECT *FROM supply_payment WHERE sp_id=?",
      sp_id,
      (err, result2) => {
        res.json({ message: result, message2: result2 });
      }
    );
  });
}

  getfundrequestInfo(req: any, res: any) {
  const { fr_id } = req.body;
  db.query("SELECT *FROM fp_sp_item WHERE sp_id=?", fr_id, (err, result) => {
    db.query(
      "SELECT *FROM fund_request WHERE fr_id=?",
      fr_id,
      (err, result2) => {
        res.json({ message: result, message2: result2 });
      }
    );
  });
}

  UpdateSupplyPayment(req: any, res: any) {
  const { id, sp_id, r_id, campus, item, vendor, mop, amount } = req.body;
  db.query(
    "UPDATE fp_sp_item SET ? WHERE id= ? ",
    [{ sp_id, r_id, campus, item, vendor, mop, amount }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  procurementTest(req: any, res: any) {
  res.send("Procurement");
}
}
