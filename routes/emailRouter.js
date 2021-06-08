const express = require("express");
const emailController = require("./../controllers/emailController");
const employeesController = require("./../controllers/employees");

const router = express.Router();

router.post(
  "/sendmail",
  employeesController.protect,
  employeesController.restrictTo("admin"),
  emailController.sendCustomisedEmail
);

module.exports = router;

