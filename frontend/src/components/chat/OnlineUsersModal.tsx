import { useEffect, useRef } from 'react';
import type { User } from '../../types';
import UserAvatar from '../UserAvatar';

interface OnlineUsersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onlineUserIds: string[];
    allUsers: User[];
}

export default function OnlineUsersModal({
    isOpen,
    onClose,
    onlineUserIds,
    allUsers,
}: OnlineUsersModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        const handleClickOutside = (e: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);
    const onlineUsers = allUsers.filter((user) =>
        onlineUserIds.includes(user._id),
    );
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div
                ref={modalRef}
                className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">
                        Online Users ({onlineUsers.length})
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-gray-800 transition"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {onlineUsers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No users online
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {onlineUsers.map((user) => (
                                <div
                                    key={user._id}
                                    className="flex items-center gap-3 p-4 hover:bg-gray-50 transition"
                                >
                                    <div className="relative">
                                        <UserAvatar
                                            name={user.fullName}
                                            size="md"
                                            online={true}
                                        />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-800">
                                            {user.fullName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
