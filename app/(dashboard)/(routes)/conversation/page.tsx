"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heading } from "@/components/heading";
import { MessagesSquareIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useChatSocket } from "@/app/hooks/useChatSocket";

// Import custom hooks
import { useTypingEffect } from "./customHooks/useTypingEffect";
import { useMessageEditing } from "./customHooks/useMessageEditing";
import { useMessageSubmit } from "./customHooks/useMessageSubmit";
import { useProcessSocketMessages } from "./customHooks/useProcessSocketMessages";

// IMPORTANT: Define all key variables in the webpage
const display_name_of_role = "role";
const display_name_of_role_user = "user";
const display_name_of_role_ai = "assistant";
const display_name_of_content = "content";

// Create a constants object to pass to the hooks
const constants = {
    display_name_of_role,
    display_name_of_role_user,
    display_name_of_role_ai,
    display_name_of_content,
};

// Define your Message interface (used throughout the page)
export interface Message {
    [display_name_of_role]: typeof display_name_of_role_user | string;
    [display_name_of_content]: string;
}

// Zod form schema
const formSchema = z.object({
    prompt: z.string().min(1, "Message cannot be empty"),
});

// Component for rendering individual chat messages (non-edit mode)
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
    // Global hooks
    const { messages: socketMessages, sendMessage } = useChatSocket<Message>(
        constants.display_name_of_role,
        constants.display_name_of_role_user,
        constants.display_name_of_role_ai,
        constants.display_name_of_content
    );
    // Conversation state
    const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
    const pendingMessages = useRef<string[]>([]);
    const displayedMessageSet = useRef<Set<string>>(new Set());
    const lastProcessedIndex = useRef(0);

    // Typing effect hook (remains in place)
    const { typingText, isTyping, startTyping, skipTyping } = useTypingEffect(
        (text: string) => {
            const trimmedText = text.trim();
            const messageKey = `${display_name_of_role_ai}-${trimmedText}`;
            displayedMessageSet.current.add(messageKey);
            setDisplayMessages((prev) => [
                ...prev,
                { [display_name_of_role]: display_name_of_role_ai, [display_name_of_content]: trimmedText },
            ]);
            if (pendingMessages.current.length > 0) {
                const nextMessage = pendingMessages.current.shift();
                if (nextMessage) startTyping(nextMessage);
            }
        },
        5
    );

    // Process incoming socket messages using the custom hook
    useProcessSocketMessages<Message>({
        socketMessages,
        isTyping,
        startTyping,
        setDisplayMessages,
        displayedMessageSet,
        pendingMessages,
        lastProcessedIndex,
        constants,
    });

    // Dropdown state for single-select
    const namesOptions = ["Alice", "Bob", "Charlie", "Dave"];
    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Set up react-hook-form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { prompt: "" },
    });

    // Scroll to bottom when messages update
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [displayMessages, typingText]);

    // Use custom hook for handling form submission
    const onSubmit = useMessageSubmit<Message>({
        sendMessage,
        setDisplayMessages,
        displayedMessageSet,
        constants,
    });

    // Use custom hook for editing actions (removed the generic parameter here)
    const {
        editingIndex,
        editedContent,
        setEditedContent,
        handleEditClick,
        cancelEditing,
        resendEditedMessage,
        updateAndPropagate,
        isPropagating,
    } = useMessageEditing({
        displayMessages,
        setDisplayMessages,
        sendMessage,
        displayedMessageSet,
        constants,
    });

    // Helper: Wait until the typing effect has finished (i.e. assistant response is complete)
    const waitForTypingToComplete = (): Promise<void> => {
        return new Promise<void>((resolve) => {
            const check = () => {
                if (!isTyping) {
                    resolve();
                } else {
                    setTimeout(check, 5);
                }
            };
            check();
        });
    };

    const updateAndPropagateHandler = async (index: number) => {
        await updateAndPropagate(index, waitForTypingToComplete);
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
                {displayMessages.map((message, index) => {
                    if (
                        message[display_name_of_role] === display_name_of_role_user &&
                        editingIndex === index
                    ) {
                        return (
                            <div key={`edit-${index}`} className="flex flex-col items-end">
                                <div className="w-[40%] p-3 border border-gray-400 shadow-md">
                                    <Input
                                        value={editedContent}
                                        onChange={(e) => setEditedContent(e.target.value)}
                                        className="border rounded-lg px-4 py-2 focus:ring-0"
                                        placeholder="Edit your message..."
                                        aria-label="Edit your message"
                                    />
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <Button variant="outline" onClick={cancelEditing}>
                                        Cancel
                                    </Button>
                                    <Button onClick={() => resendEditedMessage(index)}>
                                        Resend
                                    </Button>
                                    <Button onClick={() => updateAndPropagateHandler(index)}>
                                        Update &amp; Propagate
                                    </Button>
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <div key={`msg-${index}`} className="flex flex-col">
                                <ChatMessage message={message} />
                                {message[display_name_of_role] === display_name_of_role_user &&
                                    editingIndex !== index && (
                                        <Button
                                            onClick={() =>
                                                handleEditClick(index, message[display_name_of_content])
                                            }
                                            variant="link"
                                            size="sm"
                                            className="self-end"
                                        >
                                            Edit
                                        </Button>
                                    )}
                            </div>
                        );
                    }
                })}
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
                    <form
                        onSubmit={form.handleSubmit((values) => {
                            onSubmit(values);
                            form.reset(); // Clear the input field after submission
                        })}
                        className="flex gap-2 items-center"
                    >
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
                            disabled={isTyping || isPropagating || !selectedName}
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
