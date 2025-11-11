import { useRef, useState, type FormEvent } from 'react';
import Button from '../Button';
import ImageUploadModal from '../ImageUploadModal';

interface MessageInputProps {
    onSendMessage: (text: string) => Promise<void>;
    onSendImage: (image: string) => Promise<void>;
    onSendAudio: (audioBlob: Blob) => Promise<void>;
    onTyping: (text: string) => void;
    disabled?: boolean;
}

export default function MessageInput({
    onSendMessage,
    onSendImage,
    onSendAudio,
    onTyping,
    disabled = false,
}: MessageInputProps) {
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleStartRecording = async () => {
        if (sending || disabled) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            setIsRecording(true);
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = async () => {
                setSending(true);
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: 'audio/webm',
                });
                try {
                    await onSendAudio(audioBlob);
                } catch (error) {
                    console.error('Audio send failed', error);
                } finally {
                    setSending(false);
                    setIsRecording(false);
                    stream.getTracks().forEach((track) => track.stop());
                }
            };
            mediaRecorderRef.current.start();
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('ไม่สามารถเข้าถึงไมโครโฟนได้');
            setIsRecording(false);
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!messageText.trim() || sending || isRecording) return;
        setSending(true);
        try {
            await onSendMessage(messageText.trim());
            setMessageText('');
        } catch (error) {
            console.error('Message send failed', error);
        } finally {
            setSending(false);
        }
    };

    const handleChange = (text: string) => {
        if (isRecording) return;
        setMessageText(text);
        onTyping(text);
    };

    const showSendButton = messageText.trim().length > 0;

    // const handleImageSend = async (file: File) => {
    //     const reader = new FileReader();
    //     reader.onloadend = async () => {
    //         const base64 = reader.result as string;
    //         setSending(true);
    //         try {
    //             await onSendImage(base64);
    //         } catch (error) {
    //             console.error('Image send failed', error);
    //         } finally {
    //             setSending(false);
    //         }
    //     };
    //     reader.readAsDataURL(file);
    // };

    const handleImageSend = async (file: File) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const img = new Image();
            img.onload = async () => {
                const maxWidth = 800;
                const maxHeight = 600;
                let { width, height } = img;

                const scale = Math.min(maxWidth / width, maxHeight / height, 1);
                width = width * scale;
                height = height * scale;

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                ctx.drawImage(img, 0, 0, width, height);

                const base64 = canvas.toDataURL('image/jpeg', 0.7);

                setSending(true);
                try {
                    await onSendImage(base64);
                } catch (error) {
                    console.error('Image send failed', error);
                } finally {
                    setSending(false);
                }
            };
            img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="border-t border-gray-200 bg-white p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
                {isRecording ? (
                    <div className="flex flex-1 items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-red-600">
                        Recording audio...
                    </div>
                ) : (
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        disabled={disabled || sending || isRecording}
                    />
                )}

                {showSendButton ? (
                    <Button
                        type="submit"
                        disabled={
                            !messageText.trim() ||
                            sending ||
                            disabled ||
                            isRecording
                        }
                        loading={sending && !isRecording}
                    >
                        Send
                    </Button>
                ) : (
                    <Button
                        type="button"
                        onClick={
                            isRecording
                                ? handleStopRecording
                                : handleStartRecording
                        }
                        disabled={disabled || (sending && !isRecording)}
                        loading={sending && isRecording}
                    >
                        {isRecording ? 'Stop' : 'Mic'}
                    </Button>
                )}

                <Button
                    type="button"
                    onClick={() => setShowModal(true)}
                    disabled={sending || isRecording}
                >
                    Upload
                </Button>
            </form>

            <ImageUploadModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSend={handleImageSend}
            />
        </div>
    );
}
