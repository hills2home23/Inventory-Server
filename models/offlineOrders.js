const mongoose = require('mongoose');
const offlineOrdersSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: [true, "Customer Name is required"]
    },
    cart: [
        {
            productId: {
                type: mongoose.Schema.ObjectId,
                ref: "product",
            },
            productQuantity: {
                type: Number,
                required: [true, "Enter Product Quantity"]
            }
        }
    ],
    totalPrice: {
        type: String,
        required: [true, "Total Price is required"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        required: [true, "Status is required"]
    },
    paymentStatus: {
        type: String,
        enum: ["Unpaid", "Partially Paid", "Paid"]
    }
});

const offlineOrders = mongoose.model("offlineOrder", offlineOrdersSchema);

module.exports = offlineOrders;