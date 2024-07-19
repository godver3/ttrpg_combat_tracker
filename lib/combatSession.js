// lib/combatSession.js
import crypto from 'crypto';

export function generateCombatSessionId() {
  return crypto.randomBytes(16).toString('hex');
}
