import React, { useState, useEffect } from 'react';
import styles from './CombatTracker.module.css';
import { Zap, Heart, Shield, X, Skull, Sword } from 'lucide-react';

const CombatTracker = ({
  combatants,
  setCombatants,
  isCombatActive,
  setIsCombatActive,
  setEnemyCounts,
  startCombat,
  endCombat,
  currentTurn,
  setCurrentTurn,
  combatTime, // Add combatTime as a prop
  setCombatTime // Add setCombatTime as a prop
}) => {
  const [editMode, setEditMode] = useState({ type: null, id: null });

  useEffect(() => {
    const saveCombatState = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.username) {
        await fetch(`/api/user/${user.username}/combat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            combatants,
            isCombatActive,
            currentTurn,
            combatTime // Include combatTime in the save request
          })
        });
      }
    };

    saveCombatState();
  }, [combatants, isCombatActive, currentTurn, combatTime]); // Add combatTime to dependencies

  const handleNextTurn = () => {
    setCurrentTurn((prevTurn) => (prevTurn + 1) % combatants.length);
  };

  const removeAllCombatants = () => {
    setCombatants([]);
    setIsCombatActive(false);
    setEnemyCounts({});
    setCurrentTurn(0);
    setCombatTime(0); // Reset combatTime
  };

  const handleInitiativeChange = (id, newValue) => {
    setCombatants(prevCombatants => {
      const updatedCombatants = prevCombatants.map(combatant => {
        if (combatant.id === id) {
          return { ...combatant, initiative: parseInt(newValue) || 0 };
        }
        return combatant;
      });
      return updatedCombatants.sort((a, b) => (b.initiative || -Infinity) - (a.initiative || -Infinity));
    });
    setEditMode({ type: null, id: null });
  };

  const handleHealthChange = (id, change) => {
    setCombatants(prevCombatants =>
      prevCombatants.map(combatant =>
        combatant.id === id ? {
          ...combatant,
          currentHP: Math.min(Math.max(combatant.currentHP - change, 0), combatant.maxHP)
        } : combatant
      )
    );
    setEditMode({ type: null, id: null });
  };

  const onRemoveCombatant = (id) => {
    setCombatants(prevCombatants => prevCombatants.filter(c => c.id !== id));
  };

  return (
    <div className={styles.combatTracker}>
      <ul className={styles.combatantList}>
        {combatants.map((combatant, index) => (
          <li
            key={combatant.id}
            className={`${styles.combatant} ${index === currentTurn && isCombatActive ? styles.active : ''}`}
          >
            {combatant.type === 'enemy' ? (
              <Skull className={styles.entityIcon} />
            ) : (
              <Sword className={styles.entityIcon} />
            )}
            <span className={styles.combatantName}>{combatant.name}</span>
            <div className={styles.combatantStats}>
              <span className={styles.statItem}>
                <Shield size={16} />
                <span>{combatant.ac}</span>
              </span>
              <span className={styles.statItem}>
                <Heart size={16} />
                {editMode.type === 'health' && editMode.id === combatant.id ? (
                  <input
                    type="number"
                    autoFocus
                    placeholder="+/-"
                    onBlur={(e) => handleHealthChange(combatant.id, e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleHealthChange(combatant.id, e.target.value);
                      }
                    }}
                  />
                ) : (
                  <span onClick={() => setEditMode({ type: 'health', id: combatant.id })}>
                    {combatant.currentHP} / {combatant.maxHP}
                  </span>
                )}
              </span>
              <span className={styles.statItem}>
                <Zap size={16} />
                {editMode.type === 'initiative' && editMode.id === combatant.id ? (
                  <input
                    type="number"
                    autoFocus
                    defaultValue={combatant.initiative || ''}
                    onBlur={(e) => handleInitiativeChange(combatant.id, e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleInitiativeChange(combatant.id, e.target.value);
                      }
                    }}
                  />
                ) : (
                  <span onClick={() => isCombatActive && setEditMode({ type: 'initiative', id: combatant.id })}>
                    {combatant.initiative || '-'}
                  </span>
                )}
              </span>
              <button
                className={styles.removeButton}
                onClick={() => onRemoveCombatant(combatant.id)}
                title="Remove Combatant"
              >
                <X size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CombatTracker;
