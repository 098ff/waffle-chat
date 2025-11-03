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

export default function Register() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
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
            const { data } = await authAPI.register({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
            });

            if (data.success) {
                dispatch(
                    setCredentials({
                        user: {
                            _id: data._id,
                            email: data.email,
                            fullName: data.fullName,
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
