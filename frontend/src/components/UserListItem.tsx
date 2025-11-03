import type { User } from '../types';

interface UserListItemProps {
    user: User;
    selected: boolean;
    onToggle: () => void;
    selectionType: 'radio' | 'checkbox';
}

export default function UserListItem({
    user,
    selected,
    onToggle,
    selectionType,
}: UserListItemProps) {
    return (
        <label className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition">
            <input
                type={selectionType}
                name="user"
                checked={selected}
                onChange={onToggle}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <div className="ml-3 flex-1">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                        <div className="font-medium text-gray-800">
                            {user.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                            {user.email}
                        </div>
                    </div>
                </div>
            </div>
        </label>
    );
}
