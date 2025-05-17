import React from 'react';
import type { Post } from '~/api/postsApi';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-6 transition-shadow duration-300 hover:shadow-xl">
      <h3 className="text-xl lg:text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-2">{post.title}</h3>
      <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{post.body.substring(0, 200)}{post.body.length > 200 && '...'}</p>
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
        <span>User ID: {post.userId}</span>
        <span>Reactions: {post.reactions}</span>
      </div>
      {post.tags && post.tags.length > 0 && (
         <div className="mt-3 flex flex-wrap gap-2">
             {post.tags.map(tag => (
                 <span key={tag} className="inline-block bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
                     #{tag}
                 </span>
             ))}
         </div>
      )}
    </div>
  );
};

export default PostCard;