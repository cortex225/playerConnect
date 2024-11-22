import { useState, useEffect } from "react";

export function useMessages(userId: string) {
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;

        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/messages?userId=${userId}`);
                if (!res.ok) throw new Error("Erreur lors de la récupération des messages");
                const data = await res.json();
                setMessages(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchMessages();
    }, [userId]);

    return { messages, error };
}