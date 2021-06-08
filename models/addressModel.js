const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Enter Title"],
  },
  mobileNumber: {
    type: String,
    required: [true, "Enter Description"],
  },
  pincode: {
    type: String,
    required: [true, "Enter Flat, House no., Building, Company, Apartment: "],
  },

  addressLine1: {
    type: String,
    required: [true, "Enter Area, Colony, Street, Sector, Village"],
  },
  addressLine2: {
    type: String,
    required: [true, "Enter Area, Colony, Street, Sector, Village"],
  },
  townCity: {
    type: String,
    required: [true, "Enter Town City"],
  },
  state: {
    type: String,
    required: [true, "Enter State"],
  },
  landMark: {
    type: String,
    required: [true, "Enter Landmark"],
  },
});

const address = addressSchema;
module.exports = address;
