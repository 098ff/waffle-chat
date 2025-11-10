import type { Message, User } from '../../types';

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

    // sender name when sender object is present and not the current user
    const senderName =
        typeof message.senderId === 'object' && message.senderId
            ? message.senderId.fullName
            : '';

    return (
        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-xs lg:max-w-md">
                {!isMine && senderName && (
                    <div className="text-xs font-medium text-gray-600 mb-1">
                        {senderName}
                    </div>
                )}
                <div
                    className={`px-4 py-2 rounded-lg ${
                        isMine
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                >
                    {message.text && <p className="break-words">{message.text}</p>}
                    
                    {message.image && (
                        <img
                            src={message.image}
                            alt="attachment"
                            className="mt-2 rounded max-w-full"
                        />
                    )}

                    {message.audio && (
                        <audio
                            src={message.audio}
                            controls
                            className="mt-2 w-full max-w-xs"
                        />
                    )}
                    
                    <div
                        className={`text-xs mt-1 ${
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