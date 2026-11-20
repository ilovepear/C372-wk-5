const db = require('../config/db');
async function create(ownerId, petId, serviceId, bookingDate) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [[pet]] = await connection.execute('SELECT id FROM pets WHERE id=? AND owner_id=? FOR UPDATE', [petId,ownerId]);
    const [[service]] = await connection.execute('SELECT id,price FROM services WHERE id=? AND is_active=1 FOR UPDATE', [serviceId]);
    if (!pet || !service) { await connection.rollback(); return { unavailable: true }; }
    // Price comes only from MySQL. Never trust a posted amount.
    const [booking] = await connection.execute(`INSERT INTO service_bookings
      (pet_id,service_id,booking_date,booked_price,booking_status) VALUES (?,?,?,?,'pending')`,
      [petId,serviceId,bookingDate,service.price]);
    await connection.execute(`INSERT INTO payments (booking_id,amount,payment_status)
      VALUES (?,?,'pending')`, [booking.insertId,service.price]);
    await connection.commit();
    return { bookingId: booking.insertId };
  } catch (error) {
    try { await connection.rollback(); } catch (rollbackError) { console.error('Rollback error:', rollbackError); }
    throw error;
  } finally { connection.release(); }
}
async function history(ownerId) {
  const [rows] = await db.execute(`SELECT b.id,b.booking_date,b.booked_price,b.booking_status,
    p.name AS pet_name,s.name AS service_name, pay.payment_status
    FROM service_bookings b JOIN pets p ON p.id=b.pet_id
    JOIN services s ON s.id=b.service_id
    LEFT JOIN payments pay ON pay.id=(SELECT MAX(pay2.id) FROM payments pay2 WHERE pay2.booking_id=b.id)
    WHERE p.owner_id=? ORDER BY b.created_at DESC,b.id DESC`, [ownerId]);
  return rows;
}
module.exports = { create, history };
