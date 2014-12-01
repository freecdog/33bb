var express = require('express');
var router = express.Router();

var path = require('path');
var BB = require(path.join(__dirname, '..', 'public', 'javascripts', 'BB', 'index.js'));

//var Datatone = require('../public/javascripts/Datatone.js').Datatone;
var Datatone = BB.Datatone;
var data = new Datatone();

/* GET home page. */
router.get('/', function(req, res) {
    //res.render('index', { title: '123' });
    var title = "Calculation haven't started yet";
    if (data.currentT) title = data.currentT.toFixed(3);
    res.render('index', { title: title });
});

module.exports = router;
