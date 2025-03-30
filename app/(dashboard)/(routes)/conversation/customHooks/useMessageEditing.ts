import { useState } from "react";

interface UseMessageEditingProps {
    displayMessages: any[]; // Using your Message interface defined on the page
    setDisplayMessages: React.Dispatch<React.SetStateAction<any[]>>;
    sendMessage: (message: string) => void;
    displayedMessageSet: React.MutableRefObject<Set<string>>;
    constants: {
        display_name_of_role: string;
        display_name_of_role_user: string;
        display_name_of_content: string;
    };
}

export function useMessageEditing({
                                      displayMessages,
                                      setDisplayMessages,
                                      sendMessage,
                                      displayedMessageSet,
                                      constants,
                                  }: UseMessageEditingProps): {
    editingIndex: number | null;
    editedContent: string;
    setEditedContent: React.Dispatch<React.SetStateAction<string>>;
    handleEditClick: (index: number, currentContent: string) => void;
    cancelEditing: () => void;
    resendEditedMessage: (index: number) => void;
    updateAndPropagate: (
        index: number,
        waitForTypingToComplete: () => Promise<void>
    ) => Promise<void>;
    isPropagating: boolean;
} {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editedContent, setEditedContent] = useState<string>("");
    const [isPropagating, setIsPropagating] = useState(false);

    const handleEditClick = (index: number, currentContent: string) => {
        setEditingIndex(index);
        setEditedContent(currentContent);
    };

    const cancelEditing = () => {
        setEditingIndex(null);
        setEditedContent("");
    };

    const resendEditedMessage = (index: number) => {
        const trimmedEdited = editedContent.trim();
        // Truncate conversation up to the message being edited
        const newMessages = displayMessages.slice(0, index);
        const editedMessage = {
            [constants.display_name_of_role]: constants.display_name_of_role_user,
            [constants.display_name_of_content]: trimmedEdited,
        };
        newMessages.push(editedMessage);
        setDisplayMessages(newMessages);
        sendMessage(trimmedEdited);
        const messageKey = `${constants.display_name_of_role_user}-${trimmedEdited}`;
        displayedMessageSet.current.add(messageKey);
        setEditingIndex(null);
        setEditedContent("");
    };

    const updateAndPropagate = async (
        index: number,
        waitForTypingToComplete: () => Promise<void>
    ) => {
        setIsPropagating(true);
        const trimmedEdited = editedContent.trim();

        // Build the updated message.
        const updatedMessage = {
            [constants.display_name_of_role]: constants.display_name_of_role_user,
            [constants.display_name_of_content]: trimmedEdited,
        };

        // Clear the conversation and update the state with only the updated message.
        setDisplayMessages([updatedMessage]);

        // Send the updated message to trigger the assistant's response.
        sendMessage(trimmedEdited);

        // Exit edit mode.
        cancelEditing();

        // Wait for the assistant's response for the updated message to complete.
        await waitForTypingToComplete();

        // Process subsequent user messages one at a time.
        const subsequentUserMessages = displayMessages
            .slice(index + 1)
            .filter(
                (msg) =>
                    msg[constants.display_name_of_role] === constants.display_name_of_role_user
            )
            .map((msg) => msg[constants.display_name_of_content]);

        for (const userMsg of subsequentUserMessages) {
            // Append the user message to the conversation state.
            setDisplayMessages((prevHistory) => [
                ...prevHistory,
                {
                    [constants.display_name_of_role]: constants.display_name_of_role_user,
                    [constants.display_name_of_content]: userMsg,
                },
            ]);
            // Send the user message to get the assistant's response.
            sendMessage(userMsg);
            await waitForTypingToComplete();
        }

        setIsPropagating(false);
    };

    return {
        editingIndex,
        editedContent,
        setEditedContent,
        handleEditClick,
        cancelEditing,
        resendEditedMessage,
        updateAndPropagate,
        isPropagating,
    };
}
