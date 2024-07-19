import React, { useState, useEffect } from 'react';
import styles from './Libraries.module.css';
import { Heart, Shield, Zap, Edit, Trash2, Swords, UserPlus, ChevronDown, ChevronRight } from 'lucide-react';

const Libraries = ({ addToCombat }) => {
  const [players, setPlayers] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [newCharacter, setNewCharacter] = useState({ name: '', hp: '', ac: '', init: '' });
  const [expandedSections, setExpandedSections] = useState({ players: true, enemies: true });
  const [editingCharacter, setEditingCharacter] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.username) {
        const response = await fetch(`/api/user/${user.username}`);
        const data = await response.json();
        setPlayers(data.library || []);
        setEnemies(data.enemies || []);
      }
    };

    fetchUserData();
  }, []);

  const saveToLocalStorage = (key, data) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.username) {
      fetch(`/api/user/${user.username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: data })
      });
    }
  };

  const handleAddCharacter = (type) => {
    setModalType(type);
    setEditingCharacter(null);
    setNewCharacter({ name: '', hp: '', ac: '', init: '' });
    setShowModal(true);
  };

  const handleEditCharacter = (character, type) => {
    setModalType(type);
    setEditingCharacter(character);
    setNewCharacter({ ...character });
    setShowModal(true);
  };

  const handleRemoveCharacter = (character, type) => {
    if (type === 'player') {
      const updatedPlayers = players.filter(p => p !== character);
      setPlayers(updatedPlayers);
      saveToLocalStorage('library', updatedPlayers);
    } else {
      const updatedEnemies = enemies.filter(e => e !== character);
      setEnemies(updatedEnemies);
      saveToLocalStorage('enemies', updatedEnemies);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newCharacter.name || !newCharacter.hp || !newCharacter.ac || !newCharacter.init) {
      alert("Please fill in all fields");
      return;
    }

    const updatedCharacter = {
      ...newCharacter,
      hp: newCharacter.hp
    };

    let updatedList;
    if (editingCharacter) {
      updatedList = modalType === 'player'
        ? players.map(p => p === editingCharacter ? updatedCharacter : p)
        : enemies.map(e => e === editingCharacter ? updatedCharacter : e);
    } else {
      updatedList = modalType === 'player' ? [...players, updatedCharacter] : [...enemies, updatedCharacter];
    }

    if (modalType === 'player') {
      setPlayers(updatedList);
      saveToLocalStorage('library', updatedList);
    } else {
      setEnemies(updatedList);
      saveToLocalStorage('enemies', updatedList);
    }
    setShowModal(false);
    setNewCharacter({ name: '', hp: '', ac: '', init: '' });
    setEditingCharacter(null);
  };

  const handleAddToCombat = (character, type) => {
    addToCombat({ ...character, type });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const renderCharacterList = (characters, type) => (
    <ul className={styles.characterList}>
      {characters.map((character, index) => (
        <li key={index} className={styles.characterItem}>
          <div className={styles.characterName}>{character.name}</div>
          <div className={styles.characterDetails}>
            <span className={styles.characterStats}>
              <span title="HP"><Heart size={16} /> {character.hp}</span>
              <span title="AC"><Shield size={16} /> {character.ac}</span>
              <span title="Initiative"><Zap size={16} /> {character.init}</span>
            </span>
            <div className={styles.actionButtons}>
              <button
                className={styles.editButton}
                onClick={() => handleEditCharacter(character, type)}
                title="Edit Character"
              >
                <Edit size={20} />
              </button>
              <button
                className={styles.removeButton}
                onClick={() => handleRemoveCharacter(character, type)}
                title={`Remove ${type === 'player' ? 'Player' : 'Enemy'}`}
              >
                <Trash2 size={20} />
              </button>
              <button
                className={styles.addToCombatButton}
                onClick={() => handleAddToCombat(character, type)}
                title="Add to Combat"
              >
                <Swords size={20} />
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={styles.libraries}>
      <div className={styles.section}>
        <button className={styles.sectionHeader} onClick={() => toggleSection('players')}>
          {expandedSections.players ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          <h3>Players ({players.length})</h3>
        </button>
        {expandedSections.players && renderCharacterList(players, 'player')}
        <button className={styles.addButton} onClick={() => handleAddCharacter('player')}>
          <UserPlus size={20} />
          Add Player
        </button>
      </div>

      <div className={styles.section}>
        <button className={styles.sectionHeader} onClick={() => toggleSection('enemies')}>
          {expandedSections.enemies ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          <h3>Enemies ({enemies.length})</h3>
        </button>
        {expandedSections.enemies && renderCharacterList(enemies, 'enemy')}
        <button className={styles.addButton} onClick={() => handleAddCharacter('enemy')}>
          <Swords size={20} />
          Add Enemy
        </button>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Name"
                value={newCharacter.name}
                onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="HP (e.g., 20 or 4d10+20)"
                value={newCharacter.hp}
                onChange={(e) => setNewCharacter({...newCharacter, hp: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="AC"
                value={newCharacter.ac}
                onChange={(e) => setNewCharacter({...newCharacter, ac: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Init"
                value={newCharacter.init}
                onChange={(e) => setNewCharacter({...newCharacter, init: e.target.value})}
                required
              />
              <button type="submit">{editingCharacter ? 'Update' : 'Add'} {modalType}</button>
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Libraries;
