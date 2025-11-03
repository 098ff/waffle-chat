import { useState, type FormEvent } from 'react';
import Button from '../Button';

interface MessageInputProps {
    onSendMessage: (text: string) => Promise<void>;
    onTyping: (text: string) => void;
    disabled?: boolean;
}

export default function MessageInput({
    onSendMessage,
    onTyping,
    disabled = false,
}: MessageInputProps) {
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!messageText.trim() || sending) return;

        setSending(true);
        try {
            await onSendMessage(messageText.trim());
            setMessageText('');
        } catch (error) {
            // Error handling is done in parent component
        } finally {
            setSending(false);
        }
    };

    const handleChange = (text: string) => {
        setMessageText(text);
        onTyping(text);
    };

    return (
        <div className="bg-white border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={messageText}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={disabled || sending}
                />
                <Button
                    type="submit"
                    disabled={!messageText.trim() || sending || disabled}
                    loading={sending}
                >
                    Send
                </Button>
            </form>
        </div>
    );
}
