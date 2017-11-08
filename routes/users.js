var express = require('express');
var router = express.Router();
var mysql = require("mysql");
var config = require("../config/config"); 
var bcrypt = require("bcrypt-nodejs");



var connection = mysql.createConnection(config.db);
connection.connect((error)=>{
	if(error){
		throw error; //if there's an error let me know and stop
	}
});
/* GET users listing. */
router.get('/', function(req, res, next) {
	if(req.session.name == undefined){
		res.redirect("/login");
	}else{
		var name = req.session.name;
		var email = req.session.email;
		res.render("users", {
			name: name,
			email: email
		})
	}

});


router.post("/userProcess", (req, res, next)=>{
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	if(password = ""){
		var updateQuery = "update users set name = ?, email = ? where id = ?;";
		var queryParams = [name, email, req.session.uid];
	}else{
		var updateQuery = "update users set name = ?, email = ?, password = ? where id = ?;"
		var hash = bcrypt.hashSync(password);
		var queryParams = [name, email, hash, req.session.uid];
		connection.query(updateQuery, [queryParams], (error, results)=>{
			res.redirect("/");
		});
	}
})
module.exports = router;
