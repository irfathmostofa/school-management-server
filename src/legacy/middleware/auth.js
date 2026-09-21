const { verify } = require("../utils/jwt");

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : req.body?.token;

  if (!token) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  const decoded = verify(token);
  if (!decoded) {
    return res.status(401).json({ ok: false, message: "Invalid or expired token" });
  }

  req.user = decoded;
  next();
}

module.exports = { auth };
