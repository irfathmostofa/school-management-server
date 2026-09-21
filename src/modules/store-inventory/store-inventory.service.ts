// @ts-nocheck
import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { UploadService } from "../../common/upload/upload.service";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";

let db: any;
let publicDirectory: string;

//product Type

// router.post("/getProductByType", (req, res) => {
//   const { type } = req.body;
//   db.query("SELECT *FROM products WHERE type=?", type, (err, result) => {
//     res.json({ message: result });
//   });
// });



// router.post("/getTransferHistory", (req, res) => {
//   const { session } = req.body;

//   db.query(
//     "SELECT * FROM product_transfer WHERE session=?",
//     [session],
//     (err, result) => {
//       if (err) {
//         res.json({ ok: false, message: err });
//       } else {
//         res.json({ ok: true, message: result });
//       }
//     }
//   );
// });

// GRN
function addgrninfo(item, grn_id, po_id, r_id, type, brand, qty, remark) {
  db.query(
    "INSERT INTO mdr_item SET ?",
    { item, grn_id, po_id, r_id, type, brand, qty, remark },
    (err, result) => {}
  );
}

// GRN

//mdr
function addmdrinfo(mdr_id, r_id, item, pcondition, fqty, note) {
  db.query(
    "INSERT INTO mdr_item SET ?",
    { mdr_id, r_id, item, pcondition, qty: fqty, note },
    (err, result) => {}
  );
}

//mdr

/////////////////////// new stock ////////////////////////



// router.post("/getallquotation", (req, res) => {
//   db.query("SELECT *FROM quotation", (err, result) => {
//     res.json({ message: result });
//   });
// });


/////////////////// vendor ///////////////

////////////// product ////////////

// router.post("/getallStoreProduct", (req, res) => {
//   db.query("SELECT *FROM store_product", (err, result) => {
//     res.json({ message: result });
//   });
// });

////////////////////////////  billing ///////////////

@Injectable()
export class StoreInventoryService {
  constructor(
    private readonly database: DatabaseService,
    private readonly upload: UploadService
  ) {
    db = this.database;
    publicDirectory = this.upload.publicDirectory;
  
  }

