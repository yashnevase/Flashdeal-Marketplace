const db = require('../lib/dbconnection');

const addProduct = async (seller_id, category_id, name, description, price, discount, stock, deal_expiry, product_img) => {
    const sql = "INSERT INTO products (seller_id, category_id, name, description, price, discount, stock, deal_expiry, approved ,product_img ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const result = await db.query(sql, [seller_id, category_id, name, description, price, discount, stock, deal_expiry, false, product_img]);
    return result.insertId;
};

const getProductById = async (id) => {
    const sql = "SELECT * FROM products WHERE id = ?";
    const products = await db.query(sql, [id]);
    return products[0];
};

const getPendingProducts = async () => {
    const sql = "SELECT p.*, u.username as seller_username FROM products p JOIN users u ON p.seller_id = u.id WHERE p.approved = false";
    return db.query(sql);
};

const approveProduct = async (id) => {
    const sql = "UPDATE products SET approved = true WHERE id = ?";
    const result = await db.query(sql, [id]);
    return result.affectedRows;
};

const getAllApprovedProducts = async (category_id, search_term, page = 1, limit = 10) => {
    let sql = `SELECT p.*, u.username as seller_username, c.name as category_name
               FROM products p
               JOIN users u ON p.seller_id = u.id
               LEFT JOIN categories c ON p.category_id = c.id
               WHERE p.approved = true`;
    const params = [];

    if (category_id) {
        sql += " AND p.category_id = ?";
        params.push(category_id);
    }

    if (search_term) {
        sql += " AND p.name LIKE ?";
        params.push(`%${search_term}%`);
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Inject limit and offset directly (make sure they are integers!)
    sql += ` LIMIT ${limit} OFFSET ${offset}`;

    // console.log('SQL:', sql);
    // console.log('Params:', params);

    return db.query(sql, params);
};


// seller specific prod
const getSellerProducts = async (seller_id, category_id, search_term, page = 1, limit = 10) => {
    let sql = `SELECT p.*, u.username as seller_username, c.name as category_name
               FROM products p
               JOIN users u ON p.seller_id = u.id
               LEFT JOIN categories c ON p.category_id = c.id
               WHERE p.seller_id = ?`;
    const params = [seller_id];

    if (category_id) {
        sql += " AND p.category_id = ?";
        params.push(category_id);
    }

    if (search_term) {
        sql += " AND p.name LIKE ?";
        params.push(`%${search_term}%`);
    }

    const offset = (page - 1) * limit;
    sql += ` LIMIT ${limit} OFFSET ${offset}`;

    return db.query(sql, params);
};



const updateProduct = async (id, seller_id, data) => {
    const fields = [];
    const params = [];

    for (const key of ['category_id', 'name', 'description', 'price', 'discount', 'stock', 'deal_expiry', 'product_img']) {
        if (data[key] !== undefined) {
            fields.push(`${key} = ?`);
            params.push(data[key]);
        }
    }

    if (fields.length === 0) {
        throw new Error('No fields to update');
    }

    const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ? AND seller_id = ?`;
    params.push(id, seller_id);

    const result = await db.query(sql, params);
    return result.affectedRows;
};



const deleteProduct = async (id, seller_id) => {
    const sql = "DELETE FROM products WHERE id = ? AND seller_id = ?";
    const result = await db.query(sql, [id, seller_id]);
    return result.affectedRows;
};

module.exports = {
    addProduct,
    getProductById,
    getPendingProducts,
    approveProduct,
    getAllApprovedProducts,
    updateProduct,
    deleteProduct,
    getSellerProducts
};
