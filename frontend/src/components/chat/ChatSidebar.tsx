import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Chat, User } from '../../types';
import EmptyState from '../EmptyState';
import InvitationsModal from '../InvitationsModal';
import ChatListItem from './ChatListItem';
import OnlineUsersModal from './OnlineUsersModal';

interface ChatSidebarProps {
    joinedChats: Chat[];
    notJoinedChats: Chat[];
    currentChat: Chat | null;
    user: User | null;
    onlineUserIds: string[];
    allUsers: User[];
    onChatSelect: (chat: Chat) => void;
    isOnline: (chat: Chat) => boolean;
    onLogout: () => void;
}

export default function ChatSidebar({
    joinedChats,
    notJoinedChats,
    currentChat,
    user,
    onlineUserIds,
    allUsers,
    onChatSelect,
    isOnline,
    onLogout,
}: ChatSidebarProps) {
    const navigate = useNavigate();

    const [showOnlineModal, setShowOnlineModal] = useState(false);
    const [showInvitations, setShowInvitations] = useState(false);

    return (
        <div className="flex w-80 flex-col border-r border-gray-200 bg-white">
            <div className="border-b border-gray-200 p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Chats</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/create-chat')}
                            className="rounded-lg bg-blue-300 p-2 text-white outline-2 transition hover:outline-blue-700"
                            title="New Chat"
                        >
                            ➕
                        </button>
                        <button
                            onClick={() => setShowInvitations(true)}
                            className="rounded-lg bg-yellow-300 p-2 text-white outline-2 transition hover:outline-yellow-700"
                            title="Invitations"
                        >
                            📩
                        </button>
                        <button
                            onClick={onLogout}
                            className="rounded-lg bg-red-300 p-2 text-white outline-2 transition hover:outline-red-700"
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
                        className="flex items-center gap-1 rounded-lg bg-green-100 px-2 py-1 text-green-700 transition hover:bg-green-200"
                        title="View online users"
                    >
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
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
            <InvitationsModal
                open={showInvitations}
                onClose={() => setShowInvitations(false)}
            />

            <div className="flex-1 overflow-y-auto">
                <div className="bg-gray-100 py-2 text-center text-xl font-bold text-gray-800">
                    Joined Chat
                </div>
                {joinedChats.length === 0 ? (
                    <EmptyState
                        message="No chats yet"
                        action={{
                            label: 'Create your first chat',
                            onClick: () => navigate('/create-chat'),
                        }}
                    />
                ) : (
                    joinedChats.map((chat) => (
                        <ChatListItem
                            key={chat._id}
                            chat={chat}
                            currentUser={user}
                            allUsers={allUsers}
                            isActive={currentChat?._id === chat._id}
                            online={isOnline(chat)}
                            onClick={() => onChatSelect(chat)}
                        />
                    ))
                )}

                <div className="bg-gray-100 py-2 text-center text-xl font-bold text-gray-800">
                    Not Joined
                </div>
                {notJoinedChats.length === 0 ? (
                    <EmptyState
                        message="No More Chat to Join!"
                        action={{
                            label: '',
                            onClick: () => {},
                        }}
                    />
                ) : (
                    notJoinedChats.map((chat) => (
                        <ChatListItem
                            key={chat._id}
                            chat={chat}
                            currentUser={user}
                            allUsers={allUsers}
                            isActive={currentChat?._id === chat._id}
                            online={isOnline(chat)}
                            onClick={() => onChatSelect(chat)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
