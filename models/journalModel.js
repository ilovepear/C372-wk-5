const db = require('../config/db');
async function list(ownerId, filters = {}) {
  let query = `SELECT j.*, p.name AS pet_name FROM journal j JOIN pets p ON p.id=j.pet_id
               WHERE p.owner_id=?`;
  const args = [ownerId];
  if (filters.petId) { query += ' AND j.pet_id=?'; args.push(filters.petId); }
  if (filters.q) { query += ' AND (j.activity LIKE ? OR j.notes LIKE ?)'; args.push('%'+filters.q+'%','%'+filters.q+'%'); }
  if (filters.activity) { query += ' AND j.activity LIKE ?'; args.push('%'+filters.activity+'%'); }
  if (filters.from) { query += ' AND j.entry_date >= ?'; args.push(filters.from); }
  if (filters.to) { query += ' AND j.entry_date <= ?'; args.push(filters.to); }
  query += filters.sort === 'oldest' ? ' ORDER BY j.entry_date ASC, j.id ASC' : ' ORDER BY j.entry_date DESC, j.id DESC';
  const [rows] = await db.execute(query, args);
  return rows;
}
async function getOwned(id, ownerId) {
  const [rows] = await db.execute('SELECT j.* FROM journal j JOIN pets p ON p.id=j.pet_id WHERE j.id=? AND p.owner_id=?', [id, ownerId]);
  return rows[0] || null;
}
async function create(petId, activity, notes, entryDate) {
  const [result] = await db.execute('INSERT INTO journal (pet_id,activity,notes,entry_date) VALUES (?,?,?,?)', [petId,activity,notes,entryDate]);
  return result.insertId;
}
async function update(id, ownerId, petId, activity, notes, entryDate) {
  const [result] = await db.execute(`UPDATE journal j JOIN pets p ON p.id=j.pet_id
    SET j.pet_id=?,j.activity=?,j.notes=?,j.entry_date=? WHERE j.id=? AND p.owner_id=?`,
    [petId,activity,notes,entryDate,id,ownerId]);
  return result.affectedRows;
}
async function remove(id, ownerId) {
  const [result] = await db.execute('DELETE j FROM journal j JOIN pets p ON p.id=j.pet_id WHERE j.id=? AND p.owner_id=?', [id,ownerId]);
  return result.affectedRows;
}
async function countByPet(ownerId, petId) {
  const [rows] = await db.execute('SELECT COUNT(*) AS total FROM journal j JOIN pets p ON p.id=j.pet_id WHERE p.owner_id=? AND p.id=?', [ownerId,petId]);
  return rows[0].total;
}
module.exports = { list, getOwned, create, update, remove, countByPet };
