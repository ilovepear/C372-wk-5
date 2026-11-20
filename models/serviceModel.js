const db = require('../config/db');
async function active() {
  const [rows] = await db.execute('SELECT id,name,price FROM services WHERE is_active=1 ORDER BY name');
  return rows;
}
module.exports = { active };
