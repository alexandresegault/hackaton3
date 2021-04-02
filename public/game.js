const socket = io();

let players = [];
let bullets = [];
let dead = false;

const ctx = canvas.getContext("2d");

const audioJet = new Audio(`sounds/jet.mp3`);
audioJet.muted = false;

const audioColision = new Audio(`sounds/colision.mp3`);
audioColision.muted = false;
audioColision.volume = 0.1;

const audioMusic = new Audio(`sounds/musicCountry.mp3`);
audioMusic.loop = true;
audioMusic.volume = 0.2;
audioMusic.muted = false;

const enableMute = () => {
  audioMusic.muted = !audioMusic.muted;
  audioColision.muted = !audioColision.muted;
  audioJet.muted = !audioJet.muted;
};

function drawPlayers() {
  players.forEach(function ({ x, y, size, color, name, hpMax, hp, dead }) {
    // LIFE BAR MAX HP
    ctx.beginPath();
    ctx.rect(x, y + 60, hpMax, 10);
    ctx.fillStyle = "red";
    ctx.fill();
    // LIFE BAR ACTUAL HP
    ctx.beginPath();
    ctx.rect(x, y + 60, hp, 10);
    ctx.fillStyle = "green";
    ctx.fill();
    // HITBOX PLAYER
    ctx.beginPath();
    ctx.rect(x, y, size, size);
    ctx.fillStyle = color;
    ctx.font = "14px sans-serif";
    ctx.fillText(name, x, y - 5);
    ctx.fill();
    if (dead) {
      let image = document.getElementById("chick-dead");
      ctx.drawImage(image, x, y, 50, 50);
    } else {
      let image = document.getElementById("poulet");
      ctx.drawImage(image, x, y, 50, 50);
    }
  });
}

function drawBullets() {
  bullets.forEach(function ({ x, y, size, color }) {
    ctx.beginPath();
    let image = document.getElementById("fried-chicken");
    ctx.drawImage(image, x, y, size, size);
    ctx.fill();
  });
}
const drawGameOver = () => {
  ctx.font = "64px  Alice";
  ctx.fillText("GAME OVER", 470 / 2, 340 / 2);
};

socket.on("lists", function (listPlayers, listBullets) {
  // if (listPlayers.length != players.length)
  writePlayers(listPlayers);
  players = listPlayers;
  bullets = listBullets;
});
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // 1.
  movePlayer();
  drawPlayers(); // 2.
  drawBullets();
  if (dead) drawGameOver();
  requestAnimationFrame(update); // 3.
}
// first call
requestAnimationFrame(update);
// PLAYER MOOVES
const keyboard = {};

window.onkeydown = function (e) {
  keyboard[e.keyCode] = true;
};

window.onkeyup = function (e) {
  delete keyboard[e.keyCode];
};

function movePlayer() {
  socket.emit(keyboard[37] ? "move left" : "stop left");
  socket.emit(keyboard[38] ? "move up" : "stop up");
  socket.emit(keyboard[39] ? "move right" : "stop right");
  socket.emit(keyboard[40] ? "move down" : "stop down");
}

// PLAYER ACTIONS

function getMousePos(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

canvas.addEventListener(
  "mousedown",
  function (evt) {
    const mousePos = getMousePos(canvas, evt);
    socket.emit("mousedown", mousePos.x, mousePos.y);
    audioJet.currentTime = 0;
    audioJet.play();
    audioMusic.play();
  },
  false
);

socket.on("colision", (x, y) => {
  audioColision.currentTime = 0;
  audioColision.play();
  // splash(x, y, "")
});

socket.on("dead", () => {
  dead = true;
});

// function splash(xxx, yyy, text) {
// 	{
// 		const colors = ["#ffc000", "#ff3b3b", "#ff8400"]
// 		const bubbles = 25

// 		const explode = (x, y, text) => {
// 			let particles = []
// 			// let ratio = window.devicePixelRatio;
// 			let ratio = 1.25
// 			let c = document.createElement("canvas")
// 			let ctx = c.getContext("2d")

// 			c.style.position = "absolute"
// 			c.style.left = 200 + x + "px"
// 			c.style.top = y - 100 + "px"
// 			c.style.pointerEvents = "none"
// 			c.style.width = 200 + "px"
// 			c.style.height = 200 + "px"
// 			c.style.zIndex = 100
// 			c.width = 200 * ratio
// 			c.height = 200 * ratio
// 			c.style.zIndex = "9999999"
// 			ctx.textY = c.height / 2
// 			document.body.appendChild(c)

// 			for (var i = 0; i < bubbles; i++) {
// 				particles.push({
// 					x: c.width / 2,
// 					y: c.height / 2,
// 					radius: r(20, 30),
// 					color: colors[Math.floor(Math.random() * colors.length)],
// 					rotation: r(0, 360, true),
// 					speed: r(8, 12),
// 					friction: 0.9,
// 					opacity: r(0, 0.5, true),
// 					yVel: 0,
// 					gravity: 0.1,
// 				})
// 			}

// 			render(particles, ctx, c.width, c.height, text)
// 			setTimeout(() => document.body.removeChild(c), 1000)
// 		}

// 		const render = (particles, ctx, width, height, text) => {
// 			requestAnimationFrame(() => render(particles, ctx, width, height, text))
// 			ctx.clearRect(0, 0, width, height)
// 			ctx.globalAlpha = 1.0
// 			ctx.font = "bold 48px serif"
// 			ctx.fillStyle = "black"
// 			ctx.fillText(text, width / 4, ctx.textY)
// 			ctx.textY += height / 100
// 			particles.forEach((p, i) => {
// 				p.x += p.speed * Math.cos((p.rotation * Math.PI) / 180)
// 				p.y += p.speed * Math.sin((p.rotation * Math.PI) / 180)

// 				p.opacity -= 0.01
// 				p.speed *= p.friction
// 				p.radius *= p.friction
// 				p.yVel += p.gravity
// 				p.y += p.yVel

// 				if (p.opacity < 0 || p.radius < 0) return

// 				ctx.beginPath()
// 				ctx.globalAlpha = p.opacity
// 				ctx.fillStyle = p.color
// 				ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, false)
// 				ctx.fill()
// 			})

// 			return ctx
// 		}

// 		const r = (a, b, c) =>
// 			parseFloat(
// 				(Math.random() * ((a ? a : 1) - (b ? b : 0)) + (b ? b : 0)).toFixed(
// 					c ? c : 0
// 				)
// 			)
// 		explode(xxx, yyy, text)
// 	}
// }
