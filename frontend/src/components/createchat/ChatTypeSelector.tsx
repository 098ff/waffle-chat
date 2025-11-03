import ChatTypeCard from '../../components/chat/ChatTypeCard';
import type { Dispatch, SetStateAction } from 'react';

interface ChatTypeSelectorProps {
    chatType: 'private' | 'group';
    setChatType: Dispatch<SetStateAction<'private' | 'group'>>;
    resetSelection: () => void;
}

export default function ChatTypeSelector({
    chatType,
    setChatType,
    resetSelection,
}: ChatTypeSelectorProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
                Chat Type
            </label>
            <div className="flex gap-4">
                <ChatTypeCard
                    type="private"
                    title="Private Chat"
                    description="One-on-one conversation"
                    isSelected={chatType === 'private'}
                    onClick={() => {
                        setChatType('private');
                        resetSelection();
                    }}
                />
                <ChatTypeCard
                    type="group"
                    title="Group Chat"
                    description="Chat with multiple people"
                    isSelected={chatType === 'group'}
                    onClick={() => {
                        setChatType('group');
                        resetSelection();
                    }}
                />
            </div>
        </div>
    );
}
