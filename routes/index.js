var express = require('express');
var router = express.Router();

var Datatone = require('../public/javascripts/Datatone.js').Datatone;
var data = new Datatone();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: data.currentT.toString() });
});

module.exports = router;
