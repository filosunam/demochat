'use strict';

var requirejs = require('requirejs');

requirejs(['express'], function (express) {

  var app     = express(),
      //server  = app.listen(process.env.PORT || config.port),
      server  = app.listen(3000),
      io      = require('socket.io').listen(server);

  // all environments
  app.configure(function () {
    app.use(express.query());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());
    app.use(express.session({
      secret: 'P=~g8+Cf{Lz&HO,P',
      cookie: { maxAge: 18000000 }
    }));

    // compiling less files
    app.use(require('less-middleware')({
      src: __dirname + '/public',
      yuicompress: true
    }));

    // ejs for main file
    app.set("view engine", "ejs");
    app.set('views', __dirname + '/app/views');

    // static files
    app.use(express.static(__dirname + '/public'));
  });

  // development
  app.configure('development', function () {
    app.use(express.logger('dev'));
    app.use(express.errorHandler());
  });

  // production
  app.configure('production', function () {
    app.use(express.logger());
    app.enable('view cache');
  });

  // router
  app.use(app.router);

  // main route
  app.get('/', function (req, res) {
    res.render('index');
  });

  var users = 0;

  io.sockets.on('connection', function (socket) {
    
    users++;
    io.sockets.emit("connected", { users: users });

    socket.emit('message', { message: '¡Bienvenido a la sala de Servicios Escolares!' });
    socket.on('send', function (data) {
      io.sockets.emit('message', {
        date: new Date(),
        message: data.message
      });
    });

    socket.on('disconnect', function(){
      users--;
      io.sockets.emit("connected", { users: users });
    });

  });

});
