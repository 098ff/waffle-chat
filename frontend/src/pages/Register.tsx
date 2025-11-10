import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authAPI } from '../services/api';
import { setCredentials } from '../store/authSlice';
import { toast } from 'react-toastify';
import type { AppDispatch } from '../store';
import AuthLayout from '../components/AuthLayout';
import InputField from '../components/InputField';
import Button from '../components/Button';

export default function Register() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Only image files (JPEG, PNG, GIF, WebP) are allowed');
                return;
            }

            setProfilePic(file);
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setProfilePic(null);
        setPreviewUrl('');
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('fullName', formData.fullName);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('password', formData.password);
            
            if (profilePic) {
                formDataToSend.append('profilePic', profilePic);
            }

            const { data } = await authAPI.register(formDataToSend);

            if (data.success) {
                dispatch(
                    setCredentials({
                        user: {
                            _id: data._id,
                            email: data.email,
                            fullName: data.fullName,
                            profilePic: data.profilePic,
                            createdAt: new Date().toISOString(),
                        },
                        token: data.token,
                    }),
                );
                toast.success('Registration successful!');
                navigate('/chats');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Create Account" subtitle="Join Waffle Chat today">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        {previewUrl ? (
                            <div className="relative">
                                <img
                                    src={previewUrl}
                                    alt="Profile preview"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                                    aria-label="Remove image"
                                >
                                    ×
                                </button>
                            </div>
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                                <svg
                                    className="w-12 h-12 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>
                    <label className="cursor-pointer">
                        <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors inline-block font-medium">
                            {previewUrl ? 'Change Photo' : 'Upload Photo'}
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </label>
                    <p className="text-xs text-gray-500">
                        Optional • Max 5MB • JPG, PNG, GIF, WebP
                    </p>
                </div>

                <InputField
                    label="Full Name"
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            fullName: e.target.value,
                        })
                    }
                    placeholder="John Doe"
                />

                <InputField
                    label="Email"
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="john@example.com"
                />

                <InputField
                    label="Password"
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            password: e.target.value,
                        })
                    }
                    placeholder="••••••••"
                />

                <InputField
                    label="Confirm Password"
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                        })
                    }
                    placeholder="••••••••"
                />

                <Button type="submit" loading={loading} fullWidth>
                    Sign Up
                </Button>
            </form>

            <p className="text-center text-gray-600 mt-6">
                Already have an account?{' '}
                <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                >
                    Sign In
                </Link>
            </p>
        </AuthLayout>
    );
}
