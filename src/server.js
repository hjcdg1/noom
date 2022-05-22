import express from "express";
import WebSocket from "ws";
import http from "http";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");

const server = http.createServer(app);
server.listen(3000, handleListen);

const wss = new WebSocket.Server({ server });
const sockets = [];
wss.on("connection", (socket) => {
  socket["nickname"] = "Anonymous";
  sockets.push(socket);
  console.log("Connected to Browser.");

  socket.on("message", (message) => {
    const messageObj = JSON.parse(message.toString("utf8"));

    switch (messageObj.type) {
      case "nickname":
        socket["nickname"] = messageObj.payload;
        break;
      case "message":
        sockets.forEach((_socket) =>
          _socket.send(`${socket.nickname}: ${messageObj.payload}`)
        );
        break;
    }
  });

  socket.on("close", () => console.log("Disconnected from Browser."));
});