  addProductType(req: any, res: any) {
  const { p_type, category } = req.body;
  db.query(
    "INSERT INTO product_category SET ?",
    { p_type, category },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  getProductType(req: any, res: any) {
  db.query("SELECT *FROM product_category ", (err, result) => {
    res.json({ message: result });
  });
}

  getProductTypeinduById(req: any, res: any) {
  const { id } = req.body;
  db.query("SELECT *FROM product_category WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
}

  getProductTypeById(req: any, res: any) {
  const { p_type } = req.body;
  if (p_type == "student") {
    db.query(
      "SELECT *FROM product_category WHERE p_type='student' ",
      (err, result) => {
        res.json({ message: result });
      }
    );
  }
  if (p_type == "general") {
    db.query(
      "SELECT *FROM product_category WHERE p_type='general' ",
      (err, result) => {
        res.json({ message: result });
      }
    );
  }
}

  UpdateProductType(req: any, res: any) {
  const { id, p_type, category } = req.body;
  db.query(
    "UPDATE product_category SET ? WHERE id= ? ",
    [{ p_type, category }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  addProduct(req: any, res: any) {
  const {
    item,
    product_id,
    cat,
    brand,
    author,
    publisher,
    publisher_date,
    bookedition,
    qty,
    price,
    type,
  } = req.body;

  if (type == "general") {
    db.query(
      "INSERT INTO products SET ?",
      {
        item,
        product_id,
        cat,
        brand,
        author: "",
        publisher: "",
        publisher_date: "",
        bookedition: "",
        qty,
        price,
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
  if (type == "student") {
    db.query(
      "INSERT INTO products SET ?",
      {
        item,
        product_id,
        cat,
        brand: "",
        author,
        publisher,
        publisher_date,
        bookedition,
        qty,
        price,
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
}

  getProductByType(req: any, res: any) {
  const { type, page = 1, limit = 10000  } = req.body;

  const offset = (page - 1) * limit;

  // First get total count
  db.query(
    "SELECT COUNT(*) AS total FROM products WHERE type = ?",
    [type],
    (err, countResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }

      const total = countResult[0].total;

      // Then get paginated records
      db.query(
        "SELECT * FROM products WHERE type = ? LIMIT ? OFFSET ?",
        [type, parseInt(limit), parseInt(offset)],
        (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
          }

          res.json({
            message: {
              data: result,   
              total: total,   
              page: parseInt(page),
              limit: parseInt(limit),
            },
          });
        }
      );
    }
  );
}

  getProduct(req: any, res: any) {
  db.query("SELECT *FROM products", (err, result) => {
    res.json({ message: result });
  });
}

  getProductById(req: any, res: any) {
  const { id } = req.body;
  db.query("SELECT *FROM products WHERE id=?",id,(err, result) => {
      res.json({ message: result });
    });
}

  UpdateProduct(req: any, res: any) {
  const {
    id,
    item,
    cat,
    brand,
    author,
    publisher,
    publisher_date,
    bookedition,
    qty,
    price,
    type,
    product_type
  } = req.body;
  db.query(
    "UPDATE products SET ? WHERE id= ? ",
    [
      {
        item,
        cat,
        brand,
        author,
        publisher,
        publisher_date,
        bookedition,
        qty,
        price,
        type,
        product_type
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
}

  getProductLastID(req: any, res: any) {
  const { cat } = req.body;
  db.query(
    "SELECT product_id FROM products WHERE cat= ? ORDER BY product_id DESC LIMIT 1",
    [cat],
    (err, result) => {
      if (err) {
        console.error(err);

        return res.status(500).json({ message: err });
      }

      if (result.length === 0) {
        return res.json({ message: "0001" });
      }

      const lastID = parseInt(result[0].product_id.slice(6)) + 1;

      const paddedLastID = String(lastID).padStart(4, "0");

      res.json({ message: paddedLastID });
    }
  );
}

  getStudentProducts(req: any, res: any) {
  const { searchQuery } = req.body;
  // Use placeholders for searchQuery and fix SQL query syntax
  db.query(
    "SELECT * FROM products WHERE type = ? AND (product_id LIKE ? OR item LIKE ?) LIMIT 5",
    ["student", `%${searchQuery}%`, `%${searchQuery}%`],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

  addTransferProduct(req: any, res: any) {
  const {
    product_id,
    product_name,
    transferCampus,
    transferQty,
    transferDate,
    session,
    creatorID,
    creatorName,
  } = req.body;

  db.query(
    "INSERT INTO product_transfer SET ?",
    [
      {
        product_id,
        product_name,
        transferCampus,
        transferQty,
        transferDate,
        session,
        creatorID,
        creatorName,
      },
    ],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: "Records has been successfully added." });
      }
    }
  );
}

  updateTransferProduct(req: any, res: any) {
  const { transferID, transferQty } = req.body;

  const sql =
    "UPDATE product_transfer SET transferQty = ?, status='0' WHERE id = ?";
  const values = [transferQty, transferID];

  db.query(sql, values, (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({
        ok: true,
        message: "Records have been successfully updated.",
      });
    }
  });
}

  getTransferHistory(req: any, res: any) {
  const { page = 1, limit = 10000 } = req.body; 

  const offset = (page - 1) * limit;

 
  const query = `
    SELECT * 
    FROM product_transfer 
    ORDER BY id DESC 
    LIMIT ? OFFSET ?
  `;


  const countQuery = `SELECT COUNT(*) AS total FROM product_transfer`;

  db.query(countQuery, (err, countResult) => {
    if (err) {
      return res.status(500).json({ ok: false, message: err.message });
    }

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    db.query(query, [parseInt(limit), parseInt(offset)], (err, result) => {
      if (err) {
        return res.status(500).json({ ok: false, message: err.message });
      }

      res.json({
        ok: true,
        data: result,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages,
        },
      });
    });
  });
}

  updateTransferHistory(req: any, res: any) {
  const { item, status } = req.body;
  const { id, product_id, product_name, transferCampus, transferQty, session } =
    JSON.parse(item);

  const sql = "UPDATE product_transfer SET status = ? WHERE id = ?";
  const values = [status, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      db.query(
        `INSERT INTO library_items (product_id, product_name, campus, quantity)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
        [product_id, product_name, transferCampus, transferQty],
        (err, result) => {
          if (err) {
            res.json({ ok: false, message: err });
          } else {
            db.query(
              "UPDATE products SET qty = qty - ? WHERE product_id = ?",
              [parseInt(transferQty), product_id],
              (err, result) => {
                if (err) {
                  res.json({ ok: false, message: err });
                } else {
                  res.json({
                    ok: true,
                    message: "Records have been successfully updated.",
                  });
                }
              }
            );
          }
        }
      );
    }
  });
}

  getLibraryItems(req: any, res: any) {
  //   const {session} = req.body;

  db.query(
    `SELECT LI.campus, LI.quantity as libraryQty, pr.product_id, pr.item,pr.cat, pr.brand, pr.author, pr.publisher, pr.publisher_date, pr.bookedition,pr.qty as storeQty, pr.price , pr.type
FROM library_items AS LI
JOIN products AS pr ON LI.product_id = pr.product_id;
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

  getLibraryItemByID(req: any, res: any) {
  const { product_id, campus } = req.body;

  db.query(
    `SELECT LI.campus, LI.quantity as libraryQty, pr.product_id, pr.item,pr.cat, pr.brand, pr.author, pr.publisher, pr.publisher_date, pr.bookedition,pr.qty as storeQty, pr.price , pr.type
FROM library_items AS LI
JOIN products AS pr ON LI.product_id = pr.product_id WHERE LI.product_id = ? AND LI.campus = ?
`,
    [product_id, campus],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

  getLibraryIssuedItems(req: any, res: any) {
  const { receiver_type, campus, session } = req.body;

  db.query(
    `SELECT * FROM item_issue_list WHERE receiver_type = ? AND campus = ? AND  session = ? `,
    [receiver_type, campus, session],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

  async addLibraryIssueItems(req: any, res: any) {
  const {
    receiver_id,
    receiver_name,
    receiver_type,
    campus,
    issued_items,
    creatorID,
    creatorName,
    session,
  } = req.body;

  const parsedIssuedItems = JSON.parse(issued_items);

  // Generate a unique issue_id
  const lastIDResult = await new Promise((resolve, reject) => {
    db.query(
      "SELECT issue_id FROM item_issue_list ORDER BY id DESC LIMIT 1",
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });

  let issue_id = "LI-0001";

  if (lastIDResult && lastIDResult.length > 0) {
    const lastID = parseInt(lastIDResult[0].issue_id.slice(3)) + 1;
    const paddedLastID = String(lastID).padStart(4, "0");
    issue_id = `LI-${paddedLastID}`;
  }

  const insertData = parsedIssuedItems.map((item) => {
    return [
      issue_id,
      campus,
      item.product_id,
      item.product_name,
      item.quantity,
      receiver_type,
      receiver_id,
      receiver_name,
      session,
      creatorID,
      creatorName,
      item.issueDate,
      item.returnDate,
    ];
  });

  const insertData2 = parsedIssuedItems.map((item) => {
    return [parseInt(item.quantity), item.product_id, campus];
  });

  const query =
    "INSERT INTO `item_issue_list`" +
    "(issue_id, `campus`, `product_id`, `product_name`, `quantity`, `receiver_type`, `receiver_id`, `receiver_name`, `session`, `creatorID`, `creatorName`, `issueDate`, `returnDate`)" +
    " VALUES ?";

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(query, [insertData], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    const updatePromises = insertData2.map((data) => {
      return new Promise((resolve, reject) => {
        db.query(
          "UPDATE library_items SET quantity = quantity - ? WHERE product_id=? AND campus=?",
          data,
          (err, result2) => {
            if (err) {
              reject(err);
            } else {
              resolve(result2);
            }
          }
        );
      });
    });

    await Promise.all(updatePromises);

    res.json({
      ok: true,
      message: "Records have been successfully added.",
      issue_id,
    });
  } catch (err) {
    res.json({ ok: false, message: err });
  }
}

  getIssueInfo(req: any, res: any) {
  const { product_id, issue_id } = req.body;

  db.query(
    `SELECT * FROM item_issue_list WHERE product_id = ? AND issue_id = ?`,
    [product_id, issue_id],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

  getLibraryReturnItems(req: any, res: any) {
  const { giver_type, campus, session } = req.body;

  db.query(
    `SELECT * FROM item_return_list WHERE giver_type = ? AND campus = ? AND  session = ? `,
    [giver_type, campus, session],
    (err, result) => {
      if (err) {
        res.json({ ok: false, message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
}

  async addLibraryReturnItems(req: any, res: any) {
  const {
    giver_id,
    giver_name,
    giver_type,
    campus,
    return_items,
    creatorID,
    creatorName,
    session,
  } = req.body;

  const parsedReturnItems = JSON.parse(return_items);

  // Generate a unique return_id
  const lastIDResult = await new Promise((resolve, reject) => {
    db.query(
      "SELECT return_id FROM item_return_list ORDER BY id DESC LIMIT 1",
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });

  let return_id = "LR-0001";

  if (lastIDResult && lastIDResult.length > 0) {
    const lastID = parseInt(lastIDResult[0].return_id.slice(3)) + 1;
    const paddedLastID = String(lastID).padStart(4, "0");
    return_id = `LR-${paddedLastID}`;
  }

  const insertData = parsedReturnItems.map((item) => {
    return [
      return_id,
      campus,
      item.issue_id,
      item.product_id,
      item.product_name,
      item.quantity,
      item.fine,
      item.issueDate,
      item.needToReturn,
      item.returnToLibraryDate,
      creatorID,
      creatorName,
      giver_id,
      giver_name,
      giver_type,
      session,
    ];
  });

  const insertData2 = parsedReturnItems.map((item) => {
    return [
      item.product_id,
      item.product_name,
      campus,
      item.quantity,
      parseInt(item.quantity),
    ];
  });

  const updateData3 = parsedReturnItems.map((item) => {
    return [item.issue_id, item.product_id];
  });

  const query =
    "INSERT INTO `item_return_list`" +
    "(`return_id`, `campus`, `issue_id`, `product_id`, `product_name`, `quantity`, `fine`, `issueDate`, `needToReturn`, `returnToLibraryDate`, `creatorID`, `creatorName`, `giverID`, `giverName`, `giver_type`, `session`)" +
    " VALUES ?";

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(query, [insertData], (err, result) => {
        if (err) {
          res.json({ ok: false, message: err });
          reject(err);
        } else {
          resolve(result);
          //   res.json({ ok: true, message: 'Records have been successfully added.', return_id });
        }
      });
    });

    const updatePromises = insertData2.map((data) => {
      return new Promise((resolve, reject) => {
        const query2 = `
      INSERT INTO library_items (product_id, product_name, campus, quantity)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = quantity + ?`;

        db.query(query2, [...data], (err, result2) => {
          if (err) {
            res.json({ ok: false, message: err, data });
            reject(err);
          } else {
            resolve(result2);
            // res.json({ ok: true, message: 'Records have been successfully added..', return_id });
          }
        });
      });
    });

    const updatePromises3 = updateData3.map((data) => {
      // issue_id , product_id
      return new Promise((resolve, reject) => {
        const query2 = `
      UPDATE item_issue_list SET status = 1 WHERE issue_id = ? AND product_id= ?`;

        db.query(query2, [...data], (err, result3) => {
          if (err) {
            res.json({ ok: false, message: err, data });
            reject(err);
          } else {
            resolve(result3);
            // res.json({ ok: true, message: 'Records have been successfully added...', return_id });
          }
        });
      });
    });

    await Promise.all(updatePromises);
    await Promise.all(updatePromises3);

    res.json({
      ok: true,
      message: "Records have been successfully added.",
      return_id,
    });
  } catch (err) {
    res.json({ ok: false, message: err });
  }
}

  addGRNinfo(req: any, res: any) {
  const { grn_id, po_id, sname, cnum, billnum, gdate, session, compile } =
    req.body;
  db.query(
    "INSERT INTO grn SET ?",
    {
      grn_id,
      po_id,
      sname,
      cnum,
      billnum,
      gdate,
      status: "",
      img: "",
      billcheck: "",
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

  getGRNinfo(req: any, res: any) {
  db.query("SELECT *FROM grn ORDER BY id DESC", (err, result) => {
    res.json({ message: result });
  });
}

  getAllinfoByGRN(req: any, res: any) {
  const { grn_id } = req.body;
  db.query("SELECT *FROM grn WHERE grn_id=?", grn_id, (err, result) => {
    db.query(
      "SELECT *FROM grn_item WHERE grn_id=? ",
      grn_id,
      (err, result2) => {
        res.json({ info: result, items: result2 });
      }
    );
  });
}

  updateGRNBillstatus(req: any, res: any) {
  const { grn_id, img, chk } = req.body;

  var filename = "";
  if (req.files !== null) {
    if (req.files.img !== undefined) {
      var file = req.files.img;
      var filename = uuidv4() + file.name;
      file.mv(publicDirectory + "/image/" + filename, (err) => {
        if (err) {
          res.json({ message: err });
        } else {
          res.json({ message: true });
        }
      });
    }
  }

  if (chk == "") {
    db.query(
      "UPDATE grn SET ? WHERE grn_id=?",
      [{ img: filename }, grn_id],
      (err, result) => {
        if (err) {
          res.json({ message: false });
        } else {
          res.json({ message: true });
        }
      }
    );
  } else {
    db.query(
      "UPDATE grn SET ? WHERE grn_id=?",
      [{ billcheck: chk }, grn_id],
      (err, result) => {
        if (err) {
          res.json({ message: false });
        } else {
          res.json({ message: true });
        }
      }
    );
  }
}

  updateGRNstatus(req: any, res: any) {
  const { grn_id } = req.body;
  db.query(
    "UPDATE grn SET ? WHERE grn_id=?",
    [{ status: "Received" }, grn_id],
    (err, result) => {
      if (err) {
        res.json({ message: false });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  addGRNitem(req: any, res: any) {
  const { item, grn_id, po_id, r_id, type, brand, qty, remark, pid } = req.body;
  db.query("SELECT * FROM products WHERE id=?", pid, (err, result) => {
    if (err) {
      res.json({ message: false });
      return;
    }
    const cs = parseInt(result[0].qty);
    const us = cs + parseInt(qty);
    db.query(
      "UPDATE products SET ? WHERE id=?",
      [{ qty: us }, pid],
      (err, result) => {
        if (err) {
          res.json({ message: false });
        } else {
          addgrninfo(item, grn_id, po_id, r_id, type, brand, qty, remark);
          res.json({ message: "ok" });
        }
      }
    );
  });
  db.query(
    "INSERT INTO grn_item SET ?",
    { item, grn_id, po_id, r_id, type, brand, qty, remark },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  addMDRinfo(req: any, res: any) {
  const { rname, mdr_id, r_id, campus, gdate, session, compile } = req.body;
  db.query(
    "INSERT INTO mdr SET ?",
    { rname, mdr_id, r_id, campus, gdate, status: "", session, compile },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
}

  getMDRinfo(req: any, res: any) {
    const { user } = req.body;
  db.query("SELECT *FROM mdr WHERE rname=? ORDER BY id DESC",user,(err, result) => {
    res.json({ message: result });
  });
}

  updateMDRstatus(req: any, res: any) {
  const { mdr_id, user } = req.body;
  db.query("SELECT *FROM mdr WHERE rname=?", user, (err, result) => {
    if (result.length > 0) {
      db.query(
        "UPDATE mdr SET ? WHERE mdr_id=?",
        [{ status: "Received" }, mdr_id],
        (err, result) => {
          if (err) {
            res.json({ message: err });
          } else {
            res.json({ severity:"success",summary:"Success",message: "Product Received" });
          }
        }
      );
    } else {
      res.json({ severity:"warn",summary:"Warning",message: "Invalid User" });
    }
  });
}

  getAllMDRinfoByID(req: any, res: any) {
  const { mdr_id } = req.body;
  db.query("SELECT *FROM mdr WHERE mdr_id=?", mdr_id, (err, result) => {
    db.query(
      "SELECT *FROM mdr_item WHERE mdr_id=? ",
      mdr_id,
      (err, result2) => {
        res.json({ info: result, items: result2 });
      }
    );
  });
}

  addMDRitem(req: any, res: any) {
  const { mdr_id, r_id, item, pcondition, fqty, note, pid } = req.body;
  db.query("SELECT * FROM products WHERE id=?", pid, (err, result) => {
    if (err) {
      res.json({ message: false });
      return;
    }
    const cs = parseInt(result[0].qty);
    const us = cs - parseInt(fqty);
    if (cs < fqty) {
      res.json({ message: false });
    } else {
      db.query(
        "UPDATE products SET ? WHERE id=?",
        [{ qty: us }, pid],
        (err, result) => {
          if (err) {
            res.json({ message: false });
          } else {
            addmdrinfo(mdr_id, r_id, item, pcondition, fqty, note);
            res.json({ message: "ok" });
          }
        }
      );
    }
  });
}

  addCustomer(req: any, res: any) {
  const {
    customer_name,
    address,
    delivery_address,
    mobile_no,
    whatsapp,
    delivery_no,
    district,
    police_station,
    email,
    notes,
    session,
  } = req.body;

  const sql = `
    INSERT INTO customer (
      customer_name,
      address,
      delivery_address,
      mobile_no,
      whatsapp,
      delivery_no,
      district,
      police_station,
      email,
      notes,
      session
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    customer_name,
    address,
    delivery_address,
    mobile_no,
    whatsapp,
    delivery_no,
    district,
    police_station,
    email,
    notes,
    session,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.json({
        message: false,
        alert: "Failed to add customer.",
        error: err.message,
      });
    }

    res.json({
      message: true,
      alert: "Customer added successfully.",
      insertId: result.insertId,
    });
  });
}

  UpdateCustomer(req: any, res: any) {
  const {
    id,
    customer_name,
    address,
    delivery_address,
    mobile_no,
    whatsapp,
    delivery_no,
    district,
    police_station,
    email,
    notes,
  } = req.body;

  if (!id) {
    return res.json({
      message: false,
      alert: "Customer ID is required",
    });
  }

  const data = {
    customer_name,
    address,
    delivery_address,
    mobile_no,
    whatsapp,
    delivery_no,
    district,
    police_station,
    email,
    notes,
  };

  db.query(
    "UPDATE customer SET ? WHERE id = ?",
    [data, id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.json({
          message: false,
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.json({
          message: false,
          alert: "Customer not found",
        });
      }

      return res.json({
        message: true,
        alert: "Customer updated successfully",
      });
    }
  );
}

  getCustomerByID(req: any, res: any) {
  const { id } = req.body;

  if (!id) {
    return res.json({
      message: false,
      alert: "Customer ID is required",
    });
  }

  db.query(
    "SELECT * FROM customer WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        return res.json({
          message: false,
          error: err.message,
        });
      }

      if (result.length === 0) {
        return res.json({
          message: false,
          alert: "Customer not found",
        });
      }

      return res.json({
        message: true,
        data: result[0],
      });
    }
  );
}

  getAllSearchCustomer(req: any, res: any) {
  const { search } = req.body;
  const searchTerm = `%${search || ""}%`;

  const query = `
    SELECT id, customer_name AS name, mobile_no, email, 'customer' AS type
    FROM customer
    WHERE customer_name LIKE ? OR mobile_no LIKE ? OR email LIKE ?

    UNION ALL

    SELECT student_id AS id, CONCAT(student_first_name, ' ', student_last_name) AS name, NULL AS mobile_no, NULL AS email, 'student' AS type
    FROM student
    WHERE student_id LIKE ? OR student_first_name LIKE ? OR student_last_name LIKE ?

    UNION ALL

    SELECT emp_id AS id, CONCAT(emp_fname, ' ', emp_lname) AS name, NULL AS mobile_no, email, 'employee' AS type
    FROM employee
    WHERE emp_id LIKE ? OR emp_fname LIKE ? OR emp_lname LIKE ? OR email LIKE ?

    ORDER BY id DESC
  `;

  const params = [
    searchTerm, searchTerm, searchTerm,       // customer - 3
    searchTerm, searchTerm, searchTerm,       // student - 3
    searchTerm, searchTerm, searchTerm, searchTerm, // employee - 4
  ]; // total 10

  db.query(query, params, (err, result) => {
    if (err) {
      return res.json({ message: false, error: err.message });
    }
    res.json({ message: true, data: result });
  });
}

  getAllCustomer(req: any, res: any) {
  db.query(
    "SELECT * FROM customer ORDER BY id DESC",
    (err, result) => {
      if (err) {
        return res.json({
          message: false,
          error: err.message,
        });
      }

      res.json({
        message: true,
        data: result,
      });
    }
  );
}

  deleteCustomer(req: any, res: any) {
  const { id } = req.body;

  if (!id) {
    return res.json({
      message: false,
      alert: "Customer ID is required",
    });
  }

  db.query(
    "DELETE FROM customer WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error(err);

        return res.json({
          message: false,
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.json({
          message: false,
          alert: "Customer not found",
        });
      }

      return res.json({
        message: true,
        alert: "Customer deleted successfully.",
      });
    }
  );
}

  addquotation(req: any, res: any) {
  const {
    session,
    customer_name,
    total,
    discount,
    discount_type,
    compile,
    items,
  } = req.body;

  // Get last quotation
  db.query(
    "SELECT id FROM quotation ORDER BY id DESC LIMIT 1",
    (err, result) => {
      if (err) {
        return res.json({ message: false, error: err });
      }

      let quotation_id = "q-1";

      if (result.length > 0) {
        quotation_id = `q-${result[0].id + 1}`;
      }

      // Insert quotation
      db.query(
        "INSERT INTO quotation SET ?",
        {
          session,
          quotation_id,
          customer_name,
          total,
          discount,
          discount_type,
          compile,
        },
        (err, quotationResult) => {
          if (err) {
            return res.json({ message: false, error: err });
          }

          if (!items || items.length === 0) {
            return res.json({
              message: true,
              quotation_id,
            });
          }

          const values = items.map((item) => [
            quotation_id,
            item.itemName,
            item.description,
            item.qty,
            item.price,
            item.discount,
            item.total_amount,
          ]);

          db.query(
            `INSERT INTO quotation_item
            (quotation_id,itemName,description,qty,price,discount,total_amount)
            VALUES ?`,
            [values],
            (err2, result2) => {
              if (err2) {
                return res.json({ message: false, error: err2 });
              }

              res.json({
                message: true,
                quotation_id,
                totalItems: result2.affectedRows,
              });
            }
          );
        }
      );
    }
  );
}

  getLastQuotationId(req: any, res: any) {
  db.query(
    "SELECT quotation_id FROM quotation ORDER BY id DESC LIMIT 1",
    (err, result) => {
      if (err) {
        return res.json({
          message: false,
          error: err,
        });
      }

      let nextQuotationId = "q-1";

      if (result.length > 0) {
        const lastQuotationId = result[0].quotation_id;

        const lastNumber = parseInt(lastQuotationId.split("-")[1]) || 0;

        nextQuotationId = `q-${lastNumber + 1}`;
      }

      res.json({
        message: true,
        next_quotation_id: nextQuotationId,
      });
    }
  );
}

  getallquotation(req: any, res: any) {
  const query = `
    SELECT 
      q.*,
      COALESCE(SUM(qi.qty), 0) AS total_qty,
      COALESCE(SUM(qi.total_amount), 0) AS total_sum
    FROM quotation q
    LEFT JOIN quotation_item qi ON qi.quotation_id = q.quotation_id
    GROUP BY q.id
    ORDER BY q.id DESC
  `;

  db.query(query, (err, result) => {
    if (err) {
      return res.json({
        message: false,
        error: err.message,
      });
    }

    res.json({
      message: true,
      data: result,
    });
  });
}

  getquotationItemById(req: any, res: any) {
  const { quotation_id } = req.body;

  if (!quotation_id) {
    return res.status(400).json({ error: "quotation_id is required" });
  }

  db.query(
    "SELECT * FROM quotation_item WHERE quotation_id = ?",
    [quotation_id],
    (err, result1) => {
      if (err) {
        return res.status(500).json({ error: "Error fetching quotation_item", details: err });
      }

      db.query(
        "SELECT * FROM quotation WHERE quotation_id = ?",
        [quotation_id],
        (err, result2) => {
          if (err) {
            return res.status(500).json({ error: "Error fetching quotation", details: err });
          }

          return res.status(200).json({
            success: true,
            quotation_item: result1,
            quotation: result2,
          });
        }
      );
    }
  );
}

  addinvoice(req: any, res: any) {
  const {
    session,
    quotation_id,
    customer_name,
    total,
    discount,
    status,
    compile,
    payment_date,
    payment_mode,
    account_id,
    payment_amount,
  } = req.body;

  // Generate Payment ID
  const payment_id = Math.floor(1000000 + Math.random() * 9000000);

  // Generate Invoice ID
  db.query(
    "SELECT id FROM invoice ORDER BY id DESC LIMIT 1",
    (err, result) => {
      if (err) {
        return res.json({
          message: false,
          error: err,
        });
      }

      let invoice_id = "INV-1";

      if (result.length > 0) {
        invoice_id = `INV-${result[0].id + 1}`;
      }

      // Payment Data
      const paymentData = {
        payment_id,
        session,
        type: "income",
        ptype: "Invoice Collection",
        phead: "Invoice",
        payment_for: quotation_id,
        note: `Invoice Payment (${quotation_id})`,
        amount: payment_amount,
        mode: payment_mode,
        account_id,
        status: "1",
        status2: "1",
        verified: "",
        trxId: invoice_id,
        date: payment_date,
        compile,
      };

      // Insert Payment
      db.query("INSERT INTO payment SET ?", paymentData, (err) => {
        if (err) {
          return res.json({
            message: false,
            error: err,
          });
        }

        // Insert Invoice
        db.query(
          "INSERT INTO invoice SET ?",
          {
            invoice_id,
            quotation_id,
            customer_name,
            total,
            discount,
            paid_amount:payment_amount,
            status,
            session,
            compile,
          },
          (err) => {
            if (err) {
              return res.json({
                message: false,
                error: err,
              });
            }

            res.json({
              message: true,
              invoice_id,
            });
          }
        );
      });
    }
  );
}

  getallinvoice(req: any, res: any) {
  db.query("SELECT *FROM invoice", (err, result) => {
    res.json({ message: result });
  });
}

  deleteinvoice(req: any, res: any) {
  const { invoice_id } = req.body;

  if (!invoice_id) {
    return res.json({
      message: false,
      alert: "Invoice ID is required",
    });
  }

  db.query(
    "DELETE FROM invoice WHERE invoice_id = ?",
    [invoice_id],
    (err, result) => {
      if (err) {
        console.error(err);

        return res.json({
          message: false,
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.json({
          message: false,
          alert: "Invoice not found",
        });
      }

      return res.json({
        message: true,
        alert: "Invoice deleted successfully.",
      });
    }
  );
}

  addvendor(req: any, res: any) {
  const {
    vendor_name,
    address,
    mobile_no,
    whatsapp,
    district,
    police_station,
    email,
    notes,
    session,
  } = req.body;

  const sql = `
    INSERT INTO vendor (
      vendor_name,
      address,
      mobile_no,
      whatsapp,
      district,
      police_station,
      email,
      notes,
      session
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    vendor_name,
    address,
    mobile_no,
    whatsapp,
    district,
    police_station,
    email,
    notes,
    session,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.json({
        message: false,
        alert: "Failed to add Vendor.",
        error: err.message,
      });
    }

    res.json({
      message: true,
      alert: "Vendor added successfully.",
      insertId: result.insertId,
    });
  });
}

  UpdateVendor(req: any, res: any) {
  const {
    id,
    vendor_name,
    address,
    delivery_address,
    mobile_no,
    whatsapp,
    delivery_no,
    district,
    police_station,
    email,
    notes,
  } = req.body;

  if (!id) {
    return res.json({
      message: false,
      alert: "Vendor ID is required",
    });
  }

  const data = {
    vendor_name,
    address,
    delivery_address,
    mobile_no,
    whatsapp,
    delivery_no,
    district,
    police_station,
    email,
    notes,
  };

  db.query(
    "UPDATE vendor SET ? WHERE id = ?",
    [data, id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.json({
          message: false,
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.json({
          message: false,
          alert: "vendor not found",
        });
      }

      return res.json({
        message: true,
        alert: "Vendor updated successfully",
      });
    }
  );
}

  getvendorID(req: any, res: any) {
  const { id } = req.body;

  if (!id) {
    return res.json({
      message: false,
      alert: "Vendor ID is required",
    });
  }

  db.query(
    "SELECT * FROM vendor WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        return res.json({
          message: false,
          error: err.message,
        });
      }

      if (result.length === 0) {
        return res.json({
          message: false,
          alert: "Customer not found",
        });
      }

      return res.json({
        message: true,
        data: result[0],
      });
    }
  );
}

  getAllVendor(req: any, res: any) {
  db.query(
    "SELECT * FROM vendor ORDER BY id DESC",
    (err, result) => {
      if (err) {
        return res.json({
          message: false,
          error: err.message,
        });
      }

      res.json({
        message: true,
        data: result,
      });
    }
  );
}

  deleteVendor(req: any, res: any) {
  const { id } = req.body;

  if (!id) {
    return res.json({
      message: false,
      alert: "Vendor ID is required",
    });
  }

  db.query(
    "DELETE FROM vendor WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error(err);

        return res.json({
          message: false,
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.json({
          message: false,
          alert: "Vendor not found",
        });
      }

      return res.json({
        message: true,
        alert: "Vendor deleted successfully.",
      });
    }
  );
}

  getLastPurchaseId(req: any, res: any) {
  db.query(
    "SELECT product_id FROM store_product ORDER BY id DESC LIMIT 1",
    (err, result) => {
      if (err) {
        return res.json({
          message: false,
          error: err,
        });
      }

      let nextQuotationId = "p-1";

      if (result.length > 0) {
        const lastQuotationId = result[0].quotation_id;

        const lastNumber = parseInt(lastQuotationId.split("-")[1]) || 0;

        nextQuotationId = `p-${lastNumber + 1}`;
      }

      res.json({
        message: true,
        next_quotation_id: nextQuotationId,
      });
    }
  );
}

  addStoreProduct(req: any, res: any) {
  const {
    session,
    customer_name,
    total,
    discount,
    discount_type,
    compile,
    items,
  } = req.body;

  // Get last store_product
  db.query(
    "SELECT id FROM store_product ORDER BY id DESC LIMIT 1",
    (err, result) => {
      if (err) {
        return res.json({ message: false, error: err });
      }

      let product_id = "p-1";

      if (result.length > 0) {
        product_id = `p-${result[0].id + 1}`;
      }

      // Insert store_product
      db.query(
        "INSERT INTO store_product SET ?",
        {
          session,
          product_id,
          customer_name,
          total,
          discount,
          discount_type,
          compile,
        },
        (err, quotationResult) => {
          if (err) {
            return res.json({ message: false, error: err });
          }

          if (!items || items.length === 0) {
            return res.json({
              message: true,
              product_id,
            });
          }

          const values = items.map((item) => [
            product_id,
            item.itemName,
            item.description,
            item.qty,
            item.price,
            item.discount,
            item.total_amount,
          ]);

          db.query(
            `INSERT INTO store_product_item
            (product_id,itemName,description,qty,price,discount,total_amount)
            VALUES ?`,
            [values],
            (err2, result2) => {
              if (err2) {
                return res.json({ message: false, error: err2 });
              }

              res.json({
                message: true,
                product_id,
                totalItems: result2.affectedRows,
              });
            }
          );
        }
      );
    }
  );
}

  getLastStoreProductId(req: any, res: any) {
  db.query(
    "SELECT product_id FROM store_product ORDER BY id DESC LIMIT 1",
    (err, result) => {
      if (err) {
        return res.json({
          message: false,
          error: err,
        });
      }

      let nextQuotationId = "p-1";

      if (result.length > 0) {
        const lastQuotationId = result[0].product_id;

        const lastNumber = parseInt(lastQuotationId.split("-")[1]) || 0;

        nextQuotationId = `p-${lastNumber + 1}`;
      }

      res.json({
        message: true,
        next_quotation_id: nextQuotationId,
      });
    }
  );
}

  getallStoreProduct(req: any, res: any) {
  const query = `
    SELECT 
      q.*,
      COALESCE(SUM(qi.qty), 0) AS total_qty,
      COALESCE(SUM(qi.total_amount), 0) AS total_sum
    FROM store_product q
    LEFT JOIN store_product_item qi ON qi.product_id = q.product_id
    GROUP BY q.id
    ORDER BY q.id DESC
  `;

  db.query(query, (err, result) => {
    if (err) {
      return res.json({
        message: false,
        error: err.message,
      });
    }

    res.json({
      message: true,
      data: result,
    });
  });
}

  getallStoreProductItemlist(req: any, res: any) {
  db.query("SELECT *FROM store_product_item", (err, result) => {
    res.json({ message: result });
  });
}

  getStoreProductItemById(req: any, res: any) {
  const { product_id } = req.body;

  if (!product_id) {
    return res.status(400).json({ error: "product_id is required" });
  }

  db.query(
    "SELECT * FROM store_product_item WHERE product_id = ?",
    [product_id],
    (err, result1) => {
      if (err) {
        return res.status(500).json({ error: "Error fetching store_product_item", details: err });
      }

      db.query(
        "SELECT * FROM store_product WHERE product_id = ?",
        [product_id],
        (err, result2) => {
          if (err) {
            return res.status(500).json({ error: "Error fetching store_product", details: err });
          }

          return res.status(200).json({
            success: true,
            quotation_item: result1,
            quotation: result2,
          });
        }
      );
    }
  );
}

  addbill(req: any, res: any) {
  const {
    session,
    product_id,
    customer_name,
    total,
    discount,
    status,
    compile,
    payment_date,
    payment_mode,
    account_id,
    payment_amount,
  } = req.body;

  // Generate Payment ID
  const payment_id = Math.floor(1000000 + Math.random() * 9000000);

  // Generate Invoice ID
  db.query(
    "SELECT id FROM billing ORDER BY id DESC LIMIT 1",
    (err, result) => {
      if (err) {
        return res.json({
          message: false,
          error: err,
        });
      }

      let bill_id = "bill-1";

      if (result.length > 0) {
        bill_id = `bill-${result[0].id + 1}`;
      }

      // Payment Data
      const paymentData = {
        payment_id,
        session,
        type: "expense",
        ptype: "Bill Collection",
        phead: "Billing",
        payment_for: product_id,
        note: `Store product Payment (${product_id})`,
        amount: payment_amount,
        mode: payment_mode,
        account_id,
        status: "1",
        status2: "1",
        verified: "",
        trxId: bill_id,
        date: payment_date,
        compile,
      };

      // Insert Payment
      db.query("INSERT INTO payment SET ?", paymentData, (err) => {
        if (err) {
          return res.json({
            message: false,
            error: err,
          });
        }

        // Insert Invoice
        db.query(
          "INSERT INTO billing SET ?",
          {
            bill_id,
            product_id,
            customer_name,
            total,
            discount,
            paid_amount:payment_amount,
            status,
            session,
            compile,
          },
          (err) => {
            if (err) {
              return res.json({
                message: false,
                error: err,
              });
            }

            res.json({
              message: true,
              bill_id,
            });
          }
        );
      });
    }
  );
}

  getallbillinfo(req: any, res: any) {
  db.query("SELECT *FROM billing", (err, result) => {
    res.json({ message: result });
  });
}

  deletebill(req: any, res: any) {
  const { bill_id } = req.body;

  if (!bill_id) {
    return res.json({
      message: false,
      alert: "Bill ID is required",
    });
  }

  db.query(
    "DELETE FROM billing WHERE bill_id = ?",
    [invoice_id],
    (err, result) => {
      if (err) {
        console.error(err);

        return res.json({
          message: false,
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.json({
          message: false,
          alert: "Bill not found",
        });
      }

      return res.json({
        message: true,
        alert: "Bill deleted successfully.",
      });
    }
  );
}

  get(req: any, res: any) {
  res.send("storeInventory");
}
}
