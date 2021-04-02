const writePlayers = (players) => {
	const parent = document.querySelector("#listPlayers")
	players.forEach((pl) => {
		const color = pl.color

		if (!Array.from(parent.children).some((e) => e.id === pl.color)) {
			const el = document.createElement("li")
			el.id = color
			el.innerText = `${pl.name}: ${pl.score} points`
			el.style.color = color
			parent.appendChild(el)
		} else {
			const el = document.getElementById(color)
			pl.hp <= 0
				? (el.innerText = `${pl.name} s'est fait plumé avec ${pl.score} points`)
				: (el.innerText = `${pl.name} : ${pl.score} points`)
		}
	})
}

const askName = () => {
	let name = prompt("whats your name ?")
	socket.emit("name", name)
}

socket.on("askName", askName)
