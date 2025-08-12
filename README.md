# Postgram Backend (In-Memory Storage)

A simple Express.js backend using in-memory arrays for storing users and posts.  
Perfect for testing and prototyping before adding a real database.

## 🚀 Features
- Register/Login users
- JWT authentication
- Public and private routes
- No database — stores data in memory

## 📦 Install
```bash
npm install
```

## ▶ Run
Development (with auto-restart):
```bash
npm run dev
```
Production:
```bash
npm start
```

## 📡 API Endpoints
### Register
POST `/api/register`  
Body: `{ "username": "user1", "password": "pass" }`

### Login
POST `/api/login`  
Body: `{ "username": "user1", "password": "pass" }`  
Returns: `{ "token": "..." }`

### Get Posts
GET `/api/posts`

### Create Post
POST `/api/posts` (requires `Authorization: Bearer <token>` header)  
Body: `{ "title": "My Post", "content": "Post content" }`
