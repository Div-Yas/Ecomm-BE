// auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const router = express.Router();

const secret = "secretKey";

// Signup
router.post("/signup", async (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword, role });
  await user.save();
  res.status(201).send("User registered");
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ id: user._id, role: user.role }, secret); // No expiry time set
    res.json({ token });
  } else {
    res.status(401).send("Invalid credentials");
  }
});

// Middleware to verify token
const authenticateJWT = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) return res.status(403).send("Access denied");

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7, authHeader.length).trim()
    : authHeader;

  try {
    const verified = jwt.verify(token, secret);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send("Invalid token");
  }
};

module.exports = { router, authenticateJWT };
