

export default function ChatLock() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center text-7xl">
            <div>🔒</div>
            <div className='text-3xl py-5 font-bold text-gray-800'>You have not joined this chat yet</div>
            <div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold px-6 py-3 rounded-2xl shadow-md transition-all duration-200"
                onClick={() => {}}
                >
                    Join This Chat
                </button>
            </div>
        </div>
    );
}