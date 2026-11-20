const db = require('../config/db');
async function list(ownerId) {
  const [rows] = await db.execute(`SELECT r.*,p.name AS pet_name FROM care_reminders r
    JOIN pets p ON p.id=r.pet_id WHERE p.owner_id=? ORDER BY r.is_done ASC,r.due_date ASC,r.id DESC`, [ownerId]);
  return rows;
}
async function create(ownerId, petId, task, date) {
  const [result] = await db.execute(`INSERT INTO care_reminders(pet_id,task,due_date)
    SELECT id,?,? FROM pets WHERE id=? AND owner_id=?`, [task,date,petId,ownerId]);
  return result.affectedRows;
}
async function setDone(ownerId,id,done) {
  const [result] = await db.execute(`UPDATE care_reminders r JOIN pets p ON p.id=r.pet_id
    SET r.is_done=? WHERE r.id=? AND p.owner_id=?`,[done?1:0,id,ownerId]);
  return result.affectedRows;
}
async function remove(ownerId,id) {
  const [result] = await db.execute(`DELETE r FROM care_reminders r JOIN pets p ON p.id=r.pet_id
    WHERE r.id=? AND p.owner_id=?`,[id,ownerId]);
  return result.affectedRows;
}
module.exports = { list, create, setDone, remove };
