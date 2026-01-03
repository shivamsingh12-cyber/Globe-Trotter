import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Community = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showPostModal, setShowPostModal] = useState(false);

  // Load posts from localStorage or use defaults (Simulating "Real" persistence)
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('community_posts');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 1,
        title: 'My trip to Paris!',
        author: 'Sarah J.',
        avatar: '', // Empty will show placeholder
        likes: 12,
        comments: 4,
        date: '2025-01-02',
        excerpt: 'Had a wonderful time seeing the Eiffel tower and eating croissants. Highly recommend the Latin Quarter for food.'
      },
      {
        id: 2,
        title: 'Question about Tokyo transit',
        author: 'Mike R.',
        avatar: '',
        likes: 5,
        comments: 8,
        date: '2025-01-01',
        excerpt: 'Is the JR Pass still worth it for a 7 day trip? Planning to visit Tokyo, Kyoto, and Osaka.'
      }
    ];
  });

  // Save to localStorage whenever posts change
  React.useEffect(() => {
    localStorage.setItem('community_posts', JSON.stringify(posts));
  }, [posts]);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    const title = e.target.elements.title.value;
    const content = e.target.elements.content.value;

    const newPost = {
      id: Date.now(),
      title: title,
      author: 'You',
      avatar: '',
      likes: 0,
      comments: 0,
      date: new Date().toISOString().split('T')[0],
      excerpt: content
    };

    setPosts([newPost, ...posts]);
    setShowPostModal(false);
  };

  // Filter & Sort Logic
  const filteredPosts = posts
    .filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'popular') return b.likes - a.likes;
      return new Date(b.date) - new Date(a.date);
    });

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20 font-sans">
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">←</button>
            <h1 className="text-xl font-bold">GlobalTrotter Community</h1>
          </div>
          <button onClick={() => setShowPostModal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-sm">
            + Share Experience
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Controls Bar */}
        <div className="glass-card p-4 rounded-xl mb-8 flex flex-col md:flex-row gap-4 items-center border border-white/10">
          <input
            type="text"
            placeholder="Search community stories..."
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2">
            <select
              className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700 font-medium text-sm appearance-none cursor-pointer focus:outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Sort by: Newest</option>
              <option value="popular">Sort by: Popular</option>
            </select>
          </div>
        </div>

        {/* Post List (Wireframe Style: Avatar Left, Content Right) */}
        <div className="space-y-4">
          {filteredPosts.length > 0 ? filteredPosts.map(post => (
            <div key={post.id} className="glass-card p-6 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all flex gap-6 items-start">

              {/* Avatar Circle */}
              <div className="w-16 h-16 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center border-2 border-white/10 overflow-hidden">
                {post.avatar ? (
                  <img src={post.avatar} alt={post.author} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white mb-1">{post.title}</h3>
                  <span className="text-xs text-gray-500">{post.date}</span>
                </div>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">{post.excerpt}</p>

                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-2">
                  <span className="text-sm text-indigo-400 font-medium">{post.author}</span>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1 hover:text-gray-300 cursor-pointer">👍 {post.likes}</span>
                    <span className="flex items-center gap-1 hover:text-gray-300 cursor-pointer">💬 {post.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl">No posts found.</p>
            </div>
          )}
        </div>
      </main>

      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-white/10 relative">
            <button onClick={() => setShowPostModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
            <h2 className="text-2xl font-bold mb-4">Share Experience</h2>
            <form onSubmit={handlePostSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <input name="title" type="text" required className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none" placeholder="Trip title..." />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Details</label>
                  <textarea name="content" required rows="4" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none" placeholder="Share your experience..."></textarea>
                </div>
                <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold mt-2">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
