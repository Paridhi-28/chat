import { useEffect, useState } from "react";
import io from "socket.io-client"; // default import, not named

const display_name_of_role = "role";
const display_name_of_role_user = "user";
const display_name_of_role_ai = "assistant";
const display_name_of_content = "content";

// Local message type matching your naming
export type Message = {
    [display_name_of_role]: typeof display_name_of_role_user | typeof display_name_of_role_ai;
    [display_name_of_content]: string;
};

export const useChatSocket = () =>
{
    const [socket, setSocket] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() =>
    {
        // Connect to your server on port 5000
        const socketIo = io("http://localhost:5000");

        socketIo.on("connect", () => {
            console.log("Connected to chat server.");
        });

        // Whenever the server emits the full conversation, update local state
        socketIo.on("messages", (data: Message[]) => {
            setMessages(data);
        });

        setSocket(socketIo);

        return () => {
            socketIo.disconnect();
        };
    }, []);

    // Send user message to the server
    const sendMessage = (msg: string) => {
        socket?.emit("line", msg);
    };

    return { messages, sendMessage };
};
