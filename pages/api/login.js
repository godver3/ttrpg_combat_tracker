import fs from 'fs';
import path from 'path';

const dataDirPath = path.join('/app', 'data');
const dataFilePath = path.join(dataDirPath, 'users.json');

export default function handler(req, res) {
  // Check if the directory exists, and create it if it doesn't
  if (!fs.existsSync(dataDirPath)) {
    fs.mkdirSync(dataDirPath, { recursive: true });
  }

  // Check if the file exists, and create it with an empty array if it doesn't
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf-8');
  }

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
