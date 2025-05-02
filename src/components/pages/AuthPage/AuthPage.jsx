//src/components/pages/AuthPage/AuthPage.jsx
import React, { useState } from 'react';
import styles from './AuthPage.module.css';
import SignUpForm from '../../SignUpForm/SignUpForm';
import LoginForm from '../../LoginForm/LoginForm';
import ResetPasswordForm from '../../ResetPasswordForm/ResetPasswordForm';
import Brand from '../../Brand/Brand';

export default function AuthPage({ setUser }) {
  const [showLogin, setShowLogin] = useState(true);
  const [showReset, setShowReset] = useState(false);

  const handleToggle = () => {
    setShowLogin(!showLogin);
    setShowReset(false);
  };

  return (
    <main className={styles.AuthPage}>
      <div>
        <h3 onClick={handleToggle}>{showLogin && !showReset ? 'SIGN UP' : 'LOG IN'}</h3>
        <Brand />
      </div>
      {showReset ? (
        <ResetPasswordForm />
      ) : showLogin ? (
        <LoginForm setUser={setUser} setShowReset={setShowReset} />
      ) : (
        <SignUpForm setUser={setUser} />
      )}
    </main>
  );
}