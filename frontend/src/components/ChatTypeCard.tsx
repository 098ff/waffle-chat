interface ChatTypeCardProps {
    type: 'private' | 'group';
    title: string;
    description: string;
    isSelected: boolean;
    onClick: () => void;
}

export default function ChatTypeCard({
    title,
    description,
    isSelected,
    onClick,
}: ChatTypeCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
        >
            <div className="font-semibold">{title}</div>
            <div className="text-xs mt-1">{description}</div>
        </button>
    );
}
