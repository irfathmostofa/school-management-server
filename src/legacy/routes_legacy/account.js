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
  optionsSuccessStatus: 200,
};

router.use(cors(corsOptions));

const db = mysql.createConnection({
  host: "localhost",
  user: "rooh_db",
  password: "7qcqZQ7FTm46TWA?",
  database: "rooh_db",
  timezone: "utc",
});

// router.post("/addpayment", (req, res) => {
//   const {
//     session,
//     type,
//     ptype,
//     campus,
//     phead,
//     payment_for,
//     note,
//     amount,
//     mode,
//     account_id,
//     date,
//     compile,
//   } = req.body;

//   var ran = Math.floor(100000 + Math.random() * 900000);

//   db.query(
//     "INSERT INTO payment SET ?",
//     {
//       payment_id: ran,
//       session,
//       type,
//       ptype,
//       campus,
//       phead,
//       payment_for,
//       note,
//       amount,
//       mode,
//       account_id,
//       status: 1,
//       status2: 1,
//       verified: 0,
//       date,
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





router.post("/addpayment", (req, res) => {
  const {
    session,
    type,
    ptype,
    campus,
    phead,
    sub_expense_head,
    payment_for,
    note,
    amount,
    mode,
    account_id,
    date,
    compile,
  } = req.body;

  const d = new Date(date);
  const year = d.getFullYear();
  console.log(year)
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const prefix = `${year}${month}`;

  // Get latest payment_id for this month
  db.query(
    "SELECT payment_id FROM payment WHERE payment_id LIKE ? ORDER BY payment_id DESC LIMIT 1",
    [`${prefix}%`],
    (err, rows) => {
      if (err) {
        return res.json({ message: err });
      }

      let nextNumber = 1; // default if none found
      if (rows.length > 0) {
        const lastId = String(rows[0].payment_id || "");
        const lastNumber = parseInt(lastId.slice(-3)) || 0;
        nextNumber = lastNumber + 1;
      }

      if (nextNumber > 999) {
        return res.json({ message: "Payment ID limit reached for this month" });
      }

      const payment_id = `${prefix}${String(nextNumber).padStart(3, "0")}`;

      db.query(
        "INSERT INTO payment SET ?",
        {
          payment_id,
          session,
          type,
          ptype,
          campus,
          phead,
          sub_expense_head,
          payment_for,
          note,
          amount,
          mode,
          account_id,
          status: 1,
          status2: 1,
          verified: 0,
          date,
          compile,
        },
        (err2) => {
          if (err2) {
            res.json({ message: err2 });
          } else {
            res.json({ message: true, payment_id });
          }
        }
      );
    }
  );
});





router.post("/RandP-Report", (req, res) => {
    const { startDate, endDate } = req.body;

    const paymentQueryParameters = [startDate, endDate, startDate, endDate];
    const transferQueryParameters = [startDate, endDate];

    // Opening balance query
    const openingBalanceQuery = `
        SELECT
            b.id,
            b.bank_name,
            b.acc_number,
            b.o_balance,
            b.o_balance +
            COALESCE(SUM(CASE WHEN p.type = 'income' AND p.date < ? THEN p.amount ELSE 0 END), 0) +
            COALESCE(SUM(CASE WHEN p.type = 'transfer' AND p.ptype = 'transfer_from' AND p.date < ? THEN p.amount ELSE 0 END), 0) -
            COALESCE(SUM(CASE WHEN p.ptype = 'transfer_to' AND p.date < ? THEN p.amount ELSE 0 END), 0) -
            COALESCE(SUM(CASE WHEN p.type = 'expense' AND p.date < ? THEN p.amount ELSE 0 END), 0) AS opening_balance
        FROM bank b
        LEFT JOIN payment p ON p.account_id = b.id
        WHERE b.date <= ? -- Ensure to only include bank records within the date range
        GROUP BY b.id`;

    // Closing balance query
    const closingBalanceQuery = `
        SELECT
            b.id,
            b.bank_name,
            b.acc_number,
            b.o_balance,
            b.o_balance +
            COALESCE(SUM(CASE WHEN p.type = 'income' AND p.date <= ? THEN p.amount ELSE 0 END), 0) +
            COALESCE(SUM(CASE WHEN p.type = 'transfer' AND p.ptype = 'transfer_from' AND p.date <= ? THEN p.amount ELSE 0 END), 0) -
            COALESCE(SUM(CASE WHEN p.ptype = 'transfer_to' AND p.date <= ? THEN p.amount ELSE 0 END), 0) -
            COALESCE(SUM(CASE WHEN p.type = 'expense' AND p.date <= ? THEN p.amount ELSE 0 END), 0) AS closing_balance
        FROM bank b
        LEFT JOIN payment p ON p.account_id = b.id
        WHERE b.date <= ?
        GROUP BY b.id`;

   const studentIncomeQuery = `
SELECT
    ih.id AS id,
    ih.income_head AS head,
    'student' AS type,
    COALESCE(SUM(p.amount), 0) AS total_amount
FROM income_head ih
LEFT JOIN payment p ON p.phead = ih.income_head AND p.date BETWEEN ? AND ?
WHERE ih.income_type = 'Student'
GROUP BY ih.id, ih.income_head

UNION ALL

SELECT
    ft.id AS id,
    ft.feeType AS head,
    'fee' AS type,
    COALESCE(SUM(p.amount), 0) AS total_amount
FROM feesType ft
LEFT JOIN payment p ON p.phead = ft.feeType AND p.date BETWEEN ? AND ?
GROUP BY ft.id, ft.feeType
ORDER BY head`;

    // Queries for general income heads
    const generalIncomeQuery = `
        SELECT
    ih.id AS id,
    ih.income_head AS head,
    'student' AS type,
    COALESCE(SUM(p.amount), 0) AS total_amount
FROM income_head ih
LEFT JOIN payment p ON p.phead = ih.income_head AND p.date BETWEEN ? AND ?
WHERE ih.income_type = 'General'
GROUP BY ih.id, ih.income_head ORDER BY head`;

    // CAPEX expenses query
    const CAPEXExpenseQuery = `
        SELECT
            eh.id AS id,
            eh.expense_head AS head,
            'expense' AS type,
            p.ptype,
            COALESCE(SUM(p.amount), 0) AS total_amount
        FROM expense_head eh
        LEFT JOIN payment p ON p.phead = eh.expense_head
        WHERE p.ptype = 'CAPEX' AND p.date BETWEEN ? AND ?
        GROUP BY eh.id, eh.expense_head 
        ORDER BY head`;

    // OPEX expenses query
    const OPEXExpenseQuery = `
        SELECT
            eh.id AS id,
            eh.expense_head AS head,
            'expense' AS type,
            p.ptype,  
            COALESCE(SUM(p.amount), 0) AS total_amount
        FROM expense_head eh
        LEFT JOIN payment p ON p.phead = eh.expense_head
        WHERE p.ptype = 'OPEX' AND p.date BETWEEN ? AND ?  
        GROUP BY eh.id, eh.expense_head, p.ptype  
        ORDER BY head`;

    // Transfer query
    const transferQuery = `
        SELECT 
            b.bank_name AS transfer_to_bank,
            b.acc_number AS transfer_to_account,
            b2.bank_name AS transfer_from_bank,
            b2.acc_number AS transfer_from_account,
            CONCAT(b2.bank_name, ' transferred to ', b.bank_name) AS transfer_description,
            t.amount AS transfer_amount
        FROM amount_transfer t
        LEFT JOIN bank b ON t.transfer_to = b.id
        LEFT JOIN bank b2 ON t.transfer_from = b2.id
        WHERE t.transfer_date BETWEEN ? AND ?`;

    // Execute opening balance query
    db.query(openingBalanceQuery, [startDate, startDate, startDate, startDate, endDate], (openingErr, openingResult) => {
        if (openingErr) {
            return res.json({ message: 'Database query failed for opening balance', error: openingErr });
        }

        const openingBalances = openingResult.length > 0 ? openingResult.map(account => ({
            account: account.bank_name || "null",
            balance: parseFloat(account.opening_balance || 0)
        })) : [{
            account: "null",
            balance: 0
        }];

        // Execute closing balance query
        db.query(closingBalanceQuery, [endDate, endDate, endDate, endDate, endDate], (closingErr, closingResult) => {
            if (closingErr) {
                return res.json({ message: 'Database query failed for closing balance', error: closingErr });
            }

            const closingBalances = closingResult.map(account => ({
                account: account.bank_name || "null",
                balance: parseFloat(account.closing_balance || 0)
            }));

            // Fetch student income
            db.query(studentIncomeQuery, paymentQueryParameters, (incomeErr, incomeResult) => {
                if (incomeErr) {
                    return res.json({ message: 'Database query failed for student income', error: incomeErr });
                }

                const studentIncome = incomeResult.map(item => ({
                    title: item.head,
                    amount: parseFloat(item.total_amount || 0)
                }));

                // Fetch general income
                db.query(generalIncomeQuery, transferQueryParameters, (generalIncomeErr, generalIncomeResult) => {
                    if (generalIncomeErr) {
                        return res.json({ message: 'Database query failed for general income', error: generalIncomeErr });
                    }

                    const generalIncome = generalIncomeResult.map(item => ({
                        title: item.head,
                        amount: parseFloat(item.total_amount || 0)
                    }));

                    // Fetch CAPEX expenses
                    db.query(CAPEXExpenseQuery, transferQueryParameters, (CAPEXExpenseErr, CAPEXExpenseResult) => {
                        if (CAPEXExpenseErr) {
                            return res.json({ message: 'Database query failed for CAPEX expenses', error: CAPEXExpenseErr });
                        }

                        const CAPEXExpense = CAPEXExpenseResult.map(item => ({
                            title: item.head,
                            amount: parseFloat(item.total_amount || 0)
                        }));

                        // Fetch OPEX expenses
                        db.query(OPEXExpenseQuery, transferQueryParameters, (OPEXExpenseErr, OPEXExpenseResult) => {
                            if (OPEXExpenseErr) {
                                return res.json({ message: 'Database query failed for OPEX expenses', error: OPEXExpenseErr });
                            }

                            const OPEXExpense = OPEXExpenseResult.map(item => ({
                                title: item.head,
                                amount: parseFloat(item.total_amount || 0)
                            }));

                            // Fetch transfers
                            db.query(transferQuery, transferQueryParameters, (transferErr, transferResult) => {
                                if (transferErr) {
                                    return res.json({ message: 'Database query failed for transfers', error: transferErr });
                                }

                                const transferBalances = transferResult.map(transfer => ({
                                    title: transfer.transfer_description,
                                    amount: parseFloat(transfer.transfer_amount || 0)
                                }));

                                // Combine and process results
                                const reportData = {
                                    openingBalances,
                                    closingBalances,
                                    studentIncome,
                                    generalIncome,
                                    CAPEXExpense,
                                    OPEXExpense,
                                    transferBalances
                                };

                                return res.json(reportData);
                            });
                        });
                    });
                });
            });
        });
    });
});



