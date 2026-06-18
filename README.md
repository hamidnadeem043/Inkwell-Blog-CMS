# Inkwell CMS 📝

Inkwell is a modern, lightweight, full-stack Blog Content Management System (CMS) designed for seamless writing, managing, and publishing of blog posts. The project features a responsive React single-page application frontend and a secure Node.js/Express REST API backend.

## 🚀 Features

- **Secure JWT Authentication**: Sign up and log in securely. Sessions are preserved using local storage.
- **Personal Dashboard**: Track, manage, edit, and delete your published posts and drafts in a unified workspace.
- **Rich Text Editor**: Write and format your posts with a dynamic editor interface.
- **Public Blog Feed**: A responsive, visitor-friendly feed showcasing published posts sorted by creation date.
- **Clean REST API**: Lightweight Express.js backend with robust validation and routing.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Routing & State**: React Hooks & Context API
- **HTTP Client**: Axios
- **Styling**: Vanilla CSS (Custom Responsive Layouts)

### Backend
- **Framework**: Node.js & Express
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs (password hashing)
- **CORS**: Enabled for cross-origin requests

---

## ⚙️ Project Structure

```text
blog-cms/
├── backend/            # Express REST API
│   ├── index.js        # Main entry point & API routes
│   └── package.json
└── frontend-react/     # React Single-Page Application
    ├── src/
    │   ├── components/ # Reusable UI (AuthModal, Header)
    │   ├── views/      # Page views (BlogFeed, Dashboard, Editor, PostView)
    │   ├── App.jsx     # Main entry & view routing
    │   └── api.js      # Axios client configuration
    └── package.json
