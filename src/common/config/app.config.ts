export default () => ({
  port: Number(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET || "mysupersecretpassword",
  db: {
    url:
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.NEON_DATABASE_URL ||
      "",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "rooh_db",
    ssl: process.env.DB_SSL || "",
  },
  sms: {
    apiUrl: process.env.SMS_API_URL,
    apiKey: process.env.SMS_API_KEY,
    secretKey: process.env.SMS_SECRET_KEY,
    callerId: process.env.SMS_CALLER_ID,
  },
  payment: {
    storeId: process.env.PAYMENT_STORE_ID || "ahischool",
    signatureKey: process.env.PAYMENT_SIGNATURE_KEY || "",
    callbackUrl:
      process.env.PAYMENT_CALLBACK_URL ||
      "https://server.mpairproject.xyz/server/payment/callback",
    frontendStatusUrl:
      process.env.PAYMENT_FRONTEND_STATUS_URL ||
      "http://localhost:5173/paymentStatus",
    gatewayUrl:
      process.env.PAYMENT_GATEWAY_URL ||
      "https://secure.aamarpay.com/jsonpost.php",
  },
});