router.post('/accountSummary', (req, res) => {
    const { accountId, startDate, endDate } = req.body;
    const currentDate = new Date().toISOString().slice(0, 10);


const openingBalanceQuery = `
    SELECT 
        b.o_balance + 
        COALESCE(SUM(CASE WHEN p.type = 'income' THEN p.amount ELSE 0 END), 0) +
        COALESCE(SUM(CASE WHEN p.type = 'transfer' AND p.ptype = 'transfer_from' THEN p.amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN p.type = 'transfer' AND p.ptype = 'transfer_to' THEN p.amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN p.type = 'expense' THEN p.amount ELSE 0 END), 0) AS opening_balance
    FROM bank b
    LEFT JOIN payment p ON p.account_id = b.id AND p.date < ? 
    WHERE b.id = ? AND b.date <= ?
`;



    
    // Query to fetch payments within the selected date range
    const paymentQuery = `
        SELECT p.*, b.account_type, b.bank_name
        FROM payment p
        JOIN bank b ON p.account_id = b.id
        WHERE p.date BETWEEN ? AND ? AND b.id = ?
        ORDER BY p.date ASC, p.id ASC`;
    
    // Query to fetch bank account details
    const bankQuery = `
        SELECT b.account_type, b.bank_name, b.branch_name, b.acc_number, b.routing_number, b.o_balance, b.date AS bank_date 
        FROM bank b
        WHERE b.id = ?`;

    // Parameters for queries
   const openingBalanceParams = [startDate, accountId, startDate];
    const paymentParams = [startDate, endDate, accountId];

    // Start with opening balance calculation
    db.query(openingBalanceQuery, openingBalanceParams, (openingErr, openingResult) => {
        if (openingErr) {
            return res.json({ message: 'Database query failed', error: openingErr });
        }

        const openingBalance = parseFloat(openingResult[0].opening_balance || 0);
        let runningBalance = openingBalance; // Initialize running balance with the opening balance

        // Fetch transactions within the date range
        db.query(paymentQuery, paymentParams, (paymentErr, paymentResult) => {
            if (paymentErr) {
                return res.json({ message: 'Database query failed', error: paymentErr });
            }

            // Default transaction array with opening balance entry
            const transactions = [{
                id: 'N/A',
                paymentId: 'N/A',
                paymentFor: 'All',
                description: 'Opening Balance',
                debit: 0,
                credit: 0,
                balance: openingBalance,
                date: startDate
            }];

            // Process each transaction to build the transaction list
            paymentResult.forEach(transaction => {
                let amount = parseFloat(transaction.amount);
                let debit = 0;
                let credit = 0;
                let description = transaction.phead || 'No description';

                if (transaction.type === 'income') {
                    credit = amount;
                    runningBalance += amount;
                } else if (transaction.type === 'expense') {
                    debit = amount;
                    runningBalance -= amount;
                    
                } else if (transaction.type === 'transfer') {
                    if (transaction.ptype === 'transfer_to') {
                        debit = amount;
                        runningBalance -= amount;
                        description = 'Transfer to';
                    } else {
                         credit = amount;
                        runningBalance += amount;
                        description = 'Transfer from';
                    }
                    
                }

                transactions.push({
                    id: transaction.id || 'N/A',
                    paymentId: transaction.payment_id || 'N/A',
                    paymentFor: transaction.payment_for || 'N/A',
                    description,
                    debit,
                    credit,
                    type: transaction.type,
                    balance: runningBalance,
                    date: transaction.date || startDate
                });
            });

            // Calculate total summary for credit and debit
            const summary = transactions.reduce((acc, transaction) => {
                acc.credit += transaction.credit || 0;
                acc.debit += transaction.debit || 0;
                return acc;
            }, { credit: 0, debit: 0 });

            summary.balance = openingBalance + summary.credit - summary.debit;

            // Fetch bank information
            db.query(bankQuery, [accountId], (bankErr, bankResult) => {
                if (bankErr) {
                    return res.json({ message: 'Database query failed', error: bankErr });
                }

                if (bankResult.length === 0) {
                    return res.json({ message: 'No account information found for this account ID' });
                }

                const bankInfo = {
                    account_type: bankResult[0].account_type,
                    bank_name: bankResult[0].bank_name,
                    branch_name: bankResult[0].branch_name,
                    acc_number: bankResult[0].acc_number,
                    routing_number: bankResult[0].routing_number,
                    o_balance: parseFloat(bankResult[0].o_balance),
                    date: bankResult[0].bank_date
                };

                res.json({
                    message: true,
                    openingBalance,
                    summary,
                    transactions,
                    bankInfo
                });
            });
        });
    });
});


