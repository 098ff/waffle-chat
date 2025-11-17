import type { Chat, User } from '../types';

/**
 * Get the display name for a chat
 * @param chat - The chat object
 * @param currentUserId - The current user's ID
 * @returns The chat display name
 */
export const getChatName = (chat: Chat, currentUserId?: string): string => {
    if (chat.type === 'group') {
        return chat.name || 'Group Chat';
    }
    const otherParticipant = chat.participants.find((p) => {
        const userId = typeof p.user === 'string' ? p.user : p.user._id;
        return userId !== currentUserId;
    });
    if (otherParticipant) {
        return otherParticipant.fullName;
    }
    return 'Private Chat';
};

/**
 * Get the profile picture URL for a chat
 * @param chat - The chat object
 * @param currentUserId - The current user's ID
 * @param allUsers - Array of all users for fallback lookup
 * @returns The profile picture URL or undefined
 */
export const getChatProfilePic = (
    chat: Chat,
    currentUserId?: string,
    allUsers: User[] = [],
): string | undefined => {
    if (chat.type === 'group') {
        return chat.metadata?.avatarUrl;
    }

    const otherParticipant = chat.participants.find((p) => {
        const userId = typeof p.user === 'string' ? p.user : p.user._id;
        return userId !== currentUserId;
    });

    if (!otherParticipant) return undefined;

    // If user is populated as an object, get profilePic directly
    if (
        typeof otherParticipant.user === 'object' &&
        otherParticipant.user.profilePic
    ) {
        return otherParticipant.user.profilePic;
    }

    // Otherwise, find the user in allUsers array (fallback for non-populated data)
    const userId =
        typeof otherParticipant.user === 'string'
            ? otherParticipant.user
            : otherParticipant.user._id;
    const otherUser = allUsers.find((u) => u._id === userId);
    return otherUser?.profilePic;
};
