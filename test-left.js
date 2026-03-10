const Particle = require("particle-api-js");

const particle = new Particle();

const TOKEN = process.env.PARTICLE_TOKEN;
const DEVICE_ID = process.env.PARTICLE_DEVICE_ID;

if (!TOKEN || !DEVICE_ID) {
  console.error(
    "Set PARTICLE_TOKEN and PARTICLE_DEVICE_ID in your .env file"
  );
  process.exit(1);
}

const SPEED = 255;
const KEEPALIVE_MS = 400;

function fireCommand(argument) {
  return particle
    .callFunction({
      deviceId: DEVICE_ID,
      name: "motor",
      argument,
      auth: TOKEN,
    })
    .then(() => console.log(`Sent: ${argument}`))
    .catch((err) => console.error("Error:", err.body || err));
}

function stop() {
  clearInterval(interval);
  fireCommand("stop").then(() => {
    console.log("\nStopped.");
    process.exit();
  });
}

console.log(`Turning left at full speed (${SPEED}). Press Ctrl+C to stop.`);

fireCommand(`left,${SPEED}`);

const interval = setInterval(() => {
  fireCommand(`left,${SPEED}`);
}, KEEPALIVE_MS);

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