router.post('/accountSummaryForDaily', (req, res) => {
    const { paymentMode, startDate, endDate } = req.body;
    // const currentDate = new Date().toISOString().slice(0, 10);

    const openingBalanceQuery = `
        SELECT 
        b.o_balance + 
        COALESCE(SUM(CASE WHEN p.type = 'income' THEN p.amount ELSE 0 END), 0) +
        COALESCE(SUM(CASE WHEN p.type = 'transfer' AND p.ptype = 'transfer_from' THEN p.amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN p.type = 'transfer' AND p.ptype = 'transfer_to' THEN p.amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN p.type = 'expense' THEN p.amount ELSE 0 END), 0) AS opening_balance
    FROM bank b
    LEFT JOIN payment p ON p.account_id = b.id AND p.date < ? 
    WHERE b.account_type = ? AND b.date <= ?`;
    
    const paymentQuery = `SELECT p.*, b.account_type, b.bank_name
        FROM payment p
        JOIN bank b ON p.account_id = b.id
        WHERE p.date BETWEEN ? AND ? AND b.account_type=?
        ORDER BY p.date ASC, p.id ASC`;

    const openingBalanceParameters = [startDate, paymentMode,startDate];
    const paymentQueryParameters = [startDate, endDate, paymentMode];

    // Calculate the opening balance
    db.query(openingBalanceQuery, openingBalanceParameters, (openingErr, openingResult) => {
        if (openingErr) {
            return res.json({ message: 'Database query failed', error: openingErr });
        }

        const openingBalance = parseFloat(openingResult[0].opening_balance || 0);
        let runningBalance = openingBalance; // Initialize running balance with the opening balance

        // Fetch transactions within the date range
        db.query(paymentQuery, paymentQueryParameters, (paymentErr, paymentResult) => {
            if (paymentErr) {
                return res.json({ message: 'Database query failed', error: paymentErr });
            }

            // Default transaction array with opening balance entry
            const transactions = [{
                id: 'N/A',
                paymentId: 'N/A',
                paymentFor: 'All',
                description: 'Opening Balance',
                debit: 0,
                credit: 0,
                balance: openingBalance,
                date: startDate // No specific date for opening balance
            }];

            if (paymentResult.length === 0) {
                return res.json({
                    message: 'No transactions found for the selected date range',
                    openingBalance,
                    summary: { credit: 0, debit: 0, balance: openingBalance },
                    transactions
                });
            }

            // Process transactions and add to the transactions array
            paymentResult.forEach(transaction => {
                let amount = parseFloat(transaction.amount);
                let debit = 0;
                let credit = 0;
                let description = transaction.phead || 'No description';

               

                // Handle income, expense, and transfer transactions
                if (transaction.type === 'income') {
                    credit = amount;
                    runningBalance += amount;
                } else if (transaction.type === 'expense') {
                    debit = amount;
                    runningBalance -= amount;
                } else if (transaction.type === 'transfer') {
                    // Handle transfer transactions
                    if (transaction.ptype === 'transfer_to') {
                        debit = amount;
                        runningBalance -= amount;
                        description = 'Transfer to';
                    }else {
                        credit = amount;
                        runningBalance += amount;
                        description = 'Transfer from';
                    }
                }

                // Add transaction to the list
                transactions.push({
                    id: transaction.id || 'N/A',
                    paymentId: transaction.payment_id || 'N/A',
                    paymentFor: transaction.payment_for || 'N/A',
                    description,
                    debit,
                    credit,
                    type:transaction.type,
                    balance: runningBalance,
                    date: transaction.date || startDate
                });
            });

            // Calculate total summary of credit and debit
            const summary = transactions.reduce((acc, transaction) => {
                acc.credit += transaction.credit || 0;
                acc.debit += transaction.debit || 0;
                return acc;
            }, { credit: 0, debit: 0 });

            summary.balance = openingBalance + summary.credit - summary.debit;

            res.json({
                message: true,
                openingBalance,
                summary,
                transactions
            });
        });
    });
});


router.post("/addAmountTransfer", async (req, res) => {
    const { transfer_to, transfer_from, transfer_date, amount, session, modeTo,modeFrom,compile, create_date } = req.body; 
    const paymentId = Math.floor(1000000 + Math.random() * 9000000);
    try {
        const toNote = `Transfer to account ${modeFrom}`;
        const fromNote = `Transfer From account ${modeTo}`;
        // Insert into amount_transfer
        const result = await db.query("INSERT INTO amount_transfer SET ?", { 
            transfer_to, 
            transfer_from, 
            transfer_date, 
            amount, 
            trxId: paymentId, 
            session, 
            compile, 
            create_date 
        });

        // Check if insert was successful
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "Failed to insert into amount_transfer" });
        }

        // Prepare data for transfer_to
        const transferTopaymentData = {
            payment_id: paymentId,
            session: session,
            type: 'transfer',
            ptype: 'transfer_to',
            campus: '',
            phead: 'transfer',
            payment_for: transfer_to,
            note: fromNote,
            amount: amount,
            mode: modeFrom,
            account_id: transfer_from, 
            status: '1',
            status2: '0',
            verified: '',
            date: transfer_date,
            compile: compile
        };

        // Insert into payment for transfer_to
        const paymentToResult = await db.query('INSERT INTO payment SET ?', transferTopaymentData);
        if (paymentToResult.affectedRows === 0) {
            return res.status(400).json({ message: "Failed to insert payment for transfer_to" });
        }

        // Prepare data for transfer_from
        const transferFrompaymentData = {
            payment_id: paymentId,
            session: session,
            type: 'transfer',
            ptype: 'transfer_from',
            campus: '',
            phead: 'transfer',
            payment_for: transfer_from,
            note: toNote,
            amount: amount,
            mode: modeTo,
            account_id: transfer_to,
            status: '1',
            status2: '0',
            verified: '',
            date: transfer_date,
            compile: compile
        };

        // Insert into payment for transfer_from
        const paymentFromResult = await db.query('INSERT INTO payment SET ?', transferFrompaymentData);
        if (paymentFromResult.affectedRows === 0) {
            return res.status(400).json({ message: "Failed to insert payment for transfer_from" });
        }

        res.json({ message: true });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: error.message });
    }
});



// router.post("/getAmountTransfer", (req, res) => {
//     const{session}=req.body;
//   db.query("SELECT *FROM amount_transfer WHERE session",(err, result) => {
//       res.json({ message: result });
//     }
//   );
// });

