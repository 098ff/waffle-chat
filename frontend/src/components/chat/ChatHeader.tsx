import type { Chat } from '../../types';
import UserAvatar from '../UserAvatar';

interface ChatHeaderProps {
    chat: Chat;
    chatName: string;
    online: boolean;
}

export default function ChatHeader({ chat, chatName, online }: ChatHeaderProps) {
    return (
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
    );
}
