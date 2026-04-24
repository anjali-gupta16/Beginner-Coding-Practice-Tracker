const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const DB_PATH = path.join(process.cwd(), 'db.json');

app.use(cors());
app.use(express.json());

// Helper reading/writing DB
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

// API Routes
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const db = await readDB();
    if (db.users.find(u => u.email === email)) return res.status(400).json({ error: 'User exists' });
    const newUser = { id: Date.now().toString(), name, email, password, data: {} };
    db.users.push(newUser);
    await writeDB(db);
    res.json({ message: 'Success', user: { id: newUser.id, name, email } });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const db = await readDB();
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: 'Invalid' });
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

app.post('/api/save', async (req, res) => {
    const { userId, payload } = req.body;
    const db = await readDB();
    const index = db.users.findIndex(u => u.id === userId);
    if (index === -1) return res.status(404).json({ error: 'User not found' });
    db.users[index].data = { ...db.users[index].data, ...payload };
    await writeDB(db);
    res.json({ message: 'Saved' });
});

app.get('/api/load/:userId', async (req, res) => {
    const { userId } = req.params;
    const db = await readDB();
    const user = db.users.find(u => u.id === userId);
    res.json({ data: user ? user.data : {} });
});

module.exports = app;
