import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { chatAPI } from "../../services/api";
import type { AppDispatch } from "../../store";
import { setChats, setCurrentChat, setNotJoinedChats } from "../../store/chatSlice";

interface ChatLockProps {
    chatId: string;
}

export default function ChatLock({ chatId }: ChatLockProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(false);

    const joinChat = async (chatId: string) => {
        try {
            setLoading(true);
            await chatAPI.joinChat(chatId);
            const { data } = await chatAPI.getChats();
            dispatch(setChats(data.joinedChats));
            dispatch(setNotJoinedChats(data.notJoinedChats));
            const joined = data.joinedChats.find((c: any) => c._id === chatId);
            if (joined) dispatch(setCurrentChat(joined));
            toast.success("Joined chat");
        } catch (err) {
            console.error('Failed to join chat', err);
            toast.error("Failed to join chat");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-[160px] leading-none">🔒</div>
            <div className='text-3xl py-5 font-bold text-gray-800'>You have not joined this chat yet</div>
            <div>
                <button
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xl font-semibold px-6 py-3 rounded-2xl shadow-md transition-all duration-200"
                    onClick={() => joinChat(chatId)}
                    disabled={loading}
                >
                    {loading ? 'Joining…' : 'Join This Chat'}
                </button>
            </div>
        </div>
    );
}