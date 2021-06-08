const Employee = require("./../models/employees");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const crypto = require("crypto");
const { promisify } = require("util");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const sendEmail = require("./../utils/email");
const axios = require("axios");
const nodemailer = require('nodemailer');
const sendgridTransport = require("nodemailer-sendgrid-transport");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);



const signToken = (id) => {
  return jwt.sign({ id }, "my-ultra-secure-and-ultra-long-secret", {
    expiresIn: "7d",
  });
};

const createSendToken = (employee, statusCode, res) => {
  const token = signToken(employee._id);
  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  employee.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      employee,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  Employee.findOne({ email }).exec((err, employee) => {
    if (employee) {
      return res.status(400).json({
        message: "employee already registered",
      });
    }
  });


  const newemployee = await Employee.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  createSendToken(newemployee, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // 2) Check if employee exists && password is correct
  const employee = await Employee.findOne({ email }).select("+password");

  if (!employee || !(await employee.correctPassword(password, employee.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(employee, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;

  if (req.headers.authorization) {
    token = req.headers.authorization;
  }
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(
    token,
    "my-ultra-secure-and-ultra-long-secret"
  );
  // 3) Check if employee still exists
  const currentEmployee = await Employee.findById(decoded.id);
  if (!currentEmployee) {
    return next(
      new AppError(
        "The employee belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) Check if employee changed password after the token was issued
  if (currentEmployee.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("Employee recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.employee = currentEmployee;
  next();
});




























exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get employee based on POSTed email
  const { email } = req.body;
  const employee = await Employee.findOne({ email });
  if (!employee) {
    return next(new AppError("There is no employee with email address.", 404));
  }

  // 2) Generate the random reset token
  const resetToken = employee.createPasswordResetToken();
  await employee.save({ validateBeforeSave: false });

  // 3) Send it to employee's email
  const resetURL = `https://hills2home.com/resetPassword?resetToken=${resetToken}`;
  //const message = `Forgot your password ? \nSubmit your new password in this link: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;


  let mailTransporter = nodemailer.createTransport(
    sendgridTransport({
      auth: {
        api_key: process.env.SENDGRID_API_KEY,
      },
    })
  );

  const emailData = {
    from: process.env.ADMIN_EMAIL,
    fromname: 'Hills2Home',
    to: email,
    subject: `Password Reset link`,
    html: `
                  <h1>Please use the following link to reset your password</h1>
                  <p>Forgot your password ? \nSubmit your new password in this link: ${resetURL}.\nIf you didn't forget your password, please ignore this email!</p>
                  <hr />
              `
  };


  try {
    await mailTransporter.sendMail(emailData);

    res.status(200).json({
      status: "success",
      message: "Reset Password link sent to email!",
    });
  } catch (err) {
    employee.passwordResetToken = undefined;
    employee.passwordResetExpires = undefined;
    await employee.save({ validateBeforeSave: false });
    console.log(err);
    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get employee based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const employee = await Employee.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is employee, set the new password
  if (!employee) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  employee.password = req.body.password;
  employee.passwordConfirm = req.body.passwordConfirm;
  employee.passwordResetToken = undefined;
  employee.passwordResetExpires = undefined;
  await employee.save();

  // 3) Update changedPasswordAt property for the employee
  // 4) Log the employee in, send JWT
  createSendToken(employee, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get employee from collection
  const employee = await Employee.findById(req.employee.id).select("+password");

  // 2) Check if POSTed current password is correct
  if (!(await employee.correctPassword(req.body.passwordCurrent, employee.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  // 3) If so, update password
  employee.password = req.body.password;
  employee.passwordConfirm = req.body.passwordConfirm;
  await employee.save();
  // Employee.findByIdAndUpdate will NOT work as intended!

  // 4) Log employee in, send JWT
  createSendToken(employee, 200, res);
});

exports.ShiprocketLogin = catchAsync(async (req, res, next) => {
  var data = JSON.stringify({
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD,
  });

  var config = {
    method: "post",
    url: "https://apiv2.shiprocket.in/v1/external/auth/login",
    headers: {
      "Content-Type": "application/json",
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    data: data,
  };
  const response = await axios(config);
  res.status(200).json({
    status: "success",
    token: response.data.token,
  });
});














































exports.EmployeeById = (req, res, next, id) => {
  Employee.findById(id).exec((err, employee) => {
    if (err || !employee) {
      return res.status(400).json({ error: 'Employee not found' });
    }
    req.profile = employee;
    next();
  })
}

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllEmployee = catchAsync(async (req, res, next) => {
  try {
    const employees = await Employee.find();
    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      results: employees.length,
      data: {
        employees,
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

// Is controller ka kya role hai ????????
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if employee POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }
  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email");
  // 3) Update employee document
  const updatedEmployee = await Employee.findByIdAndUpdate(req.employee.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      employee: updatedEmployee,
    },
  });
});




// Is controller ka kya role hai ????????
exports.deleteMe = catchAsync(async (req, res, next) => {
  await Employee.findByIdAndUpdate(req.employee.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// For receiving the list of all employees
exports.getEmployee = catchAsync(async (req, res) => {
  try {
    console.log(req.params.id);
    const employee = await Employee.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: {
        employee,
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

// Yeh wala dekh lo ismein passwords ko kaise handle karna hai yeh main nahi samjha
exports.createEmployee = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};

// Yeh wala dekh lo ismein passwords ko kaise handle karna hai yeh main nahi samjha
exports.updateEmployee = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};

// For deleting an employee
exports.deleteEmployee = catchAsync(async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
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


exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='employee'
    if (!roles.includes(req.employee.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};