router.post("/updateAmountTransfer", (req, res) => {
  const {
    transfer_id,
    transfer_date,
    amount,
    compile,
    update_date
  } = req.body;

  const updateData = {
    transfer_date,
    amount,
    compile,
    update_date
  };

  db.query(
    "UPDATE amount_transfer SET ? WHERE transfer_id = ?",
    [updateData, transfer_id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/deleteStudentIncome", (req, res) => {
  const { id } = req.body;


  db.query("DELETE FROM income_items WHERE income_id = ?", [id], (err, incomeResult) => {
    if (err) {
      return res.json({ error: "Failed to delete income items", details: err });
    }

    // Then, delete from payment table
    db.query("DELETE FROM payment WHERE payment_id = ?", [id], (err, paymentResult) => {
      if (err) {
        return res.json({ error: "Failed to delete payment", details: err });
      }

      // Finally, delete from student_income
      db.query("DELETE FROM student_income WHERE payment_id = ?", [id], (err, incomeResult) => {
        if (err) {
          return res.json({ error: "Failed to delete student income", details: err });
        }

        res.json({ success: true, message: "Student income deleted successfully" });
      });
    });
  });
});


router.post("/deletePayment", (req, res) => {
  const { id } = req.body;
  db.query("DELETE FROM payment WHERE id = ?", [id], (err, result) => {
    if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
  });
});

router.post("/deleteAmountTransfer", (req, res) => {
  const { id } = req.body;
  db.query("DELETE FROM amount_transfer WHERE trxId = ?", [id], (err, result) => {
    if (err) {
        res.json({ message: err });
      } else {
        db.query("DELETE FROM payment WHERE payment_id = ?", [id], (err, result) => {
        if (err) {
            res.json({ message: err });
          } else {
            res.json({ message: true });
          }
  });
      }
  });
  
});

router.post("/addStudentIncome", (req, res) => {
  const {
    student_id,
    session,
    type,
    campus,
    ihead,
    mode,
    account_id,
    note,
    amount,
    date,
    items,
  } = req.body;

  const ran = Math.floor(100000 + Math.random() * 900000);

  const parsedItems = JSON.parse(items);

  db.query(
    "INSERT INTO student_income SET ?",
    {
      payment_id: ran,
      student_id,
      session,
      type,
      campus,
      ihead,
      mode,
      account_id,
      note,
      amount,
      status: 1,
      status2: 1,
      date,
    },
    (err, result) => {
      if (err) {
        return res.json({ error: "Failed to insert student income", details: err });
      }

    //   const insertID = result.insertId;

      // Insert income items if available
      if (parsedItems.length > 0) {
        const incomeItemsValues = parsedItems.map((item) => [
          ran,
          item.productId,
          item.qty,
          item.type,
        ]);

        const sql = `INSERT INTO income_items (income_id, product_id, qty, type) VALUES ?`;

        db.query(sql, [incomeItemsValues], (err) => {
          if (err) {
            return res.json({ error: "Failed to insert income items", details: err });
          }
        });
      }

      // Insert into payment table
      db.query(
        "INSERT INTO payment SET ?",
        {
          payment_id: ran,
          session: session,
          type: "income",
          ptype: "student",
          campus: campus,
          phead: ihead,
          payment_for: student_id,
          note: note,
          amount: amount,
          mode: mode,
          account_id: account_id,
          status: 1,
          status2: 1,
          verified: "",
          date: date,
        },
        (err) => {
          if (err) {
            return res.json({ error: "Failed to insert payment", details: err });
          }
          res.json({ success: true, message: "Student income added successfully" });
        }
      );
    }
  );
});


router.post("/UpdateStudentIncome", (req, res) => {
  const { payment_id, session, type, campus, ihead, mode,account_id,note, amount, date } =
    req.body;

  db.query(
    "UPDATE student_income SET ? WHERE payment_id= ? ",
    [{ session, type, campus, ihead, mode,account_id,note, amount, date }, payment_id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );

  db.query(
    "UPDATE payment SET ? WHERE payment_id= ? ",
    [
      {
        session: session,
        campus: campus,
        phead: ihead,
        mode: mode,
        account_id: account_id,
        note: note,
        amount: amount,
        date: date,
      },
      payment_id,
    ],
    (err, result2) => {
      if (err) {
        res.json({ message1: err });
      } else {
        res.json({ message1: true });
      }
    }
  );
});

router.post("/approveExpenseData", (req, res) => {
  const { id } = req.body;

  db.query(
    "UPDATE payment SET ? WHERE id= ? ",
    [{ verified: 1 }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/approveIncomeData", (req, res) => {
  const { id } = req.body;

  // Fetch income items for the given income ID
  db.query(`SELECT * FROM income_items WHERE income_id = ?`, [id], (err, incomeItems) => {
    if (err) {
      return res.json({ message: "Error fetching income items", details: err });
    }

    if (incomeItems.length === 0) {
      return res.json({ message: "No income items found for this ID" });
    }

    // Fetch current stock for all involved products
    const productIds = incomeItems.map((item) => item.product_id);
    
    db.query(`SELECT product_id, qty FROM products WHERE product_id IN (?)`, [productIds], (err, stockData) => {
      if (err) {
        return res.json({ message: "Error fetching product stock", details: err });
      }

      // Convert stockData into an object for easy lookup
      const stockMap = {};
      stockData.forEach((item) => {
        stockMap[item.product_id] = item.qty;
      });

      // Prepare update queries for each product
      const updateStockPromises = incomeItems.map((item) => {
        return new Promise((resolve, reject) => {
          const currentStock = stockMap[item.product_id] || 0;
          const newStock = currentStock - item.qty;

          // Ensure stock doesn't go negative
          if (newStock < 0) {
            return reject(`Not enough stock for product ID: ${item.product_id}`);
          }

          // Update the product stock
          db.query(
            "UPDATE products SET qty = ? WHERE product_id = ?",
            [newStock, item.product_id],
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          );
        });
      });

      // Execute all stock updates before updating payment status
      Promise.all(updateStockPromises)
        .then(() => {
          db.query("UPDATE payment SET verified = 1 WHERE payment_id = ?", [id], (err) => {
            if (err) {
              return res.status(500).json({ message: "Error updating payment", details: err });
            }

            // db.query("UPDATE student_income SET status = 0 WHERE payment_id = ?", [id], (err) => {
            //   if (err) {
            //     return res.status(500).json({ message: "Error updating student income status", details: err });
            //   }

              // All done
              res.json({ message: true });
            // });
          });
        })
        .catch((err) => {
          res.json({ message: "Stock update failed", details: err });
        });
    });
  });
});


router.post("/addGenaralIncome", (req, res) => {
  const { session, type, phead, payment_for, campus, mode, account_id, note, amount, date, productId } = req.body;
  const ran = Math.floor(100000 + Math.random() * 900000); // Generate random payment_id

  // Insert into `income_items` table
  const sql = `INSERT INTO income_items (income_id, product_id, qty, type) VALUES ?`;
  const incomeValues = [[ran, productId, 1, "general"]];

  db.query(sql, [incomeValues], (err) => {
    if (err) {
      return res.json({ error: "Failed to insert income items", details: err });
    }

    db.query(
      "INSERT INTO payment SET ?",
      {
        payment_id: ran,
        session: session,
        type: "income",
        ptype: "general", // Fixed typo from "genaral"
        campus: campus,
        phead: phead,
        payment_for: payment_for,
        note: note,
        amount: amount,
        mode: mode,
        account_id: account_id,
        status: 1,
        status2: 1,
        verified: "",
        compile: "",
        date: date,
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
});


router.post("/addAccount", (req, res) => {
  const { account_type,...rest} = req.body;

  db.query(
    "INSERT INTO bank SET ?",
    {account_type,...rest},
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});
router.post("/getAccount", (req, res) => {
  db.query("SELECT *FROM bank",(err, result) => {
      res.json({ message: result });
    }
  );
});


// router.post("/getStudentIncome", (req, res) => {
//   db.query("SELECT student_income.*,student.student_id,student.student_first_name, student.student_last_name, student.Class,student.section FROM student_income INNER JOIN student ON student_income.student_id = student.student_id", (err, result) => {
//     res.json({ message: result });
//   });
// });




router.post("/getStudentIncome", (req, res) => {
  const { page = 1, limit = 1000 } = req.body; 
  const offset = (page - 1) * limit;

  
  const query = `
    SELECT student_income.*, student.student_id, student.student_first_name, 
           student.student_last_name, student.Class, student.section
    FROM student_income
    INNER JOIN student ON student_income.student_id = student.student_id
    LIMIT ? OFFSET ?
  `;

  
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM student_income
    INNER JOIN student ON student_income.student_id = student.student_id
  `;

  db.query(query, [parseInt(limit), parseInt(offset)], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    db.query(countQuery, (err2, countResult) => {
      if (err2) {
        return res.status(500).json({ error: err2 });
      }

      const total = countResult[0].total;
      res.json({
        data: result,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      });
    });
  });
});












router.post("/getStudentIncomeById", (req, res) => {
  const { student_id } = req.body;
  db.query(
    "SELECT *FROM student_income WHERE student_id= ? AND status=0",
    student_id,
    (err, result) => {
      res.json({ message: result });
    }
  );
});

router.post("/UpdateLibrarySell", (req, res) => {
  const { id } = req.body;
  db.query(
    "UPDATE student_income SET ? WHERE id= ? ",
    [{ status: 0 }, id],
    (err, result) => {
      if (err) {
        res.json({ message1: err });
      } else {
        res.json({ message1: true });
      }
    }
  );
});

router.post("/Updateprincipaleligible", (req, res) => {
  const { id } = req.body;
  db.query(
    "UPDATE admission SET ? WHERE form_number= ? ",
    [{ eligible_status: 1 }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        db.query(
          "UPDATE admission_test SET ? WHERE form_number= ? ",
          [{ status1: 0 }, id],
          (err, result2) => {
            res.json({ message: true });
          }
        );
      }
    }
  );
});

router.post("/getExpensedataWithEmployeeInfo", (req, res) => {
  const query = `
  SELECT 
      payment.*,
      bank.bank_name,
      COALESCE(employee.emp_id, payment.payment_for) AS emp_id,
      employee.emp_type, 
      employee.emp_fname, 
      employee.emp_lname
    FROM 
      payment 
    LEFT JOIN 
      employee 
    ON 
      payment.payment_for = employee.emp_id
    INNER JOIN 
      bank 
    ON 
      payment.account_id = bank.id
    WHERE 
      payment.type = 'expense'
    ORDER BY 
      payment.id DESC`;

  db.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ data: result });
    }
  });
});


router.post("/getAccountTransactionsbyId", (req, res) => {
  const { id } = req.body;
  
  if (!id) {
    return res.status(400).json({ message: "Account ID is required" });
  }
  
  const query = "SELECT * FROM payment WHERE account_id = ?";
  
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database query failed", error: err });
    }
    res.status(200).json({ data: result });
  });
});

router.post("/getExpensedata", (req, res) => {
  db.query(
    "SELECT *FROM payment WHERE type='expense' ORDER BY id DESC",
    (err, result) => {
      res.json({ message: result });
    }
  );
});

router.post("/getPattyCashFromPayment", (req, res) => {
  db.query(
    "SELECT *FROM payment WHERE phead='Petty Cash' AND verified=1 ORDER BY id DESC",
    (err, result) => {
      res.json({ message: result });
    }
  );
});

router.post("/addPattyCashItem", (req, res) => {
  const { payment_id, item, amount } = req.body;
  db.query(
    "INSERT INTO patty_cash_item SET ?",
    { payment_id, item, amount },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/getPattyCashItem", (req, res) => {
  const { payment_id } = req.body;
  db.query(
    "SELECT *FROM patty_cash_item WHERE payment_id=?",
    payment_id,
    (err, result) => {
      res.json({ message: result });
    }
  );
});

router.post("/getPattyCash", (req, res) => {
  const { payment_id } = req.body;
  db.query(
    "SELECT *FROM patty_cash WHERE payment_id=?",
    payment_id,
    (err, result) => {
      res.json({ message: result });
    }
  );
});

router.post("/addPattyCash", (req, res) => {
  const { payment_id, adj_amount, amount, compile } = req.body;
  db.query(
    "INSERT INTO patty_cash SET ?",
    { payment_id, adj_amount, amount, compile },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        db.query(
          "UPDATE payment SET ? WHERE payment_id= ? ",
          [{ amount: adj_amount }, payment_id],
          (err, result2) => {
            res.json({ message: true });
          }
        );
      }
    }
  );
});

router.post("/getExpensedataById", (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM payment WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
});

router.post("/getstudentIncomeaById", (req, res) => {
  const { payment_id } = req.body;
  db.query(
    "SELECT *FROM student_income WHERE payment_id=?",
    payment_id,
    (err, result) => {
      res.json({ message: result });
    }
  );
});

// router.post("/UpdateExpensedata", (req, res) => {
//   const { id, session, type, ptype, campus, phead,payment_for, note, amount,mode,account_id,date } =req.body;
//   db.query(
//     "UPDATE payment SET ? WHERE id= ?",
//     [
//       {
//         session: session,
//         type: type,
//         ptype: ptype,
//         campus: campus,
//         phead: phead,
//         payment_for: payment_for,
//         mode:mode,
//         account_id:account_id,
//         note: note,
//         amount: amount,
//         date: date,
//       },
//       id,
//     ],
//     (err, result) => {
//       if (err) {
//         res.json({ message: err });
//       } else {
//         res.json({ message: true });
//       }
//     }
//   );
// });




router.post("/UpdateExpensedata", (req, res) => {
  const { id, session, type, ptype, campus,sub_expense_head, phead,payment_for, note, amount,mode,account_id,date } =req.body;
  db.query(
    "UPDATE payment SET ? WHERE id= ?",
    [
      {
        session: session,
        type: type,
        ptype: ptype,
        campus: campus,
        phead: phead,
        sub_expense_head:sub_expense_head,
        payment_for: payment_for,
        mode:mode,
        account_id:account_id,
        note: note,
        amount: amount,
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
});













// router.post("/getAmountTransferDataForReport", (req, res) => {
//   const { startDate, endDate, session, type } = req.body;
//   const currentDate = new Date().toISOString().split('T')[0];
//   const start = startDate || currentDate;
//   const end = endDate || currentDate;

//   let query = `
//     SELECT 
//       amount_transfer.*,
//       bank_to.account_type AS transfer_to_account_type, 
//       bank_to.bank_name AS transfer_to_bank_name, 
//       bank_to.branch_name AS transfer_to_branch_name, 
//       bank_to.acc_number AS transfer_to_acc_number,
//       bank_from.account_type AS transfer_from_account_type, 
//       bank_from.bank_name AS transfer_from_bank_name, 
//       bank_from.branch_name AS transfer_from_branch_name, 
//       bank_from.acc_number AS transfer_from_acc_number
//     FROM 
//       amount_transfer
//     LEFT JOIN 
//       bank AS bank_to ON amount_transfer.transfer_to = bank_to.id
//     LEFT JOIN 
//       bank AS bank_from ON amount_transfer.transfer_from = bank_from.id
//     WHERE 
//       amount_transfer.session = ?`;

//   let queryParams = [session];

//   if (type) {
//     query += " AND (bank_to.account_type = ? OR bank_from.account_type = ?)";
//     queryParams.push(type, type);
//   }

//   if (startDate && endDate) {
//     query += " AND amount_transfer.transfer_date BETWEEN ? AND ?";
//     queryParams.push(start, end);
//   } else {
//     query += " AND amount_transfer.transfer_date = ?";
//     queryParams.push(currentDate);
//   }

//   query += " ORDER BY amount_transfer.transfer_id DESC";

//   db.query(query, queryParams, (err, result) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//     } else {
//       res.json({ message: result });
//     }
//   });
// });



router.post("/getAmountTransferDataForReport", (req, res) => {
  const { startDate, endDate, type } = req.body;
  const currentDate = new Date().toISOString().split('T')[0];
  const start = startDate || currentDate;
  const end = endDate || currentDate;

  let query = `
    SELECT 
      amount_transfer.*,
      bank_to.account_type AS transfer_to_account_type, 
      bank_to.bank_name AS transfer_to_bank_name, 
      bank_to.branch_name AS transfer_to_branch_name, 
      bank_to.acc_number AS transfer_to_acc_number,
      bank_from.account_type AS transfer_from_account_type, 
      bank_from.bank_name AS transfer_from_bank_name, 
      bank_from.branch_name AS transfer_from_branch_name, 
      bank_from.acc_number AS transfer_from_acc_number
    FROM 
      amount_transfer
    LEFT JOIN 
      bank AS bank_to ON amount_transfer.transfer_to = bank_to.id
    LEFT JOIN 
      bank AS bank_from ON amount_transfer.transfer_from = bank_from.id
    WHERE 1=1`;

  let queryParams = [];

  if (type) {
    query += " AND (bank_to.account_type = ? OR bank_from.account_type = ?)";
    queryParams.push(type, type);
  }

  if (startDate && endDate) {
    query += " AND amount_transfer.transfer_date BETWEEN ? AND ?";
    queryParams.push(start, end);
  } else {
    query += " AND amount_transfer.transfer_date = ?";
    queryParams.push(currentDate);
  }

  query += " ORDER BY amount_transfer.transfer_id DESC";

  db.query(query, queryParams, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: result });
    }
  });
});
















// router.post("/getExpensedataForReport", (req, res) => {
//   const { startDate, endDate, session, type,emp_id } = req.body;
//   const currentDate = new Date().toISOString().split('T')[0];
//   const start = startDate || currentDate;
//   const end = endDate || currentDate;

//   let query = `
//     SELECT 
//       payment.*, 
//       employee.emp_id, 
//       employee.emp_type, 
//       employee.emp_fname, 
//       employee.emp_lname,
//       bank.bank_name
//     FROM 
//       payment 
//     INNER JOIN 
//       employee 
//     ON 
//       payment.payment_for = employee.emp_id 
//       INNER JOIN bank ON payment.account_id=bank.id
//     WHERE 
//       payment.type = 'expense' 
//       AND payment.session = ?`;

//   let queryParams = [session];

//   if (type) {
//     query += " AND payment.ptype = ?";
//     queryParams.push(type);
//   }
//   if (emp_id) {
//     query += " AND payment.payment_for = ?";
//     queryParams.push(emp_id);
//   }

//   if (startDate && endDate) {
//     query += " AND payment.date BETWEEN ? AND ?";
//     queryParams.push(start, end);
//   } else {
//     query += " AND payment.date = ?";
//     queryParams.push(currentDate);
//   }

//   query += "ORDER BY payment.date ASC, payment.id ASC"; // If you want to order by ID descending

//   db.query(query, queryParams, (err, result) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//     } else {
//       res.json({ message: result });
//     }
//   });
// });



router.post("/getExpensedataForReport", (req, res) => {
  const { startDate, endDate, type,emp_id } = req.body;
  const currentDate = new Date().toISOString().split('T')[0];
  const start = startDate || currentDate;
  const end = endDate || currentDate;

  let query = `
    SELECT 
      payment.*, 
      employee.emp_id, 
      employee.emp_type, 
      employee.emp_fname, 
      employee.emp_lname,
      bank.bank_name
    FROM 
      payment 
    INNER JOIN 
      employee 
    ON 
      payment.payment_for = employee.emp_id 
      INNER JOIN bank ON payment.account_id=bank.id
    WHERE 
      payment.type = 'expense'`;

  let queryParams = [];

  if (type) {
    query += " AND payment.ptype = ?";
    queryParams.push(type);
  }
  if (emp_id) {
    query += " AND payment.payment_for = ?";
    queryParams.push(emp_id);
  }

  if (startDate && endDate) {
    query += " AND payment.date BETWEEN ? AND ?";
    queryParams.push(start, end);
  } else {
    query += " AND payment.date = ?";
    queryParams.push(currentDate);
  }

  query += "ORDER BY payment.date ASC, payment.id ASC"; // If you want to order by ID descending

  db.query(query, queryParams, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: result });
    }
  });
});


// router.post("/getAllCollectedfeesReport", (req, res) => {
//   const { startDate, endDate, session, type } = req.body;

//   const currentDate = new Date().toISOString().slice(0, 10);
//   const start = startDate || currentDate;
//   const end = endDate || currentDate;

//   let query =`
//   SELECT 
//       payment.*, 
//       bank.account_type,
//       bank.bank_name
//     FROM 
//       payment 
//     INNER JOIN 
//       bank 
//     ON 
//       payment.account_id = bank.id 
//     WHERE 
//       payment.ptype = 'fees collection' 
//       AND payment.session = ?`;
//   let queryParams = [session];

//   if (startDate && endDate) {
//     query += " AND payment.date BETWEEN ? AND ?";
//     queryParams.push(start, end);
//   } else {
//     query += " AND payment.date=?";
//     queryParams.push(currentDate);
//   }

//   if (type) {
//     query += " AND payment.phead=?";
//     queryParams.push(type);
//   }

//   query += "ORDER BY payment.date ASC, payment.id ASC";

//   db.query(query, queryParams, (err, result) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//     } else {
//       res.json({ message: result });
//     }
//   });
// });




router.post("/getAllCollectedfeesReport", (req, res) => {
  const { startDate, endDate, type } = req.body;

  const currentDate = new Date().toISOString().slice(0, 10);
  const start = startDate || currentDate;
  const end = endDate || currentDate;

  let query = `
    SELECT 
      payment.*, 
      bank.account_type,
      bank.bank_name
    FROM 
      payment 
    INNER JOIN 
      bank 
      ON payment.account_id = bank.id 
    WHERE 
      payment.ptype = 'fees collection'`;

  let queryParams = [];

  if (startDate && endDate) {
    query += " AND payment.date BETWEEN ? AND ?";
    queryParams.push(start, end);
  } else {
    query += " AND payment.date = ?";
    queryParams.push(currentDate);
  }

  if (type) {
    query += " AND payment.phead = ?";
    queryParams.push(type);
  }

  query += " ORDER BY payment.date ASC, payment.id ASC";

  db.query(query, queryParams, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: result });
    }
  });
});












