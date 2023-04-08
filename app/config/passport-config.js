const passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
require('dotenv').config();
const {users} = require('./sequelize');

var opts = {
    jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey : process.env.JWT_SECRET_KEY
}

passport.use(new JwtStrategy(opts, function(jwt, done) {
    users.findOne({where:{id: jwt.id}})
    .then((user)=>{
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    }).catch(err=>{
        return done(err, false);
    })
}));

passport.checkAuthentication = passport.authenticate('jwt', { session: false });

module.exports = passport;