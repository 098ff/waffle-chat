'use client';
import type { Chat, User } from '../../types';
import { getChatName, getChatProfilePic } from '../../utils';
import UserAvatar from '../UserAvatar';

interface ChatListItemProps {
    chat: Chat;
    currentUser: User | null;
    allUsers: User[];
    isActive: boolean;
    online: boolean;
    onClick: () => void;
}

export default function ChatListItem({
    chat,
    currentUser,
    allUsers,
    isActive,
    online,
    onClick,
}: ChatListItemProps) {
    const chatName = getChatName(chat, currentUser?._id);
    const profilePic = getChatProfilePic(chat, currentUser?._id, allUsers);

    return (
        <button
            onClick={onClick}
            className={`h-fit w-full border-b border-gray-100 p-4 text-left transition hover:bg-gray-50 ${
                isActive ? 'bg-blue-50' : ''
            }`}
        >
            <div className="flex items-center gap-4">
                <UserAvatar
                    name={chatName}
                    profilePic={profilePic}
                    size="md"
                    online={online}
                />
                <div className="ml-3 flex-1 overflow-hidden">
                    <span className="truncate font-medium text-gray-800">
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
