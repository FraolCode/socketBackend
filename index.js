const dotenv = require("dotenv");
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
// const roomHandler = require("./roomHandler");

dotenv.config();
const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const MAX_PLAYERS = 5;
let waitingPlayers = [];
numPlayers = 0

io.on("connection", (socket) => {
  console.log("A player has connected!" + socket.id);

  socket.on("joinGame", (roomId, playerName) => {
    console.log(roomId + playerName);
    const room = io.sockets.adapter.rooms.get(roomId);
    if (room) {
      const players = Array.from(room).map((socketId) => ({
        id: socketId,
        name: io.sockets.sockets.get(socketId).playerName,
      }));
       numPlayers = players.length;
      if (numPlayers < MAX_PLAYERS) {
        socket.join(roomId);
        socket.playerName = playerName;
        const room = io.sockets.adapter.rooms.get(roomId);
        const players = Array.from(room).map((socketId) => ({
          id: socketId,
          name: io.sockets.sockets.get(socketId).playerName,
        }));
        numPlayers = players.length;
        console.log("joined")
        console.log(players.length)
        io.to(roomId).emit("updateWaitingPlayers", players,numPlayers);
      } else {
        socket.emit("gameFull");
      }
    } else {
      socket.join(roomId);
      socket.playerName = playerName;
      const room = io.sockets.adapter.rooms.get(roomId);
      const players = Array.from(room).map((socketId) => ({
        id: socketId,
        name: io.sockets.sockets.get(socketId).playerName,
      }));
      console.log("created")
      console.log(players.length)
      numPlayers = players.length
      io.to(roomId).emit("updateWaitingPlayers", players,numPlayers);
    }

    // if (numPlayers < MAX_PLAYERS) {
    //   socket.join(roomId);
    //   socket.playerName = playerName;
    //   const room = io.sockets.adapter.rooms.get(roomId);
    //   const players = Array.from(room).map((socketId) => ({
    //     id: socketId,
    //     name: io.sockets.sockets.get(socketId).playerName,
    //   }));
    //   io.to(roomId).emit('updateWaitingPlayers', players);

    // } else {
    //   socket.emit('gameFull');
    // }
  });

  socket.on("disconnect", () => {
    console.log("A player has disconnected");
    io.emit("updateWaitingPlayers", waitingPlayers, numPlayers);
  });
});

const port = process.env.PORT || 8080;
httpServer.listen(port, () => console.log(`Listening on port ${port}`));
