import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { chatAPI, messageAPI } from "../services/api";
import { addChat } from "../store/chatSlice";
import { toast } from "react-toastify";
import type { AppDispatch } from "../store";
import type { User } from "../types";

export default function CreateChat() {
  const [chatType, setChatType] = useState<"private" | "group">("private");
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await messageAPI.getAllContacts();
      setAllUsers(data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserToggle = (userId: string) => {
    if (chatType === "private") {
      setSelectedUsers([userId]);
    } else {
      setSelectedUsers((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId]
      );
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    if (chatType === "private" && selectedUsers.length !== 1) {
      toast.error("Private chat requires exactly one user");
      return;
    }

    if (chatType === "group" && !groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    setLoading(true);
    try {
      const { data } = await chatAPI.createChat({
        type: chatType,
        name: chatType === "group" ? groupName : undefined,
        participants: selectedUsers,
      });

      dispatch(addChat(data));
      toast.success(
        `${chatType === "private" ? "Chat" : "Group"} created successfully!`
      );
      navigate("/chats");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create chat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Create New Chat
            </h1>
            <button
              onClick={() => navigate("/chats")}
              className="text-gray-600 hover:text-gray-800 transition"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Chat Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Chat Type
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setChatType("private");
                    setSelectedUsers([]);
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                    chatType === "private"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold">Private Chat</div>
                  <div className="text-xs mt-1">One-on-one conversation</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChatType("group");
                    setSelectedUsers([]);
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                    chatType === "group"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold">Group Chat</div>
                  <div className="text-xs mt-1">Chat with multiple people</div>
                </button>
              </div>
            </div>

            {/* Group Name */}
            {chatType === "group" && (
              <div>
                <label
                  htmlFor="groupName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Group Name
                </label>
                <input
                  id="groupName"
                  type="text"
                  required={chatType === "group"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                />
              </div>
            )}

            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {chatType === "private" ? "Select User" : "Select Participants"}
              </label>
              {loadingUsers ? (
                <div className="text-center py-8 text-gray-500">
                  Loading users...
                </div>
              ) : allUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No users available
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                  {allUsers.map((user) => (
                    <label
                      key={user._id}
                      className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition"
                    >
                      <input
                        type={chatType === "private" ? "radio" : "checkbox"}
                        name="user"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleUserToggle(user._id)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-gray-800">
                              {user.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Count */}
            {selectedUsers.length > 0 && (
              <div className="text-sm text-gray-600">
                Selected: {selectedUsers.length} user
                {selectedUsers.length > 1 ? "s" : ""}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/chats")}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || selectedUsers.length === 0}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading
                  ? "Creating..."
                  : `Create ${chatType === "private" ? "Chat" : "Group"}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
