interface UseMessageSubmitProps<TMessage> {
    sendMessage: (message: string) => void;
    setDisplayMessages: React.Dispatch<React.SetStateAction<TMessage[]>>;
    displayedMessageSet: React.MutableRefObject<Set<string>>;
    constants: {
        display_name_of_role: string;
        display_name_of_role_user: string;
        display_name_of_content: string;
    };
}

export function useMessageSubmit<TMessage>({
                                               sendMessage,
                                               setDisplayMessages,
                                               displayedMessageSet,
                                               constants,
                                           }: UseMessageSubmitProps<TMessage>) {
    const onSubmit = (values: { prompt: string }) => {
        const trimmedPrompt = values.prompt.trim();
        const userMsg = {
            [constants.display_name_of_role]: constants.display_name_of_role_user,
            [constants.display_name_of_content]: trimmedPrompt,
        } as TMessage;
        const messageKey = `${constants.display_name_of_role_user}-${trimmedPrompt}`;
        displayedMessageSet.current.add(messageKey);
        setDisplayMessages((prev) => [...prev, userMsg]);
        sendMessage(trimmedPrompt);
    };

    return onSubmit;
}
