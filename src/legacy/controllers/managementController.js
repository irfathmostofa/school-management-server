const { db } = require("../models");
exports.get = (req, res) => {
  res.send("Server is Running");
}
