const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http').createServer(app);
const MongoClient = require('mongodb').MongoClient;
const MongoStore = require('connect-mongo');
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bcrypt = require('bcryptjs');
const saltRounds = 12;
require('dotenv').config();


const io = require("socket.io")(http, {
  cors: {
    credentials: true,
  },
  allowEIO3: true,
});
app.use(session({
  secret : 'secretcode',
  resave : true,
  saveUninitialized : false,
  store : new MongoStore({mongoUrl : process.env.DB_URL}),
  cookie : {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.json());
app.use(cors());
let db;

MongoClient.connect(process.env.DB_URL, (err, client)=>{
  if (err) return console.log(err);
  db = client.db('se');
  http.listen(8080, () => {
    console.log('listening on *:8080');
  });
});



io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join', (data)=>{
    console.log('join ' + data);
    socket.join(data);
  });

  socket.on('push', (data) => {
    console.log(data);
    io.to(data.sendTo).emit('push', data.sendFrom);
  });
  socket.on('leave', (data)=>{
    console.log('leave ' + data);
    socket.leave(data);
  });
  
});

app.post('/signUp', (req, res)=>{
  console.log(req.body);
  db.collection('members').findOne({nickName : req.body.nickName})
  .then(result=>{
    if(result) {
      res.send('nick existed');
      throw new Error('nick fail');
    }
    else {
      return db.collection('members').findOne({id : req.body.id})
    }
  })
  .then(result=>{
    if(result) {
      res.send('id existed');
      throw new Error('id fail');
    }
    else {
      return bcrypt.hash(req.body.pw, saltRounds);
    }
  })
  .then(hash=>{
    return db.collection('members').insertOne({
      nickName : req.body.nickName,
      id : req.body.id,
      pw : hash,
      category : req.body.category
    });
  })
  .then(()=>{
    res.send('signUp success');
  })
  .catch(err=>{
    console.log(err);
  });
});


app.post('/login', passport.authenticate('local', {
  failureRedirect : '/loginFail',
}), (req, res)=>{
  console.log(req.body);
  db.collection('members').findOne({id : req.body.id}, (err, result)=>{
    if(err) console.log(err);
    res.send('login success');
  });
});

app.get('/loginFail', (req, res)=>{
  res.send('login fail');
});



app.get('/loginCheck', loginCheck, (req, res)=>{
  res.send(req.user.id);
});

app.get('/memberList', (req, res)=>{
  db.collection('members').find().toArray()
  .then(result=>{
    res.send(result);
  });
});

app.get('/logout', (req, res)=>{
  req.session.destroy();
  res.send('logout success');
});





passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true,
  passReqToCallback: false,
}, (inputId, inputPw, done)=>{
  console.log(inputId, inputPw);
  db.collection('members').findOne({id : inputId}, (err, result)=>{
    if(err) return done(err);
    console.log(result);
    if(!result) return done(null, false, {message : 'id fail'});
    bcrypt.compare(inputPw, result.pw, (err, isMatch)=>{
      if (err) return done(err);
      if (isMatch) {
        return done(null, result);
      }else{
        return done(null, false, {message : 'password fail'});
      }
    });
  });
}));

passport.serializeUser((user, done)=>{
  done(null, user.id);
});
passport.deserializeUser((id, done)=>{
  db.collection('members').findOne({id : id}, (err, result)=>{
    done(null, result);
  });
});

function loginCheck(req, res, next) {
  if (req.user) {
    next();
  }else {
    res.send('not login');
  }
}