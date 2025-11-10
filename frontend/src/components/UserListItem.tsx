import type { User } from '../types';
import UserAvatar from './UserAvatar';

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
                    <UserAvatar 
                        name={user.fullName}
                        profilePic={user.profilePic}
                        size="md"
                    />
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
