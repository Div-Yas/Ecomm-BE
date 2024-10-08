const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [itemSchema],
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  status: { type: String, default: "Placed" },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
