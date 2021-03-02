var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var socket = require('socket.io');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var io = socket();
app.io = io;
const users = {};
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection',function(socket){
    socket.on('new-user-joined',function(name){
       users[socket.id] = name;
       socket.broadcast.emit('user-joined',name);
    });
    socket.on('send',function(message){
         socket.broadcast.emit('receive',{message: message , name: users[socket.id]});
    });
    socket.on('disconnect',function(message){
      socket.broadcast.emit('leave',users[socket.id]);
      delete users[socket.id];
  });
});


app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;