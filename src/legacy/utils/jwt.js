const jwt = require("jsonwebtoken");
const config = require("../config");

function sign(payload, expiresIn = "1d") {
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
}

function verify(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (err) {
    return null;
  }
}

module.exports = { sign, verify };
