const passport = require('passport');
const httpStatus = require('http-status');
const AppError = require('../utils/AppError');
const { roleRights } = require('../config/roles');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  // console.log(err)
  console.log(user)
  if (err || info || !user) {
    return reject(new AppError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;
  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every(requiredRight => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new AppError(httpStatus.FORBIDDEN, 'Not allowed to do this action.'));
    }
  }
  resolve();
};

const auth = (...requiredRights) => async (req, res, next) => {
  // console.log("getInvited requiredRights :::, ", req)
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false })(req, res, next);
  })
    .then(() => next())
    .catch(err => next(err));
};

module.exports = auth;
