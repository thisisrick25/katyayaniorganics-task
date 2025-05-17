import React from 'react';
import { FaComments } from 'react-icons/fa';

interface ChatButtonProps {
  onClick: () => void;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 z-50 transition-transform hover:scale-110"
      aria-label="Open chat"
    >
      <FaComments size={24} />
    </button>
  );
};

export default ChatButton;
