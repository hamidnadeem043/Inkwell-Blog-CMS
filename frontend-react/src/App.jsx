import { useState } from 'react';
import { useAuth } from './AuthContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import BlogFeed from './views/BlogFeed';
import PostView from './views/PostView';
import Dashboard from './views/Dashboard';
import Editor from './views/Editor';

export default function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState('blog'); // blog | post | dashboard | editor
  const [activePostId, setActivePostId] = useState(null);
  const [editPostId, setEditPostId] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  if (loading) return <div className="loading" style={{ marginTop: '4rem' }}>Loading…</div>;

  const goViewPost = (id) => { setActivePostId(id); setView('post'); };
  const goEdit = (id) => { setEditPostId(id); setView('editor'); };
  const goNewPost = () => { setEditPostId(null); setView('editor'); };
  const onEditorDone = () => { setEditPostId(null); setView('dashboard'); };

  return (
    <>
      <Header view={view} setView={setView} onLoginClick={() => setShowAuth(true)} />

      {showAuth && !user && <AuthModal onClose={() => setShowAuth(false)} />}

      <main className="main-content">
        {view === 'blog' && (
          <BlogFeed onViewPost={goViewPost} />
        )}
        {view === 'post' && (
          <PostView
            postId={activePostId}
            onBack={() => setView('blog')}
            onEdit={goEdit}
          />
        )}
        {view === 'dashboard' && user && (
          <Dashboard
            onNewPost={goNewPost}
            onEdit={goEdit}
            onViewPost={goViewPost}
          />
        )}
        {view === 'editor' && user && (
          <Editor postId={editPostId} onDone={onEditorDone} />
        )}
        {(view === 'dashboard' || view === 'editor') && !user && (
          <div className="empty-state">
            <h3>Sign in to continue</h3>
            <p><button className="btn btn-primary" onClick={() => setShowAuth(true)}>Sign In</button></p>
          </div>
        )}
      </main>
    </>
  );
}
