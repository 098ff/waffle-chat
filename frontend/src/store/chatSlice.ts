import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Chat, Message } from '../types';

interface ChatState {
    chats: Chat[];
    currentChat: Chat | null;
    messages: Message[];
    onlineUsers: string[];
    typingUsers: { [chatId: string]: string[] };
    loading: boolean;
}

const initialState: ChatState = {
    chats: [],
    currentChat: null,
    messages: [],
    onlineUsers: [],
    typingUsers: {},
    loading: false,
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setChats: (state, action: PayloadAction<Chat[]>) => {
            state.chats = action.payload;
        },
        addChat: (state, action: PayloadAction<Chat>) => {
            const exists = state.chats.find(
                (c) => c._id === action.payload._id,
            );
            if (!exists) {
                state.chats.unshift(action.payload);
            }
        },
        setCurrentChat: (state, action: PayloadAction<Chat | null>) => {
            state.currentChat = action.payload;
        },
        setMessages: (state, action: PayloadAction<Message[]>) => {
            state.messages = action.payload;
        },
        addMessage: (state, action: PayloadAction<Message>) => {
            state.messages.push(action.payload);
        },
        setOnlineUsers: (state, action: PayloadAction<string[]>) => {
            state.onlineUsers = action.payload;
        },
        setTyping: (
            state,
            action: PayloadAction<{
                chatId: string;
                userId: string;
                typing: boolean;
            }>,
        ) => {
            const { chatId, userId, typing } = action.payload;
            if (!state.typingUsers[chatId]) {
                state.typingUsers[chatId] = [];
            }
            if (typing) {
                if (!state.typingUsers[chatId].includes(userId)) {
                    state.typingUsers[chatId].push(userId);
                }
            } else {
                state.typingUsers[chatId] = state.typingUsers[chatId].filter(
                    (id) => id !== userId,
                );
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const {
    setChats,
    addChat,
    setCurrentChat,
    setMessages,
    addMessage,
    setOnlineUsers,
    setTyping,
    setLoading,
} = chatSlice.actions;
export default chatSlice.reducer;
