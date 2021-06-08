const catchAsync = require("./catchAsync");
const appError = require("./appError");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new appError("No doc found with that ID", 404));
    }
    res.status(201).json({
      status: "sucess",
    });
  });
