const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const employeeController = require("./../controllers/employees");

router
    .route("/")
    .get(warehouseController.getWarehouses)
    .post(warehouseController.addWarehouse);

router
    .route("/:id")
    .patch(employeeController.protect, warehouseController.updateWarehouse)
    .delete(employeeController.protect, warehouseController.deleteWarehouse);

module.exports = router;