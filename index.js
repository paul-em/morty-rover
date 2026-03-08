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

const command = process.argv[2] || "stop";
const speed = process.argv[3];
const argument = speed ? `${command},${speed}` : command;

const validCommands = ["forward", "reverse", "left", "right", "stop"];
if (!validCommands.includes(command)) {
  console.error("Usage: node index.js [forward|reverse|left|right|stop] [speed 0-255]");
  process.exit(1);
}

particle
  .callFunction({
    deviceId: DEVICE_ID,
    name: "motor",
    argument,
    auth: TOKEN,
  })
  .then((result) => {
    console.log(`Motor: ${command} (return value: ${result.body.return_value})`);
  })
  .catch((err) => {
    console.error("Error:", err.body || err);
  });
