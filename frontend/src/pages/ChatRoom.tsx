import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { chatAPI } from '../services/api';
import { socketService } from '../services/socket';
import {
    setChats,
    setCurrentChat,
    setMessages,
    addMessage,
    setOnlineUsers,
    setTyping,
} from '../store/chatSlice';
import { logout } from '../store/authSlice';
import { toast } from 'react-toastify';
import type { RootState, AppDispatch } from '../store';
import type { Chat, Message } from '../types';
import Button from '../components/Button';
import ChatListItem from '../components/ChatListItem';
import MessageBubble from '../components/MessageBubble';
import EmptyState from '../components/EmptyState';
import UserAvatar from '../components/UserAvatar';

export default function ChatRoom() {
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { user, token } = useSelector((state: RootState) => state.auth);
    const { chats, currentChat, messages, typingUsers } = useSelector(
        (state: RootState) => state.chat,
    );

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        loadChats();
        initializeSocket();

        return () => {
            socketService.disconnect();
        };
    }, [token]);

    useEffect(() => {
        if (currentChat) {
            loadMessages(currentChat._id);
            socketService.joinRoom(currentChat._id);
        }
    }, [currentChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const initializeSocket = () => {
        if (!token) return;

        socketService.connect(token);

        socketService.on('message:new', (message: Message) => {
            dispatch(addMessage(message));
        });

        socketService.on(
            'typing',
            (data: { chatId: string; userId: string; typing: boolean }) => {
                if (data.userId !== user?._id) {
                    dispatch(setTyping(data));
                }
            },
        );

        socketService.on('getOnlineUsers', (users: string[]) => {
            dispatch(setOnlineUsers(users));
        });
    };

    const loadChats = async () => {
        try {
            const { data } = await chatAPI.getChats();
            dispatch(setChats(data));
            if (data.length > 0 && !currentChat) {
                dispatch(setCurrentChat(data[0]));
            }
        } catch (error) {
            toast.error('Failed to load chats');
        }
    };

    const loadMessages = async (chatId: string) => {
        try {
            const { data } = await chatAPI.getChatMessages(chatId);
            dispatch(setMessages(data));
        } catch (error) {
            toast.error('Failed to load messages');
        }
    };

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!messageText.trim() || !currentChat || sending) return;

        setSending(true);
        try {
            socketService.sendMessage(
                {
                    chatId: currentChat._id,
                    text: messageText.trim(),
                },
                (ack: any) => {
                    if (ack.status === 'ok') {
                        setMessageText('');
                    } else {
                        toast.error('Failed to send message');
                    }
                    setSending(false);
                },
            );
        } catch (error) {
            toast.error('Failed to send message');
            setSending(false);
        }
    };

    const handleTyping = (text: string) => {
        setMessageText(text);

        if (!currentChat) return;

        // Clear existing timeout
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        // Send typing indicator
        socketService.sendTyping(currentChat._id, true);

        // Stop typing after 2 seconds of inactivity
        const timeout = setTimeout(() => {
            socketService.sendTyping(currentChat._id, false);
        }, 2000);

        setTypingTimeout(timeout);
    };

    const handleLogout = () => {
        socketService.disconnect();
        dispatch(logout());
        navigate('/login');
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const getChatName = (chat: Chat) => {
        if (chat.type === 'group') {
            return chat.name || 'Group Chat';
        }
        const otherParticipant = chat.participants.find(
            (p) => p.user !== user?._id,
        );
        if (otherParticipant) {
            return otherParticipant.fullName;
        }
        return 'Private Chat';
    };

    const getTypingUsers = () => {
        if (!currentChat) return [];
        return typingUsers[currentChat._id] || [];
    };

    return (
        <div className="h-screen flex bg-gray-50">
            {/* Sidebar - Chat List */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            Chats
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate('/create-chat')}
                                className="p-2 outline-2 bg-blue-300 text-white rounded-lg hover:outline-blue-700 transition"
                                title="New Chat"
                            >
                                ➕
                            </button>
                            <button
                                onClick={handleLogout}
                                className="p-2 outline-2 bg-red-300 text-white rounded-lg hover:outline-red-700 transition"
                                title="Logout"
                            >
                                🚪
                            </button>
                        </div>
                    </div>
                    <div className="text-sm text-gray-600">
                        Logged in as:{' '}
                        <span className="font-medium">{user?.fullName}</span>
                    </div>
                </div>

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
                                onClick={() => dispatch(setCurrentChat(chat))}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {currentChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white border-b border-gray-200 p-4">
                            <div className="flex items-center">
                                <UserAvatar
                                    name={getChatName(currentChat)}
                                    size="md"
                                />
                                <div className="ml-3">
                                    <div className="font-semibold text-gray-800">
                                        {getChatName(currentChat)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {currentChat.type === 'group'
                                            ? `${currentChat.participants.length} members`
                                            : ''}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
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
                                        currentUser={user}
                                    />
                                ))
                            )}
                            {getTypingUsers().length > 0 && (
                                <div className="text-sm text-gray-500 italic">
                                    Someone is typing...
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="bg-white border-t border-gray-200 p-4">
                            <form
                                onSubmit={handleSendMessage}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={messageText}
                                    onChange={(e) =>
                                        handleTyping(e.target.value)
                                    }
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    disabled={sending}
                                />
                                <Button
                                    type="submit"
                                    disabled={!messageText.trim() || sending}
                                    loading={sending}
                                >
                                    Send
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <EmptyState message="Welcome to Waffle Chat! Select a chat to start messaging" />
                    </div>
                )}
            </div>
        </div>
    );
}
