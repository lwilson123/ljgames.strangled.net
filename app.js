const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

const db = new sqlite3.Database('chat.db');

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, text TEXT, image TEXT)');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.get('/messages', (req, res) => {
  db.all('SELECT * FROM messages', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/messages', (req, res) => {
  const { username, text, image } = req.body;
  if (!username || !text) {
    res.status(400).json({ error: 'Username and text are required' });
    return;
  }
  const stmt = db.prepare('INSERT INTO messages (username, text, image) VALUES (?, ?, ?)');
  stmt.run(username, text, image || null);
  stmt.finalize();
  res.status(201).json({ message: 'Message added successfully' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
