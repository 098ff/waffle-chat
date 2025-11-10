export interface User {
    _id: string;
    email: string;
    fullName: string;
    profilePic?: string;
    createdAt: string;
}

export interface AuthResponse {
    success: boolean;
    _id: string;
    name: string;
    email: string;
    token: string;
}

export interface Participant {
    user: string;
    role: 'member' | 'admin';
    fullName: string;
    joinedAt: string;
    _id?: string;
}

export interface Chat {
    _id: string;
    type: 'private' | 'group';
    name?: string;
    participants: Participant[];
    createdBy: string;
    metadata?: {
        avatarUrl?: string;
        description?: string;
    };
    lastMessage?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    _id: string;
    senderId: string | User;
    receiverId?: string | User;
    chatId?: string;
    text?: string;
    image?: string;
    audio: any;
    status: 'sent' | 'delivered' | 'read';
    readBy?: Array<{
        userId: string;
        readAt: string;
    }>;
    createdAt: string;
    updatedAt: string;
}

export interface CreateChatPayload {
    type: 'private' | 'group';
    name?: string;
    participants: string[];
}

export interface SendMessagePayload {
    chatId: string;
    text?: string;
    image?: string;
}

export type Invitation = {
  _id: string;
  chat: {
    _id: string;
    name: string;
    type: string;
  };
  inviter: {
    _id: string;
    fullName: string;
    email?: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
};

