import { io, Socket } from 'socket.io-client';
import type { Message } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Set<(data: any) => void>> = new Map();

    connect(token: string): void {
        if (this.socket?.connected) return;

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        // Forward events to registered listeners
        this.socket.on('message:new', (data: Message) => {
            this.notifyListeners('message:new', data);
        });

        this.socket.on(
            'typing',
            (data: { chatId: string; userId: string; typing: boolean }) => {
                this.notifyListeners('typing', data);
            },
        );

        this.socket.on(
            'member:joined',
            (data: { chatId: string; userId: string }) => {
                this.notifyListeners('member:joined', data);
            },
        );

        this.socket.on(
            'member:left',
            (data: { chatId: string; userId: string }) => {
                this.notifyListeners('member:left', data);
            },
        );

        this.socket.on('getOnlineUsers', (users: string[]) => {
            this.notifyListeners('getOnlineUsers', users);
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.listeners.clear();
        }
    }

    // Join a chat room
    joinRoom(chatId: string, callback?: (ack: any) => void): void {
        this.socket?.emit('join-room', { chatId }, callback);
    }

    // Leave a chat room
    leaveRoom(chatId: string, callback?: (ack: any) => void): void {
        this.socket?.emit('leave-room', { chatId }, callback);
    }

    // Send a message
    sendMessage(
        payload: { chatId: string; text?: string; image?: string },
        callback?: (ack: any) => void,
    ): void {
        this.socket?.emit('message:create', payload, callback);
    }

    // Send an audio message
    sendAudioMessage(
        payload: { chatId: string; audioData: Blob },
        callback?: (ack: any) => void,
    ): void {
        const reader = new FileReader();
        reader.onload = () => {
            const arrayBuffer = reader.result as ArrayBuffer;
            // emit raw ArrayBuffer (socket.io supports binary)
            this.socket?.emit(
                'message:audio',
                {
                    chatId: payload.chatId,
                    audioData: arrayBuffer,
                },
                callback,
            );
        };
        reader.readAsArrayBuffer(payload.audioData);
    }

    // Send typing indicator
    sendTyping(chatId: string, typing: boolean): void {
        this.socket?.emit('typing', { chatId, typing });
    }

    // Subscribe to events
    on(event: string, callback: (data: any) => void): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
    }

    // Unsubscribe from events
    off(event: string, callback: (data: any) => void): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.delete(callback);
        }
    }

    private notifyListeners(event: string, data: any): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach((callback) => callback(data));
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export const socketService = new SocketService();
