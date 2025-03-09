// server.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { spawn } from 'child_process';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = 5000;

const display_name_of_role = "role";
const display_name_of_role_user = "user";
const display_name_of_role_ai = "assistant";
const display_name_of_content = "content";

type Message = {
    [display_name_of_role]: "user" | "assistant";
    [display_name_of_content]: string;
};

let messages: Message[] = [];

// Listen for incoming connections (from web clients and Python client)
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // When a web client sends a user message:
    socket.on("line", (msg: string) => {
        console.log("Received user message:", msg);
        const userMessage: Message = { role: display_name_of_role_user, content: msg };
        messages.push(userMessage);
        io.emit("messages", messages);
    });

    // When the Python client sends back an AI response:
    socket.on("ai response", (msg: string) => {
        console.log("Received AI response:", msg);
        const aiMessage: Message = { role: display_name_of_role_ai, content: msg };
        messages.push(aiMessage);
        io.emit("messages", messages);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);

    // Spawn the Python process.
    const pythonProcess = spawn('C:\\Users\\acer\\Documents\\Programming\\Python\\Chatbot\\ChatBot\\Scripts\\python.exe', ['app2.py']); // adjust the path and command if necessary

    pythonProcess.stdout.on('data', (data: Buffer) => {
        console.log("Python stdout:", data.toString());
    });
    pythonProcess.stderr.on('data', (data: Buffer) => {
        console.error("Python stderr:", data.toString());
    });
    pythonProcess.on('close', (code) => {
        console.log("Python process closed with code", code);
    });
});
