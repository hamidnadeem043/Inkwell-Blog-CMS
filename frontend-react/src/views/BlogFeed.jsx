import { useEffect, useState } from 'react';
import api from '../api';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function BlogFeed({ onViewPost }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/posts')
      .then(r => setPosts(r.data))
      .catch(() => setError('Could not load posts. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading posts…</div>;
  if (error) return <div className="loading">{error}</div>;

  return (
    <div>
      <div className="feed-header">
        <h1>The <em>Latest</em></h1>
      </div>
      {posts.length === 0 ? (
        <div className="empty-state">
          <h3>No posts yet</h3>
          <p>Sign in and write the first one.</p>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map(p => (
            <div className="post-card" key={p.id} onClick={() => onViewPost(p.id)}>
              <div className="post-meta">{p.author} · {formatDate(p.createdAt)}</div>
              <h2>{p.title}</h2>
              <p>{p.excerpt}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
