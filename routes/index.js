var express = require('express');
var router = express.Router();
var mysql = require("mysql");
var config = require("../config/config");

var connection = mysql.createConnection(config.db);
connection.connect((error)=>{
	if(error){
		console.log(error);
	}
});

/* GET home page. */
router.get('/', function(req, res, next) {
	var selectQuery = "select * from voteUsers;";
	connection.query(selectQuery, (error, results, field)=>{
		res.render("index", {result:results});
	})
});

module.exports = router;
