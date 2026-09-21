import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import * as path from "path";
import * as fs from "fs";

@Injectable()
export class NotificationService {
  private firebase: any = null;

  constructor(private readonly db: DatabaseService) {
    try {
      const serviceAccountPath = path.join(process.cwd(), "service-account.json");
      if (fs.existsSync(serviceAccountPath)) {
        const admin = require("firebase-admin");
        const serviceAccount = require(serviceAccountPath);
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        }
        this.firebase = admin;
      }
    } catch (err) {
      console.error("Firebase init skipped:", (err as Error).message);
    }
  }

  async sendNotification(
    token: string,
    title: string,
    body: string,
    url?: string,
    className?: string,
    id?: any,
    userId: any = null,
  ) {
    try {
      if (!title || !body) {
        return { success: false, message: "Missing required fields" };
      }
      const insertQuery = `INSERT INTO notifications ("user", title, body, section, "content_Id") VALUES (?, ?, ?, ?, ?)`;
      const values = [userId, title, body, className, id];
      this.db.query(insertQuery, values, (err: any, result: any) => {
        if (err) {
          console.error("Error saving notification to database:", err);
        } else {
          console.log("Notification saved to database:", result.insertId);
        }
      });

      if (!token) {
        return { success: true, message: "Notification stored without push token" };
      }
      if (!this.firebase) {
        return { success: true, message: "Notification stored (push unavailable)" };
      }

      const message = {
        token,
        notification: { title, body },
        data: {
          url: url || "",
          className: className || "",
          id: id ? String(id) : "",
        },
      };
      const response = await this.firebase.messaging().send(message);
      return { success: true, message: "Notification sent", response };
    } catch (error) {
      console.error("Error sending notification:", error);
      return {
        success: false,
        message: "Notification sending failed",
        error: (error as Error).message,
      };
    }
  }

  async sendAttendanceNotification(
    token: string,
    title: string,
    body: string,
    url?: string,
    className?: string,
    id?: any,
    _userId: any = null,
  ) {
    try {
      if (!title || !body) {
        return { success: false, message: "Missing required fields" };
      }
      if (!token) {
        return { success: true, message: "Notification skipped (no token)" };
      }
      if (!this.firebase) {
        return { success: true, message: "Notification skipped (push unavailable)" };
      }
      const message = {
        token,
        notification: { title, body },
        data: {
          url: url || "",
          className: className || "",
          id: id ? String(id) : "",
        },
      };
      const response = await this.firebase.messaging().send(message);
      return { success: true, message: "Notification sent", response };
    } catch (error) {
      console.error("Error sending notification:", error);
      return {
        success: false,
        message: "Notification sending failed",
        error: (error as Error).message,
      };
    }
  }
}
