import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authAPI } from '../services/api';
import { setCredentials } from '../store/authSlice';
import { toast } from 'react-toastify';
import type { AppDispatch } from '../store';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await authAPI.login({
                email: formData.email,
                password: formData.password,
            });

            if (data.success) {
                dispatch(
                    setCredentials({
                        user: {
                            _id: data._id,
                            email: data.email,
                            fullName: data.name,
                            createdAt: new Date().toISOString(),
                        },
                        token: data.token,
                    }),
                );
                toast.success('Login successful!');
                navigate('/chats');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.msg || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Sign in to continue chatting
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                            placeholder="john@example.com"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    password: e.target.value,
                                })
                            }
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-6">
                    Don't have an account?{' '}
                    <Link
                        to="/register"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}
