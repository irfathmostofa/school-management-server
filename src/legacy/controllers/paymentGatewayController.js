const { db } = require("../models");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { sign, verify } = require("../utils/jwt");
const publicDirectory = path.join(__dirname, "../public");

const callbackURL = "https://server.mpairproject.xyz/server/payment/callback";
const paymentCredentials = {
  store_id: "ahischool",
  signature_key: "78ca2fd77d6eac063025f453480177ba",
  success_url: callbackURL,
  fail_url: callbackURL,
  cancel_url: callbackURL,
  type: "json",
};

// {
// "cus_name": "Rion",
// "cus_email": "nazmulrion16@gmail.com",
// "cus_phone": "01611269298",
// "cus_add1": "mPair Technologies",
// "cus_add2": "ctg",
// "cus_city": "ctg",
// "cus_country": "Bangladesh",
// "amount": "1.00",
// "tran_id": "325252",
// "currency": "BDT",

// "desc": "Lend Money",
// }


exports.initiatePayment = async (req, res) => {
  try {
    const {
      cus_name,
      cus_email,
      cus_phone,
      cus_add1,
      cus_add2,
      cus_city,
      cus_country,
      amount,
      currency,
      desc,
      selectedFees,
    } = req.body;

    const uID = uuidv4();
    const parsedSelectedFees = JSON.parse(selectedFees);
    const feeIds = parsedSelectedFees.map((fee) => fee.id);

    db.query(
      "UPDATE fees_collection SET initiateTxn = ? WHERE id IN (?)",
      [uID, feeIds],
      async (error, result) => {
        if (error) {
          return res
            .status(500)
            .json({ error: "An error occurred while processing the payment" });
        } else {
          // payment start
          const paymentData = {
            store_id: paymentCredentials.store_id,
            signature_key: paymentCredentials.signature_key,
            cus_name: cus_name,
            cus_email: cus_email,
            cus_phone: cus_phone,
            cus_add1: cus_add1,
            cus_add2: cus_add2,
            cus_city: cus_city,
            cus_country: cus_country,
            amount: amount,
            tran_id: uID,
            currency: currency,
            desc: desc,
            success_url: paymentCredentials.success_url,
            fail_url: paymentCredentials.fail_url,
            cancel_url: paymentCredentials.cancel_url,
            type: paymentCredentials.type,
            // opt_a: JSON.stringify(selectedFees),
          };

          const gateWayURL = "https://secure.aamarpay.com/jsonpost.php";

          const options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(paymentData),
          };

          try {
            const response = await fetch(gateWayURL, options);
            const data = await response.json();
            res.json(data);
          } catch (fetchError) {
            console.log("Error fetching payment gateway:", fetchError);
            res.status(500).json({ error: "Error initiating payment" });
          }
        }
      }
    );
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: error });
  }
}

// Sample Response After Redirection
// {
//     "pg_service_charge_bdt": "2",
//     "amount_original" : "100",
//     "gateway_fee": "" ,
//     "pg_service_charge_usd":"Not-Available" ,
//     "pg_card_bank_name":"Not Available",
//     "pg_card_bank_country":"Not Available",
//     "card_number": "1234XXXXXXXXX123",
//     "card_holder": "" ,
//     "status_code": "2" ,
//     "pay_status": "Successful" ,
//     "success_url": "http://localhost:3000/success.php",
//     "fail_url": "http://localhost:3000/fail.php",
//     "cus_name": "Customer Name",
//     "cus_email": "customer@test.com" ,
//     "cus_phone": "0178273****",
//     "currency_merchant": "USD",
//     "convertion_rate": "109.57",
//     "ip_address": "XXX.XXX.XXX.XX" ,
//     "other_currency": "40.00" ,
//     "pg_txnid": "AAM1694948761103545" ,
//     "epw_txnid": "AAM1694948761103545" ,
//     "mer_txnid": "test1599957",
//     "store_id": "aamarpaytest" ,
//     "merchant_id": "aamarpaytest" ,
//     "currency": "BDT",
//     "store_amount": "4240.36" ,
//     "pay_time": "2023-09-17 17:06:08",
//     "amount":  "4382.80" ,
//     "bank_txn": "1094621001640" ,
//     "card_type": "DBBL-VISA",
//     "reason": "Not Available",
//     "pg_card_risklevel": "0" ,
//     "pg_error_code_details": "Not Available" ,
//     "opt_a":"" ,
//     "opt_b": "",
//     "opt_c": "" ,
//     "opt_d": ""
// }

exports.callback = async (req, res, next) => {
  // Callback data
  // console.log(req.body);
  const { status_code, pay_status, pg_txnid, mer_txnid } = req.body;
  if (status_code === "2" && pay_status === "Successful") {
    db.query(
      "INSERT INTO online_transaction (feesID, details, status) VALUES (?, ?, ?)",
      [mer_txnid, JSON.stringify(req.body), "success"],
      (error, result) => {
        if (error) {
          // return res
          //   .status(500)
          //   .json({ error: "An error occurred while processing the payment" });
        } else {
          db.query(
            "UPDATE fees_collection SET  payment_mode = 'online', payment_date = ?, paymentStatus = 'fullPaid', advancePayment= 0,  paid = fees_collection.balance,      balance = 0 ,  trxID = ?    WHERE initiateTxn = ? AND balance != 0",
            [new Date().toISOString().slice(0, 10), mer_txnid, mer_txnid],
            (error, result) => {
              if (error) {
                return res.status(500).json({
                  error: "An error occurred while processing the payment",
                });
              }
              // res.json({ status: "success" });
            }
          );
        }
      }
    );
  } else {
    db.query(
      "INSERT INTO online_transaction (feesID, details, status) VALUES (?, ?, ?)",
      [mer_txnid, JSON.stringify(req.body), "failed"],
      (error, result) => {
        if (error) {
          return res
            .status(500)
            .json({ error: "An error occurred while processing the payment" });
        }

        // res.json({ status: "success" });
      }
    );
  }

  res.redirect(`http://localhost:5173/paymentStatus?status=${pay_status}`);
}

exports.get = (req, res) => {
  res.send("Hello from student");
}
