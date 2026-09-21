const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

module.exports = {
  port: Number(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET || "mysupersecretpassword",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "rooh_db",
  },
  sms: {
    apiUrl: process.env.SMS_API_URL,
    apiKey: process.env.SMS_API_KEY,
    secretKey: process.env.SMS_SECRET_KEY,
    callerId: process.env.SMS_CALLER_ID,
  },
};
