import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      skills = [],
      experienceLevel,
      targetRole,
      preferredDomain
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // check existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashed,
      skills,
      experienceLevel,
      targetRole,
      preferredDomain
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      skills: user.skills,
      token: generateToken(user._id)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

import axios from "axios";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await User.updateOne(
      { _id: user._id },
      { lastLogin: new Date() }
    );

    // Warm up AI service (don't await)
    axios
      .get(`${process.env.AI_SERVICE_URL}/health`)
      .then(() => console.log("AI service warmed up"))
      .catch((err) =>
        console.log("Health check failed:", err.message)
      );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
      experienceLevel: user.experienceLevel,
      targetRole: user.targetRole,
      preferredDomain: user.preferredDomain,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};