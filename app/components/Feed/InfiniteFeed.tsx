import React, { useState, useEffect, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useGetPostsQuery } from '~/api/postsApi';
import PostCard from './PostCard';
import Spinner from '~/components/Core/Spinner';

const PAGE_LIMIT = 10;

const InfiniteFeed: React.FC = () => {
  const [skip, setSkip] = useState(0);
  // The useGetPostsQuery with proper merge strategy will return all accumulated posts.
  const { data, error, isLoading, isFetching } = useGetPostsQuery(
    { limit: PAGE_LIMIT, skip },
    {
      // refetchOnMountOrArgChange: true, // Consider this if data freshness is critical on mount/arg change
    }
  );

  const postsToRender = data?.posts || [];
  const totalPosts = data?.total || 0;
  const hasMoreData = postsToRender.length < totalPosts && !isFetching;

  const fetchMoreData = useCallback(() => {
    if (!isFetching && postsToRender.length < totalPosts) {
      setSkip(prevSkip => prevSkip + PAGE_LIMIT);
    }
  }, [isFetching, postsToRender.length, totalPosts]);

  // Show initial loading spinner
  if (isLoading && skip === 0 && postsToRender.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // Show error message
  if (error) {
    return <p className="text-red-500 text-center p-4">Error loading posts. Please try again later.</p>;
  }

  // No posts found message (after initial load)
  if (!isLoading && postsToRender.length === 0 && skip === 0) {
     return <p className="text-gray-500 dark:text-gray-400 text-center p-4">No posts found.</p>;
  }


  return (
    <div id="feedScrollableDiv" className="h-[calc(100vh-180px)] sm:h-[calc(100vh-120px)] overflow-y-auto px-2 sm:px-4 py-4"> {/* Adjust height based on Navbar etc. */}
      <InfiniteScroll
        dataLength={postsToRender.length}
        next={fetchMoreData}
        hasMore={hasMoreData}
        loader={<Spinner />}
        scrollableTarget="feedScrollableDiv"
        endMessage={
          postsToRender.length > 0 ? (
             <p className="text-center text-gray-500 dark:text-gray-400 my-6 font-semibold">
                 You've reached the end!
             </p>
          ) : null
        }
        // Prevent a bug with rapidly changing hasMore prop
        // This ensures InfiniteScroll gets the latest hasMore value
        // by re-rendering it when hasMore changes.
        // key={hasMoreData.toString()} // This can cause full re-renders, use with caution
      >
        {postsToRender.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </InfiniteScroll>
      {/* Show a spinner at the bottom if fetching subsequent pages and it's not the initial load */}
      {isFetching && skip > 0 && <Spinner />}
    </div>
  );
};

export default InfiniteFeed;