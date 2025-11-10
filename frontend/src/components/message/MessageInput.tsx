import { useState, useRef, type FormEvent } from 'react';
import Button from '../Button';

interface MessageInputProps {
    onSendMessage: (text: string) => Promise<void>;
    onSendAudio: (audioBlob: Blob) => Promise<void>; 
    onTyping: (text: string) => void;
    disabled?: boolean;
}

export default function MessageInput({
    onSendMessage,
    onSendAudio, 
    onTyping,
    disabled = false,
}: MessageInputProps) {
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);
    const [isRecording, setIsRecording] = useState(false); 

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleStartRecording = async () => {
        if (sending || disabled) return;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsRecording(true); 
            
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = []; 

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                setSending(true);
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                
                try {
                    await onSendAudio(audioBlob); 
                } catch (error) {
                    console.error("Audio send failed", error);
                } finally {
                    setSending(false);
                    setIsRecording(false);
                    stream.getTracks().forEach(track => track.stop()); // ปิดการเข้าถึงไมโครโฟน
                }
            };

            mediaRecorderRef.current.start();

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("ไม่สามารถเข้าถึงไมโครโฟนได้");
            setIsRecording(false);
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current?.state === "recording") {
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

    return (
        <div className="bg-white border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">

                {isRecording ? (
                    <div className="flex-1 px-4 py-2 flex items-center justify-center text-red-600 bg-gray-100 rounded-lg">
                        Recording audio...
                    </div>
                ) : (
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        disabled={disabled || sending || isRecording}
                    />
                )}

                {showSendButton ? (
                    <Button
                        type="submit" 
                        disabled={!messageText.trim() || sending || disabled || isRecording}
                        loading={sending && !isRecording}
                    >
                        Send
                    </Button>
                ) : (
                    <Button
                        type="button"
                        onClick={isRecording ? handleStopRecording : handleStartRecording}
                        disabled={disabled || (sending && !isRecording)}
                        loading={sending && isRecording} 
                    >
                        {isRecording ? "Stop" : "Mic"}
                    </Button>
                )}
            </form>
        </div>
    );
}