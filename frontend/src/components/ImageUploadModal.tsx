import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSend: (file: File) => void;
}

export default function ImageUploadModal({ isOpen, onClose, onSend }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setFile(null);
            setPreview(null);
        }
    }, [isOpen]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            setPreview(URL.createObjectURL(f));
        }
    };

    const handleSend = () => {
        if (file) onSend(file);
        setFile(null);
        setPreview(null);
        onClose();
    };

    const handleSelectFile = () => {
        fileInputRef.current?.click();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
            <div className="bg-white w-[400px] rounded-2xl shadow-2xl p-6 relative animate-fadeIn">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
                >
                    ✕
                </button>

                <h2 className="text-lg font-semibold mb-4 text-gray-800 text-center">Upload an Image</h2>

                <div
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition cursor-pointer w-full"
                    onClick={handleSelectFile}
                >
                    {preview ? (
                        <img
                            src={preview}
                            alt="preview"
                            className="w-full h-56 object-contain rounded-lg"
                        />
                    ) : (
                        <div className="text-gray-500 flex flex-col items-center gap-2">
                            {/* Inline plus icon */}
                            <div className="w-12 h-12 flex items-center justify-center border-2 border-gray-400 rounded-full">
                                <span className="block w-6 h-0.5 bg-gray-400"></span>
                                <span className="block w-0.5 h-6 bg-gray-400 absolute"></span>
                            </div>
                            <p className="text-sm mt-2">Click to choose an image</p>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                    />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                        onClick={handleSend}
                        disabled={!file}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
