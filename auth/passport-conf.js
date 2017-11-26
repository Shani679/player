const mongoose = require('mongoose');
const userSchema = require('../model/user.model');
const User = mongoose.model('User', userSchema);

const passportHandlers = {
  login: (username, password, done) => {
    User.findOne({username}, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {message: 'User not found'});
      }
      if (user.password !== password) {
        return done(null, false, {message: 'Incorrect password'});
      }
      return done(null, user);
    });
  },
  serializeUser: (user, done) => done(null, user),
  deserializeUser: (user, done) => done(null, user),
  validatedUser: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.sendStatus(401);
  }
}

module.exports = passportHandlers;