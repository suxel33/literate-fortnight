const http = require("http");
const chalk = require("chalk");

const client = require('./db/client');

const app = require("./app");

const PORT = process.env["PORT"] ?? 3000;
const server = http.createServer(app);


server.listen(PORT, () => {
  console.log(
    chalk.blueBright("CORS-enabled server is listening on PORT:"),
    chalk.yellow(PORT),
    chalk.blueBright("Get your routine on!")
  );
});

client.connect();