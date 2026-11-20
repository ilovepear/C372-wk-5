const db = require('../config/db');
async function createPet(ownerId, data, image = null) {
  const [result] = await db.execute(
    'INSERT INTO pets (owner_id,name,species,breed,age,image) VALUES (?,?,?,?,?,?)',
    [ownerId, data.pet_name || data.name, data.species, data.breed, Number(data.age), image]);
  return result.insertId;
}
async function getPetsByOwner(ownerId) {
  const [rows] = await db.execute('SELECT * FROM pets WHERE owner_id = ? ORDER BY name', [ownerId]);
  return rows;
}
async function getOwnedPet(ownerId, petId) {
  const [rows] = await db.execute('SELECT * FROM pets WHERE owner_id = ? AND id = ?', [ownerId, petId]);
  return rows[0] || null;
}
async function updatePet(ownerId, id, data, image) {
  const [result] = await db.execute(
    'UPDATE pets SET name=?,species=?,breed=?,age=?,image=COALESCE(?,image) WHERE owner_id=? AND id=?',
    [data.pet_name || data.name, data.species, data.breed, Number(data.age), image || null, ownerId, id]);
  return result.affectedRows;
}
async function deletePet(ownerId, id) {
  const [result] = await db.execute('DELETE FROM pets WHERE owner_id=? AND id=?', [ownerId, id]);
  return result.affectedRows;
}
module.exports = { createPet, getPetsByOwner, getOwnedPet, updatePet, deletePet };
