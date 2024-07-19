// pages/api/user/[username].js

import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'users.json');

const ensureDataFile = () => {
  if (!fs.existsSync(path.dirname(dataFilePath))) {
    fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
  }
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]));
  }
};

export default function handler(req, res) {
  ensureDataFile();
  const { username } = req.query;
  const users = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

  const userIndex = users.findIndex(user => user.username === username);

  if (req.method === 'GET') {
    if (userIndex !== -1) {
      res.status(200).json(users[userIndex]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } else if (req.method === 'POST') {
    if (userIndex !== -1) {
      const { library, enemies } = req.body;
      if (library) users[userIndex].library = library;
      if (enemies) users[userIndex].enemies = enemies;
      fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2));
      res.status(200).json(users[userIndex]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
