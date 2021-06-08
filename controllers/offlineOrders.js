const OfflineOrders = require("../models/offlineOrders");
const catchAsync = require("../utils/catchAsync");
// const AppError = require("../utils/appError");

exports.getOfflineOrders = catchAsync(async (req, res, next) => {
    try {
        const offlineOrders = await OfflineOrders.find().populate({
            path: "products",
            model: "product",
            select: { photo: 1, title: 1, photo: 1, price: 1 }
        });

        res.status(200).json({
            status: "success",
            results: offlineOrders.length,
            data: {
                offlineOrders
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

exports.getOfflineOrderByID = catchAsync(async (req, res, next) => {
    try {
        const offlineOrder = await OfflineOrders.findById(req.params.id).populate({
            path: "products",
            model: "product",
            select: { photo: 1, title: 1, photo: 1, price: 1 }
        });

        res.status(200).json({
            status: "success",
            data: {
                offlineOrder
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

exports.addOfflineOrder = catchAsync(async (req, res, next) => {
    try {
        const offlineOrder = await OfflineOrders.create(req.body);

        res.status(201).json({
            status: "success",
            data: {
                offlineOrder
            }
        });
    }
    catch (err) {
        res.status(404).json({
            status: "fail",
            message: err
        });
    }
});

exports.updateOfflineOrder = catchAsync(async (req, res, next) => {
    try {
        const offlineOrder = await OfflineOrders.findByIdAndUpdate(res.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: "success",
            data: {
                offlineOrder
            }
        });
    }
    catch (err) {
        res.status(404).json({
            status: "fail",
            message: err
        });
    }
});

exports.deleteOfflineOrder = catchAsync(async (req, res, next) => {
    try {
        await OfflineOrders.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: "success",
            data: null
        });
    }
    catch (err) {
        res.status(404).json({
            status: "fail",
            message: err
        });
    }
});