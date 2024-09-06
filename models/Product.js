// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  originalPrice: { type: Number },
  discountPrice: { type: Number },
  sellingPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  uom: { type: String },
  hsnCode: { type: String },
});

module.exports = mongoose.model("Product", productSchema);
