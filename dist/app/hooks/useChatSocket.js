import { useEffect, useState } from "react";
import io from "socket.io-client"; // default import, not named
const display_name_of_role = "role";
const display_name_of_role_user = "user";
const display_name_of_role_ai = "assistant";
const display_name_of_content = "content";
export const useChatSocket = () => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    useEffect(() => {
        // Connect to your server on port 5000
        const socketIo = io("http://localhost:5000");
        socketIo.on("connect", () => {
            console.log("Connected to chat server.");
        });
        // Whenever the server emits the full conversation, update local state
        socketIo.on("messages", (data) => {
            setMessages(data);
        });
        setSocket(socketIo);
        return () => {
            socketIo.disconnect();
        };
    }, []);
    // Send user message to the server
    const sendMessage = (msg) => {
        socket === null || socket === void 0 ? void 0 : socket.emit("line", msg);
    };
    return { messages, sendMessage };
};
