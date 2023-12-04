const socketIO = require("socket.io");

const initializeSocket = (server) => {
  const io = socketIO(server, {
    transports: ["websocket", "polling"], // Allow both WebSocket and polling
    allowUpgrades: true,
    upgrade: true,
  });
  io.on("connection", (socket) => {
    console.log("User Connected");

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });

    socket.on("chat message", (msg) => {
      io.emit("chat message", msg);
    });
  });
};

module.exports = initializeSocket;
