require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  name: 'petcare.sid',
  secret: process.env.SESSION_SECRET || 'development-only-change-in-env',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 1000 * 60 * 60 * 4 }
}));
app.use(flash());
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.messages = req.flash('success');
  res.locals.errors = req.flash('error');
  res.locals.today = require('./helpers/validation').todaySingapore();
  res.locals.money = amount => Number(amount || 0).toFixed(2);
  next();
});
app.use(require('./routes/indexRoutes'));
app.use(require('./routes/authRoutes'));
app.use(require('./routes/adminRoutes'));
app.use(require('./routes/petRoutes'));
app.use(require('./routes/journalRoutes'));
app.use(require('./routes/serviceRoutes'));
app.use(require('./routes/reminderRoutes'));
app.use(require('./routes/paymentRoutes'));
app.use((req, res) => res.status(404).render('error', { title: 'Page not found', detail: 'This page does not exist.' }));
app.use((err, req, res, next) => {
  console.error('Application error:', err);
  if (res.headersSent) return next(err);
  if (err.code === 'LIMIT_FILE_SIZE' || /Upload a JPG/.test(err.message)) {
    req.flash('error', err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 2 MB or smaller.' : err.message);
    return res.redirect(req.get('referer') || '/journals');
  }
  return res.status(500).render('error', { title: 'Something went wrong', detail: 'Please check your database settings or try again.' });
});
if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`PetCareApp running at http://localhost:${port}`));
}
module.exports = app;
