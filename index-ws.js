import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { join } from "path";

const app = express();
const PORT = 3000;
const server = createServer(app);

app.get("/", (req, res) => {
  res.sendFile(join(import.meta.dirname, "index.html"));
});

server.listen(PORT, function () {
  console.log("Listening on " + PORT);
});

process.on("SIGINT", () => {
  wss.clients.forEach((client) => client.close());
  server.close(() => {
    shutdownDB();
  });
});

const wss = new WebSocketServer({ server: server });

wss.on("connection", function connection(ws) {
  const numClients = wss.clients.size;

  console.log("clients connected: ", numClients);

  wss.broadcast(`Current visitors: ${numClients}`);

  if (ws.readyState === 1) {
    // 1 代表 ws.OPEN
    ws.send("welcome!");
  }

  db.run('INSERT INTO visitors (count, time) VALUES (?, datetime("now"))', [
    numClients,
  ]);

  ws.on("close", function close() {
    wss.broadcast(`Current visitors: ${wss.clients.size}`);
    console.log("A client has disconnected");
  });

  ws.on("error", function error(err) {
    console.error("WebSocket Error:", err);
  });
});

wss.broadcast = function broadcast(data) {
  console.log("Broadcasting: ", data);
  wss.clients.forEach(function each(client) {
    if (client.readyState === 1) {
      // 确保连接是打开状态 (ws.OPEN)
      client.send(data);
    }
  });
};

import sqlite3 from "sqlite3";
const db = new sqlite3.Database(":memory:");

db.serialize(() => {
  db.run(`CREATE TABLE visitors (
        count INTEGER,
        time TEXT
    )`);
});

function getCounts() {
  db.each("SELECT * FROM visitors", (err, row) => {
    console.log(row);
  });
}

function shutdownDB() {
  getCounts();
  console.log("Shutting down db");
  db.close();
}
