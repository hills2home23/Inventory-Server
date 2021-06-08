const mongoose = require("mongoose");
const emailModelSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "orderID is required"],
  },
  fullName: {
    type: String,
    required: [true, "fullName is required"],
  },
  townCity: {
    type: String,
    required: [true, "townCity is required"],
  },
  message: {
    type: String,
    required: [true, "message is required"],
  },
});

const emailsData = mongoose.model("emails", emailModelSchema);

module.exports = emailsData;
