import { useEffect, useRef, useState } from 'react';
import api from '../api';
import { useToast } from '../ToastContext';

const TOOLBAR = [
  { label: 'B', cmd: 'bold', title: 'Bold', style: { fontWeight: 700 } },
  { label: 'I', cmd: 'italic', title: 'Italic', style: { fontStyle: 'italic' } },
  { label: 'U', cmd: 'underline', title: 'Underline', style: { textDecoration: 'underline' } },
  { label: 'S', cmd: 'strikeThrough', title: 'Strikethrough', style: { textDecoration: 'line-through' } },
  { divider: true },
  { label: 'H2', cmd: 'formatBlock', val: 'H2', title: 'Heading 2' },
  { label: 'H3', cmd: 'formatBlock', val: 'H3', title: 'Heading 3' },
  { label: '¶', cmd: 'formatBlock', val: 'P', title: 'Paragraph' },
  { divider: true },
  { label: '• List', cmd: 'insertUnorderedList', title: 'Bullet list' },
  { label: '1. List', cmd: 'insertOrderedList', title: 'Numbered list' },
  { label: '" Quote', cmd: 'formatBlock', val: 'blockquote', title: 'Blockquote' },
  { divider: true },
  { label: '↩', cmd: 'undo', title: 'Undo' },
  { label: '↪', cmd: 'redo', title: 'Redo' },
];

export default function Editor({ postId, onDone }) {
  const [title, setTitle] = useState('');
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (postId) {
      api.get(`/posts/${postId}`).then(r => {
        setTitle(r.data.title);
        setPublished(r.data.published);
        if (editorRef.current) editorRef.current.innerHTML = r.data.content;
      }).catch(() => toast('Could not load post.', 'error'));
    } else {
      setTitle('');
      setPublished(false);
      if (editorRef.current) editorRef.current.innerHTML = '';
    }
  }, [postId]);

  const fmt = (cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
  };

  const save = async (forcePublish = null) => {
    const content = editorRef.current?.innerHTML || '';
    const pub = forcePublish !== null ? forcePublish : published;
    if (!title.trim()) { toast('Please add a title.', 'error'); return; }
    if (!content || content === '<br>') { toast('Please write some content.', 'error'); return; }
    setSaving(true);
    try {
      if (postId) {
        await api.put(`/posts/${postId}`, { title, content, published: pub });
      } else {
        await api.post('/posts', { title, content, published: pub });
      }
      toast(pub ? 'Post published!' : 'Draft saved.');
      onDone();
    } catch (e) {
      toast(e.response?.data?.error || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="editor-view">
      <div className="editor-header">
        <h2>{postId ? 'Edit Post' : 'New Post'}</h2>
        <button className="back-btn" onClick={onDone}>✕ Cancel</button>
      </div>

      <input
        className="editor-title-input"
        placeholder="Your post title…"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <div className="rte-toolbar">
        {TOOLBAR.map((t, i) =>
          t.divider
            ? <div className="divider" key={i} />
            : <button key={i} title={t.title} style={t.style || {}}
                onClick={() => fmt(t.cmd, t.val || null)}>
                {t.label}
              </button>
        )}
      </div>

      <div
        className="rte-content"
        contentEditable
        ref={editorRef}
        suppressContentEditableWarning
      />

      <div className="editor-footer">
        <label className="publish-toggle">
          <div className="toggle-switch">
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
            <div className="slider" />
          </div>
          Publish immediately
        </label>
        <div className="editor-btns">
          <button className="btn btn-secondary" onClick={() => save(false)} disabled={saving}>
            Save Draft
          </button>
          <button className="btn btn-primary" onClick={() => save(true)} disabled={saving}>
            {saving ? 'Saving…' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
