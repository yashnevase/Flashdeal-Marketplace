const db = require('../lib/dbconnection');

const createOrder = async (buyer_id, product_id, quantity, total_price) => {
    const sql = "INSERT INTO orders (buyer_id, product_id, quantity, total_price, status) VALUES (?, ?, ?, ?, ?)";
    const result = await db.query(sql, [buyer_id, product_id, quantity, total_price, 'Pending']);
    return result.insertId;
};

const getOrderById = async (id) => {
    const sql = "SELECT * FROM orders WHERE id = ?";
    const orders = await db.query(sql, [id]);
    return orders[0];
};

const getBuyerOrders = async (buyer_id) => {
    const sql = `SELECT o.*, p.name as product_name, p.price, p.discount,p.product_img FROM orders o JOIN products p ON o.product_id = p.id WHERE o.buyer_id = ? ORDER BY id DESC `
    // ORDER BY o.timestamps DESC;`

    return db.query(sql, [buyer_id]);
};

const getSellerOrders = async (seller_id) => {
    const sql = `SELECT o.*, p.name as product_name, p.price, p.discount, u.username as buyer_username ,p.product_img
    FROM orders o JOIN products p ON o.product_id = p.id 
    JOIN users u ON o.buyer_id = u.id 
    WHERE p.seller_id = ? `
    // ORDER BY o.timestamps DESC`;
    return db.query(sql, [seller_id]);
};

const updateOrderStatus = async (order_id, status) => {
    const sql = "UPDATE orders SET status = ? WHERE id = ?";
    const result = await db.query(sql, [status, order_id]);
    return result.affectedRows;
};

// Atomic stock deduction (transaction)
const deductProductStock = async (product_id, quantity) => {
    // This should ideally be a transaction with order status update
    const sql = "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?";
    const result = await db.query(sql, [quantity, product_id, quantity]);
    return result.affectedRows;
};

module.exports = {
    createOrder,
    getOrderById,
    getBuyerOrders,
    getSellerOrders,
    updateOrderStatus,
    deductProductStock,
};
