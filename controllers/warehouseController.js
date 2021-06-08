const Warehouse = require("../models/warehouseModel");
const catchAsync = require("../utils/catchAsync");
// const AppError = require("../utils/appError");

exports.getWarehouses = catchAsync(async (req, res, next) => {
    try {
        const warehouses = await Warehouse.find();
        res.status(200).json({
            status: "success",
            results: warehouses.length,
            data: {
                warehouses
            }
        })
    }
    catch (err) {
        res.status(404).json({
            status: "fail",
            message: err,
        });
    }
});

exports.addWarehouse = catchAsync(async (req, res, next) => {
    try {
        const warehouse = await Warehouse.create(req.body);

        res.status(201).json({
            status: "success",
            data: {
                warehouse
            }
        })
    }
    catch (err) {
        res.status(404).json({
            status: "fail",
            message: err,
        });
    }
});

exports.updateWarehouse = catchAsync(async (req, res, next) => {
    try {
        const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            status: "success",
            data: {
                warehouse,
            },
        });
    }
    catch (err) {
        res.status(404).json({
            status: "fail",
            message: err,
        });
    }
});

exports.deleteWarehouse = catchAsync(async (req, res, next) => {
    try {
        await Warehouse.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: "success",
            data: null,
        });
    }
    catch (err) {
        res.status(404).json({
            status: "fail",
            message: err,
        });
    }
});