// router.post("/getIncomeDataForReport", (req, res) => {
//   const { startDate, endDate, session, type } = req.body;

//   const start = startDate || new Date().toISOString().slice(0, 10);
//   const end = endDate || new Date().toISOString().slice(0, 10);

//   // Base query
//   let query = `
//     SELECT 
//       payment.*, 
//       bank.account_type,
//       bank.bank_name
//     FROM 
//       payment 
//     INNER JOIN 
//       bank 
//     ON 
//       payment.account_id = bank.id 
//     WHERE 
//       payment.type = 'income' 
//       AND payment.session = ?`;

//   let queryParams = [session];

//   query += " AND DATE(payment.date) BETWEEN ? AND ?";
//   queryParams.push(start, end);

//   if (type) {
//     query += " AND payment.ptype = ?";
//     queryParams.push(type);
//   }

//   query += " ORDER BY payment.date ASC, payment.id ASC";

//   db.query(query, queryParams, (err, result) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//     } else {
//       res.json({ message: result });
//     }
//   });
// });



router.post("/getIncomeDataForReport", (req, res) => {
  const { startDate, endDate, type } = req.body;

  const start = startDate || new Date().toISOString().slice(0, 10);
  const end = endDate || new Date().toISOString().slice(0, 10);

  // Base query
  let query = `
    SELECT 
      payment.*, 
      bank.account_type,
      bank.bank_name
    FROM 
      payment 
    INNER JOIN 
      bank 
    ON 
      payment.account_id = bank.id 
    WHERE 
      payment.type = 'income'`;

  let queryParams = [];

  query += " AND DATE(payment.date) BETWEEN ? AND ?";
  queryParams.push(start, end);

  if (type) {
    query += " AND payment.ptype = ?";
    queryParams.push(type);
  }

  query += " ORDER BY payment.date ASC, payment.id ASC";

  db.query(query, queryParams, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: result });
    }
  });
});


