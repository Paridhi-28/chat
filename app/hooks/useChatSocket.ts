import { useEffect, useState } from "react";
        import io from "socket.io-client";

        export const useChatSocket = <Message>(
            display_name_of_role: string,
            display_name_of_role_user: string,
            display_name_of_role_ai: string,
            display_name_of_content: string
        ) => {
            const [socket, setSocket] = useState<any>(null);
            const [messages, setMessages] = useState<Message[]>([]);

            useEffect(() => {
                const socketIo = io("http://localhost:5000");

                socketIo.on("connect", () => {
                    console.log("Connected to chat server.");
                    socketIo.emit("set_format", {
                        role: display_name_of_role,
                        user: display_name_of_role_user,
                        assistant: display_name_of_role_ai,
                        content: display_name_of_content
                    });
                });

                socketIo.on("messages", (data: Message[]) => {
                    setMessages(data);
                });

                setSocket(socketIo);

                return () => {
                    socketIo.disconnect();
                };
            }, [display_name_of_role, display_name_of_role_user, display_name_of_role_ai, display_name_of_content]);

            const sendMessage = (msg: string) => {
                socket?.emit("line", msg);
            };

            return { messages, sendMessage };
        };