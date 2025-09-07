const express = require('express');
const router = express.Router();
const Joi = require('joi');
const s_product = require('../services/s_product');
const upload = require('../lib/multer'); // Multer for file uploads
const { verifyToken, checkRole } = require('../lib/auth');
const sharp = require('sharp');

const path = require('path');


// Joi schema for adding/updating products
const productSchema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    description: Joi.string().min(5),
    price: Joi.number().positive().precision(2),
    discount: Joi.number().min(0).max(100).default(0),
    stock: Joi.number().integer().min(0),
    deal_expiry: Joi.date().iso(),
    category_id: Joi.number().integer().positive().allow(null),
    product_img: Joi.string().uri().allow(null)
});

// (Seller only) POST /api/products — Add product
router.post('/products', verifyToken, checkRole(['Seller']), upload.single('productImage'), async (req, res) => {
    try {
        const { error, value } = productSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { name, description, price, discount, stock, deal_expiry, category_id } = value;
        const seller_id = req.user.id;

        let imageUrl = null;

        if (req.file) {
            const outputFilename = `compressed-${Date.now()}.jpeg`;
            const outputPath = path.join(__dirname, '..', 'uploads', outputFilename);

            await sharp(req.file.buffer)
                .resize(800) // resize width to 800px (height auto)
                .jpeg({ quality: 70 }) // compress JPEG
                .toFile(outputPath);

            imageUrl = `http://${process.env.IP}/uploads/${outputFilename}`;
        }



        const productId = await s_product.addProduct(seller_id, category_id, name, description, price, discount, stock, deal_expiry, imageUrl);
        res.status(201).json({ message: 'Product added successfully', productId });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// (Admin only) GET /api/products/pending — List products awaiting approval
router.get('/products/pending', verifyToken, checkRole(['Admin']), async (req, res) => {
    try {
        const products = await s_product.getPendingProducts();
        res.json(products);
    } catch (error) {
        console.error('Error fetching pending products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// (Admin only) PUT /api/products/:id/approve — Approve product
router.put('/products/:id/approve', verifyToken, checkRole(['Admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await s_product.approveProduct(id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found or already approved' });
        }
        res.json({ message: 'Product approved successfully' });
    } catch (error) {
        console.error('Error approving product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/products — List all approved products with filters (category, search by name), pagination, countdown timers for deals
router.get('/products', async (req, res) => {
    try {
        const { category_id, search_term, page, limit } = req.query;

        const categoryIdNumber = category_id ? parseInt(category_id) : undefined;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const validPage = Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;
        const validLimit = Number.isInteger(limitNumber) && limitNumber >= 0 ? limitNumber : 10;

        console.log('Query params:', { category_id, search_term, page, limit });
        console.log('Parsed params:', { categoryIdNumber, search_term, validPage, validLimit });

        const products = await s_product.getAllApprovedProducts(categoryIdNumber, search_term, validPage, validLimit);

        res.json(products);
    } catch (error) {
        console.error('Error fetching approved products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// seller specific products
router.get('/Sellerproducts', verifyToken, async (req, res) => {
    try {
        const seller_id = req.user.id;
        const { category_id, search_term, page, limit } = req.query;

        const categoryIdNumber = category_id ? parseInt(category_id) : undefined;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const validPage = Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;
        const validLimit = Number.isInteger(limitNumber) && limitNumber >= 0 ? limitNumber : 10;

        const products = await s_product.getSellerProducts(seller_id, categoryIdNumber, search_term, validPage, validLimit);

        res.json(products);
    } catch (error) {
        console.error('Error fetching seller products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// (Seller only) PUT /api/products/:id — Update product (only own products)

router.put('/products/:id', verifyToken, checkRole(['Seller']), upload.single('productImage'), async (req, res) => {
    try {
        const { id } = req.params;
        const seller_id = req.user.id;
        console.log('Updating product ID:', id, 'with seller_id:', seller_id);


        // If image uploaded, process it first
        if (req.file) {
            const outputFilename = `compressed-${Date.now()}.jpeg`;
            const outputPath = path.join(__dirname, '..', 'uploads', outputFilename);

            await sharp(req.file.buffer)
                .resize(800)
                .jpeg({ quality: 70 })
                .toFile(outputPath);

            // Add image URL to body before validation
            req.body.product_img = `http://${process.env.IP}/uploads/${outputFilename}`;
        }

        // Validate all fields, including the image
        const { error, value } = productSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({ message: error.details.map(d => d.message).join(', ') });
        }

        if (Object.keys(value).length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update' });
        }

        // Update product only if it belongs to this seller
        const affectedRows = await s_product.updateProduct(id, seller_id, value);

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found or you do not have permission to update this product' });
        }

        res.json({ message: 'Product updated successfully' });

    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});





// (Seller only) DELETE /api/products/:id — Delete product (only own products)
router.delete('/products/:id', verifyToken, checkRole(['Seller']), async (req, res) => {
    try {
        const { id } = req.params;
        const seller_id = req.user.id;

        const affectedRows = await s_product.deleteProduct(id, seller_id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found or you do not have permission to delete this product' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
