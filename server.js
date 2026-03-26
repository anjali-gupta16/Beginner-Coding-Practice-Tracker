const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve frontend files

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

// Register
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password required' });
    }

    const db = await readDB();
    if (db.users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
    }

    // In a real app, hash password!
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        data: {} // Holds user's localStorage equivalent data
    };

    db.users.push(newUser);
    await writeDB(db);

    const { password: _, ...userWithoutPassword } = newUser;
    res.json({ message: 'Registration successful', user: userWithoutPassword });
});

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    const db = await readDB();
    const user = db.users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ message: 'Login successful', user: userWithoutPassword });
});

// Save Data
app.post('/api/save', async (req, res) => {
    const { userId, payload } = req.body;
    if (!userId || !payload) {
        return res.status(400).json({ error: 'User ID and payload required' });
    }

    const db = await readDB();
    const userIndex = db.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    db.users[userIndex].data = {
        ...db.users[userIndex].data,
        ...payload
    };
    
    await writeDB(db);
    res.json({ message: 'Data saved successfully', data: db.users[userIndex].data });
});

// Sync/Load Data
app.get('/api/load/:userId', async (req, res) => {
    const { userId } = req.params;
    const db = await readDB();
    const user = db.users.find(u => u.id === userId);
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({ data: user.data || {} });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
