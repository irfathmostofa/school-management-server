const { db, query, pool, connect } = require("../config/database");

module.exports = {
  db,
  query,
  pool,
  connect,
  User: require("./User"),
  Student: require("./Student"),
  Employee: require("./Employee"),
  BaseModel: require("./BaseModel"),
};
