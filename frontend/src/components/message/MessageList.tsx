import { useRef, useEffect } from 'react';
import type { Message, User } from '../../types';
import MessageBubble from './MessageBubble';

interface MessageListProps {
    messages: Message[];
    currentUser: User | null;
    typingUsers: string[];
}

export default function MessageList({
    messages,
    currentUser,
    typingUsers,
}: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                    No messages yet. Start the conversation!
                </div>
            ) : (
                messages.map((message) => (
                    <MessageBubble
                        key={message._id}
                        message={message}
                        currentUser={currentUser}
                    />
                ))
            )}
            {typingUsers.length > 0 && (
                <div className="text-sm text-gray-500 italic">
                    Someone is typing...
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
}
