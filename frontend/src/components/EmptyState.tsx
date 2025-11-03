import type { ReactNode } from 'react';

interface EmptyStateProps {
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    children?: ReactNode;
}

export default function EmptyState({
    message,
    action,
    children,
}: EmptyStateProps) {
    return (
        <div className="text-center py-8 text-gray-500">
            <p>{message}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-2 text-blue-600 hover:text-blue-700 transition"
                >
                    {action.label}
                </button>
            )}
            {children}
        </div>
    );
}
