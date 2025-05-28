const { io } = require("socket.io-client");

const socket = io("https://localhost:5001", {
    transports: ["websocket"],
    rejectUnauthorized: false, // Accept self-signed cert for local dev
});

socket.on("connect", () => {
    console.log("Connected to server:", socket.id);
    socket.emit("join-room", "user123");
});

socket.on("connect_error", (err) => {
    console.error("Connection error:", err.message);
});

socket.on("disconnect", (reason) => {
    console.log("Disconnected:", reason);
});

