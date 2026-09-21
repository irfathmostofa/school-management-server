const firebase = require("firebase-admin");
const serviceAccount = require("./service-account.json");
const { db } = require("./models");

if (!firebase.apps.length) {
  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
  });
}

const sendNotification = async (token, title, body, url, className, id, userId = null) => {
  try {
    if (!title || !body) {
      return { success: false, message: "Missing required fields" };
    }
    const insertQuery = `INSERT INTO notifications ("user", title, body, section, "content_Id") VALUES (?, ?, ?, ?, ?)`;
    const values = [userId, title, body, className, id];

    db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error("Error saving notification to database:", err);
      } else {
        console.log("Notification saved to database:", result.insertId);
      }
    });

    if (!token) {
      return { success: true, message: "Notification stored without push token" };
    }

    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: {
        url: url || "",
        className: className || "",
        id: id ? String(id) : "",
      },
    };

    const response = await firebase.messaging().send(message);
    return { success: true, message: "Notification sent", response };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, message: "Notification sending failed", error: error.message };
  }
};

const sendAttendanceNotification = async (token, title, body, url, className, id, userId = null) => {
  try {
    if (!title || !body) {
      return { success: false, message: "Missing required fields" };
    }

    if (!token) {
      return { success: true, message: "Notification skipped (no token)" };
    }

    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: {
        url: url || "",
        className: className || "",
        id: id ? String(id) : "",
      },
    };

    const response = await firebase.messaging().send(message);
    return { success: true, message: "Notification sent", response };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, message: "Notification sending failed", error: error.message };
  }
};

module.exports = { sendNotification, sendAttendanceNotification };
