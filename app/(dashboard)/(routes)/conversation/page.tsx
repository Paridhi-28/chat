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

// Form Schema (Ensures input isn't empty)
const formSchema = z.object({
  prompt: z.string().min(1, "Message cannot be empty"),
});

// Fixed AI Response
const FIXED_RESPONSE = "This is a fixed response with a typing effect!";
const display_name_of_role = "role";
const display_name_of_role_user = "user";
const display_name_of_role_ai = "ai";
const display_name_of_content = "content";

// Type definition using the constants
type Message = {
  [display_name_of_role]: typeof display_name_of_role_user | typeof display_name_of_role_ai;
  [display_name_of_content]: string;
};

const ConversationPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingText, setTypingText] = useState<string>("");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: "" },
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingText]);

  const [isLoading, setIsLoading] = useState(false);

  const simulateTyping = (text: string) => {
    setIsLoading(true); // Set loading state to true
    let i = 0;
    const interval = setInterval(() => {
      setTypingText(text.slice(0, i + 1) + "..."); // Add "..." as suffix progressively
      i++;

      if (i >= text.length) {
        clearInterval(interval);
        setMessages((prev) => [...prev, { role: "ai", content: text }]);
        setTypingText(""); // Clear typing effect when finished
        setIsLoading(false); // Set loading state to false when finished
      }
    }, 50); // Adjust typing speed here (milliseconds per letter)
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setMessages((prev) => [...prev, { role: "user", content: values.prompt }]);
    simulateTyping(FIXED_RESPONSE);
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
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-3 ${
                message.role === "user"
                  ? "bg-transparent text-black border-b border-gray-400 shadow-md w-[40%]"
                  : "text-black w-[60%]"
              }`}
            >
              {message.content}
            </div>
          </motion.div>
        ))}
        {/* Typing Effect */}
        {typingText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex justify-start"
          >
            <div className="text-black w-[60%]">{typingText}</div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar (Adjusted height to stay visible) */}
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
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="px-6" disabled={isLoading}>Send</Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ConversationPage;