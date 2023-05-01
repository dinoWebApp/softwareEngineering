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
app.use(express.static(path.join(__dirname, 'pushlist/dist')));
let db;

MongoClient.connect(process.env.DB_URL, (err, client)=>{
  if (err) return console.log(err);
  db = client.db('se');
  http.listen(3000, () => {
    console.log('listening on *:3000');
  });
});

app.get('/', (req, res)=>{
  res.sendFile(path.join(__dirname, 'pushlist/dist/index.html'));
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

app.post('/api/sign-up', (req, res)=>{
  console.log(req.body);
  bcrypt.hash(req.body.pw, saltRounds, (err, hash)=>{
    db.collection('members').insertOne({
      id : req.body.id,
      pw : hash,
    }, (err, result)=>{
      if (err) console.log(err);
      res.send('sign-up success');
    });
  });
});

app.post('/api/login', passport.authenticate('local', {
  failureRedirect : '/api/loginFail',
}), (req, res)=>{
  console.log(req.body);
  db.collection('members').findOne({id : req.body.id}, (err, result)=>{
    if(err) console.log(err);
    res.send('success');
  });
});

app.get('/api/loginFail', (req, res)=>{
  res.send('login fail');
});

app.get('/api/sign-up/id-check', (req, res)=>{
  console.log(req.query.id);
  db.collection('members').findOne({id : req.query.id}, (err, result)=>{
    console.log(result);
    if(result) {
      res.send('existed');
    } else res.send('success');
  });
});

app.get('/api/login-check', loginCheck, (req, res)=>{
  res.send(req.user.id);
});
app.get('/api/', (req, res)=>{
  db.collection('members').find().toArray()
  .then(result=>{
    res.send(result);
  });
});

app.get('/api/logout', (req, res)=>{
  req.session.destroy();
  res.send('logout success');
});

app.get('*', (req, res)=>{
  res.sendFile(path.join(__dirname, 'pushlist/dist/index.html'));
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