import { useState, useRef } from 'react';
import { PlayCircle, PauseCircle } from 'lucide-react';

interface AudioPlayerProps {
    audioUrl: string;
    isMine: boolean;
}

export default function AudioPlayer({ audioUrl, isMine }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="mt-2 flex items-center gap-2">
            <button
                onClick={togglePlay}
                className={`p-2 rounded-full transition-colors ${isMine
                        ? 'bg-blue-700 hover:bg-blue-800'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
            >
                {isPlaying ? (
                    <PauseCircle className="w-5 h-5" />
                ) : (
                    <PlayCircle className="w-5 h-5" />
                )}
            </button>
            <div className="flex-1">
                <div className={`text-xs font-medium ${isMine ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                    Voice Message
                </div>
            </div>
            <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
            />
        </div>
    );
}