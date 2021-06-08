const emailModel = require("./../models/emailModel");
const catchAsync = require("./../utils/catchAsync");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const nodemailer = require('nodemailer');
const sendgridTransport = require("nodemailer-sendgrid-transport");


exports.subscribeToNewsletter = catchAsync(async (req, res, next) => {
  const subscribe = await emailModel.create({
    email: req.body.email,
    fullName: req.body.fullName,
    townCity: req.body.townCity,
    message: req.body.message,
  });
  res.status(200).json({
    status: "success",
    data: {
      subscribe,
    },
  });
});

exports.getEmailsOfNewsletters = catchAsync(async (req, res, next) => {
  const subscribe = await emailModel.find();
  res.status(200).json({
    status: "success",
    data: {
      subscribe,
    },
  });
});

exports.sendCustomisedEmail = catchAsync(async (req, res, next) => {
  console.log(req.body);
  let mailTransporter = nodemailer.createTransport(
    sendgridTransport({
      auth: {
        api_key:process.env.SENDGRID_API_KEY,
      },
    })
  );
  const emailData = {
    from: process.env.ADMIN_EMAIL,
    fromname: 'Hills2Home',
    to: req.body.email,
    subject: `${req.body.subject}`,
    html: `
                <p>${req.body.message}</p>
                <hr />
            `
  };
  try {
    await mailTransporter.sendMail(emailData);
    res.status(200).json({
      status: "success",
      message: "Order Successfully created ",
    });
  } catch (err) {
    console.log(err);
    return next(
      new AppError("Couldn't Sent Mail"),
      500
    );
  }
});


//exports.bulkemail = catchAsync(async (req, res, next) => {
//  console.log(req.body);
//  const msg = {
//    to: ['example1@mail.com', 'example2@mail.com'], // replace these with your email addresses
//    from: 'Sadie Miller <sadie@thebigdonut.party>',
//    subject: '🍩 Donuts, at the big donut 🍩',
//    text: 'Fresh donuts are out of the oven. Get them while they’re hot!',
//    html: '<p>Fresh donuts are out of the oven. Get them while they’re <em>hot!</em></p>',
//  };
//  
//  sgMail.sendMultiple(msg).then(() => {
//    console.log('emails sent successfully!');
//  }).catch(error => {
//    console.log(error);
//  });
//});
