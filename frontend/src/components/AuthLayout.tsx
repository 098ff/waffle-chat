import type { ReactNode } from 'react';

interface AuthLayoutProps {
    title: string;
    subtitle: string;
    children: ReactNode;
}

export default function AuthLayout({
    title,
    subtitle,
    children,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {title}
                    </h1>
                    <p className="mt-2 text-gray-600">{subtitle}</p>
                </div>
                {children}
            </div>
        </div>
    );
}
