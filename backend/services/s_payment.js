const db = require('../lib/dbconnection');

const createPayment = async (order_id, payment_method, amount, payment_status) => {
    const sql = "INSERT INTO payments (order_id, payment_method, amount, payment_status, payment_date) VALUES (?, ?, ?, ?, NOW())";
    const result = await db.query(sql, [order_id, payment_method, amount, payment_status]);
    return result.insertId;
};

const updatePaymentStatus = async (payment_id, payment_status) => {
    const sql = "UPDATE payments SET payment_status = ? WHERE id = ?";
    const result = await db.query(sql, [payment_status, payment_id]);
    return result.affectedRows;
};

// Update payment status using internal order_id instead of payment id
const updatePaymentStatusByOrderId = async (order_id, payment_status) => {
    const sql = "UPDATE payments SET payment_status = ? WHERE order_id = ?";
    const result = await db.query(sql, [payment_status, order_id]);
    return result.affectedRows;
};

const getPaymentByOrderId = async (order_id) => {
    const sql = "SELECT * FROM payments WHERE order_id = ?";
    const payments = await db.query(sql, [order_id]);
    return payments[0];
};

module.exports = {
    createPayment,
    updatePaymentStatus,
    updatePaymentStatusByOrderId,
    getPaymentByOrderId,
};
