const db = require('../lib/dbconnection');

const addCategory = async (name, description) => {
    const sql = "INSERT INTO categories (name, description) VALUES (?, ?)";
    const result = await db.query(sql, [name, description]);
    return result.insertId;
};

const getCategoryById = async (id) => {
    const sql = "SELECT * FROM categories WHERE id = ?";
    const categories = await db.query(sql, [id]);
    return categories[0];
};

const getAllCategories = async () => {
    const sql = "SELECT * FROM categories";
    return db.query(sql);
};

const updateCategory = async (id, name, description) => {
    const sql = "UPDATE categories SET name = ?, description = ? WHERE id = ?";
    const result = await db.query(sql, [name, description, id]);
    return result.affectedRows;
};

const deleteCategory = async (id) => {
    const sql = "DELETE FROM categories WHERE id = ?";
    const result = await db.query(sql, [id]);
    return result.affectedRows;
};

module.exports = {
    addCategory,
    getCategoryById,
    getAllCategories,
    updateCategory,
    deleteCategory,
};
