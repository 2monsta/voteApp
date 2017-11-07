var express = require('express');
var router = express.Router();
var mysql = require("mysql");
var config = require("../config/config"); //sensative data
var bcrypt = require("bcrypt-nodejs"); //hash user password
var multer = require("multer");


var connection = mysql.createConnection(config.db);
connection.connect((error)=>{
	if(error){
		throw error; //if there's an error let me know and stop
	}
});
//================== HOME PAGE==================
router.get('/', function(req, res, next) {
	if(req.session.name == undefined){
		res.redirect("/login?msg=loginfirst");
		return;
	}
	function getNBA(){
		return new Promise((resolve, reject)=>{
			// var selectQuery = "select * from nba;";
			var selectSpecificNBA = `
				Select * from nba where id not in(
					select image_id from votes where user_id = ?
				);
			`;
			connection.query(selectSpecificNBA, [req.session.uid], (error, results, field)=>{
				if(error){
					reject(error);
				}else{
					if(results.length ==0){
						resolve("done");
					}else{
						var rand = Math.floor(Math.random() * results.length);
						resolve(results[rand]);
					}
				}
			});
		});
	}
	// a function that returns a promise is easier to chain 
	getNBA().then((teams)=>{
		if(teams == "done"){
			res.redirect("/standings?msg=finished");
		}else{
			res.render("index",{
				name: req.session.name,
				team: teams
			});
		}
	}).catch((error)=>{
		res.json(error);
	});
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
					req.session.uid = results[0].id;
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

// LOGOUT
router.get("/logout", (req,res,next)=>{
	req.session.destroy();
	res.redirect("/login");
});


// Voting process
router.get("/vote/:direction/:teamID", (req,res,send)=>{
	// res.json(req.params);
	var teamID = req.params.teamID;
	var direction = req.params.direction;
	var insertTo = new Promise((resolve, reject)=>{
		var insertVoteQuery="insert into votes(image_id, vote_direction, user_id) values(?, ?, ?);";
		connection.query(insertVoteQuery, [teamID, direction, req.session.uid], (error, results, field)=>{
			if(error){
				reject(error);
			}else{
				resolve(results);
			}
		});
	});
	insertTo.then((e)=>{
		res.redirect("/")
	}).catch((e)=>{
		res.json(e);
	})
});


// STANDINGS

router.get("/standings", (req, res, next)=>{
	var standings = new Promise((resolve, reject)=>{
		const standingsQuery = `select votes.image_id,
		sum(if(votes.vote_direction='up', 1, 0)) as upVotes, 
		sum(if(votes.vote_direction='down', 1, 0)) as downVotes, 
		sum(if(votes.vote_direction='up', 1, -1)) as total,
		nba.title, nba.imageUrl from votes
		inner join nba
		on votes.image_id = nba.id
		group by image_id;`;
		connection.query(standingsQuery, (error, results)=>{
			if(error){
				reject(error);
			}else{
				console.log(results);
				resolve(results);
				results.map((teams,i)=>{
					if(teams.upVotes /(teams.upVotes + teams.downVotes)>.8){
						results[i].cls = "top-rated best";
						resolve(results);
					}else if(teams.upVotes /(teams.upVotes + teams.downVotes)<=.5){
						results[i].cls = "worst-rated sucks";
						resolve(results);
					}else{
						results[i].cls = "middle";
						resolve(results);
					}
				})
			}
		})
	});

	standings.then((result)=>{
		console.log(result);
		res.render("standings", {
			standingsResults:result
		});
	}).catch((error)=>{
		console.log(error);
	})
})

router.post('/uploadTeam', (req, res)=>{
	res.render("upload");
});

module.exports = router;
