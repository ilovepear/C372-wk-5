function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
function notice(req, type, message) { req.flash(type, message); }
module.exports = { asyncHandler, notice };
