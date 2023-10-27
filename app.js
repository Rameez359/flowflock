var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

const database = require('./private/database/connectDb');
database.connect();

var app = express();
const corsOptions = {
  origin: 'http://example.com', // Replace with the actual origin you want to allow
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Enable cookies and authentication headers
  optionsSuccessStatus: 204, // Set the status code for successful preflight requests
  // Add more options as needed
};

app.use(cors(corsOptions));


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var flocksRouter = require('./routes/flocks');
var feedRouter = require('./routes/feed');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/flocks', flocksRouter);
app.use('/feed', feedRouter);



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
