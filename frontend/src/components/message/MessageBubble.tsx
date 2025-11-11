import type { Message, User } from '../../types';
import AudioPlayer from './AudioPlayer';

interface MessageBubbleProps {
    message: Message;
    currentUser: User | null;
}

export default function MessageBubble({
    message,
    currentUser,
}: MessageBubbleProps) {
    const isMine =
        typeof message.senderId === 'string'
            ? message.senderId === currentUser?._id
            : message.senderId._id === currentUser?._id;

    const senderName =
        typeof message.senderId === 'object' && message.senderId
            ? message.senderId.fullName
            : '';

    return (
        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-xs lg:max-w-md">
                {!isMine && senderName && (
                    <div className="mb-1 text-xs font-medium text-gray-600">
                        {senderName}
                    </div>
                )}
                <div
                    className={`rounded-lg px-4 py-2 ${
                        isMine
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-200 bg-white text-gray-800'
                    }`}
                >
                    {message.text && (
                        <p className="break-words">{message.text}</p>
                    )}

                    {message.image && (
                        <img
                            src={message.image}
                            alt="attachment"
                            className="mt-2 max-w-full rounded"
                        />
                    )}

                    {message.audio && (
                        <AudioPlayer audioUrl={message.audio} isMine={isMine} />
                    )}

                    <div
                        className={`mt-1 text-xs ${
                            isMine ? 'text-blue-100' : 'text-gray-500'
                        }`}
                    >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
