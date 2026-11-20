const db = require('../config/db');
const { createHash } = require('crypto');
// Match the Week 1-5 teaching database's SHA-256 password format.
// For a production site migrate password hashes to bcrypt/scrypt/Argon2.
const hash = value => createHash('sha256').update(value).digest('hex');
async function findByUsername(username) {
  const [rows] = await db.execute('SELECT id, username, name, role, password FROM users WHERE username = ?', [username]);
  return rows[0] || null;
}
async function createUser(username, password, name) {
  const [result] = await db.execute(
    "INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, 'user')",
    [username, hash(password), name]);
  return result.insertId;
}
async function getUserById(id) {
  const [rows] = await db.execute('SELECT id, username, name, role, created_at FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}
async function getAllUsers() {
  const [rows] = await db.execute('SELECT id, username, name, role, created_at FROM users ORDER BY id');
  return rows;
}
async function deleteUser(id) {
  const [result] = await db.execute('DELETE FROM users WHERE id = ? AND role != ?', [id, 'admin']);
  return result.affectedRows;
}
async function updateName(id, name) {
  await db.execute('UPDATE users SET name = ? WHERE id = ?', [name, id]);
}
// Sign-up creates the account and its first pet together or neither is saved.
async function createWithPet(user, pet, image) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      "INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, 'user')",
      [user.username, hash(user.password), user.name]);
    await connection.execute('INSERT INTO pets (owner_id,name,species,breed,age,image) VALUES (?,?,?,?,?,?)',
      [result.insertId,pet.pet_name,pet.species,pet.breed,Number(pet.age),image]);
    await connection.commit();
    return result.insertId;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally { connection.release(); }
}
module.exports = { hash, findByUsername, createUser, createWithPet, getUserById, getAllUsers, deleteUser, updateName };
