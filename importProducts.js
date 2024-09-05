const fs = require("fs");
const mongoose = require("mongoose");
const Product = require("./models/Product");

mongoose.connect("mongodb://localhost:27017/ecommerce", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

fs.readFile("./products.json", "utf8", async (err, data) => {
  if (err) throw err;
  const products = JSON.parse(data);
  try {
    await Product.insertMany(products);
    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Error inserting data:", error);
  } finally {
    mongoose.connection.close();
  }
});
