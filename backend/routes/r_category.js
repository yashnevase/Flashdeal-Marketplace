const express = require('express');
const router = express.Router();
const Joi = require('joi');
const s_category = require('../services/s_category');
const { verifyToken, checkRole } = require('../lib/auth');

// Joi schema for category creation/update
const categorySchema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    description: Joi.string().min(10)
});

// GET /api/categories — List all categories (public)
router.get('/categories', async (req, res) => {
    try {
        const categories = await s_category.getAllCategories();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// (Admin only) POST /api/categories — Create category
router.post('/categories', verifyToken, checkRole(['Admin']), async (req, res) => {
    try {
        const { error, value } = categorySchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { name, description } = value;
        const categoryId = await s_category.addCategory(name, description);
        res.status(201).json({ message: 'Category created successfully', categoryId });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// (Admin only) PUT /api/categories/:id — Update category
router.put('/categories/:id', verifyToken, checkRole(['Admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = categorySchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { name, description } = value;
        const affectedRows = await s_category.updateCategory(id, name, description);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// (Admin only) DELETE /api/categories/:id — Delete category
router.delete('/categories/:id', verifyToken, checkRole(['Admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await s_category.deleteCategory(id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
