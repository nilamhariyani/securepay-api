const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const { Customer, Admin } = require('../models');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromHeader("authorization"),
};

const jwtVerify = async (payload, done) => {
  // console.log(payload)
  try {
    let user = '';
    if (payload.sub.role === 3) {
      user = await Customer.findById(payload.sub.user);
    } else {
      user = await Admin.findById(payload.sub.user);
    }
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};
