import UserListItem from '../../components/UserListItem';
import EmptyState from '../../components/EmptyState';
import type { User } from '../../types';

interface UserSelectorProps {
    allUsers: User[];
    loadingUsers: boolean;
    selectedUsers: string[];
    chatType: 'private' | 'group';
    onToggle: (userId: string) => void;
}

export default function UserSelector({
    allUsers,
    loadingUsers,
    selectedUsers,
    chatType,
    onToggle,
}: UserSelectorProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
                {chatType === 'private' ? 'Select User' : 'Select Participants'}
            </label>
            {loadingUsers ? (
                <div className="text-center py-8 text-gray-500">
                    Loading users...
                </div>
            ) : allUsers.length === 0 ? (
                <EmptyState message="No users available" />
            ) : (
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                    {allUsers.map((user) => (
                        <UserListItem
                            key={user._id}
                            user={user}
                            selected={selectedUsers.includes(user._id)}
                            selectionType={
                                chatType === 'private' ? 'radio' : 'checkbox'
                            }
                            onToggle={() => onToggle(user._id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
