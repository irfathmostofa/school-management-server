const hr = require("./hr");
const student = require("./student");
const paymentGateway = require("./paymentGateway");
const frontOffice = require("./frontOffice");
const account = require("./account");
const fees = require("./fees");
const management = require("./management");
const procurement = require("./procurement");
const settings = require("./settings");
const stad = require("./stad");
const storeInventory = require("./storeInventory");
const dashboard = require("./dashboard");
const academic = require("./academic");
const auth = require("./auth");
const admin = require("./admin");
const newHr = require("./newHr");

function registerRoutes(app) {
  app.use("/server/hr", hr);
  app.use("/server/student", student);
  app.use("/server/payment", paymentGateway);
  app.use("/server/", frontOffice);
  app.use("/server/", account);
  app.use("/server/", fees);
  app.use("/server/", management);
  app.use("/server/", procurement);
  app.use("/server/", stad);
  app.use("/server/", storeInventory);
  app.use("/server/", dashboard);
  app.use("/server/", academic);
  app.use("/server/", auth);
  app.use("/server/", settings);
  app.use("/server/", admin);
  app.use("/server/", newHr);
}

module.exports = { registerRoutes };
