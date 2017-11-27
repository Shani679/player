const express=require('express');
const app=express();
const playlistRouter=require('./routers/playlistRouter');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const async=require('async');
const passportConfig = require('./auth/passport-conf');
const env = require('./env/development-env');

passport.use(new LocalStrategy(passportConfig.login));
passport.serializeUser(passportConfig.serializeUser);
passport.deserializeUser(passportConfig.deserializeUser);

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());

app.use(express.static('public'));

app.use('/playlist', playlistRouter);

async.waterfall([
  callback => mongoose.connect(process.env.CONNECTION_STRING, {useMongoClient: true}, err => callback(err)),
  callback => app.listen(80, err => callback(err))
], (err, results) => {
  if (err) {
    return console.log(err);
  }
  return console.log(`Server up and running on port 80 and connected to mongo DB`);
});
