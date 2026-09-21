require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const fileupload = require("express-fileupload");
const bodyParser = require("body-parser");

const { connect } = require("./models");
const config = require("./config");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const { registerRoutes } = require("./routes");

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "20mb" }));
app.use(express.json({ limit: "20mb" }));
app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));
app.use(fileupload());

registerRoutes(app);

const publicDirectory = path.join(__dirname, "public");
app.use(express.static(publicDirectory));
app.use("/image", express.static(path.join(publicDirectory, "image")));
app.use("/doTask", express.static(path.join(publicDirectory, "doTask")));
app.use(
  "/RecruitmentApplicantCV",
  express.static(path.join(publicDirectory, "RecruitmentApplicantCV"))
);
app.use("/csv", express.static(path.join(publicDirectory, "csv")));
app.use("/temp", express.static(path.join(publicDirectory, "temp")));

app.get("/server/test", (req, res) => {
  res.send("<h1>No Error test</h1>");
});

app.use(notFound);
app.use(errorHandler);

connect()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`SERVER RUNNING on port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to PostgreSQL:", err.message);
    app.listen(config.port, () => {
      console.log(`SERVER RUNNING on port ${config.port} (database unavailable)`);
    });
  });

module.exports = app;
