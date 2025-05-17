import React, { useState, useEffect, useRef, type FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import { useGetChatMessagesQuery, chatApi, type ChatMessage } from '~/api/chatApi';
import type { AppDispatch } from '~/store';
import Spinner from '~/components/Core/Spinner';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const { data: messages = [] } = useGetChatMessagesQuery(undefined, {
    // This ensures the component re-renders when messages are added via cache updates
    // For this specific use case, it might not be strictly necessary if other parts of the app
    // don't trigger re-renders of this component.
    // However, it's good practice for queries that might be updated by mutations/cache utilities.
    // Alternatively, one could select messages directly from the store if not using the hook for rendering.
  });

  useEffect(() => {
    if (isOpen) {
      setIsConnecting(true);
      ws.current = new WebSocket('wss://echo.websocket.org/.ws');

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnecting(false);
      };
      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnecting(false);
      };
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnecting(false);
        // Optionally, show an error message to the user in the chat window
      };

      ws.current.onmessage = (event) => {
        const serverMessage: ChatMessage = {
          id: Date.now().toString() + '_server',
          text: event.data as string,
          sender: 'server',
          timestamp: Date.now(),
        };
        dispatch(
          chatApi.util.updateQueryData('getChatMessages', undefined, (draftMessages) => {
            draftMessages.push(serverMessage);
          })
        );
      };
    } else {
      ws.current?.close();
      ws.current = null;
    }

    return () => {
      ws.current?.close();
    };
  }, [isOpen, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && ws.current?.readyState === WebSocket.OPEN) {
      const userMessage: ChatMessage = {
        id: Date.now().toString() + '_user',
        text: inputValue,
        sender: 'user',
        timestamp: Date.now(),
      };

      dispatch(
        chatApi.util.updateQueryData('getChatMessages', undefined, (draftMessages) => {
          draftMessages.push(userMessage);
        })
      );
      ws.current.send(inputValue);
      setInputValue('');
    }
  };

  // No need to return null if !isOpen, the parent component (HomePage) controls rendering.

  return (
    <div className={`fixed top-0 right-0 h-full w-full sm:w-80 md:w-96 bg-white dark:bg-gray-800 shadow-2xl z-[60] flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Chat</h3>
        <button onClick={onClose} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
          <FaTimes size={20} />
        </button>
      </div>

      {isConnecting && (
        <div className="flex-grow flex flex-col justify-center items-center p-4">
          <Spinner />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Connecting to chat...</p>
        </div>
      )}

      {!isConnecting && (
        <>
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm break-words">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100 text-right' : 'text-gray-500 dark:text-gray-400 text-left'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {messages.length === 0 && !isConnecting && (
                <p className="text-center text-gray-500 dark:text-gray-400 mt-4">No messages yet. Say hi!</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-2 sticky bottom-0 bg-white dark:bg-gray-800">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-sm"
              disabled={ws.current?.readyState !== WebSocket.OPEN}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white p-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
              disabled={ws.current?.readyState !== WebSocket.OPEN || !inputValue.trim()}
            >
              <FaPaperPlane size={18} />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatSidebar;
