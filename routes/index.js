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
//================== HOME PAGE==================
router.get('/', function(req, res, next) {
	var selectQuery = "select * from voteUsers;";
	connection.query(selectQuery, (error, results, field)=>{
		res.render("index", {result:results});
	});
});
// ==================REGISTER==================
router.get("/register", (req,res,next)=>{
	res.render("register");
});

router.post("/registerProcess", (req, res, next)=>{
	res.json(req.body);
});


// ==================LOGIN==================
router.get("/login", (req, res,next)=>{
	res.render("login");
});

router.post("/loginProcess", (req, res, next)=>{
	res.json(req.body);
});

module.exports = router;
