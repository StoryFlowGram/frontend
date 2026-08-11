# Frontend — StoryFluentGram

> Modern Vue 3 Web Application (Telegram WebApp & Standalone Web) for reading EPUB books, interactive translation, dictionary management, and spaced-repetition word practice.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [Features](#features)
- [Project Structure](#project-structure)

---

## Overview

The Frontend application provides a seamless, mobile-optimized experience for language learners:

- **Interactive Reader**: EPUB book reader with click-to-translate functionality for words and sentences
- **Spaced Repetition Training**: SM-2 flashcard review interface for memorizing saved vocabulary
- **Personal Library & Search**: Book catalog browsing, search with filters, and reading progress tracking
- **Authentication**: Supports Telegram WebApp native login and Google OAuth 2.0 authentication
- **Responsive UI**: Optimized for Telegram Mini Apps with dark mode support and micro-animations

---

## Architecture

```
User Browser / Telegram WebApp
             │
             ▼
┌─────────────────────────┐
│     Frontend (Vue 3)    │
│  Components & State API │
└────────────┬────────────┘
             │ HTTP / Axios
             ▼
┌─────────────────────────┐
│   API Gateway (:8000)   │
└─────────────────────────┘
```

---

## Technology Stack

| Package | Version | Role |
|--------|---------|------|
| `vue` | ^3.5.24 | Frontend framework (Composition API) |
| `vite` | ^7.2.4 | Fast frontend build tool & dev server |
| `tailwindcss` | ^3.4.17 | Utility-first CSS framework |
| `axios` | ^1.13.2 | HTTP client for API Gateway integration |
| `lucide-vue-next` | ^0.562.0 | Modern icon library |
| `vitest` | ^3.2.4 | Unit testing framework |

---

## Running the Application

### Locally (npm)

```bash
cd Frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

### Docker / Nginx Production Build

```bash
docker build -t sfg-frontend .
docker run -p 80:80 sfg-frontend
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL for API Gateway | `http://localhost:8000/api/v1` |

---

## Features

- **Library**: Browse catalog, upload EPUB files, and add books to personal shelf.
- **Reader**: EPUB reader with position saving, instant word translation, and AI word explanations.
- **Dictionary**: Saved words management, audio pronunciation, and status tags.
- **Training**: Interactive spaced-repetition flashcards using SM-2 algorithm feedback (0-5 rating).
- **Profile**: User stats, account settings, Google account linking, and logout.

---

## Project Structure

```
Frontend/
├── index.html                # Entry HTML file (Telegram & Google SDKs)
├── src/
│   ├── assets/               # CSS styles & static assets
│   ├── components/           # Reusable UI components (Reader, Layout)
│   ├── shared/               # Axios API client, utilities, types
│   ├── views/                # Page views (Library, Reader, Training, Profile)
│   ├── App.vue               # Root component
│   └── main.js               # Application entrypoint
├── nginx.conf                # Production Nginx web server config
├── Dockerfile
└── package.json
```
