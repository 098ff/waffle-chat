import type { User } from '../types';

interface UserAvatarProps {
    user?: User | string;
    name: string;
    size?: 'sm' | 'md' | 'lg';
    online?: boolean;
}

export default function UserAvatar({
    name,
    size = 'md',
    online,
}: UserAvatarProps) {
    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
    };

    const initial = name.charAt(0).toUpperCase();

    return (
        <div className="relative shrink-0">
            <div
                className={`${sizeClasses[size]} rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold`}
            >
                {initial}
            </div>
            {online !== undefined && (
                <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        online ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                />
            )}
        </div>
    );
}
