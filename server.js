var logger = require('morgan'),
  cors = require('cors'),
  http = require('http'),
  express = require('express'),
  errorhandler = require('errorhandler'),
  dotenv = require('dotenv'),
  bodyParser = require('body-parser'),
  path = require('path'),
  mongoose = require('mongoose'),
  passport = require('passport');


var app = express();
var db = require('./lib/config/database');
var pass = require('./lib/config/passport');

mongoose.connect(db.url, function (err) {
  if (err) {
    console.log('MongoDB connection error', err);
  } else {
    console.log('MongoDB connection successful');
  }
});

dotenv.load();

// Parsers
// old version of line
// app.use(bodyParser.urlencoded());
// new version of line
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(express.logger('dev'));
  app.use(errorhandler())
}

app.use('/', express.static(path.join(__dirname, '/app/scripts')));
app.use('/scripts', express.static(__dirname + '/node_modules/'));
app.set('views', __dirname + '/app/views');


app.engine('.html', require('ejs').renderFile);

app.use(passport.initialize());
app.use(passport.session());

app.use(require('./lib/config/anonymous-routes'));
app.use(require('./lib/config/protected-routes'));
app.use(require('./lib/config/user-routes'));

var port = process.env.PORT || 8080;

http.createServer(app).listen(port, function (err) {
  console.log('listening in http://localhost:' + port);
});