router.post("/getAllIncomedata", (req, res) => {
  const { type } = req.body;

  let joinClause = "";
  let selectFields = "";

  if (type === "student") {
    joinClause = `
      INNER JOIN student ON payment.payment_for = student.student_id`;
    selectFields =
      "student.student_id, student.student_first_name, student.student_last_name, student.Class, student.section";
  } else {
    joinClause = `
      INNER JOIN employee ON payment.payment_for = employee.emp_id`;
    selectFields =
      "employee.emp_id, employee.emp_type, employee.emp_fname, employee.emp_lname";
  }

  let query = `
    SELECT 
      payment.*,
      bank.bank_name,
      ${selectFields},
      -- JSON formatted items data
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'income_id', income_items.income_id,
          'product_id', income_items.product_id,
          'qty', income_items.qty,
          'type', income_items.type,
          'product_name', products.item,
          'product_price', products.price
        )
      ) AS items
    FROM 
      payment
    ${joinClause}
    INNER JOIN bank ON payment.account_id = bank.id
    INNER JOIN income_items ON payment.payment_id = income_items.income_id
    INNER JOIN products ON income_items.product_id = products.product_id
    WHERE 
      payment.ptype = ?
    GROUP BY 
      payment.id
    ORDER BY 
      payment.id DESC`;

  db.query(query, [type], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: result });
    }
  });
});


router.post("/getGeneralIncomedata", (req, res) => {
  db.query(
    "SELECT *FROM payment WHERE ptype IN ('general', 'student') AND verified=''",
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "An error occurred" });
      }
      res.json({ message: result });
    }
  );
});



router.post("/addExpense_head", (req, res) => {
  const { expense_head, parent_id, expense_type} = req.body;
  console.log(req.body);

  if (!expense_head || !expense_type) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  db.query(
    "INSERT INTO expense_head SET ?",
    { expense_head, parent_id: parent_id || null, expense_type },
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
      }
      res.status(201).json({ message: true, insertedId: result.insertId });
    }
  );
});


// router.post("/addExpense_head", (req, res) => {
//   const { expense_head } = req.body;
//   db.query(
//     "INSERT INTO expense_head SET ?",
//     { expense_head },
//     (err, result) => {
//       if (err) {
//         res.json({ message: err });
//       } else {
//         res.json({ message: true });
//       }
//     }
//   );
// });



