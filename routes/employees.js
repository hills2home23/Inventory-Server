const express = require("express");
const employeeController = require("./../controllers/employees");

const router = express.Router();

router.post("/signup", employeeController.signup);
router.post("/login", employeeController.login);
router.post(
  "/shipment/login",
  employeeController.protect,
  employeeController.ShiprocketLogin
);

router.post("/forgotPassword", employeeController.forgotPassword);
router.patch("/resetPassword/:token", employeeController.resetPassword);

router.patch(
  "/updateMyPassword",
  employeeController.protect,
  employeeController.updatePassword
);

router.patch("/updateMe", employeeController.protect, employeeController.updateMe);
// router.delete("/deleteMe", employeeController.protect, employeeController.deleteMe);

router.get("/", employeeController.getAllEmployee);
router.post("/", employeeController.createEmployee);

router
  .route("/:id")
  .get(employeeController.getEmployee)
  .patch(employeeController.updateEmployee)
  .delete(employeeController.restrictTo("admin"), employeeController.deleteEmployee);

module.exports = router;
