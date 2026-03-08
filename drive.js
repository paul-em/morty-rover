const Particle = require("particle-api-js");

const particle = new Particle();

const TOKEN = process.env.PARTICLE_TOKEN;
const DEVICE_ID = process.env.PARTICLE_DEVICE_ID;

if (!TOKEN || !DEVICE_ID) {
  console.error(
    "Set these environment variables in your .env file:\n" +
      "  PARTICLE_TOKEN=your_access_token\n" +
      "  PARTICLE_DEVICE_ID=your_device_id"
  );
  process.exit(1);
}

const SPEED = process.argv[2] || "200";

let currentCommand = "stop";
let pending = false;

function sendCommand(command) {
  if (command === currentCommand && command !== "stop") return;
  if (pending) return;

  currentCommand = command;
  pending = true;

  const argument = command === "stop" ? command : `${command},${SPEED}`;

  particle
    .callFunction({
      deviceId: DEVICE_ID,
      name: "motor",
      argument,
      auth: TOKEN,
    })
    .then(() => {
      pending = false;
    })
    .catch((err) => {
      console.error("Error:", err.body || err);
      pending = false;
    });
}

const pressed = new Set();

function updateDirection() {
  const up = pressed.has("up");
  const down = pressed.has("down");
  const left = pressed.has("left");
  const right = pressed.has("right");

  if (up) sendCommand("forward");
  else if (down) sendCommand("reverse");
  else if (left) sendCommand("left");
  else if (right) sendCommand("right");
  else sendCommand("stop");
}

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");

console.log("Drive mode active! Use arrow keys to control the rover.");
console.log(`Speed: ${SPEED} (pass a different speed as argument: node drive.js 150)`);
console.log("Press q or Ctrl+C to quit.\n");

process.stdin.on("data", (key) => {
  // Ctrl+C or q to quit
  if (key === "\u0003" || key === "q") {
    sendCommand("stop");
    setTimeout(() => {
      console.log("\nStopped.");
      process.exit();
    }, 300);
    return;
  }

  // Arrow keys come as escape sequences: \u001b[A/B/C/D
  if (key === "\u001b[A") {
    pressed.add("up");
    console.log("↑ forward");
  } else if (key === "\u001b[B") {
    pressed.add("down");
    console.log("↓ reverse");
  } else if (key === "\u001b[D") {
    pressed.add("left");
    console.log("← left");
  } else if (key === "\u001b[C") {
    pressed.add("right");
    console.log("→ right");
  }

  updateDirection();
});

// Terminal raw mode doesn't give us keyup events, so auto-stop after a delay
let stopTimer;
process.stdin.on("data", () => {
  clearTimeout(stopTimer);
  stopTimer = setTimeout(() => {
    pressed.clear();
    updateDirection();
  }, 200);
});
