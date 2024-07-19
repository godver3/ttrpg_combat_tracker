import fs from 'fs';
import path from 'path';

const combatDataFilePath = path.join(process.cwd(), 'data/combatState.json');

// Function to get combat state
export const getCombatState = () => {
  try {
    const data = fs.readFileSync(combatDataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading combat state:', error);
    return {
      combatants: [],
      currentTurn: 0,
      isCombatActive: false,
      combatTime: 0,
    };
  }
};

// Function to save combat state
export const saveCombatState = (state) => {
  try {
    fs.writeFileSync(combatDataFilePath, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving combat state:', error);
  }
};

// Function to get combat state by username
export const getCombatStateByUsername = (username) => {
  const combatState = getCombatState();
  return combatState[username] || {
    combatants: [],
    currentTurn: 0,
    isCombatActive: false,
    combatTime: 0,
  };
};

// Function to save combat state by username
export const saveCombatStateByUsername = (username, state) => {
  const combatState = getCombatState();
  combatState[username] = state;
  saveCombatState(combatState);
};
