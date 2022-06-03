import express from "express";
import SocketIO from "socket.io";
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

const wss = SocketIO(server);
wss.on("connection", (socket) => {
  socket["nickname"] = "Anonymous";
  console.log("Connected to Browser.");

  socket.on("room", (room, done) => {
    socket.join(room);
    done();
    socket.to(room).emit("join", socket.nickname);
  });

  socket.on("nickname", (nickname) => {
    socket["nickname"] = nickname;
  });

  socket.on("message", (msg, room, done) => {
    socket.to(room).emit("message", msg, socket.nickname);
    done();
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("leave", socket.nickname)
    );
  });

  socket.on("disconnect", () => console.log("Disconnected from Browser."));
});
