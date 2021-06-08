const mongoose = require('mongoose');
const warehouseSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, "Enter Item Name"]
    },
    city: {
        type: String,
        required: [true, "Enter Category"]
    }
});
const warehouse = mongoose.model("warehouse", warehouseSchema);
module.exports = warehouse;