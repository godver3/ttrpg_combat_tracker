const combatStateStore = {};

export const getCombatState = (sessionId) => {
  return combatStateStore[sessionId] || null;
};

export const setCombatState = (sessionId, state) => {
  combatStateStore[sessionId] = state;
};
