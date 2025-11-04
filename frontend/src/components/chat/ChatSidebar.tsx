import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Chat, User } from '../../types';
import ChatListItem from './ChatListItem';
import EmptyState from '../EmptyState';
import OnlineUsersModal from './OnlineUsersModal';

interface ChatSidebarProps {
    chats: Chat[];
    currentChat: Chat | null;
    user: User | null;
    onlineUserIds: string[];
    allUsers: User[];
    onChatSelect: (chat: Chat) => void;
    onLogout: () => void;
}

export default function ChatSidebar({
    chats,
    currentChat,
    user,
    onlineUserIds,
    allUsers,
    onChatSelect,
    onLogout,
}: ChatSidebarProps) {
    const navigate = useNavigate();
    const [showOnlineModal, setShowOnlineModal] = useState(false);

    return (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Chats</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/create-chat')}
                            className="p-2 outline-2 bg-blue-300 text-white rounded-lg hover:outline-blue-700 transition"
                            title="New Chat"
                        >
                            ➕
                        </button>
                        <button
                            onClick={onLogout}
                            className="p-2 outline-2 bg-red-300 text-white rounded-lg hover:outline-red-700 transition"
                            title="Logout"
                        >
                            🚪
                        </button>
                    </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <div>
                        Logged in as:{' '}
                        <span className="font-medium">{user?.fullName}</span>
                    </div>
                    <button
                        onClick={() => setShowOnlineModal(true)}
                        className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                        title="View online users"
                    >
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="font-medium">
                            {onlineUserIds.length}
                        </span>
                    </button>
                </div>
            </div>

            <OnlineUsersModal
                isOpen={showOnlineModal}
                onClose={() => setShowOnlineModal(false)}
                onlineUserIds={onlineUserIds}
                allUsers={allUsers}
            />

            <div className="flex-1 overflow-y-auto">
                {chats.length === 0 ? (
                    <EmptyState
                        message="No chats yet"
                        action={{
                            label: 'Create your first chat',
                            onClick: () => navigate('/create-chat'),
                        }}
                    />
                ) : (
                    chats.map((chat) => (
                        <ChatListItem
                            key={chat._id}
                            chat={chat}
                            currentUser={user}
                            isActive={currentChat?._id === chat._id}
                            onClick={() => onChatSelect(chat)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
