import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { chatAPI, messageAPI } from '../services/api';
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
import type { Chat, Message, User } from '../types';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/message/MessageList';
import MessageInput from '../components/message/MessageInput';
import EmptyState from '../components/EmptyState';

export default function ChatRoom() {
    const [typingTimeout, setTypingTimeout] = useState<number | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { user, token } = useSelector((state: RootState) => state.auth);
    const { chats, currentChat, messages, typingUsers, onlineUsers } =
        useSelector((state: RootState) => state.chat);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        loadChats();
        loadAllUsers();
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

    const loadAllUsers = async () => {
        try {
            const { data } = await messageAPI.getAllContacts();
            setAllUsers([...data, user]);
        } catch (error) {
            console.error('Failed to load users');
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

    const handleSendMessage = async (text: string) => {
        if (!currentChat) return;

        return new Promise<void>((resolve, reject) => {
            socketService.sendMessage(
                {
                    chatId: currentChat._id,
                    text: text,
                },
                (ack: any) => {
                    if (ack.status === 'ok') {
                        resolve();
                    } else {
                        toast.error('Failed to send message');
                        reject(new Error('Failed to send'));
                    }
                },
            );
        });
    };

    const handleTyping = () => {
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

    const isOnline = (chat: Chat) => {
        if (chat.type === 'group') {
            // Check if ANY participant in the group is online (excluding current user)
            return chat.participants.some((p) => {
                const userId = p.user.trim();
                return onlineUsers.includes(userId);
            });
        } else {
            // For private chat, check if the other user is online
            const otherUserId =
                chat.participants.find((p) => p.user !== user?._id)?.user || '';
            return onlineUsers.includes(otherUserId.trim());
        }
    };

    return (
        <div className="h-screen flex bg-gray-50">
            <ChatSidebar
                chats={chats}
                currentChat={currentChat}
                user={user}
                onlineUserIds={onlineUsers}
                allUsers={allUsers}
                onChatSelect={(chat) => dispatch(setCurrentChat(chat))}
                isOnline={isOnline}
                onLogout={handleLogout}
            />

            <div className="flex-1 flex flex-col">
                {currentChat ? (
                    <>
                        <ChatHeader
                            chat={currentChat}
                            chatName={getChatName(currentChat)}
                            online={isOnline(currentChat)}
                            onlineUserIds={onlineUsers}
                        />

                        <MessageList
                            messages={messages}
                            currentUser={user}
                            typingUsers={getTypingUsers()}
                        />

                        <MessageInput
                            onSendMessage={handleSendMessage}
                            onTyping={handleTyping}
                        />
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
