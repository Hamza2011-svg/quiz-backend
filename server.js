const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const cors = require("cors");

let players = {};
let currentQuestion = null;

const questions = [
  {
    question: "What is the capital of Pakistan?",
    options: ["Karachi", "Lahore", "Islamabad", "Quetta"],
    answer: 2
  },
  {
    question: "What color is a banana?",
    options: ["Red", "Green", "Yellow", "Blue"],
    answer: 2
  },
  {
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "22"],
    answer: 1
  }
];

app.use(cors());

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);
  players[socket.id] = { name: "Player", score: 0 };

  socket.emit("playerId", socket.id);
  io.emit("playersUpdate", players);

  socket.on("answer", (data) => {
    const player = players[socket.id];
    if (data.answerIndex === questions[data.qIndex].answer) {
      player.score += 1;
    }
    io.emit("playersUpdate", players);
  });

  socket.on("getQuestion", () => {
    const qIndex = Math.floor(Math.random() * questions.length);
    currentQuestion = { ...questions[qIndex], qIndex };
    io.emit("newQuestion", currentQuestion);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("playersUpdate", players);
    console.log("Player disconnected:", socket.id);
  });
});

http.listen(3000, () => {
  console.log("Server running on port 3000");
});
