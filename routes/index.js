var express = require('express');
var router = express.Router();
var mysql = require("mysql");
var config = require("../config/config"); //sensative data
var bcrypt = require("bcrypt-nodejs"); //hash user password

var connection = mysql.createConnection(config.db);
connection.connect((error)=>{
	if(error){
		throw error; //if there's an error let me know and stop
	}
});
//================== HOME PAGE==================
router.get('/', function(req, res, next) {
	// var selectQuery = "select * from voteUsers;";
	// connection.query(selectQuery, (error, results, field)=>{
	// 	res.render("index", {result:results});
	// });
	if(req.session.name != undefined){
		console.log(`welcome, ${req.session.name}`)
	}
	const getBands = new Promise((resolve, reject)=>{
		var selectQuery = "select * from bands;";
		connection.query(selectQuery, (error, results, field)=>{
			if(error){
				reject(error);
			}else{
				var rand = Math.floor(Math.random() * results.length);
				resolve(results[rand]);
			}
		});
	});
	getBands.then((bandObj)=>{
		res.render("index",{
			name: req.session.name,
			band: bandObj
		});
	}).catch((error)=>{
		res.json(error);
	})
});
// ==================REGISTER==================
router.get("/register", (req,res,next)=>{
	res.render("register");
});

router.post("/registerProcess", (req, res, next)=>{
	// res.json(req.body);
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	const selectQuery = "select * from users where email = ?;";
	connection.query(selectQuery, [email], (error, results, field)=>{
		if(results.length !=0){
			res.render("/register?msg=Registered");
		}else{
			// Hash the password first
			var hash = bcrypt.hashSync(password);
			var insertQuery = "insert into users (name, email, password) values (?,?,?);";
			connection.query(insertQuery, [name, email, hash], (error, results, field)=>{
				if(error){
					throw error;
				}else{
					res.redirect("/?msg=registered");
				}
			});
		}
	});
});


// ==================LOGIN==================
router.get("/login", (req, res,next)=>{
	res.render("login");
});

router.post("/loginProcess", (req, res, next)=>{
	// res.json(req.body);
	var email = req.body.email;
	var password = req.body.password; // english password from users

	var selectQuery ="select * from users where email = ?;";
	connection.query(selectQuery, [email], (error, results,field)=>{
		if(error){
			throw error;
		}else{
			if(results.length ==0){
				// not in the database
				res.redirect("/login?msg=badUser");
			}else{
				// compare sync to check the email and pass
				var passwordMatch = bcrypt.compareSync(password, results[0].password);
				if(passwordMatch){
					// user in db, log them in
					req.session.name = results[0].name;
					req.session.id = results[0].id;
					req.session.id = results[0].email;
					res.redirect("/");
				}else{
					// user in db password is bad
					res.redirect("/login?msg=badpass");
				}
			}
		}
	});
});

module.exports = router;
