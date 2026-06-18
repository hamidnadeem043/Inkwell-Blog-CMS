const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 8080;
const JWT_SECRET = 'blog-cms-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// --- In-memory data store ---
const users = [];
const posts = [];
let postIdCounter = 1;

// Seed a demo user
(async () => {
  const hash = await bcrypt.hash('password123', 10);
  users.push({ id: 1, username: 'demo', email: 'demo@blog.com', password: hash });
})();

// Seed some demo posts
posts.push(
  {
    id: postIdCounter++,
    title: 'Welcome to the Blog CMS',
    content: '<h2>Getting Started</h2><p>This is a <strong>fully functional</strong> blog content management system. You can write, edit, and delete posts using the rich text editor.</p><p>Log in with <em>demo / password123</em> to try it out!</p>',
    excerpt: 'A fully functional blog CMS with authentication and rich text editing.',
    author: 'demo',
    authorId: 1,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    published: true,
  },
  {
    id: postIdCounter++,
    title: 'Building REST APIs with Express',
    content: '<h2>Why Express?</h2><p>Express is the most popular Node.js web framework. It\'s minimal, flexible, and has a huge ecosystem.</p><h2>Key Concepts</h2><ul><li>Routing</li><li>Middleware</li><li>Error handling</li></ul><p>With JWT authentication you can secure your API endpoints effortlessly.</p>',
    excerpt: 'Learn how to build secure REST APIs with Express and JWT authentication.',
    author: 'demo',
    authorId: 1,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    published: true,
  }
);

// --- Middleware ---
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'All fields required' });
  if (users.find(u => u.email === email))
    return res.status(409).json({ error: 'Email already registered' });
  if (users.find(u => u.username === username))
    return res.status(409).json({ error: 'Username already taken' });

  const hash = await bcrypt.hash(password, 10);
  const user = { id: users.length + 1, username, email, password: hash };
  users.push(user);
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, username: user.username, email: user.email });
});

// --- Blog Post Routes ---

// Public: get all published posts
app.get('/api/posts', (req, res) => {
  const published = posts
    .filter(p => p.published)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(published);
});

// Public: get single post
app.get('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

// Protected: get my posts (all, including drafts)
app.get('/api/my-posts', authMiddleware, (req, res) => {
  const myPosts = posts
    .filter(p => p.authorId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(myPosts);
});

// Protected: create post
app.post('/api/posts', authMiddleware, (req, res) => {
  const { title, content, excerpt, published = false } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
  const post = {
    id: postIdCounter++,
    title,
    content,
    excerpt: excerpt || content.replace(/<[^>]+>/g, '').slice(0, 150) + '...',
    author: req.user.username,
    authorId: req.user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    published,
  };
  posts.push(post);
  res.status(201).json(post);
});

// Protected: update post
app.put('/api/posts/:id', authMiddleware, (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.authorId !== req.user.id) return res.status(403).json({ error: 'Not your post' });

  const { title, content, excerpt, published } = req.body;
  if (title !== undefined) post.title = title;
  if (content !== undefined) {
    post.content = content;
    post.excerpt = excerpt || content.replace(/<[^>]+>/g, '').slice(0, 150) + '...';
  }
  if (published !== undefined) post.published = published;
  post.updatedAt = new Date().toISOString();
  res.json(post);
});

// Protected: delete post
app.delete('/api/posts/:id', authMiddleware, (req, res) => {
  const idx = posts.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Post not found' });
  if (posts[idx].authorId !== req.user.id) return res.status(403).json({ error: 'Not your post' });
  posts.splice(idx, 1);
  res.json({ message: 'Post deleted' });
});


if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Blog CMS API running on http://localhost:${PORT}`));
}
module.exports = app;

