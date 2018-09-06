import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import { PORT } from "./consts";

export const app = express();
export const server = http.createServer(app);
export const io = socketIO(server);

/**
 * =========================
 *  LISTEN
 * =========================
 * Also listens to this on the client
 */
server.listen(PORT, () => {
  console.log("LISTENING ON PORT:" + PORT);
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname));
