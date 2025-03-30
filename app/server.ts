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

type Message = {
    [key: string]: string;
};

let messages: Message[] = [];
let display_name_of_role: string;
let display_name_of_role_user: string;
let display_name_of_role_ai: string;
let display_name_of_content: string;

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Receive the message format from the client
    socket.on("set_format", (format: { role: string, user: string, assistant: string, content: string }) => {
        display_name_of_role = format.role;
        display_name_of_role_user = format.user;
        display_name_of_role_ai = format.assistant;
        display_name_of_content = format.content;
        console.log("Received format:", format);
    });

    // When a web client sends a user message:
    socket.on("line", (msg: string) => {
        console.log("Received user message:", msg);
        const userMessage: Message = { [display_name_of_role]: display_name_of_role_user, [display_name_of_content]: msg };
        messages.push(userMessage);
        io.emit("messages", messages);
        io.emit("test", true);
    });

    // When the Python client sends back an AI response:
    socket.on("ai response", (msg: string) => {
        console.log("Received AI response:", msg);
        const aiMessage: Message = { [display_name_of_role]: display_name_of_role_ai, [display_name_of_content]: msg };
        messages.push(aiMessage);
        io.emit("messages", messages);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);

    // Spawn the Python process.
    const pythonProcess = spawn('C:\\Users\\acer\\Documents\\Programming\\Python\\Chatbot\\ChatBot\\Scripts\\python.exe', ['app/app2.py']); // adjust the path and command if necessary

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