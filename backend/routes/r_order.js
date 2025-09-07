const express = require('express');
const router = express.Router();
const Joi = require('joi');
const s_order = require('../services/s_order');
const s_product = require('../services/s_product');
const { verifyToken, checkRole } = require('../lib/auth');
const db = require('../lib/dbconnection'); // For transactions

// Joi schema for adding/updating cart items
const cartItemSchema = Joi.object({
    product_id: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().min(1).required()
});

// (Buyer only) GET /api/cart — Get current buyer cart with product details
router.get('/cart', verifyToken, checkRole(['Buyer']), async (req, res) => {
    try {
        const buyer_id = req.user.id;
        const sql = `SELECT ci.id as cart_item_id, ci.quantity,
                        p.id as product_id, p.name, p.description, p.price,p.product_img, 
                        p.discount, p.stock 
                        FROM cart_items ci JOIN products p ON ci.product_id = p.id 
                        WHERE ci.cart_id = (SELECT id FROM carts WHERE buyer_id = ?)`;
        const cartItems = await db.query(sql, [buyer_id]);
        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// (Buyer only) POST /api/cart — Add/update product quantity in cart
router.post('/cart', verifyToken, checkRole(['Buyer']), async (req, res) => {
    try {
        const { error, value } = cartItemSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { product_id, quantity } = value;
        const buyer_id = req.user.id;

        // Find or create cart
        let cartSql = "SELECT id FROM carts WHERE buyer_id = ?";
        let carts = await db.query(cartSql, [buyer_id]);
        let cart_id;

        if (carts.length === 0) {
            cartSql = "INSERT INTO carts (buyer_id) VALUES (?)";
            const result = await db.query(cartSql, [buyer_id]);
            cart_id = result.insertId;
        } else {
            cart_id = carts[0].id;
        }

        // Check if product exists in cart
        const cartItemSql = "SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?";
        const existingCartItem = await db.query(cartItemSql, [cart_id, product_id]);

        if (existingCartItem.length > 0) {
            // Update quantity
            const updateSql = "UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?";
            await db.query(updateSql, [quantity, cart_id, product_id]);
        } else {
            // Add new item
            const insertSql = "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)";
            await db.query(insertSql, [cart_id, product_id, quantity]);
        }

        res.status(200).json({ message: 'Cart updated successfully' });
    } catch (error) {
        console.error('Error adding/updating cart item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// (Buyer only) DELETE /api/cart/:productId — Remove product from cart
router.delete('/cart/:productId', verifyToken, checkRole(['Buyer']), async (req, res) => {
    try {
        const { productId } = req.params;
        const buyer_id = req.user.id;

        const cartSql = "SELECT id FROM carts WHERE buyer_id = ?";
        const carts = await db.query(cartSql, [buyer_id]);

        if (carts.length === 0) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const cart_id = carts[0].id;
        const deleteSql = "DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?";
        const result = await db.query(deleteSql, [cart_id, productId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        res.json({ message: 'Product removed from cart successfully' });
    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// (Buyer only) DELETE /api/cart — Clear cart
router.delete('/cart', verifyToken, checkRole(['Buyer']), async (req, res) => {
    try {
        const buyer_id = req.user.id;

        const cartSql = "SELECT id FROM carts WHERE buyer_id = ?";
        const carts = await db.query(cartSql, [buyer_id]);

        if (carts.length === 0) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const cart_id = carts[0].id;
        const deleteSql = "DELETE FROM cart_items WHERE cart_id = ?";
        await db.query(deleteSql, [cart_id]);

        res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// (Buyer only) POST /api/orders — Place order for cart items, create order entries, set status Pending, initiate payment process
router.post('/orders', verifyToken, checkRole(['Buyer']), async (req, res) => {
    const connection = await db.pool.getConnection(); // Get a connection for transaction
    try {
        await connection.beginTransaction();

        const buyer_id = req.user.id;

        // Get cart items
        const cartSql = "SELECT ci.product_id, ci.quantity, p.price, p.discount, p.stock FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = (SELECT id FROM carts WHERE buyer_id = ?)";
        const cartItems = await connection.query(cartSql, [buyer_id]);

        if (cartItems[0].length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Cart is empty' });
        }

        let totalOrderPrice = 0;
        const orderPromises = cartItems[0].map(async (item) => {
            const productPrice = item.price * (1 - item.discount / 100);
            const itemTotalPrice = productPrice * item.quantity;
            totalOrderPrice += itemTotalPrice;

            // Check stock
            if (item.stock < item.quantity) {
                throw new Error(`Insufficient stock for product ${item.product_id}`);
            }

            // Create order entry
            const orderId = await s_order.createOrder(buyer_id, item.product_id, item.quantity, itemTotalPrice);
            // Deduct stock (will be handled by transaction commit)
            await s_order.deductProductStock(item.product_id, item.quantity);
            return orderId;
        });

        const orderIds = await Promise.all(orderPromises);

        // Clear the cart after placing order
        const clearCartSql = "DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE buyer_id = ?)";
        await connection.query(clearCartSql, [buyer_id]);

        await connection.commit();
        res.status(201).json({ message: 'Order placed successfully', orderIds, totalOrderPrice });
    } catch (error) {
        await connection.rollback();
        console.error('Error placing order:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    } finally {
        connection.release();
    }
});

// (Buyer only) GET /api/orders — Get buyer’s order history with statuses and timestamps
router.get('/orders', verifyToken, checkRole(['Buyer']), async (req, res) => {
    try {
        const buyer_id = req.user.id;
        const orders = await s_order.getBuyerOrders(buyer_id);
        res.json(orders);
    } catch (error) {
        console.error('Error fetching buyer orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// (Seller only) GET /api/orders — Get seller’s product orders
router.get('/orders/seller', verifyToken, checkRole(['Seller']), async (req, res) => {
    try {
        const seller_id = req.user.id;
        const orders = await s_order.getSellerOrders(seller_id);
        res.json(orders);
    } catch (error) {
        console.error('Error fetching seller orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// (Seller/Admin) PUT /api/orders/:id/status — Update order status
router.put('/orders/:id/status', verifyToken, checkRole(['Seller', 'Admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Confirmed', 'Shipped', 'Delivered'

        const allowedStatuses = ['Confirmed', 'Shipped', 'Delivered'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid order status' });
        }

        const affectedRows = await s_order.updateOrderStatus(id, status);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: `Order status updated to ${status}` });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
