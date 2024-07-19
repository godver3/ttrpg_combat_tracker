import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './Layout.module.css';
import Libraries from './Libraries';
import DiceRoller from './DiceRoller';
import CombatTracker from './CombatTracker';
import { LogOut, Clock, Link as LinkIcon } from 'lucide-react';
import isBrowser from '../lib/isBrowser';

const Layout = ({ initialCombatState }) => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [combatants, setCombatants] = useState(initialCombatState?.combatants || []);
  const [isCombatActive, setIsCombatActive] = useState(initialCombatState?.isCombatActive || false);
  const [currentTurn, setCurrentTurn] = useState(initialCombatState?.currentTurn || 0);
  const [combatTime, setCombatTime] = useState(initialCombatState?.combatTime || 0);
  const [enemyCounts, setEnemyCounts] = useState({});
  const [rollPlayerInitiatives, setRollPlayerInitiatives] = useState(true);
  const [groupEnemies, setGroupEnemies] = useState(false);
  const [librariesOpen, setLibrariesOpen] = useState(false);
  const [diceRollerOpen, setDiceRollerOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (isBrowser) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        setUsername(user.username);
        fetchCombatState(user.username);
      } else {
        router.push('/login');
      }
    }
  }, []);

  const fetchCombatState = async (username) => {
    try {
      const response = await fetch(`/api/user/${username}/combat`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched data from API:', data);
        setCombatants(data.combatants || []);
        setIsCombatActive(data.isCombatActive || false);
        setCurrentTurn(data.currentTurn || 0);
        setCombatTime(data.combatTime || 0);
        console.log('State after setting fetched data:', {
          combatants: data.combatants,
          isCombatActive: data.isCombatActive,
          currentTurn: data.currentTurn,
          combatTime: data.combatTime,
        });
      } else {
        console.log('Failed to fetch combat state:', response);
      }
    } catch (error) {
      console.error('Error fetching combat state:', error);
    }
  };

  useEffect(() => {
    const saveCombatState = async () => {
      if (isBrowser && username) {
        try {
          const response = await fetch(`/api/user/${username}/combat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ combatants, currentTurn, isCombatActive, combatTime }), // Ensure combatTime is included
          });
          if (!response.ok) {
            throw new Error('Failed to save combat state');
          }
          const data = await response.json();
        } catch (error) {
          console.error('Error saving combat state:', error);
        }
      }
    };

    if (combatants.length > 0 || isCombatActive) {
      saveCombatState();
    }
  }, [combatants, currentTurn, isCombatActive, combatTime, username]);

  useEffect(() => {
    let interval;
    if (isCombatActive) {
      console.log('Starting combat timer with initial time:', combatTime);
      interval = setInterval(() => {
        setCombatTime((prevTime) => {
          const newTime = prevTime + 1;
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCombatActive]);

  const showFeedback = (message) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const removeAllCombatants = () => {
    setCombatants([]);
    setIsCombatActive(false);
    setEnemyCounts({});
    setCurrentTurn(0);
    setCombatTime(0);
  };

  const handleNextTurn = () => {
    setCurrentTurn((prevTurn) => (prevTurn + 1) % combatants.length);
  };

  const handlePreviousTurn = () => {
    setCurrentTurn((prevTurn) => (prevTurn - 1 + combatants.length) % combatants.length);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const rollInitiative = (character) => {
    const initiativeRoll = Math.floor(Math.random() * 20) + 1;
    return initiativeRoll + parseInt(character.init);
  };

  const calculateHealth = (hpString) => {
    const diceRegex = /(\d+)d(\d+)(?:\s*\+\s*(\d+))?/;
    const match = hpString.match(diceRegex);

    if (match) {
      const [, numDice, diceSize, modifier] = match;
      let total = 0;
      for (let i = 0; i < parseInt(numDice); i++) {
        total += Math.floor(Math.random() * parseInt(diceSize)) + 1;
      }
      if (modifier) {
        total += parseInt(modifier);
      }
      return total;
    }

    return parseInt(hpString) || 0;
  };

  const handleAddToCombat = (character) => {
    if (character.type === 'enemy') {
      setEnemyCounts((prev) => {
        const newCount = (prev[character.name] || 0) + 1;
        return { ...prev, [character.name]: newCount };
      });
      const calculatedHP = calculateHealth(character.hp);
      let initiative = null;

      if (isCombatActive) {
        if (groupEnemies) {
          const existingEnemy = combatants.find((c) => c.groupId === character.name);
          initiative = existingEnemy ? existingEnemy.initiative : rollInitiative(character);
        } else {
          initiative = rollInitiative(character);
        }
      }

      const newCharacter = {
        ...character,
        id: Date.now(),
        name: `${character.name} ${enemyCounts[character.name] + 1 || 1}`,
        initiative: initiative,
        maxHP: calculatedHP,
        currentHP: calculatedHP,
        groupId: character.name,
      };

      setCombatants((prev) => {
        const updatedCombatants = [...prev, newCharacter];
        const sortedCombatants = isCombatActive
          ? updatedCombatants.sort((a, b) => (b.initiative || 0) - (a.initiative || 0))
          : updatedCombatants;
        return sortedCombatants;
      });

      showFeedback(`Added enemy: ${newCharacter.name}`);
      return { count: enemyCounts[character.name] + 1 || 1 };
    } else {
      if (!combatants.some((c) => c.name === character.name)) {
        const newCharacter = {
          ...character,
          id: Date.now(),
          initiative: isCombatActive && rollPlayerInitiatives ? rollInitiative(character) : null,
          maxHP: parseInt(character.hp),
          currentHP: parseInt(character.hp),
        };

        setCombatants((prev) => {
          const updatedCombatants = [...prev, newCharacter];
          const sortedCombatants = isCombatActive
            ? updatedCombatants.sort((a, b) => (b.initiative || 0) - (a.initiative || 0))
            : updatedCombatants;
          return sortedCombatants;
        });

        showFeedback(`Added player: ${newCharacter.name}`);
      }
      return { count: 1 };
    }
  };

  const startCombat = () => {
    setCombatants((prevCombatants) => {
      let rolledCombatants = prevCombatants.map((combatant) => {
        if (combatant.type === 'player' && !rollPlayerInitiatives) {
          return combatant;
        }
        const initiativeRoll = rollInitiative(combatant);
        return { ...combatant, initiative: initiativeRoll };
      });

      if (groupEnemies) {
        const groupedInitiatives = {};
        rolledCombatants = rolledCombatants.map((combatant) => {
          if (combatant.type === 'enemy' && combatant.groupId) {
            if (!(combatant.groupId in groupedInitiatives)) {
              groupedInitiatives[combatant.groupId] = rollInitiative(combatant);
            }
            return { ...combatant, initiative: groupedInitiatives[combatant.groupId] };
          }
          return combatant;
        });
      }

      const sortedCombatants = rolledCombatants.sort((a, b) => (b.initiative || 0) - (a.initiative || 0));
      return sortedCombatants;
    });

    setIsCombatActive(true);
    setCurrentTurn(0);
  };

  const endCombat = () => {
    setCombatants((prevCombatants) => 
      prevCombatants.map((combatant) => {
        if (combatant.type === 'player') {
          return { ...combatant, initiative: null };
        }
        return combatant;
      }).filter((c) => c.type !== 'enemy')
    );
    setIsCombatActive(false);
    setEnemyCounts({});
    setCurrentTurn(0);
    setCombatTime(0);
  };

  return (
    <div className={styles.layout}>
      <div className={styles.header}>
        <h1>TTRPG Combat Tracker</h1>
        {username && (
          <div className={styles.buttonContainer}>
            <a href={`/player-view/${username}`} target="_blank" rel="noopener noreferrer" className={styles.button}>
              <LinkIcon size={20} /> Player View
            </a>
            <button className={styles.button} onClick={handleLogout}>
              <LogOut size={20} /> Logout
            </button>
          </div>
        )}
      </div>
      <div className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <h2>Libraries</h2>
          <Libraries addToCombat={handleAddToCombat} />
        </div>
        <div className={styles.middleColumn}>
          <h2>Combat Tracker</h2>
          <div className={styles.combatOptions}>
            <label>
              <input
                type="checkbox"
                checked={rollPlayerInitiatives}
                onChange={(e) => setRollPlayerInitiatives(e.target.checked)}
              />
              Roll Player Initiatives
            </label>
            <label>
              <input
                type="checkbox"
                checked={groupEnemies}
                onChange={(e) => setGroupEnemies(e.target.checked)}
              />
              Group Enemies
            </label>
            <div className={styles.combatTimer}>
              <Clock size={16} />
              <span>{formatTime(combatTime)}</span>
            </div>
          </div>
          <div className={styles.buttonContainer}>
            <button onClick={startCombat} disabled={isCombatActive || (combatants?.length ?? 0) === 0}>
              Start Combat
            </button>
            <button onClick={endCombat} disabled={!isCombatActive}>
              Remove All Enemies
            </button>
            <button onClick={removeAllCombatants} disabled={!isCombatActive}>Remove All Combatants</button>
            <button onClick={handlePreviousTurn} disabled={!isCombatActive || (combatants?.length ?? 0) === 0}>
              Previous Turn
            </button>
            <button onClick={handleNextTurn} disabled={!isCombatActive || (combatants?.length ?? 0) === 0}>
              Next Turn
            </button>
          </div>
          <CombatTracker
            combatants={combatants}
            setCombatants={setCombatants}
            isCombatActive={isCombatActive}
            setIsCombatActive={setIsCombatActive}
            setEnemyCounts={setEnemyCounts}
            startCombat={startCombat}
            endCombat={endCombat}
            combatTime={combatTime}
            setCombatTime={setCombatTime}
            currentTurn={currentTurn}
            setCurrentTurn={setCurrentTurn}
          />
        </div>
        <div className={styles.rightColumn}>
          <h2>Dice Roller</h2>
          <DiceRoller />
        </div>
      </div>
      {feedback && <div className={styles.feedback}>{feedback}</div>}
    </div>
  );
};

export default Layout;
