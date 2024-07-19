// pages/login.js

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Sword } from 'lucide-react';
import styles from '../styles/Login.module.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isNewUser ? '/api/register' : '/api/login';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, pin }),
    });
    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('user', JSON.stringify({ username }));
      document.cookie = `user=${JSON.stringify({ username })}; path=/`;
      router.push('/');
    } else {
      setError(data.message);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.icon}>
        <Sword size={48} />
      </div>
      <h1 className={styles.title}>TTRPG Combat Tracker</h1>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className={styles.inputGroup}>
          <label>PIN</label>
          <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} required />
        </div>
        <button type="submit" className={styles.submitButton}>{isNewUser ? 'Register' : 'Login'}</button>
      </form>
      <button className={styles.toggleButton} onClick={() => setIsNewUser(!isNewUser)}>
        {isNewUser ? 'Already have an account? Login' : 'Create a new account'}
      </button>
    </div>
  );
};

export default Login;
