const mongoose = require('mongoose');
const offlineOrdersSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: [true, "Customer Name is required"]
    },
    customerEmail: {
        type: String,
        required: [true, "Customer Email is required"]
    },
    customerPhone: {
        type: String,
        required: [true, "Customer Phone is required"]
    },
    customerAddress1: {
        type: String,
        required: [true, "Enter sector no or house no"]
    },
    customerAddress2: {
        type: String,
        required: [true, "Enter area name or locality name"]
    },
    customerCity: {
        type: String,
        required: [true, "Customer City is required"]
    },
    customerState: {
        type: String,
        required: [true, "Customer State is required"]
    },
    customerPincode: {
        type: String,
        required: [true, "Customer Pincode is required"]
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
    discount: {
        type: String,
        required: [true, "Discount is required"],
        default: "0"
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