const express = require("express");
const router = express.Router();
const Product = require("./models/Product");
const upload = require("./multerConfig");
const path = require("path");

// Fetch all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Filtering products
router.get("/search", async (req, res) => {
  const keyword = req.query.q
    ? { name: { $regex: req.query.q, $options: "i" } }
    : {};
  try {
    const products = await Product.find(keyword);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new product with image upload
router.post("/add", upload.single("image"), async (req, res) => {
  const filePath = req.file.path;
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    image: filePath.split("/").pop(), // Save image URL
    originalPrice: req.body.originalPrice,
    discountPrice: req.body.discountPrice,
    sellingPrice: req.body.sellingPrice,
    quantity: req.body.quantity,
    uom: req.body.uom,
    hsnCode: req.body.hsnCode,
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Serve product images from the "uploads" folder
router.use("/images", express.static(path.join(__dirname, "uploads")));

module.exports = router;
