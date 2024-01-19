// AuthPage.jsx
import React, { useState } from 'react';
import styles from './AuthPage.module.css'; 
import SignUpForm from '../../SignUpForm/SignUpForm';
import LoginForm from '../../LoginForm/LoginForm';
import Brand from '../../Brand/Brand';



export default function AuthPage({ setUser }) {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <main className={styles.AuthPage}>
      
      <div>
        <h3 onClick={() => setShowLogin(!showLogin)}>{showLogin ? 'SIGN UP' : 'LOG IN'}</h3>
        <Brand />
      </div>
      {showLogin ? <LoginForm setUser={setUser} /> : <SignUpForm setUser={setUser} />}
    </main>
  );
}