const express = require("express");
const router = express.Router();
const Order = require("./models/Order");
const Cart = require("./models/Cart");

// Place an order
router.post("/place", async (req, res) => {
  try {
    if (req.user.role !== "Customer")
      return res.status(403).send("Access denied");
    console.log(req.body, "req.body");

    const { address, phoneNumber, items } = req.body;

    if (!address || !phoneNumber || !items || !items.length) {
      return res
        .status(400)
        .send("Address, phone number, and items are required");
    }

    // Fetch the user's cart
    const cart = await Cart.findOne({ userId: req.user.id });
    console.log(items, "items");

    if (!cart || cart.items.length === 0) {
      return res.status(400).send("Cart is empty");
    }

    // Create a new order
    const order = new Order({
      userId: req.user.id,
      address,
      phoneNumber,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    await order.save();

    // Clear the user's cart after placing the order
    cart.items = [];
    await cart.save();

    res.status(201).send("Order placed successfully");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get order summary
router.get("/summary", async (req, res) => {
  try {
    if (req.user.role === "Customer") {
      const userOrders = await Order.find({ userId: req.user.id })
        .populate({
          path: "items.productId",
          select: "name sellingPrice",
        })
        .populate({
          path: "userId",
          select: "username",
        });

      const formattedOrders = userOrders.map((order) => ({
        _id: order._id,
        userName: order.userId.username,
        address: order.address,
        phoneNumber: order.phoneNumber,
        status: order.status,
        items: order.items.map((item) => ({
          productName: item.productId.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        date: order.date,
      }));
      console.log(formattedOrders);

      res.json(formattedOrders);
    } else if (req.user.role === "Admin") {
      const allOrders = await Order.find()
        .populate({
          path: "items.productId",
          select: "name sellingPrice",
        })
        .populate({
          path: "userId",
          select: "username",
        });
      console.log(allOrders);

      const formattedOrders = allOrders.map((order) => ({
        _id: order._id,
        userName: order.userId.username,
        address: order.address,
        phoneNumber: order.phoneNumber,
        status: order.status,
        items: order.items.map((item) => ({
          productName: item.productId.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        date: order.date,
      }));
      console.log(formattedOrders);
      res.json(formattedOrders);
    } else {
      res.status(403).send("Access denied");
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Update order status
router.put("/update/:id", async (req, res) => {
  try {
    if (req.user.role !== "Admin") return res.status(403).send("Access denied");

    const { status } = req.body;
    const allowedStatuses = ["Placed", "Packed", "Delivered"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).send("Invalid status");
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).send("Order not found");
    }

    // Update order status
    order.status = status;
    await order.save();

    res.status(200).send("Order status updated successfully");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
