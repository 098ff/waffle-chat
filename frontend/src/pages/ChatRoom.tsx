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
            (p) => typeof p.user === 'object' && p.user._id !== user?._id,
        );
        if (otherParticipant && typeof otherParticipant.user === 'object') {
            return otherParticipant.user.fullName;
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
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                title="New Chat"
                            >
                                ➕
                            </button>
                            <button
                                onClick={handleLogout}
                                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
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
                        <div className="text-center py-8 text-gray-500">
                            <p>No chats yet</p>
                            <button
                                onClick={() => navigate('/create-chat')}
                                className="mt-2 text-blue-600 hover:text-blue-700"
                            >
                                Create your first chat
                            </button>
                        </div>
                    ) : (
                        chats.map((chat) => (
                            <button
                                key={chat._id}
                                onClick={() => dispatch(setCurrentChat(chat))}
                                className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition text-left ${
                                    currentChat?._id === chat._id
                                        ? 'bg-blue-50'
                                        : ''
                                }`}
                            >
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                        {getChatName(chat)
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                    <div className="ml-3 flex-1 overflow-hidden">
                                        <div className="font-medium text-gray-800 truncate">
                                            {getChatName(chat)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {chat.type === 'group'
                                                ? `${chat.participants.length} members`
                                                : 'Private chat'}
                                        </div>
                                    </div>
                                </div>
                            </button>
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
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                                    {getChatName(currentChat)
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                                <div className="ml-3">
                                    <div className="font-semibold text-gray-800">
                                        {getChatName(currentChat)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {currentChat.type === 'group'
                                            ? `${currentChat.participants.length} members`
                                            : 'Private chat'}
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
                                messages.map((message) => {
                                    const isMine =
                                        typeof message.senderId === 'string'
                                            ? message.senderId === user?._id
                                            : message.senderId._id ===
                                              user?._id;

                                    return (
                                        <div
                                            key={message._id}
                                            className={`flex ${
                                                isMine
                                                    ? 'justify-end'
                                                    : 'justify-start'
                                            }`}
                                        >
                                            <div
                                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                    isMine
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white border border-gray-200 text-gray-800'
                                                }`}
                                            >
                                                {message.text && (
                                                    <p className="break-words">
                                                        {message.text}
                                                    </p>
                                                )}
                                                {message.image && (
                                                    <img
                                                        src={message.image}
                                                        alt="attachment"
                                                        className="mt-2 rounded max-w-full"
                                                    />
                                                )}
                                                <div
                                                    className={`text-xs mt-1 ${
                                                        isMine
                                                            ? 'text-blue-100'
                                                            : 'text-gray-500'
                                                    }`}
                                                >
                                                    {new Date(
                                                        message.createdAt,
                                                    ).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
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
                                <button
                                    type="submit"
                                    disabled={!messageText.trim() || sending}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                                >
                                    {sending ? '...' : 'Send'}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <p className="text-lg mb-2">
                                Welcome to Waffle Chat!
                            </p>
                            <p>Select a chat to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
