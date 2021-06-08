const express = require("express");
const app = express();
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const emailRouter = require("./routes/emailRouter");
const employeeRouter = require("./routes/employees");
const warehouseRouter = require("./routes/warehouseRoute");
const offlineOrderRouter = require("./routes/offlineOrderRouter");

const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
require("dotenv").config();
// Set security HTTP headers
app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

app.use(morgan("dev"));
app.use(express.json());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());

app.use(
  hpp({
    whitelist: [
      //Fix this up
    ],
  })
);


app.use("/api/v1/email", emailRouter);
app.use("/api/v1/employee", employeeRouter);
app.use("/api/v1/warehouse", warehouseRouter);
app.use("/api/v1/offorder", offlineOrderRouter);



app.get("/", function (req, res) {
  res.status(200).json({
    response: "OK",
  });
});

module.exports = app;
