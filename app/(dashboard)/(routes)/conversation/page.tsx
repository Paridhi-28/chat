"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heading } from "@/components/heading";
import { MessagesSquareIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useChatSocket } from "@/app/hooks/useChatSocket";
import { useTypingEffect } from "@/app/hooks/useTypingEffect";

// Role and content variable names (allowing dynamic naming)
const display_name_of_role = "role";
const display_name_of_role_user = "user";
const display_name_of_role_ai = "assistant";
const display_name_of_content = "content";

// Zod form schema (ensures input isn't empty)
const formSchema = z.object({
    prompt: z.string().min(1, "Message cannot be empty"),
});

// Local message type matching your naming
type Message = {
    [display_name_of_role]: typeof display_name_of_role_user | typeof display_name_of_role_ai;
    [display_name_of_content]: string;
};

// Component for rendering individual chat messages
const ChatMessage = ({ message }: { message: Message }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex ${
            message[display_name_of_role] === display_name_of_role_user ? "justify-end" : "justify-start"
        }`}
    >
        <div
            className={`p-3 ${
                message[display_name_of_role] === display_name_of_role_user
                    ? "bg-transparent text-black border-b border-gray-400 shadow-md w-[40%]"
                    : "bg-gray-100 text-black rounded-lg w-[60%]"
            }`}
        >
            {message[display_name_of_content]}
        </div>
    </motion.div>
);

const ConversationPage = () => {
    // Our Socket.IO hook
    const { messages: socketMessages, sendMessage } = useChatSocket();

    // State for displayed messages
    const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
    // Queue to hold pending AI messages
    const pendingMessages = useRef<string[]>([]);

    // Custom hook for typing effect
    const { typingText, isTyping, startTyping, skipTyping } = useTypingEffect(
        (text: string) => {
            // onFinish callback when typing completes
            setDisplayMessages((prev) => [
                ...prev,
                { [display_name_of_role]: display_name_of_role_ai, [display_name_of_content]: text },
            ]);
            // Process next pending AI message if available
            if (pendingMessages.current.length > 0) {
                const nextMessage = pendingMessages.current.shift();
                if (nextMessage) startTyping(nextMessage);
            }
        },
        50
    );

    // Dropdown options and state for single-select
    const namesOptions = ["Alice", "Bob", "Charlie", "Dave"];
    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { prompt: "" },
    });

    // Scroll to bottom on new messages or typing updates
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [displayMessages, typingText]);

    // Process incoming socket messages
    useEffect(() => {
        if (socketMessages.length === 0) return;

        socketMessages.forEach((msg: { role: string; content: string }) => {
            const alreadyInDisplay = displayMessages.some(
                (dm) =>
                    dm[display_name_of_role] === msg.role &&
                    dm[display_name_of_content] === msg.content
            );
            const alreadyInQueue = pendingMessages.current.includes(msg.content);

            if (!alreadyInDisplay && !alreadyInQueue) {
                if (msg.role === display_name_of_role_ai) {
                    if (isTyping) {
                        // Queue the AI message if a typing effect is already in progress
                        pendingMessages.current.push(msg.content);
                    } else {
                        startTyping(msg.content);
                    }
                } else {
                    // Add user messages directly
                    setDisplayMessages((prev) => [
                        ...prev,
                        { [display_name_of_role]: display_name_of_role_user, [display_name_of_content]: msg.content },
                    ]);
                }
            }
        });
    }, [socketMessages, displayMessages, isTyping, startTyping]);

    // Handle form submission
    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const userMsg: Message = {
            [display_name_of_role]: display_name_of_role_user,
            [display_name_of_content]: values.prompt,
        };
        setDisplayMessages((prev) => [...prev, userMsg]);
        sendMessage(values.prompt);
        form.reset();
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <Heading
                title="Conversation"
                description="A simple AI chat with typing effect."
                icon={MessagesSquareIcon}
                iconColor="text-violet-500"
                bgColor="bg-violet-500/10"
            />

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {displayMessages.map((message, index) => (
                    <ChatMessage key={index} message={message} />
                ))}
                {/* Typing Effect with Skip Option */}
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-start items-center space-x-2"
                    >
                        <div className="text-black w-[60%]">{typingText}</div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={skipTyping}
                            aria-label="Skip typing animation"
                            className="h-8"
                        >
                            Skip
                        </Button>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t bg-white sticky bottom-0">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 items-center">
                        <FormField
                            name="prompt"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input
                                            className="border rounded-lg px-4 py-2 focus:ring-0"
                                            placeholder="Type your message..."
                                            aria-label="Type your message"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Custom Single-Select Dropdown (Drop Up) */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setDropdownOpen((prev) => !prev)}
                                className="w-40 border rounded-md px-2 py-1 focus:outline-none focus:ring focus:border-indigo-500"
                            >
                                {selectedName ? selectedName : "Select Name"}
                            </button>
                            {dropdownOpen && (
                                <div className="absolute z-10 bottom-full mb-1 w-40 max-h-40 overflow-y-auto border rounded-md bg-white shadow-lg">
                                    {namesOptions.map((name) => (
                                        <div
                                            key={name}
                                            onClick={() => {
                                                setSelectedName(name);
                                                setDropdownOpen(false);
                                            }}
                                            className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
                                        >
                                            {name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="px-6"
                            disabled={isTyping || !selectedName}
                            aria-label="Send message"
                        >
                            Send
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default ConversationPage;
