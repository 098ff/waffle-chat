import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { chatAPI, messageAPI } from '../services/api';
import { addChat } from '../store/chatSlice';
import { toast } from 'react-toastify';
import type { AppDispatch } from '../store';
import type { User } from '../types';
import Button from '../components/Button';
import InputField from '../components/InputField';
import ChatTypeCard from '../components/chat/ChatTypeCard';
import UserListItem from '../components/UserListItem';
import EmptyState from '../components/EmptyState';

export default function CreateChat() {
    const [chatType, setChatType] = useState<'private' | 'group'>('private');
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await messageAPI.getAllContacts();
            setAllUsers(data);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleUserToggle = (userId: string) => {
        if (chatType === 'private') {
            setSelectedUsers([userId]);
        } else {
            setSelectedUsers((prev) =>
                prev.includes(userId)
                    ? prev.filter((id) => id !== userId)
                    : [...prev, userId],
            );
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (selectedUsers.length === 0) {
            toast.error('Please select at least one user');
            return;
        }

        if (chatType === 'private' && selectedUsers.length !== 1) {
            toast.error('Private chat requires exactly one user');
            return;
        }

        if (chatType === 'group' && !groupName.trim()) {
            toast.error('Please enter a group name');
            return;
        }

        setLoading(true);
        try {
            const { data } = await chatAPI.createChat({
                type: chatType,
                name: chatType === 'group' ? groupName : undefined,
                participants: selectedUsers,
            });

            dispatch(addChat(data));
            toast.success(
                `${
                    chatType === 'private' ? 'Chat' : 'Group'
                } created successfully!`,
            );
            navigate('/chats');
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Failed to create chat',
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Create New Chat
                        </h1>
                        <button
                            onClick={() => navigate('/chats')}
                            className="text-gray-600 hover:text-gray-800 transition"
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Chat Type Selector */}
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
                                        setSelectedUsers([]);
                                    }}
                                />
                                <ChatTypeCard
                                    type="group"
                                    title="Group Chat"
                                    description="Chat with multiple people"
                                    isSelected={chatType === 'group'}
                                    onClick={() => {
                                        setChatType('group');
                                        setSelectedUsers([]);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Group Name */}
                        {chatType === 'group' && (
                            <InputField
                                label="Group Name"
                                id="groupName"
                                type="text"
                                required={chatType === 'group'}
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Enter group name"
                            />
                        )}

                        {/* User Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                {chatType === 'private'
                                    ? 'Select User'
                                    : 'Select Participants'}
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
                                            selected={selectedUsers.includes(
                                                user._id,
                                            )}
                                            selectionType={
                                                chatType === 'private'
                                                    ? 'radio'
                                                    : 'checkbox'
                                            }
                                            onToggle={() =>
                                                handleUserToggle(user._id)
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Count */}
                        {selectedUsers.length > 0 && (
                            <div className="text-sm text-gray-600">
                                Selected: {selectedUsers.length} user
                                {selectedUsers.length > 1 ? 's' : ''}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate('/chats')}
                                fullWidth
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || selectedUsers.length === 0}
                                loading={loading}
                                fullWidth
                            >
                                Create{' '}
                                {chatType === 'private' ? 'Chat' : 'Group'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
