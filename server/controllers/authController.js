const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

const sendToken = (user, status, res) => {
  const token = signToken(user._id);
  res.status(status).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
  });
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });

    const user = await User.create({ name, email, password });
    sendToken(user, 201, res);
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ error: "Invalid email or password" });

    sendToken(user, 200, res);
  } catch (err) { next(err); }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, avatar: req.user.avatar } });
};

// POST /api/auth/logout
exports.logout = (_req, res) => {
  res.json({ message: "Logged out" });
};