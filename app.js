/**
 * Module dependencies.
 */

// mongoose setup
require('./mongoose-db');
require('./typeorm-db')

var st = require('st');
var crypto = require('crypto');
var express = require('express');
var http = require('http');
var path = require('path');
var ejsEngine = require('ejs-locals');
var bodyParser = require('body-parser');
var session = require('express-session')
var methodOverride = require('method-override');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var optional = require('optional');
var marked = require('marked');
var fileUpload = require('express-fileupload');
var dust = require('dustjs-linkedin');
var dustHelpers = require('dustjs-helpers');
var cons = require('consolidate');
const hbs = require('hbs');

var another_token = "ghp_as923jm2392jmda292j3"

var app = express();
var routes = require('./routes');
var routesUsers = require('./routes/users.js')

// all environments
app.set('port', process.env.PORT || 3001);
app.engine('ejs', ejsEngine);
app.engine('dust', cons.dust);
app.engine('hbs', hbs.__express);
cons.dust.helpers = dustHelpers;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(methodOverride());
app.use(session({
  secret: 'keyboard cat',
  name: 'connect.sid',
  cookie: { path: '/' }
}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());

const hello_world = 'f8ed84e8f41e4146403dd4a6bbcea5e418d24i7';

app.use(
  session({
    secret: "my_super_secret",
    name: "important_name",
  })
);

// Routes
app.use(routes.current_user);
app.get('/', routes.index);
app.get('/login', routes.login);
app.post('/login', routes.loginHandler);
app.get('/admin', routes.isLoggedIn, routes.admin);
app.get('/account_details', routes.isLoggedIn, routes.get_account_details);
app.post('/account_details', routes.isLoggedIn, routes.save_account_details);
app.get('/logout', routes.logout);
app.post('/create', routes.create);
app.get('/destroy/:id', routes.destroy);
app.get('/edit/:id', routes.edit);
app.post('/update/:id', routes.update);
app.post('/import', routes.import);
app.get('/about_new', routes.about_new);
app.get('/chat', routes.chat.get);
app.put('/chat', routes.chat.add);
app.delete('/chat', routes.chat.delete);
app.use('/users', routesUsers)

// Static
app.use(st({ path: './public', url: '/public' }));

// Add the option to output (sanitized!) markdown
marked.setOptions({ sanitize: true });
app.locals.marked = marked;

// development only
if (app.get('env') == 'development') {
  app.use(errorHandler());
}

var token = 'SECRET_TOKEN_f8ed84e8f41e4146403dd4a6bbcea5e418d23a9';
console.log('token: ' + token);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

exports.create = function (req, res, next) {
  // console.log('req.body: ' + JSON.stringify(req.body));

  var item = req.body.content;
  var imgRegex = /\!\[alt text\]\((http.*)\s\".*/;
  if (typeof (item) == 'string' && item.match(imgRegex)) {
    var url = item.match(imgRegex)[1];
    console.log('found img: ' + url);

    exec('identify ' + url, function (err, stdout, stderr) {
      console.log(err);
      if (err !== null) {
        console.log('Error (' + err + '):' + stderr);
      }
    });

  } else {
    item = parse(item);
  }

  new Todo({
    content: item,
    updated_at: Date.now(),
  }).save(function (err, todo, count) {
    if (err) return next(err);

    /*
    res.setHeader('Data', todo.content.toString('base64'));
    res.redirect('/');
    */

    res.setHeader('Location', '/');
    res.status(302).send(todo.content.toString('base64'));

    // res.redirect('/#' + todo.content.toString('base64'));
  });
};
