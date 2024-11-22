import { useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Message } from '@/types/chat';

interface MessageListProps {
    messages: Message[];
    currentUserId: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <ScrollArea className="h-[600px] p-4" ref={scrollRef}>
            <div className="space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex items-start gap-3 ${
                            message.userId === currentUserId ? 'flex-row-reverse' : ''
                        }`}
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={message.userPhotoURL || ''} />
                            <AvatarFallback>
                                {message.userName?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div
                            className={`flex flex-col ${
                                message.userId === currentUserId ? 'items-end' : ''
                            }`}
                        >
                            <div
                                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                                    message.userId === currentUserId
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                }`}
                            >
                                <p className="text-sm">{message.content}</p>
                            </div>
                            <span className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(message.timestamp), {
                    addSuffix: true,
                })}
              </span>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}