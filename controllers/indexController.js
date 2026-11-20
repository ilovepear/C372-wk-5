const db = require('../config/db');
const reminders = require('../models/reminderModel');
const { asyncHandler } = require('../helpers/http');
const index = (_req,res) => res.render('index');
const dashboard = asyncHandler(async (req,res) => {
  const id = req.session.user.id;
  const [[petStats],[journalStats],[bookingStats],care] = await Promise.all([
    db.execute('SELECT COUNT(*) AS total FROM pets WHERE owner_id=?',[id]),
    db.execute('SELECT COUNT(*) AS total FROM journal j JOIN pets p ON p.id=j.pet_id WHERE p.owner_id=?',[id]),
    db.execute('SELECT COUNT(*) AS total FROM service_bookings b JOIN pets p ON p.id=b.pet_id WHERE p.owner_id=?',[id]),
    reminders.list(id)
  ]);
  res.render('dashboard', {
    petCount: petStats[0].total,
    journalCount: journalStats[0].total,
    bookingCount: bookingStats[0].total,
    pendingReminders: care.filter(item=>!item.is_done).slice(0,4)
  });
});
module.exports = { index,dashboard };
