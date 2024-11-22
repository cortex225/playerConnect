// hooks/use-send-messages.ts
interface SendMessageParams {
    content: string;
    receiverId: string;
    senderId: string;
    senderRole: string;
}

export const sendMessage = async ({
                                      content,
                                      receiverId,
                                      senderId,
                                      senderRole
                                  }: SendMessageParams) => {
    try {
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content,
                receiverId,
                senderId,
                senderRole
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        const data = await response.json();
        return {
            id: data.id,
            content,
            sender: senderId,
            timestamp: new Date().toISOString(),
            isRead: false,
        };
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};