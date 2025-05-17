import React, { useState } from 'react';
import InfiniteFeed from '~/components/Feed/InfiniteFeed';
import ChatButton from '~/components/Chat/ChatButton';
import ChatSidebar from '~/components/Chat/ChatSidebar';

// Optional: Add meta tags for this route
// export function meta() {
//   return [{ title: "Home | MyApp" }];
// }

export default function HomePage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="container mx-auto relative"> {/* Removed flex-grow as _protected handles overall layout */}
      <InfiniteFeed />
      <ChatButton onClick={() => setIsChatOpen(true)} />
      {isChatOpen && <ChatSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />}
    </div>
  );
}
