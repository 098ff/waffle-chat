import { useNavigate } from 'react-router-dom';

interface CreateChatHeaderProps {
    title?: string;
}

export default function CreateChatHeader({
    title = 'Create New Chat',
}: CreateChatHeaderProps) {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            <button
                onClick={() => navigate('/chats')}
                className="text-gray-600 hover:text-gray-800 transition"
                aria-label="Close"
            >
                ✕
            </button>
        </div>
    );
}
