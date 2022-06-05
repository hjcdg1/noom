const welcome = document.getElementById("welcome");
const chat = document.getElementById("chat");
const roomForm = welcome.querySelector("#room");
const roomList = welcome.querySelector("ul");
const chatHeader = chat.querySelector("h3");
const messageList = chat.querySelector("ul");
const nicknameForm = chat.querySelector("#nickname");
const messageForm = chat.querySelector("#message");
const socket = io();
let room;

chat.hidden = true;

function addMessage(msg) {
  const li = document.createElement("li");
  li.innerText = msg;
  messageList.append(li);
}

socket.on("connect", () => {
  console.log("Connected to Server.");
});

socket.on("join", (nickname, roomCount) => {
  chatHeader.innerText = `Room: ${room} (${roomCount})`;
  addMessage(`${nickname} joined!`);
});

socket.on("message", (msg, nickname) => {
  addMessage(`${nickname}: ${msg}`);
});

socket.on("leave", (nickname, roomCount) => {
  chatHeader.innerText = `Room: ${room} (${roomCount})`;
  addMessage(`${nickname} left!`);
});

socket.on("rooms", (rooms) => {
  roomList.innerHTML = "";
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});

socket.on("disconnect", () => {
  console.log("Disconnected from Server.");
});

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = roomForm.querySelector("input");
  socket.emit("room", input.value, (roomCount) => {
    welcome.hidden = true;
    chat.hidden = false;
    chatHeader.innerText = `Room: ${room} (${roomCount})`;
  });
  room = input.value;
  input.value = "";
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = nicknameForm.querySelector("input");
  socket.emit("nickname", input.value);
  input.value = "";
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  const value = input.value;
  socket.emit("message", value, room, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

roomForm.addEventListener("submit", handleRoomSubmit);
nicknameForm.addEventListener("submit", handleNicknameSubmit);
messageForm.addEventListener("submit", handleMessageSubmit);
