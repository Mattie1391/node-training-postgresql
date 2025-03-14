const appError = require('../utils/appError')

module.exports = (req, res, next) => {
  // 401, '使用者尚未成為教練'
  if (!req.user.role || req.user.role !== 'COACH') { // 這裡的 req.user 是從 isAuth.js 的 req.user 來的
    next(appError(401, '使用者尚未成為教練'))
    return;
  } next()
}