router.post("/updateExpense_head", (req, res) => {
  const { id, expense_head ,parent_id, expense_type} = req.body;
  db.query(
    "UPDATE expense_head SET ? WHERE id = ?",
    [{ expense_head ,parent_id, expense_type}, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});










// router.post("/updateExpense_head", (req, res) => {
//   const { id, expense_head } = req.body;
//   db.query(
//     "UPDATE expense_head SET ? WHERE id = ?",
//     [{ expense_head }, id],
//     (err, result) => {
//       if (err) {
//         res.json({ message: err });
//       } else {
//         res.json({ message: true });
//       }
//     }
//   );
// });
router.post("/approveExpenseHead", (req, res) => {
  const { id,status,note } = req.body;
  db.query(
    "UPDATE expense_head SET ? WHERE id = ?",
    [{ status,note }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/getExpense_head", (req, res) => {
  db.query("SELECT *FROM expense_head", (err, result) => {
    res.json({ message: result });
  });
});

router.post("/deleteExpense_head", (req, res) => {
  const { id } = req.body;
  db.query("DELETE FROM `expense_head` WHERE id = ?", [id], (err, result) => {
    res.json({ message: true });
  });
});
router.post("/deleteIncomeHead", (req, res) => {
  const { id } = req.body;
  db.query("DELETE FROM `income_head` WHERE id = ?", [id], (err, result) => {
    res.json({ message: true });
  });
});

router.post("/addincome_head", (req, res) => {
  const { incomeHead, incomeType } = req.body;
  db.query(
    "INSERT INTO income_head SET ?",
    { income_head: incomeHead, income_type: incomeType },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/Updateincome_head", (req, res) => {
  const { id, incomeHead, incomeType } = req.body;
  db.query(
    "UPDATE income_head SET ? WHERE id= ?",
    [{ income_head: incomeHead, income_type: incomeType }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});
router.post("/approveIncomeHead", (req, res) => {
  const { id,status,note } = req.body;
  db.query(
    "UPDATE income_head SET ? WHERE id = ?",
    [{ status,note }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});
router.post("/getincome_head", (req, res) => {
  db.query("SELECT *FROM income_head", (err, result) => {
    res.json({ message: result });
  });
});
router.post("/getincomeheadById", (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM income_head WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
});

router.post("/getincomeHeadStudent", (req, res) => {
  db.query(
    "SELECT *FROM income_head WHERE income_type='Student'",
    (err, result) => {
      res.json({ message: result });
    }
  );
});

router.post("/getincomeHeadGeneral", (req, res) => {
  db.query(
    "SELECT *FROM income_head WHERE income_type='General'",
    (err, result) => {
      res.json({ message: result });
    }
  );
});

router.post("/addSupplyPayment", (req, res) => {
  const { sp_id, gdate, exp_date, amount, session, compile } = req.body;
  db.query(
    "SELECT *FROM supply_payment WHERE sp_id = ?",
    sp_id,
    (err, result) => {
      if (result.length > 0) {
        res.json({ message: false });
      } else {
        db.query(
          "INSERT INTO supply_payment SET ?",
          {
            sp_id,
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
});
router.post("/getSupplyPayment", (req, res) => {
  db.query("SELECT *FROM supply_payment", (err, result) => {
    res.json({ message: result });
  });
});

router.post("/getSupplyPaymentById", (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM supply_payment WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
});

router.post("/UpdateSupplyPayment", (req, res) => {
  const { id, sp_id, gdate, exp_date, amount } = req.body;
  db.query(
    "UPDATE supply_payment SET ? WHERE id= ? ",
    [{ sp_id, gdate, exp_date, amount }, id],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/getSupplyPaymentCountFR", (req, res) => {
  db.query("SELECT *FROM fund_request", (err, result) => {
    var elist = [];
    result.map((item, index) => {
      var id = item.fr_id;
      db.query("SELECT *FROM fp_sp_item WHERE sp_id = ? ", id, (err, c) => {
        if (c.length >= 0) {
          var allData = {
            fr_id: item.fr_id,
            gdate: item.gdate,
            exp_date: item.exp_date,
            amount: item.amount,
            date: item.date,
            count: c.length,
          };
          elist.push(allData);
        }
        if (Number(index) == Number(result.length) - 1) {
          res.json({ message: elist });
        }
      });
    });
  });
});

router.post("/getSupplyPaymentCountSP", (req, res) => {
  db.query("SELECT *FROM supply_payment", (err, result) => {
    var elist = [];
    result.map((item, index) => {
      var id = item.sp_id;
      db.query("SELECT *FROM fp_sp_item WHERE sp_id = ? ", id, (err, c) => {
        if (c.length >= 0) {
          var allData = {
            sp_id: item.sp_id,
            gdate: item.gdate,
            exp_date: item.exp_date,
            amount: item.amount,
            date: item.date,
            count: c.length,
          };
          elist.push(allData);
        }
        if (Number(index) == Number(result.length) - 1) {
          res.json({ message: elist });
        }
      });
    });
  });
});

router.post("/addbudgetinfo", (req, res) => {
  const {
    bid,
    pname,
    guest,
    perheadincome,
    perheadexpanse,
    campus,
    gdate,
    tincome,
    texpence,
    profit,
    session,
    compile,
  } = req.body;
  db.query(
    "INSERT INTO budget SET ?",
    {
      bid,
      pname,
      guest,
      perheadincome,
      perheadexpanse,
      campus,
      gdate,
      tincome,
      texpence,
      profit,
      status: "",
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

router.post("/addbudgetItem", (req, res) => {
  const { bid, purpose, unitcost, details, qty, amount, note, type } = req.body;
  db.query(
    "INSERT INTO budget_items SET ?",
    { bid, purpose, unitcost, details, qty, amount, note, type },
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ message: true });
      }
    }
  );
});

router.post("/getbudgetitemById", (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM budget_items WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
});
router.post("/updatebudgetitemById", (req, res) => {
  const { id, purpose, unitcost, details, qty, amount, note } = req.body;

  db.query(
    "UPDATE budget_items SET ? WHERE id=?",
    [
      {
        purpose: purpose,
        unitcost: unitcost,
        details: details,
        qty: qty,
        amount: amount,
        note: note,
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

router.post("/updatebudgetDoneById", (req, res) => {
  const { bid } = req.body;
  db.query(
    "UPDATE budget SET ? WHERE bid=?",
    [
      {
        status: "done",
      },
      bid,
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

router.post("/budgetitemdelete", (req, res) => {
  const { id } = req.body;
  db.query("DELETE FROM budget_items WHERE  id=?", id, (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ message: true });
    }
  });
});

router.post("/updatebudgetinfoById", (req, res) => {
  const { bid, pname, guest, campus } = req.body;

  db.query(
    "UPDATE budget SET ? WHERE bid=?",
    [
      {
        pname: pname,
        guest: guest,
        campus: campus,
      },
      bid,
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

router.post("/getbudgetFullinfo", (req, res) => {
  const { bid } = req.body;
  db.query("SELECT *FROM budget WHERE bid=?", bid, (err, result) => {
    db.query(
      "SELECT *FROM budget_items WHERE bid=? AND type='expense'",
      bid,
      (err, result2) => {
        db.query(
          "SELECT *FROM budget_items WHERE bid=? AND type='income'",
          bid,
          (err, result3) => {
            res.json({ message: result, expense: result2, income: result3 });
          }
        );
      }
    );
  });
});

router.post("/getbudgetAllinfo", (req, res) => {
  db.query("SELECT *FROM budget", (err, result) => {
    res.json({ message: result });
  });
});

router.post("/addKarzRequest", (req, res) => {
  const {
    name,
    emp_id,
    designation,
    request_date,
    reason,
    amount,
    returnPeriod,
    mreturn,
    remaining_payment,
    remaining_period,
    session,
  } = req.body;
  db.query(
    "INSERT INTO karz_request SET ?",
    {
      name,
      emp_id,
      designation,
      request_date,
      reason,
      amount,
      returnPeriod,
      mreturn,
      remaining_payment,
      remaining_period: 0,
      pstatus: "",
      mstatus: "",
      hrstatus: "",
      session: session,
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
});

router.post("/getKarzRequest", (req, res) => {
  db.query("SELECT *FROM karz_request", (err, result) => {
    res.json({ message: result });
  });
});

router.post("/getKarzRequestByUser", (req, res) => {
  const { emp_id } = req.body;
  db.query(
    "SELECT *FROM karz_request WHERE emp_id=?",
    emp_id,
    (err, result) => {
      res.json({ message: result });
    }
  );
});

router.post("/getKarzRequestById", (req, res) => {
  const { id } = req.body;
  db.query("SELECT *FROM karz_request WHERE id=?", id, (err, result) => {
    res.json({ message: result });
  });
});

// router.post("/ApprovelkarzById", (req, res) => {
//   const { id, user, approvel } = req.body;
//   if (user == "Principal") {
//     db.query(
//       "UPDATE karz_request SET ? WHERE id = ?",
//       [{ pstatus: approvel }, id],
//       (err, result) => {
//         if (err) {
//           res.json({ message: err });
//         } else {
//           res.json({ message: true });
//         }
//       }
//     );
//   }
//   if (user == "Manager") {
//     db.query(
//       "UPDATE karz_request SET ? WHERE id = ?",
//       [{ mstatus: approvel }, id],
//       (err, result) => {
//         if (err) {
//           res.json({ message: err });
//         } else {
//           res.json({ message: true });
//         }
//       }
//     );
//   }
//   if (user == "HR Officer") {
//     db.query(
//       "UPDATE karz_request SET ? WHERE id = ?",
//       [{ hrstatus: approvel }, id],
//       (err, result) => {
//         if (err) {
//           res.json({ message: err });
//         } else {
//           res.json({ message: true });
//         }
//       }
//     );
//   }

//   if (user == "HR Officer" || user == "Manager" || user == "Principal") {
//     db.query(
//       "SELECT returnPeriod FROM karz_request WHERE id = ?",
//       [id],
//       (err, resultperiod) => {
//         if (err) {
//           res.json({ message: err });
//         } else {
//           const returnPeriodInMonths = resultperiod[0].returnPeriod;

//           const currentDate = new Date();
//           const lastDayReturn = new Date(
//             currentDate.getFullYear(),
//             currentDate.getMonth() + returnPeriodInMonths,
//             currentDate.getDate()
//           );

//           db.query(
//             "UPDATE karz_request SET ? WHERE id = ?",
//             [{ last_day_return: lastDayReturn }, id],
//             (err, result) => {
//               if (err) {
//                 res.json({ message: err });
//               } else {
//                 res.json({ message: true });
//               }
//             }
//           );
//         }
//       }
//     );
//   }
// });




router.post("/ApprovelkarzById", (req, res) => {
  const { id, user, approvel } = req.body;
  if (user == "Super Admin") {
    db.query(
      "UPDATE karz_request SET ? WHERE id = ?",
      [{ pstatus: approvel }, id],
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
      "UPDATE karz_request SET ? WHERE id = ?",
      [{ mstatus: approvel }, id],
      (err, result) => {
        if (err) {
          res.json({ message: err });
        } else {
          res.json({ message: true });
        }
      }
    );
  }
  if (user == "HR Officer") {
    db.query(
      "UPDATE karz_request SET ? WHERE id = ?",
      [{ hrstatus: approvel }, id],
      (err, result) => {
        if (err) {
          res.json({ message: err });
        } else {
          res.json({ message: true });
        }
      }
    );
  }

  if (user == "HR Officer" || user == "Manager" || user == "Super Admin") {
    db.query(
      "SELECT returnPeriod FROM karz_request WHERE id = ?",
      [id],
      (err, resultperiod) => {
        if (err) {
          res.json({ message: err });
        } else {
          const returnPeriodInMonths = resultperiod[0].returnPeriod;

          const currentDate = new Date();
          const lastDayReturn = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + returnPeriodInMonths,
            currentDate.getDate()
          );

          db.query(
            "UPDATE karz_request SET ? WHERE id = ?",
            [{ last_day_return: lastDayReturn }, id],
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
});



router.post("/addBankAccount", (req, res) => {
  const { emp_id, emp_name, account_number, bank_name } = req.body;

  db.query(
    "INSERT INTO employee_salary_account (emp_id, emp_name, account_number, bank_name) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE emp_name = VALUES(emp_name), account_number = VALUES(account_number), bank_name = VALUES(bank_name)",
    [emp_id, emp_name, account_number, bank_name],
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        if (result.affectedRows === 1) {
          res.json({ ok: true, message: "Data inserted successfully" });
        } else {
          res.json({ ok: true, message: "Data updated successfully" });
        }
      }
    }
  );
});

router.post("/addBulkBankInfo", (req, res) => {
  const { selectedCSVData } = req.body;

  const query =
    "INSERT INTO employee_salary_account (emp_id, emp_name, account_number, bank_name) VALUES ? ON DUPLICATE KEY UPDATE emp_name = VALUES(emp_name), account_number = VALUES(account_number), bank_name = VALUES(bank_name)";

  const values = selectedCSVData.map((bankInfo) => [
    bankInfo.emp_id,
    bankInfo.emp_name,
    bankInfo.account_number,
    bankInfo.bank_name,
  ]);

  const emp_ids = selectedCSVData.map((student) => [student.emp_id]);

  db.query(
    "SELECT emp_id FROM employee_salary_account WHERE emp_id IN (?)",
    [emp_ids],
    (err, result1) => {
      if (err) {
        console.error(err);
        res.json({ message: "no duplicate found", result: result1 });
      } else {
        const duplicatesID = result1;

        db.query(query, [values], (err, result) => {
          if (err) {
            console.error(err);
            res.json({
              ok: false,
              message: "Error occurred while adding bulk students",
              result: result,
            });
          } else {
            if (duplicatesID.length > 0) {
              const dataInserted = selectedCSVData.length - duplicatesID.length;
              const duplicateCSVdataList = selectedCSVData.filter((student) =>
                duplicatesID.some(
                  (duplicate) => duplicate.student_id === student.student_id
                )
              );
              res.json({
                ok: true,
                message: `${dataInserted} Bank Info Added and ${duplicatesID.length} duplicate info found`,
                result: result,
                duplicates: duplicatesID,
                duplicateCSVdataList: duplicateCSVdataList,
              });
            } else {
              res.json({
                ok: true,
                message: "All Info Added",
                result: result,
                duplicates: duplicatesID,
              });
            }
          }
        });
      }
    }
  );
});

router.post("/getBankAccount", (req, res) => {
  db.query("SELECT * FROM employee_salary_account", (err, result) => {
    if (err) {
      res.json({ message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  });
});

router.post("/getFinalSalarySheetForPay", (req, res) => {
  const { selectedMonth } = req.body;

  db.query(
    `
   SELECT 
     final_salary_sheet.emp_id,
     final_salary_sheet.department,
     final_salary_sheet.designation,
      final_salary_sheet.emp_name,
      final_salary_sheet.net_payable_amount,
    CASE
        WHEN employee_salary_account.emp_id IS NOT NULL  THEN employee_salary_account.account_number
        ELSE 'Cash'
    END AS bankAccount
  
        
FROM
    final_salary_sheet
LEFT JOIN
    employee_salary_account ON final_salary_sheet.emp_id = employee_salary_account.emp_id

WHERE 
    final_salary_sheet.report_month = ?
    GROUP BY final_salary_sheet.emp_id;



   `,
    selectedMonth,
    (err, result) => {
      if (err) {
        res.json({ message: err });
      } else {
        res.json({ ok: true, message: result });
      }
    }
  );
});

router.post("/getFinalSalarySheetByMonth", (req, res) => {
  const { selectedMonth, session } = req.body;
  db.query(
    "SELECT *FROM final_salary_sheet WHERE report_month=? AND session=?",
    [selectedMonth, session],
    (err, result) => {
      res.json({ message: result });
    }
  );
});

router.post("/getFinalSalarySheetByID", (req, res) => {
  const { emp_id, session } = req.body;
  db.query(
    "SELECT *FROM final_salary_sheet WHERE emp_id=? AND session=?",
    [emp_id, session],
    (err, result) => {
      res.json({ message: result });
    }
  );
});

router.post("/getOverTimeReportByID", (req, res) => {
  const { emp_id, session } = req.body;

  const sql = `SELECT * FROM overTime_payroll WHERE emp_id=? AND session=?`;
  db.query(sql, [emp_id, session], (err, result) => {
    if (err) {
      res.json({ ok: false, message: err });
    } else {
      res.json({ ok: true, message: result });
    }
  });
});


router.get("/accountTest", (req, res) => {
  res.send("Accounts");
});

module.exports = router;
