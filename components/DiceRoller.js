import React, { useState } from 'react';
import Image from 'next/image';
import styles from './DiceRoller.module.css';
import { Dice1, RotateCcw, Eraser } from 'lucide-react';

const diceTypes = [
  { name: 'd2', sides: 2 },
  { name: 'd4', sides: 4 },
  { name: 'd6', sides: 6 },
  { name: 'd8', sides: 8 },
  { name: 'd10', sides: 10 },
  { name: 'd12', sides: 12 },
  { name: 'd20', sides: 20 },
  { name: 'd100', sides: 100 }
];

const DiceRoller = () => {
  const [diceQuantities, setDiceQuantities] = useState(diceTypes.reduce((acc, dice) => ({ ...acc, [dice.name]: 0 }), {}));
  const [modifier, setModifier] = useState(0);
  const [results, setResults] = useState([]);

  const updateDiceQuantity = (diceName, change) => {
    setDiceQuantities(prev => ({
      ...prev,
      [diceName]: Math.max(0, prev[diceName] + change)
    }));
  };

  const rollDice = (sides, quantity = 1) => {
    const rolls = Array(quantity).fill().map(() => Math.floor(Math.random() * sides) + 1);
    const total = rolls.reduce((sum, roll) => sum + roll, 0);
    return { rolls, total };
  };

  const handleSingleRoll = (diceName, sides) => {
    const { rolls, total } = rollDice(sides, 1);
    const newResult = {
      summary: `${diceName}: [${rolls[0]}] = ${total}`,
      details: [{ diceName, rolls, total }]
    };
    setResults([newResult, ...results.slice(0, 4)]);
  };

  const handleRollAll = () => {
    let grandTotal = 0;
    const allRolls = diceTypes.flatMap(dice => {
      const quantity = diceQuantities[dice.name];
      if (quantity > 0) {
        const { rolls, total } = rollDice(dice.sides, quantity);
        grandTotal += total;
        return [{ diceName: dice.name, rolls, total }];
      }
      return [];
    });

    grandTotal += modifier;
    const rollSummary = allRolls.map(roll => `${roll.diceName}: [${roll.rolls.join(', ')}]`).join(', ');
    const newResult = {
      summary: `${rollSummary}${modifier !== 0 ? `, Modifier: ${modifier}` : ''} = ${grandTotal}`,
      details: allRolls
    };

    setResults([newResult, ...results.slice(0, 4)]);
  };

  const resetDice = () => {
    setDiceQuantities(diceTypes.reduce((acc, dice) => ({ ...acc, [dice.name]: 0 }), {}));
    setModifier(0);
  };

  const clearHistory = () => {
    setResults([]);
  };

  return (
    <div className={styles.diceRoller}>
      <div className={styles.diceGrid}>
        {diceTypes.map((dice) => (
          <div key={dice.name} className={styles.diceRow}>
            <div className={styles.diceImageWrapper} onClick={() => handleSingleRoll(dice.name, dice.sides)}>
              <Image 
                src={`/images/${dice.name}.png`} 
                alt={`${dice.name}`} 
                width={40} 
                height={40} 
                layout="responsive"
                objectFit="contain"
              />
            </div>
            <div className={styles.diceControls}>
              <button onClick={() => updateDiceQuantity(dice.name, -1)}>-</button>
              <span>{diceQuantities[dice.name]}</span>
              <button onClick={() => updateDiceQuantity(dice.name, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.modifierRow}>
        <label>Modifier:</label>
        <input
          type="number"
          value={modifier}
          onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
        />
      </div>
      <div className={styles.buttonColumn}>
        <button className={styles.rollAllButton} onClick={handleRollAll}>
          <Dice1 size={20} />
          Roll
        </button>
        <button className={styles.resetButton} onClick={resetDice}>
          <RotateCcw size={20} />
          Reset Dice
        </button>
        <button className={styles.clearHistoryButton} onClick={clearHistory}>
          <Eraser size={20} />
          Clear History
        </button>
      </div>
      <div className={styles.results}>
        {results.map((result, index) => (
          <div key={index} className={styles.rollResult}>
            {result.summary}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiceRoller;
