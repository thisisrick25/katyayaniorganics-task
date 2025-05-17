import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { useAuth } from '~/hooks/useAuth';
import { logout } from '~/features/auth/authSlice';
import { useTheme } from '~/context/ThemeContext';
import { FaSun, FaMoon, FaSignOutAlt } from 'react-icons/fa';
import { authApi } from '~/api/authApi';
import { postsApi } from '~/api/postsApi';
import { chatApi } from '~/api/chatApi';
import type { AppDispatch } from '~/store';

const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    // Reset RTK Query states to clear cached data
    dispatch(authApi.util.resetApiState());
    dispatch(postsApi.util.resetApiState());
    dispatch(chatApi.util.resetApiState());
    navigate('/login');
  };

  return (
    <nav className="bg-gray-100 dark:bg-gray-800 p-4 shadow-md sticky top-0 z-40">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
          MyApp
        </Link>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isAuthenticated && user && (
            <div className="flex items-center space-x-2">
              {user.image && (
                 <img src={user.image} alt={user.username} className="w-8 h-8 rounded-full object-cover"/>
              )}
              <span className="text-gray-700 dark:text-gray-300 hidden sm:block">
                Hi, {user.firstName || user.username}
              </span>
            </div>
          )}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <FaMoon className="text-gray-700 dark:text-gray-300" /> : <FaSun className="text-yellow-500" />}
          </button>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Logout"
            >
              <FaSignOutAlt className="text-red-500" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;