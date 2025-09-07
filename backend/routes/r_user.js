const express = require('express');
const router = express.Router();
const Joi = require('joi');
const s_user = require('../services/s_user');
const { generateToken, verifyToken, checkRole } = require('../lib/auth');

// Joi schema for user registration
const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email(),
    password: Joi.string().min(4).required(),
    role: Joi.string().valid('Admin', 'Seller', 'Buyer').required()
});

// Joi schema for user login
const loginSchema = Joi.object({
    username: Joi.string(),
    password: Joi.string().required()
});

// POST /api/auth/register - Register user
router.post('/auth/register', async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { username, email, password, role } = value;

        const existingUser = await s_user.getUserByUsername(username);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        const userId = await s_user.addUser(username, email, password, role);
        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/auth/login - Login and get JWT token
router.post('/auth/login', async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { username, password } = value;

        const user = await s_user.getUserByUsername(username);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await s_user.comparePassword(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const id = user.id;
        const role = user.role;
        const email = user.email;
        // const username = user.username;


        const token = generateToken(user);
        res.json({ message: 'Logged in successfully', token ,user:{id,username,email,role} });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/users/me - Get current user profile
router.get('/users/me', verifyToken, async (req, res) => {
    try {
        const user = await s_user.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/users - List all users (Admin only)
router.get('/users', verifyToken, checkRole(['Admin']), async (req, res) => {
    try {
        const users = await s_user.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
