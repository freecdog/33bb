var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var clientCalc = require('./routes/clientCalc');
var bblClientCalc = require('./routes/BBLclientCalc');
var calcTime = require('./routes/calcTime');
var memoutRouter = require('./routes/memout');
var filesList = require('./routes/filesList');
var restartServer = require('./routes/restartServer');

var crypto = require('crypto');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));

// default limitation to 1mb
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
// special limit definition (413 html error)
app.use(bodyParser.json({limit: '500mb'}));
app.use(bodyParser.urlencoded({limit: '500mb', extended: true}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/calc', clientCalc);
app.use('/c', bblClientCalc);
app.use('/calcTime', calcTime);
app.use('/memout', memoutRouter);
app.use('/restartServer', restartServer);
app.use('/filesList', filesList);

app.getHash = function(password){
    var hash = crypto.createHash('sha512');
    hash.update(password, 'utf8');

    return hash.digest('base64');
};

//var MatMult = require(path.join(__dirname, 'public', 'javascripts', 'MatMult.js'));
//var numbers = require('numbers');
//console.log(1, numbers.basic.sum([1,2,3]));
//console.log(2, numbers.matrix.multiply([[2,3]], [[4],[5]]));
//console.log(3, numbers.matrix.multiply([[2],[3]], [[4,5]]));
//var Complex = numbers.complex;
//console.log(4, new Complex(-5, -6));
//console.log(5, numbers.matrix.scalarSafe([[1,2],[3,4]], 3));

var BB = require(path.join(__dirname, 'public', 'javascripts', 'BB', 'index.js'));
//var BB = require('BB');

var BBup = BB.BBup;
//var BBup = require(path.join(__dirname, 'public', 'javascripts', 'BBup.js'));
//BBup.run();

app.use('/runcalc', function(req, res){
    BBup.run({});
    res.redirect("/");
});

var Datatone = BB.Datatone;
//var Datatone = require(path.join(__dirname, 'public', 'javascripts', 'Datatone.js')).Datatone;
var data = new Datatone();
app.use('/stopcalc', function(req, res){
    data.breakCalculation = true;

    res.redirect("/");
});

app.use('/t', function(req, res){
    res.render("t");
});
app.use('/bb', function(req, res){
    res.render("bb", { host: req.headers.host});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
