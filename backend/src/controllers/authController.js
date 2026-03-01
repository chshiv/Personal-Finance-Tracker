import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { validateFields } from '../utils/validators.js';
import {validateName, validateRole, validateEmail, validateStrongPassword, validateLoginPassword} from '../utils/authValidator.js';
dotenv.config();

const registerationAllowedKeys = ["name", "email", "password", "role"];
const loginAllowedKeys = ["email", "password"];

// Register
export const register = async (req, res) => {
  try {

    const { error } = validateFields(req.body, registerationAllowedKeys);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const { name, email, password, role } = req.body;

    const nameError = validateName(name);
    if (nameError) {
      return res.status(400).json({ message: nameError });
    }

    // EMAIL VALIDATION (Reusable)
    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    // PASSWORD VALIDATION (Reusable)
    const passwordError = validateStrongPassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // ROLE VALIDATION
    const roleError = validateRole(role);
    if (roleError) {
      return res.status(400).json({ message: roleError });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword, role });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login
export const login = async (req, res) => {
  try {
    
    const { email, password } = req.body;

    const { error } = validateFields(req.body, loginAllowedKeys);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    const passwordError = validateLoginPassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '3h' }
    );

    res.status(200).json({ token, role: user.role, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};