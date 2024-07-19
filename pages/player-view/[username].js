import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/PlayerView.module.css';
import { Skull, Sword } from 'lucide-react';

const getHealthStatus = (currentHP, maxHP) => {
  const percentage = (currentHP / maxHP) * 100;
  if (currentHP === 0) return { text: 'Down', color: 'grey' };
  if (percentage <= 24) return { text: 'Near Death', color: 'darkred' };
  if (percentage <= 49) return { text: 'Bloodied', color: 'red' };
  if (percentage <= 74) return { text: 'Wounded', color: 'darkorange' };
  if (percentage <= 99) return { text: 'Barely Wounded', color: 'orange' };
  return { text: 'Healthy', color: 'green' };
};

const PlayerView = () => {
  const router = useRouter();
  const { username } = router.query;
  const [combatants, setCombatants] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isCombatActive, setIsCombatActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchState = async () => {
      if (!username) return;

      try {
        const response = await fetch(`/api/user/${username}/combat`);
        if (response.ok) {
          const data = await response.json();
          console.log('PlayerView: Received state:', data);
          if (Array.isArray(data.combatants)) {
            setCombatants(data.combatants);
            setCurrentTurn(data.currentTurn);
            setIsCombatActive(data.isCombatActive);
          } else {
            setError('Invalid data format received from server');
          }
        } else {
          setError('Failed to fetch state');
        }
      } catch (error) {
        console.error('Error fetching state:', error);
        setError('Error fetching state');
      } finally {
        setIsLoading(false);
      }
    };

    fetchState();
    const intervalId = setInterval(fetchState, 2000);
    return () => clearInterval(intervalId);
  }, [username]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Adjust combatants array so that currentTurn combatant is at the top
  const rotatedCombatants = [
    ...combatants.slice(currentTurn),
    ...combatants.slice(0, currentTurn)
  ];

  return (
    <div className={styles.playerView}>
      <h1>Combat Status</h1>
      {!isCombatActive ? (
        <div>
          <p>Combat is not currently active.</p>
          {combatants.length > 0 && (
            <div>
              <h2>Prepared Combatants:</h2>
              <ul className={styles.combatantList}>
                {combatants.map((combatant) => (
                  <li key={combatant.id} className={styles.combatant}>
                    {combatant.type === 'enemy' ? (
                      <Skull className={styles.entityIcon} />
                    ) : (
                      <Sword className={styles.entityIcon} />
                    )}
                    <span className={styles.name}>{combatant.type === 'enemy' ? 'Unknown Adversary' : combatant.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div>
          {Array.isArray(rotatedCombatants) && rotatedCombatants.length > 0 ? (
            <ul className={styles.combatantList}>
              {rotatedCombatants.map((combatant, index) => {
                const healthStatus = getHealthStatus(combatant.currentHP, combatant.maxHP);
                return (
                  <li
                    key={combatant.id}
                    className={`${styles.combatant} ${index === 0 ? styles.active : ''} ${healthStatus.text === 'Dead' ? styles.dead : ''}`}
                  >
                    {combatant.type === 'enemy' ? (
                      <Skull className={styles.entityIcon} />
                    ) : (
                      <Sword className={styles.entityIcon} />
                    )}
                    <span className={styles.name}>{combatant.name}</span>
                    {combatant.type === 'enemy' && (
                      <span
                        className={styles.healthStatus}
                        style={{ color: healthStatus.color }}
                      >
                        {healthStatus.text}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No combatants available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerView;
