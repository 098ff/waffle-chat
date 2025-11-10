import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authAPI } from '../services/api';
import { setCredentials } from '../store/authSlice';
import { toast } from 'react-toastify';
import type { AppDispatch } from '../store';
import AuthLayout from '../components/AuthLayout';
import InputField from '../components/InputField';
import Button from '../components/Button';
import type { User } from '../types';

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
                const user: User = {
                    _id: data._id,
                    email: data.email,
                    fullName: data.fullName,
                    profilePic: data.profilePic,
                    createdAt: new Date().toISOString(),
                };
                dispatch(
                    setCredentials({
                        user: user,
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
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to continue chatting"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
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
                        setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                />

                <Button type="submit" loading={loading} fullWidth>
                    Sign In
                </Button>
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
        </AuthLayout>
    );
}
