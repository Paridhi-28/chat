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
// Zod form schema (ensures input isn't empty)
const formSchema = z.object({
    prompt: z.string().min(1, "Message cannot be empty"),
});
//
// We'll align with your role constants:
//
const display_name_of_role = "role";
const display_name_of_role_user = "user";
const display_name_of_role_ai = "assistant";
const display_name_of_content = "content";
const ConversationPage = () => {
    // Our Socket.IO hook
    const { messages: socketMessages, sendMessage } = useChatSocket();
    // We'll maintain our own "displayMessages" for the typed effect
    const [displayMessages, setDisplayMessages] = useState([]);
    const [typingText, setTypingText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { prompt: "" },
    });
    // Scroll to bottom on new messages
    const messagesEndRef = useRef(null);
    useEffect(() => {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
    }, [displayMessages, typingText]);
    //
    // A function to simulate the typing effect for AI messages
    //
    const simulateTyping = (text) => {
        setIsLoading(true);
        let i = 0;
        const interval = setInterval(() => {
            setTypingText(text.slice(0, i + 1) + "...");
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                setDisplayMessages((prev) => [
                    ...prev,
                    { role: display_name_of_role_ai, content: text },
                ]);
                setTypingText("");
                setIsLoading(false);
            }
        }, 50); // Adjust speed here
    };
    //
    // On each update of "socketMessages," see if there's a new AI message we haven't displayed yet
    //
    useEffect(() => {
        if (socketMessages.length === 0)
            return;
        // For each new message from the server, if we haven't displayed it, handle it
        socketMessages.forEach((msg) => {
            // Check if it's already in displayMessages
            const alreadyInDisplay = displayMessages.some((dm) => dm[display_name_of_role] === msg.role &&
                dm[display_name_of_content] === msg.content);
            // If not already displayed, handle it
            if (!alreadyInDisplay) {
                if (msg.role === display_name_of_role_ai) {
                    // Simulate typing for new AI message
                    simulateTyping(msg.content);
                }
                else {
                    // For user messages, just add them directly
                    setDisplayMessages((prev) => [...prev, msg]);
                }
            }
        });
    }, [socketMessages]);
    //
    // Handle user form submit
    //
    const onSubmit = (values) => {
        // Immediately add user message to local display
        const userMsg = {
            role: "user",
            content: values.prompt,
        };
        setDisplayMessages((prev) => [...prev, userMsg]);
        // Send to the server so the Python AI can respond
        sendMessage(values.prompt);
        form.reset();
    };
    return (<div className="flex flex-col h-screen">
        {/* Header */}
        <Heading title="Conversation" description="A simple AI chat with typing effect." icon={MessagesSquareIcon} iconColor="text-violet-500" bgColor="bg-violet-500/10"/>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {displayMessages.map((message, index) => (<motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`p-3 ${message.role === "user"
                ? "bg-transparent text-black border-b border-gray-400 shadow-md w-[40%]"
                : "text-black w-[60%]"}`}>
                  {message.content}
                </div>
              </motion.div>))}
          {/* Typing Effect */}
          {typingText && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex justify-start">
                <div className="text-black w-[60%]">{typingText}</div>
              </motion.div>)}
          <div ref={messagesEndRef}/>
        </div>

        {/* Input Bar (Adjusted height to stay visible) */}
        <div className="p-3 border-t bg-white sticky bottom-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 items-center">
              <FormField name="prompt" render={({ field }) => (<FormItem className="flex-1">
                        <FormControl>
                          <Input className="border rounded-lg px-4 py-2 focus:ring-0" placeholder="Type your message..." {...field}/>
                        </FormControl>
                      </FormItem>)}/>
              <Button type="submit" className="px-6" disabled={isLoading}>
                Send
              </Button>
            </form>
          </Form>
        </div>
      </div>);
};
export default ConversationPage;
