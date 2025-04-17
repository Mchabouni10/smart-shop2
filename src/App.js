import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import styles from './App.module.css';
import { getUser } from './utilities/users-service';
import ErrorBoundary from './components/ErrorBoundary';
import AuthPage from './components/pages/AuthPage/AuthPage';
import NewPurchase from './components/pages/NewPurchase/NewPurchase';
import PurchaseHistoryPage from './components/pages/PurchaseHistoryPage/PurchaseHistoryPage';

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (isLoading) {
    return <div className={styles.App}>Loading...</div>;
  }

  return (
    <ErrorBoundary>
      <main className={styles.App}>
        {user ? (
          <>
            <Routes>
              <Route
                path="/orders/new"
                element={<NewPurchase user={user} setUser={setUser} />}
              />
              <Route
                path="/orders"
                element={<PurchaseHistoryPage user={user} setUser={setUser} />}
              />
              <Route path="/*" element={<Navigate to="/orders/new" />} />
            </Routes>
          </>
        ) : (
          <AuthPage setUser={setUser} />
        )}
      </main>
    </ErrorBoundary>
  );
}