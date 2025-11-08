import type { Chat } from '../../types';
import UserAvatar from '../UserAvatar';

interface ChatHeaderProps {
    chat: Chat;
    chatName: string;
    online: boolean;
}

export default function ChatHeader({ chat, chatName, online }: ChatHeaderProps) {
    return (
        <>
        <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center">
                <UserAvatar name={chatName} size="md" online={online} />
                <div className="ml-3">
                    <div className="font-semibold text-gray-800">
                        {chatName}
                    </div>
                    <div className="text-sm text-gray-500">
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
            className="fixed inset-0 flex items-center justify-center z-50 bg-white/70"
            onClick={() => setIsModalOpen(false)} // clicking outside modal closes it
        >
            {/* Modal box */}
            <div
            className="bg-white rounded-lg w-96 p-6 relative shadow-lg"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
            >
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                    onClick={() => setIsModalOpen(false)}
                >
                ✕
                </button>
                
                <h2 className="text-lg font-semibold mb-4">Members</h2>
                
                {loadingMembers ? (
                    <div className="text-gray-500">Loading...</div>
                ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {members.map((member) => (
                            <div key={member.id} className="flex items-center space-x-3">
                                <UserAvatar name={member.fullName} size="sm" online={onlineUserIds.includes(member.id)} />
                                <div>
                                    <div className="font-medium">{member.fullName}</div>
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
