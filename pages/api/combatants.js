import { getCombatStateByUsername, saveCombatStateByUsername } from '../../lib/combatants';

export default function handler(req, res) {
  const { username } = req.query;

  if (req.method === 'GET') {
    try {
      const combatState = getCombatStateByUsername(username);
      res.status(200).json(combatState);
    } catch (error) {
      console.error('Error reading combat state by username:', error);
      res.status(500).json({ error: 'Error reading combat state' });
    }
  } else if (req.method === 'POST') {
    const { combatants, currentTurn, isCombatActive, combatTime } = req.body;
    const state = { combatants, currentTurn, isCombatActive, combatTime };

    try {
      saveCombatStateByUsername(username, state);
      res.status(200).json({ message: 'Combat state saved successfully' });
    } catch (error) {
      console.error('Error saving combat state by username:', error);
      res.status(500).json({ error: 'Error saving combat state' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
