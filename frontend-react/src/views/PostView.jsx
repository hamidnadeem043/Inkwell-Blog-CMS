import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function PostView({ postId, onBack, onEdit }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    api.get(`/posts/${postId}`)
      .then(r => setPost(r.data))
      .catch(() => toast('Could not load post.', 'error'))
      .finally(() => setLoading(false));
  }, [postId]);

  const handleDelete = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    try {
      await api.delete(`/posts/${postId}`);
      toast('Post deleted.');
      onBack();
    } catch (e) {
      toast(e.response?.data?.error || 'Delete failed', 'error');
    }
  };

  if (loading) return <div className="loading">Loading…</div>;
  if (!post) return null;

  const isOwner = user && user.username === post.author;

  return (
    <div className="post-view">
      <button className="back-btn" onClick={onBack}>← Back to blog</button>
      <h1 className="post-title">{post.title}</h1>
      <div className="post-meta-bar">By {post.author} · {formatDate(post.createdAt)}</div>
      <div className="post-body" dangerouslySetInnerHTML={{ __html: post.content }} />
      {isOwner && (
        <div className="post-actions">
          <button className="btn btn-secondary" onClick={() => onEdit(post.id)}>Edit Post</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      )}
    </div>
  );
}
