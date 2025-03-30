import { useEffect } from "react";

interface SocketMessage {
    role: string;
    content: string;
}

interface UseProcessSocketMessagesProps<TMessage> {
    socketMessages: SocketMessage[];
    isTyping: boolean;
    startTyping: (text: string) => void;
    setDisplayMessages: React.Dispatch<React.SetStateAction<TMessage[]>>;
    displayedMessageSet: React.MutableRefObject<Set<string>>;
    pendingMessages: React.MutableRefObject<string[]>;
    lastProcessedIndex: React.MutableRefObject<number>;
    constants: {
        display_name_of_role: string;
        display_name_of_role_user: string;
        display_name_of_role_ai: string;
        display_name_of_content: string;
    };
}

export function useProcessSocketMessages<TMessage>({
                                                       socketMessages,
                                                       isTyping,
                                                       startTyping,
                                                       setDisplayMessages,
                                                       displayedMessageSet,
                                                       pendingMessages,
                                                       lastProcessedIndex,
                                                       constants,
                                                   }: UseProcessSocketMessagesProps<TMessage>) {
    useEffect(() => {
        if (socketMessages.length <= lastProcessedIndex.current) return;
        const newMessages = socketMessages.slice(lastProcessedIndex.current);
        newMessages.forEach((msg) => {
            const trimmedContent = msg.content.trim();
            const messageKey = `${msg.role}-${trimmedContent}`;
            if (
                displayedMessageSet.current.has(messageKey) ||
                pendingMessages.current.includes(trimmedContent)
            ) {
                return;
            }
            if (msg.role === constants.display_name_of_role_ai) {
                if (isTyping) {
                    pendingMessages.current.push(trimmedContent);
                } else {
                    startTyping(trimmedContent);
                }
            } else {
                setDisplayMessages((prev) => {
                    displayedMessageSet.current.add(messageKey);
                    return [
                        ...prev,
                        {
                            [constants.display_name_of_role]: constants.display_name_of_role_user,
                            [constants.display_name_of_content]: trimmedContent,
                        } as TMessage,
                    ];
                });
            }
        });
        lastProcessedIndex.current = socketMessages.length;
    }, [
        socketMessages,
        isTyping,
        startTyping,
        setDisplayMessages,
        displayedMessageSet,
        pendingMessages,
        lastProcessedIndex,
        constants,
    ]);
}
