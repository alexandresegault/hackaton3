const socketio = require("socket.io")

module.exports = function (server) {
	// io server
	const io = socketio(server)

	// game state (players list)
	const players = {}
	let bullets = []

	io.on("connection", function (socket) {
		players[socket.id] = {
			x: 5,
			y: 5,
			size: 50,
			speed: 2,
			color: "#" + (((1 << 24) * Math.random()) | 0).toString(16),
			score: 0,
			name: "",
			hpMax: 50,
			hp: 50,
			dead: false,
			id: socket.id,
		}

		// CHAT PART
		socket.emit("askName") // ASK TO PLAYER A NAME

		socket.on("name", (name) => {
			players[socket.id].name = name //GIVE NAME CHOOSEN TO PLAYER[SOCKET.ID]
		})
		// PLAYERS MOOVES
		socket.on("move left", function () {
			if (players[socket.id].dead) return
			if (players[socket.id].x >= 2) {
				players[socket.id].left = true
			} else {
				players[socket.id].left = false
			}
		})
		socket.on("move up", function () {
			if (players[socket.id].dead) return
			if (players[socket.id].y >= 2) {
				players[socket.id].up = true
			} else {
				players[socket.id].up = false
			}
		})
		socket.on("move right", function () {
			if (players[socket.id].dead) return
			if (players[socket.id].x <= 888) {
				players[socket.id].right = true
			} else {
				players[socket.id].right = false
			}
		})
		socket.on("move down", function () {
			if (players[socket.id].dead) return
			if (players[socket.id].y <= 630) {
				players[socket.id].down = true
			} else {
				players[socket.id].down = false
			}
		})
		socket.on("stop left", function () {
			players[socket.id].left = false
		})
		socket.on("stop up", function () {
			players[socket.id].up = false
		})
		socket.on("stop right", function () {
			players[socket.id].right = false
		})
		socket.on("stop down", function () {
			players[socket.id].down = false
		})

		// PLAYER ACTIONS
		socket.on("mousedown", (x, y) => {
			if (players[socket.id].dead) return
			const angle = Math.atan2(
				x - players[socket.id].x,
				y - players[socket.id].y
			)
			bullets.push({
				shooterId: socket.id,
				x: players[socket.id].x + 10,
				y: players[socket.id].y + 10,
				velocityX: Math.sin(angle) * 4,
				velocityY: Math.cos(angle) * 4,
				size: 40,
				color: players[socket.id].color,
				collisioned: false,
			})
		})

		socket.on("disconnect", function () {
			console.log("user disconnected")
			delete players[socket.id]
		})
		function update() {
			// bullets move : calculate new position
			bullets.forEach((bullet) => {
				bullet.x += bullet.velocityX
				bullet.y += bullet.velocityY
				// audioJet.play()
			})
			//  player moves
			for (const id in players) {
				if (Object.hasOwnProperty.call(players, id)) {
					if (players[id].left) players[id].x -= players[id].speed
					if (players[id].right) players[id].x += players[id].speed
					if (players[id].up) players[id].y -= players[id].speed
					if (players[id].down) players[id].y += players[id].speed
				}
			}

			//detect collisions
			for (let i = 0; i < bullets.length; i++) {
				for (const id in players) {
					if (Object.hasOwnProperty.call(players, id)) {
						if (
							!players[id].dead &&
							id !== bullets[i].shooterId &&
							bullets[i].x > players[id].x &&
							bullets[i].x < players[id].x + players[id].size &&
							bullets[i].y > players[id].y &&
							bullets[i].y < players[id].y + players[id].size
						) {
							io.sockets.emit(
								"colision",
								players[id].x + players[id].size / 2,
								players[id].y + players[id].size / 2
							)
							players[bullets[i].shooterId].score += 20
							players[id].hp = players[id].hp - 5 >= 0 ? players[id].hp - 5 : 0
							if (players[id].hp === 0) {
								io.to(id).emit("dead")
								players[id].dead = true
							}

							bullets[i].collisioned = true
							// audioColision.play();
						}
					}
				}
			}
			//remove collisionned bullets
			// update player scores

			// delete bullets out of map
			bullets = bullets.filter(
				(bullet) =>
					!bullet.collisioned &&
					bullet.x >= 0 &&
					bullet.y >= 0 &&
					bullet.x < 2000 &&
					bullet.y < 2000
			)

			io.emit("lists", Object.values(players), Object.values(bullets))
		}

		setInterval(update, 1000 / 30)
	})
}
