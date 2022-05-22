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
wss.on("connection", (socket) => {
  console.log("Connected to Browser.");

  socket.on("message", (message) =>
    console.log("New message:", message.toString("utf8"))
  );

  socket.on("close", () => console.log("Disconnected from Browser."));

  socket.send("hello from the server!");
});
