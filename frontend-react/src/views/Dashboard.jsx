import { useEffect, useState } from 'react';
import api from '../api';
import { useToast } from '../ToastContext';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Dashboard({ onNewPost, onEdit, onViewPost }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    api.get('/my-posts')
      .then(r => setPosts(r.data))
      .catch(() => toast('Failed to load posts.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      toast('Post deleted.');
      load();
    } catch (e) {
      toast(e.response?.data?.error || 'Delete failed', 'error');
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1>My Posts</h1>
        <button className="btn btn-primary" onClick={onNewPost}>+ New Post</button>
      </div>
      {loading ? (
        <div className="loading">Loading…</div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <h3>No posts yet</h3>
          <p>Start writing your first post.</p>
        </div>
      ) : (
        <div className="my-posts-list">
          {posts.map(p => (
            <div className="my-post-row" key={p.id}>
              <div className="title-col">
                <strong>
                  {p.title}
                  {!p.published && <span className="draft-badge">Draft</span>}
                </strong>
                <span>{formatDate(p.createdAt)}</span>
              </div>
              <div className="row-actions">
                <button className="btn btn-sm-green" onClick={() => onViewPost(p.id)}>View</button>
                <button className="btn btn-secondary btn-sm" onClick={() => onEdit(p.id)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
