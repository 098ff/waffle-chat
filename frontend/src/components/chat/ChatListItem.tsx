'use client';
import type { Chat, User } from '../../types';
import UserAvatar from '../UserAvatar';

interface ChatListItemProps {
    chat: Chat;
    currentUser: User | null;
    isActive: boolean;
    online: boolean;
    onClick: () => void;
}

export default function ChatListItem({
    chat,
    currentUser,
    isActive,
    online,
    onClick,
}: ChatListItemProps) {
    const getChatName = (chat: Chat) => {
        if (chat.type === 'group') {
            return chat.name || 'Group Chat';
        }
        const otherParticipant = chat.participants.find(
            (p) => p.user !== currentUser?._id,
        );
        if (otherParticipant) {
            return otherParticipant.fullName;
        }
        return 'Private Chat';
    };

    const chatName = getChatName(chat);

    return (
        <button
            onClick={onClick}
            className={`w-full h-fit p-4 border-b border-gray-100 hover:bg-gray-50 transition text-left ${
                isActive ? 'bg-blue-50' : ''
            }`}
        >
            <div className="flex items-center gap-4">
                <UserAvatar name={chatName} size="md" online={online} />
                <div className="ml-3 flex-1 overflow-hidden">
                    <span className="font-medium text-gray-800 truncate">
                        {chatName}
                    </span>
                    <div className="text-sm text-gray-500">
                        {chat.type === 'group'
                            ? `${chat.participants.length} members`
                            : ''}
                    </div>
                </div>
            </div>
        </button>
    );
}
