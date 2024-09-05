const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { router: authRouter, authenticateJWT } = require("./auth");
const productRouter = require("./products");
const cartRouter = require("./cart");
const orderRouter = require("./orders");
const path = require("path");
const app = express();

// Middleware for CORS
app.use(
  cors({
    origin: "http://localhost:3001", // Adjust this to your frontend URL if different
  })
);

// Middleware to parse JSON bodies
app.use(express.json());

// Route handlers
app.use("/auth", authRouter);
app.use("/products", productRouter);
app.use("/cart", authenticateJWT, cartRouter);
app.use("/orders", authenticateJWT, orderRouter);

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/ecommerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

// Start the server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
