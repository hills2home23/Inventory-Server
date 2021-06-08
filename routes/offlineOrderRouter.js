const express = require("express");
const router = express.Router();
const offlineOrders = require("../controllers/offlineOrders");
const employeeController = require("../controllers/employees");
const { sendInvoice } = require("../controllers/invoiceController.js");
router
    .route("/")
    .get(offlineOrders.getOfflineOrders)
    .post(employeeController.protect, offlineOrders.addOfflineOrder);
router
    .route("/send-invoice")
    .post(sendInvoice)
router
    .route("/:id")
    .get(offlineOrders.getOfflineOrderByID)
    .patch(employeeController.protect, offlineOrders.updateOfflineOrder)
    .delete(employeeController.protect, offlineOrders.deleteOfflineOrder);

module.exports = router;