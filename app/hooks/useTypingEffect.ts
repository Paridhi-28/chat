import {useCallback, useEffect, useRef, useState} from "react";

export const useTypingEffect = (onFinish: (text: string) => void, speed = 50) => {
    const [typingText, setTypingText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const fullTextRef = useRef<string>("");

    const startTyping = useCallback(
        (text: string) => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            fullTextRef.current = text;
            setIsTyping(true);
            let i = 0;
            intervalRef.current = setInterval(() => {
                setTypingText(text.slice(0, i + 1) + "...");
                i++;
                if (i >= text.length) {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                    onFinish(text);
                    setTypingText("");
                    setIsTyping(false);
                }
            }, speed);
        },
        [onFinish, speed]
    );

    const skipTyping = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            const fullText = fullTextRef.current;
            onFinish(fullText);
            setTypingText("");
            setIsTyping(false);
        }
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return { typingText, isTyping, startTyping, skipTyping };
};
