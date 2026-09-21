// @ts-nocheck
import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { UploadService } from "../../common/upload/upload.service";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";

let db: any;
let publicDirectory: string;

const callbackURL =
  process.env.PAYMENT_CALLBACK_URL ||
  "https://server.mpairproject.xyz/server/payment/callback";
const paymentCredentials = {
  store_id: process.env.PAYMENT_STORE_ID || "ahischool",
  signature_key: process.env.PAYMENT_SIGNATURE_KEY || "",
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

@Injectable()
export class PaymentService {
  constructor(
    private readonly database: DatabaseService,
    private readonly upload: UploadService
  ) {
    db = this.database;
    publicDirectory = this.upload.publicDirectory;
  
  }

  async initiatePayment(req: any, res: any) {
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

  async callback(req: any, res: any, next?: any) {
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

  const statusUrl =
    process.env.PAYMENT_FRONTEND_STATUS_URL || "http://localhost:5173/paymentStatus";
  res.redirect(`${statusUrl}?status=${pay_status}`);
}

  get(req: any, res: any) {
  res.send("Hello from student");
}
}
