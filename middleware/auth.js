function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/login');
}
function isAdmin(req, res, next) {
  if (req.session?.user?.role === 'admin') return next();
  return res.status(403).render('error', { title: 'Access denied', detail: 'Only administrators can view this page.' });
}
module.exports = { isLoggedIn, isAdmin };
