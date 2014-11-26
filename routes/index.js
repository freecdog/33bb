var express = require('express');
var router = express.Router();

var Datatone = require('../public/javascripts/Datatone.js').Datatone;
var data = new Datatone();

/* GET home page. */
router.get('/', function(req, res) {
    //res.render('index', { title: '123' });
    var title = "Calculation haven't started yet";
    if (data.currentT) title = data.currentT.toString();
    res.render('index', { title: title });
});

module.exports = router;
