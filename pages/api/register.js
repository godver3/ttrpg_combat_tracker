import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data/users.json');

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { username, pin } = req.body;
    const users = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

    const userExists = users.some(user => user.username === username);

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
    } else {
      const newUser = { username, pin, library: [] };
      users.push(newUser);
      fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2));
      res.status(200).json({ message: 'User registered successfully' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
