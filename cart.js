const express = require("express");
const router = express.Router();
const Cart = require("./models/Cart");
const mongoose = require("mongoose");

// Add product to cart
router.post("/add", async (req, res) => {
  const { productId, quantity, userId } = req.body;

  try {
    // Find the user's cart
    let cart = await Cart.findOne({ userId });

    if (cart) {
      // Check if the product already exists in the cart
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        // If it exists, update the quantity
        cart.items[itemIndex].quantity += quantity;
      } else {
        // If it doesn't exist, add the item to the cart
        cart.items.push({ productId, quantity });
      }
    } else {
      // If no cart exists, create a new one
      cart = new Cart({
        userId,
        items: [{ productId, quantity }],
      });
    }

    await cart.save();
    res.status(201).send("Product added to cart");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all cart items for a user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Convert userId to ObjectId if necessary
    const objectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const cart = await Cart.findOne({ userId: objectId }).populate(
      "items.productId"
    );

    if (!cart) {
      return res.status(404).send("Cart not found");
    }

    res.json(cart.items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove product from cart
router.delete("/remove/:userId/:itemId", async (req, res) => {
  const { userId, itemId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });

    if (cart) {
      cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
      await cart.save();
      res.send("Product removed from cart");
    } else {
      res.status(404).send("Cart not found");
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
