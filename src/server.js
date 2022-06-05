import express from "express";
import { Server } from "socket.io";
import http from "http";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");

const server = http.createServer(app);
server.listen(3000, handleListen);

const wss = new Server(server, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});
instrument(wss, { auth: false });

function getPublicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wss;

  return Array.from(rooms.keys()).filter((key) => sids.get(key) === undefined);
}

function countRoom(room) {
  return wss.sockets.adapter.rooms.get(room)?.size;
}

wss.on("connection", (socket) => {
  socket["nickname"] = "Anonymous";
  console.log("Connected to Browser.");

  socket.on("room", (room, done) => {
    socket.join(room);
    done(countRoom(room));
    socket.to(room).emit("join", socket.nickname, countRoom(room));
    wss.sockets.emit("rooms", getPublicRooms());
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
      socket.to(room).emit("leave", socket.nickname, countRoom(room) - 1)
    );
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from Browser.");
    wss.sockets.emit("rooms", getPublicRooms());
  });
});
