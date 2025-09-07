const db = require('../lib/dbconnection');
const { hashPassword, comparePassword } = require('../lib/auth');

const addUser = async (username, email, password, role) => {
    const hashedPassword = await hashPassword(password);
    const sql = "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)";
    const result = await db.query(sql, [username, email, hashedPassword, role]);
    return result.insertId;
};

const getUserByUsername = async (username) => {
    const sql = "SELECT * FROM users WHERE username = ?";
    const users = await db.query(sql, [username]);
    return users[0];
};

const getUserById = async (id) => {
    const sql = "SELECT id, username, email, role FROM users WHERE id = ?";
    const users = await db.query(sql, [id]);
    return users[0];
};

const getAllUsers = async () => {
    const sql = "SELECT id, username, email, role FROM users";
    return db.query(sql);
};

module.exports = {
    addUser,
    getUserByUsername,
    getUserById,
    getAllUsers,
    comparePassword,
};
