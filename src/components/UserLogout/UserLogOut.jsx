import React from 'react';
import styles from './UserLogOut.module.css';
import { logOut } from '../../utilities/users-service';

const UserLogOut = ({ user, setUser }) => {
  const handleLogOut = () => {
    logOut();
    setUser(null);
  };

  return (
    <div className={styles.UserLogOut}>
      <div className={styles.email}>Welcome: {user.name}</div>
      <div className={styles.email}>{user.email}</div>
      <button className="btn-xs" onClick={handleLogOut}>LOG OUT</button>
    </div>
  );
};

export default UserLogOut;