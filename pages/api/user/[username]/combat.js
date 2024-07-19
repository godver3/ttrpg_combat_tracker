import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'combatState.json');

const initializeDataFile = () => {
  if (!fs.existsSync(dataFilePath)) {
    const initialData = {};
    fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
  }
};

const getUserCombatState = (data, username) => {
  const defaultCombatState = { combatants: [], isCombatActive: false, currentTurn: 0, combatTime: 0 };
  return data[username] ? { ...defaultCombatState, ...data[username] } : defaultCombatState;
};

export default function handler(req, res) {
  const { username } = req.query;

  initializeDataFile();

  if (req.method === 'GET') {
    try {
      const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
      const userCombatState = getUserCombatState(data, username);
      res.status(200).json(userCombatState);
    } catch (error) {
      console.error('Error reading combat state data:', error);
      res.status(500).json({ error: 'Failed to read combat state data' });
    }
  } else if (req.method === 'POST') {
    const { combatants, isCombatActive, currentTurn, combatTime } = req.body;

    try {
      const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
      data[username] = { combatants, isCombatActive, currentTurn, combatTime };
      fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
      res.status(200).json({ message: 'Combat state updated successfully' });
    } catch (error) {
      console.error('Error updating combat state data:', error);
      res.status(500).json({ error: 'Failed to update combat state data' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
