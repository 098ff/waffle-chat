import { useEffect, useState } from 'react';
import { chatAPI } from '../../services/api';
import type { Chat } from '../../types';
import UserAvatar from '../UserAvatar';

interface ChatHeaderProps {
    chat: Chat;
    chatName: string;
    chatProfilePic?: string;
    online: boolean;
    onlineUserIds: string[];
}

interface Member {
    id: string;
    fullName: string;
    online: boolean;
    profilePic: string;
    email: string;
}

export default function ChatHeader({
    chat,
    chatName,
    chatProfilePic,
    online,
    onlineUserIds,
}: ChatHeaderProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    useEffect(() => {
        if (!isModalOpen) return;
        const fetchMembers = async () => {
            setLoadingMembers(true);

            try {
                const { data } = await chatAPI.getChatMembers(chat._id);
                setMembers(data);
            } catch (err) {
                console.error('Failed to fetch members');
            } finally {
                setLoadingMembers(false);
            }
        };

        fetchMembers();
    }, [isModalOpen, chat._id]);

    const handleClick = () => {
        if (chat.type === 'group') {
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <div
                className="border-b border-gray-200 bg-white p-4"
                onClick={handleClick}
            >
                <div className="flex items-center">
                    <UserAvatar
                        name={chatName}
                        profilePic={chatProfilePic}
                        size="md"
                        online={online}
                    />
                    <div className="ml-3">
                        <div className="font-semibold text-gray-800">
                            {chatName}
                        </div>
                        <div className="cursor-pointer text-sm text-gray-500">
                            {chat.type === 'group'
                                ? `${chat.participants.length} members`
                                : ''}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-white/70"
                    onClick={() => setIsModalOpen(false)} // clicking outside modal closes it
                >
                    {/* Modal box */}
                    <div
                        className="relative w-96 rounded-lg bg-white p-6 shadow-lg"
                        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
                    >
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                            onClick={() => setIsModalOpen(false)}
                        >
                            ✕
                        </button>

                        <h2 className="mb-4 text-lg font-semibold">Members</h2>

                        {loadingMembers ? (
                            <div className="text-gray-500">Loading...</div>
                        ) : (
                            <div className="max-h-80 space-y-3 overflow-y-auto">
                                {members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center space-x-3"
                                    >
                                        <UserAvatar
                                            name={member.fullName}
                                            profilePic={member.profilePic}
                                            size="md"
                                            online={onlineUserIds.includes(
                                                member.id,
                                            )}
                                        />
                                        <div className="ml-3">
                                            <div className="font-medium text-gray-800">
                                                {member.fullName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {member.email}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
