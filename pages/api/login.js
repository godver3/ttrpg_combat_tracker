import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data/users.json');

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { username, pin } = req.body;
    const users = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

    const user = users.find(user => user.username === username && user.pin === pin);

    if (user) {
      res.status(200).json({ message: 'Login successful', user });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
