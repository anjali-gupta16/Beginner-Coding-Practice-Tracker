const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Define the root directory (one level up from /api)
const root = path.join(__dirname, '..');

// 2. Serve static files (style.css, app.js, etc.) from the root
app.use(express.static(root));

// 3. Helper to read/write DB
const DB_PATH = path.join(root, 'db.json');

async function readDB() {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            const initial = { users: [] };
            await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2));
            return initial;
        }
        throw err;
    }
}

async function writeDB(data) {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

// 4. API Routes
// Register
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const db = await readDB();
    if (db.users.find(u => u.email === email)) return res.status(400).json({ error: 'User exists' });
    const newUser = { id: Date.now().toString(), name, email, password, data: {} };
    db.users.push(newUser);
    await writeDB(db);
    res.json({ message: 'Success', user: { id: newUser.id, name: newUser.name, email: newUser.email } });
});

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const db = await readDB();
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ message: 'Success', user: { id: user.id, name: user.name, email: user.email } });
});

// Save Data
app.post('/api/save', async (req, res) => {
    const { userId, payload } = req.body;
    const db = await readDB();
    const index = db.users.findIndex(u => u.id === userId);
    if (index === -1) return res.status(404).json({ error: 'User not found' });
    db.users[index].data = { ...db.users[index].data, ...payload };
    await writeDB(db);
    res.json({ message: 'Saved', data: db.users[index].data });
});

// Load Data
app.get('/api/load/:userId', async (req, res) => {
    const { userId } = req.params;
    const db = await readDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ data: user.data || {} });
});

// 5. Frontend Routes (Master Handler)
// This handles the home page and any sub-routes correctly
app.get('*', (req, res) => {
    res.sendFile(path.join(root, 'index.html'));
});

module.exports = app;
