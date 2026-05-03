const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const DB_PATH = path.join(process.cwd(), 'db.json');

app.use(cors());
app.use(express.json());

// In-memory fallback for Vercel (read-only filesystem)
let inMemoryDB = { users: [] };

async function readDB() {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return inMemoryDB;
    }
}

async function writeDB(data) {
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
    } catch (err) {
        inMemoryDB = data;
    }
}

// Routes - Supporting both /login and /api/login for maximum compatibility
const registerHandler = async (req, res) => {
    const { name, email, password } = req.body;
    const db = await readDB();
    if (db.users.find(u => u.email === email)) return res.status(400).json({ error: 'User exists' });
    const newUser = { id: Date.now().toString(), name, email, password, data: {} };
    db.users.push(newUser);
    await writeDB(db);
    res.json({ message: 'Success', user: { id: newUser.id } });
};

const loginHandler = async (req, res) => {
    const { email, password } = req.body;
    const db = await readDB();
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: 'Invalid' });
    res.json({ user: { id: user.id, name: user.name } });
};

const saveHandler = async (req, res) => {
    const { userId, payload } = req.body;
    const db = await readDB();
    const index = db.users.findIndex(u => u.id === userId);
    if (index === -1) return res.status(404).json({ error: 'User not found' });
    db.users[index].data = { ...db.users[index].data, ...payload };
    await writeDB(db);
    res.json({ message: 'Saved' });
};

const loadHandler = async (req, res) => {
    const { userId } = req.params;
    const db = await readDB();
    const user = db.users.find(u => u.id === userId);
    res.json({ data: user ? user.data : {} });
};

// Map routes to handlers
app.post('/api/register', registerHandler);
app.post('/register', registerHandler);

app.post('/api/login', loginHandler);
app.post('/login', loginHandler);

app.post('/api/save', saveHandler);
app.post('/save', saveHandler);

app.get('/api/load/:userId', loadHandler);
app.get('/load/:userId', loadHandler);

module.exports = app;
