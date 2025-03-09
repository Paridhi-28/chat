// client3.ts
import io from "socket.io-client";
const socket = io("http://localhost:5000", { transports: ["websocket"] });
socket.on("connect", () => {
    console.log("Third client connected with id:", socket.id);
    const message = { role: "user", content: "Hello from client3" };
    socket.emit("line", message.content);
});
socket.on("messages", (data) => {
    console.log("Received messages from server:");
    console.log(data);
});
socket.on("disconnect", () => {
    console.log("Disconnected from server.");
});
