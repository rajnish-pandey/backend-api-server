const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = "supersecret";

// In-memory storage
let users = [];
let posts = [];
let postIdCounter = 1;

// Simple logging function
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    fs.appendFileSync("server.log", logMessage + "\n", "utf8");
}

// Middleware to log every request
app.use((req, res, next) => {
    log(`${req.method} ${req.url}`);
    next();
});

// Middleware to verify token
function authenticateToken(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        log("Unauthorized access attempt");
        return res.status(401).json({ message: "Access token required" });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
        log("Invalid token used");
        return res.status(403).json({ message: "Invalid token" });
        }
        req.user = user;
        next();
    });
}

// Register
app.post("/api/signup", (req, res) => {
    const { username, password } = req.body;
    if (users.find((u) => u.username === username)) {
        log(`Register failed - User already exists: ${username}`);
        return res.status(400).json({ message: "User already exists" });
    }
    users.push({ username, password });
    log(`User registered: ${username}`);
    res.json({ message: "User registered successfully" });
});

// Login
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(
        (u) => u.username === username && u.password === password
    );
    if (!user) {
        log(`Login failed - Invalid credentials: ${username}`);
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    log(`User logged in: ${username}`);
    res.json({ token });
});

// Create Post
app.post("/api/posts", authenticateToken, (req, res) => {
    const { title, content } = req.body;
    const newPost = {
        id: postIdCounter++,
        title,
        content,
        author: req.user.username,
        likes: 0,
    };
    posts.push(newPost);
    log(`Post created by ${req.user.username}: "${title}"`);
    res.json(newPost);
});

// Get all posts
app.get("/api/posts", (req, res) => {
    res.json(posts);
});

// Like a post
app.post("/api/posts/:id/like", authenticateToken, (req, res) => {
    const post = posts.find((p) => p.id === parseInt(req.params.id));
    if (!post) {
        log(`Like failed - Post not found (ID: ${req.params.id})`);
        return res.status(404).json({ message: "Post not found" });
    }
    post.likes += 1;
    log(`Post liked by ${req.user.username} (ID: ${post.id})`);
    res.json({ message: "Post liked", likes: post.likes });
});

// Delete a post
app.delete("/api/posts/:id", authenticateToken, (req, res) => {
    const postIndex = posts.findIndex((p) => p.id === parseInt(req.params.id));
    if (postIndex === -1) {
        log(`Delete failed - Post not found (ID: ${req.params.id})`);
        return res.status(404).json({ message: "Post not found" });
    }

    const post = posts[postIndex];
    if (post.author !== req.user.username) {
        log(
        `Delete failed - Unauthorized by ${req.user.username} (Post ID: ${post.id})`
        );
        return res
        .status(403)
        .json({ message: "You can only delete your own posts" });
    }

    posts.splice(postIndex, 1);
    log(`Post deleted by ${req.user.username} (ID: ${req.params.id})`);
    res.json({ message: "Post deleted" });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => log(`Server running on port ${PORT}`));
