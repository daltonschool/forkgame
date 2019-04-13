(async function main() {
	const express = require("express")
	var bodyParser = require("body-parser")
	var cookieParser = require('cookie-parser');
	const app = express()
	app.use(bodyParser.urlencoded({ extended: false }))
	app.use(bodyParser.json())
	app.use(cookieParser());
	const port = process.env.PORT || 1337;

	const request = require('request-promise').defaults({ jar: true })

	const { prompt } = require('enquirer');

	var sqlite3 = require('sqlite3')
	var db = new sqlite3.Database("storage.db")

	const uuidv4 = require('uuid/v4');

	var fixSession = (req, res, next) => {
		let token;
		if (!req.cookies.token) {
			const genToken = uuidv4()
			res.cookie("token", genToken)
			db.run("INSERT INTO sessions (token, userId) VALUES (?, -1)", [genToken])
			token = genToken
		} else {
			token = req.cookies.token
		}
		req.token = token;
		next()
	}

	var getUserId = (req, callback) => {
		db.all("SELECT userId FROM sessions WHERE token = ?", req.token, (err, result) => {
			if (err) {
				callback(null, err)
				return
			}
			result ? callback(result[0].userId, null) : callback(-1, null)
		})
	}

	var checkLogin = (req, res, next) => {
		getUserId(req, (result, err) => {
			console.log(result)
			if (result != -1) {
				next()
			} else {
				res.status(401).json({
					status: "error",
					error: "unauthorized"
				})
			}
		})
	}

	app.use(fixSession)

	db.run("SELECT COUNT(*) FROM users", async (result, err) => {
		if (result && result.code == "SQLITE_ERROR") {
			console.log("Welcome to the fork game server!")
			console.log("Trying to set this up on a server and can't type? Run this locally then upload the generated storage.db file to the server.")
			console.log("To import users from the Dalton database, please enter a username and password to dalton.org")

			let loggedIn = false

			while (!loggedIn) {
				const response = await prompt([{
					type: 'input',
					name: 'username',
					message: 'What is your username? It should be in the form cXXyy.'
				},
				{
					type: 'password',
					name: 'password',
					message: 'What is your password? It is not stored or shared.'
				}]);
				console.log("Logging you in...")
				try {
					let req = await request({
						url: "https://dalton.myschoolapp.com/api/SignIn",
						method: "POST",
						json: {
							"From": "",
							"InterfaceSource": "WebApp",
							"Password": response.password,
							"Username": response.username,
						}
					})
					if (!req.LoginSuccessful) {
						console.log("The username or password you entered was invalid.")
					} else {
						console.log("Logged in!")
						loggedIn = true;
					}
				} catch (e) {
					console.log("There was an error logging you in.")
					let tryagain = await prompt({
						type: "toggle",
						name: "tryAgain",
						message: "Would you like to try again?"
					})
					if (!tryagain.tryAgain) {
						console.log("Goodbye.")
						return
					}
				}
			}

			grade = await prompt({
				type: 'autocomplete',
				name: 'grade',
				message: 'Which grade is playing?',
				limit: 5,
				suggest(input, choices) {
					return choices.filter(choice => choice.message.toUpperCase().startsWith(input.toUpperCase()));
				},
				choices: [
					"Kindergarten",
					"First",
					"Second",
					"Third",
					"Fourth",
					"Fifth",
					"Sixth",
					"Seventh",
					"Eighth",
					"Ninth",
					"Tenth",
					"Eleventh",
					"Twelfth"
				]
			})

			let peopleStr;
			try {
				peopleStr = await request(`https://dalton.myschoolapp.com/api/directory/directoryresultsget?directoryId=725&searchVal=&facets=1657_${grade.grade}&searchAll=false`)
			} catch (e) {
				console.log(e)
			}

			db.exec("CREATE TABLE sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, token TEXT, userId INTEGER)");
			db.exec("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, firstname TEXT, lastname TEXT, nickname TEXT, email TEXT, killedBy INTEGER, userLevel INTEGER, kills INTEGER)");

			let stmt = db.prepare("INSERT INTO users (firstname, lastname, nickname, email, killedBy, userLevel, kills) VALUES (?, ?, ?, ?, -1, 0, 0)");
			let people = JSON.parse(peopleStr)
			let emails = []
			for (id in people) {
				const p = people[id]
				emails.push(p.Email)
				stmt.run(p.FirstName, p.LastName, p.Nickname, p.Email)
			}

			adminSelect = await prompt({
				type: 'autocomplete',
				name: 'admin',
				message: 'Select a person to promote to administrator.',
				limit: 5,
				suggest(input, choices) {
					return choices.filter(choice => choice.message.toUpperCase().startsWith(input.toUpperCase()));
				},
				choices: emails
			})
			console.log(`Promoting ${adminSelect.admin} to administrator.`)
			let admin = adminSelect.admin.split(" ");
			db.run("UPDATE users SET userLevel = 2 WHERE email = ?", admin[0], admin[1])

			console.log("Setup is now complete. Yay")
		}
	})

	app.get("/api/stats", (req, res) => {
		db.all("SELECT users.id AS id, users.firstname AS firstname, users.lastname AS lastname, users.nickname AS nickname, users.kills AS kills, killers.id AS killer_id, killers.firstname AS killer_firstname, killers.nickname AS killer_nickname, killers.lastname AS killer_lastname, killers.kills AS killer_kills, killers.killedBy AS killer_killedBy FROM users LEFT JOIN users killers ON users.killedBy = killers.id ORDER BY users.killedby, users.kills DESC;", (err, rows) => {
			if (err) {
				console.log(err)
				res.status(500).json({
					status: "error",
					error: "internal server error",
				})
				return
			}
			let resp = []
			for (i in rows) {
				let r = rows[i]
				let user = {
					firstname: r.firstname,
					lastname: r.lastname,
					nickname: r.nickname,
					kills: r.kills,
					id: r.id,
					dead: !(r.killer_id == null),
					killer: {
						firstname: r.killer_firstname,
						lastname: r.killer_lastname,
						nickname: r.killer_nickname,
						id: r.killer_id,
						kills: r.killer_kills,
						dead: !(r.killer_killedBy == -1)
					}
				}
				resp.push(user)
			}
			res.json(resp)
		})
	})

	app.post("/api/findSomeoneToKill", (req, res) => {
		let query = req.body.query
		if (!query) {
			res.status(400).json({
				status: "error",
				error: "missing parameters"
			})
			return
		}
		if (query == "") {
			res.json([])
			return
		}
		let sqlQuery = `%${query}%`
		db.all("SELECT id, firstname, nickname, lastname FROM users WHERE killedBy = -1 AND (firstname LIKE ? OR lastname LIKE ? OR nickname LIKE ?)", [sqlQuery, sqlQuery, sqlQuery], (err, rows) => {
			if (err) {
				console.log(err)
				res.status(500).json({
					status: "error",
					error: "internal server error",
				})
				return
			}
			res.json(rows)
		})
	})

	app.use('/api/kill', checkLogin)
	app.post("/api/kill", (req, res) => {
		getUserId(req, (id, err) => {
			let player = req.body.player
			if (!req.body.player) {
				res.status(400).json({
					status: "error",
					error: "missing parameters"
				})
				return
			}
			db.all("SELECT killedBy FROM users WHERE id = ?", player, (err, killedBy) => {
				if (err) {
					console.log(err)
					res.status(500).json({
						status: "error",
						error: "internal server error",
					})
					return
				}
				if (killedBy.length == 0) {
					res.status(400).json({
						status: "error",
						error: "player not found"
					})
					return
				} else if (killedBy[0].killedBy != -1) {
					res.status(410).json({
						status: "error",
						error: "player already dead"
					})
					return
				}
				db.run("UPDATE users SET killedBy = ? WHERE id = ?", [id, player], (result, err) => {
					if (err) {
						console.log(err)
						res.status(500).json({
							status: "error",
							error: "internal server error",
						})
						return
					}
					db.run("UPDATE users SET kills = kills + 1 WHERE id = ?", id, (result, err) => {
						if (err) {
							console.log(err)
							res.json({
								status: "ok",
								warning: "kill count not updated"
							})
							return
						}

						res.json({
							status: "ok"
						})
					})
				})
			})
		})
	})

	app.get("/api/auth/me", (req, res) => {
		getUserId(req, (id, err) => {
			if (err) {
				console.log(err)
				res.status(500).json({
					status: "error",
					error: "internal server error",
				})
				return
			}

			if (id == -1) {
				res.status(401).json({
					status: "error",
					error: "signed out",
				})
			} else {
				db.all("SELECT users.id AS id, users.firstname AS firstname, users.lastname AS lastname, users.nickname AS nickname, users.kills AS kills, killers.id AS killer_id, killers.firstname AS killer_firstname, killers.lastname AS killer_lastname, killers.kills AS killer_kills, killers.killedBy AS killer_killedBy FROM users LEFT JOIN users killers ON users.killedBy = killers.id WHERE users.id = ?", id, (err, rows) => {
					if (err) {
						console.log(err)
						res.status(500).json({
							status: "error",
							error: "internal server error",
						})
						return
					}

					let r = rows[0]
					res.json({
						firstname: r.firstname,
						lastname: r.lastname,
						nickname: r.nickname,
						kills: r.kills,
						id: r.id,
						dead: !(r.killer_id == null),
						killer: {
							fistname: r.killer_firstname,
							lastname: r.killer_lastname,
							nickname: r.killer_nickname,
							id: r.killer_id,
							kills: r.killer_kills,
							dead: !(r.killer_killedBy == -1)
						}
					})
				})
			}
		})
	})

	app.post("/api/auth/logout", (req, res) => {
		db.run("UPDATE sessions SET userId = -1 WHERE token = ?", req.token, (result, err) => {
			if (err) {
				console.log(err)
				res.status(500).json({
					status: "error",
					error: "internal server error",
				})
				return
			}
			res.json({ status: "ok" })
		})
	})


	app.post("/api/auth/login", async (req, res) => {
		if (!req.body.username || !req.body.password) {
			res.status(400).json({
				status: "error",
				error: "missing parameters"
			})
		}
		let jar = request.jar()
		let login = await request({
			url: "https://dalton.myschoolapp.com/api/SignIn",
			method: "POST",
			jar: jar,
			json: {
				"From": "",
				"InterfaceSource": "WebApp",
				"Username": req.body.username,
				"Password": req.body.password,
			}
		})
		if (!login.LoginSuccessful) {
			res.status(401).json({
				status: "error",
				error: "login was unsuccessful"
			})
			return
		}
		let emailReq = await request({
			url: `https://dalton.myschoolapp.com/api/user/${login.CurrentUserForExpired}/?propertylist=Email`,
			method: "GET",
			jar: jar,
		})
		db.all("SELECT id FROM users WHERE email = ?", JSON.parse(emailReq).Email, (err, rows) => {
			if (err) {
				console.log(error)
				res.status(500).json({
					status: "error",
					error: "internal server error",
				})
				return
			} else if (rows == []) {
				res.status(401).json({
					status: "error",
					error: "account does not exit",
				})
				return
			}
			db.run("UPDATE sessions SET userId = ? WHERE token = ?", [rows[0].id, req.token], (result, err) => {
				if (err) {
					console.log(err)
					res.status(500).json({
						status: "error",
						error: "internal server error",
					})
					return
				}
				res.json({
					status: "ok"
				})
			})
		})
	})

	app.use('/', express.static('site'))
	app.use('/public', express.static('public'))

	app.listen(port, () => console.log(`Fork game listening on port ${port}!`))
})()
