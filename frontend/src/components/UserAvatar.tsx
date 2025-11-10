import type { User } from '../types';

interface UserAvatarProps {
    user?: User | string;
    name: string;
    profilePic?: string;
    size?: 'sm' | 'md' | 'lg';
    online?: boolean;
}

export default function UserAvatar({
    name,
    profilePic,
    size = 'md',
    online = false,
}: UserAvatarProps) {
    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
    };
    const initial = name.charAt(0).toUpperCase();
    const avatarColor = () => {
        // Avatar color relate with alphabet
        const charCode = initial.charCodeAt(0);
        const colors = [
            'from-blue-400 to-blue-600',
            'from-red-400 to-red-600',
            'from-green-400 to-green-600',
            'from-purple-400 to-purple-600',
            'from-pink-400 to-pink-600',
            'from-yellow-400 to-yellow-600',
            'from-indigo-400 to-indigo-600',
            'from-teal-400 to-teal-600',
        ];
        return colors[charCode % colors.length];
    };
    return (
        <div className="relative shrink-0">
            {profilePic ? (
                <img
                    src={profilePic}
                    alt={name}
                    className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200`}
                />
            ) : (
                <div
                    className={`${
                        sizeClasses[size]
                    } rounded-full bg-linear-to-br ${avatarColor()} flex items-center justify-center text-white font-semibold`}
                >
                    {initial}
                </div>
            )}
            <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    online ? 'bg-green-500' : 'bg-gray-400'
                }`}
            />
        </div>
    );
}
